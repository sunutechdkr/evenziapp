import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import * as XLSX from 'xlsx';
import { format } from 'date-fns';

// Interface pour les données de participant
interface ParticipantData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  type: string;
  eventId: string;
  qrCode: string;
  shortCode: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  checkedIn: boolean;
  checkInTime: Date | string | null;
}

// GET /api/events/[id]/export/participants - Exporter les participants au format Excel
export async function GET(
  request: Request, 
  { params }: { params: Promise<{ id: string }> }
) {
  // Vérification de l'authentification
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json(
      { message: "Non autorisé" },
      { status: 401 }
    );
  }
  
  const { id } = await params;
  
  try {
    // Vérifier si l'événement existe
    const event = await prisma.$queryRaw`
      SELECT 
        id, 
        name, 
        description, 
        location, 
        start_date as "startDate", 
        end_date as "endDate",
        user_id as "userId"
      FROM events
      WHERE id = ${id}
    `;

    // Si l'événement n'est pas trouvé
    if (!event || !Array.isArray(event) || event.length === 0) {
      return NextResponse.json(
        { message: "Événement non trouvé" },
        { status: 404 }
      );
    }
    
    // Autoriser l'accès aux administrateurs et aux propriétaires de l'événement
    if (session.user.role !== "ADMIN" && event[0].userId !== session.user.id) {
      return NextResponse.json(
        { message: "Non autorisé" },
        { status: 401 }
      );
    }
    
    // Récupérer tous les participants de l'événement
    const participants = await prisma.$queryRaw`
      SELECT 
        id, 
        first_name as "firstName", 
        last_name as "lastName", 
        email, 
        phone, 
        type, 
        event_id as "eventId", 
        qr_code as "qrCode", 
        short_code as "shortCode",
        created_at as "createdAt",
        updated_at as "updatedAt",
        checked_in as "checkedIn", 
        check_in_time as "checkInTime"
      FROM registrations
      WHERE event_id = ${id}
      ORDER BY created_at DESC
    `;
    
    // Si aucun participant n'est trouvé
    if (!Array.isArray(participants) || participants.length === 0) {
      return NextResponse.json(
        { message: "Aucun participant trouvé pour cet événement" },
        { status: 404 }
      );
    }
    
    // Formater les données pour l'export Excel
    const formattedParticipants = (participants as ParticipantData[]).map((participant) => ({
      ID: participant.id,
      Prénom: participant.firstName,
      Nom: participant.lastName,
      Email: participant.email,
      Téléphone: participant.phone,
      Type: participant.type,
      "Code QR": participant.qrCode,
      "Code Court": participant.shortCode || '',
      "Date d'inscription": format(new Date(participant.createdAt), 'dd/MM/yyyy HH:mm:ss'),
      "Dernière modification": format(new Date(participant.updatedAt), 'dd/MM/yyyy HH:mm:ss'),
      "Check-in": participant.checkedIn ? 'Oui' : 'Non',
      "Date de check-in": participant.checkInTime ? format(new Date(participant.checkInTime), 'dd/MM/yyyy HH:mm:ss') : ''
    }));
    
    // Créer un classeur Excel
    const worksheet = XLSX.utils.json_to_sheet(formattedParticipants);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Participants");
    
    // Générer le fichier Excel
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    
    // Créer un nom de fichier avec le nom de l'événement et la date
    const eventName = event[0].name.replace(/[^a-zA-Z0-9]/g, '_');
    const fileName = `Participants_${eventName}_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
    
    // Définir les en-têtes de réponse
    const headers = new Headers();
    headers.append('Content-Disposition', `attachment; filename=${fileName}`);
    headers.append('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    
    // Retourner le fichier Excel
    return new NextResponse(excelBuffer, {
      status: 200,
      headers: headers
    });
    
  } catch (error) {
    console.error("Erreur lors de l'exportation des participants:", error);
    return NextResponse.json(
      { message: "Erreur lors de l'exportation des participants" },
      { status: 500 }
    );
  }
} 