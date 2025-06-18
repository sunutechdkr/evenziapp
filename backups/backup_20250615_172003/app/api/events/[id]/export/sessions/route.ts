import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import * as XLSX from 'xlsx';
import { format } from 'date-fns';

// Interface pour les données de session
interface SessionData {
  id: string;
  title: string;
  description: string | null;
  start_date: Date | string;
  end_date: Date | string;
  start_time: string;
  end_time: string;
  location: string | null;
  speaker: string | null;
  capacity: number | null;
  event_id: string;
  created_at: Date | string;
  updated_at: Date | string;
}

// GET /api/events/[id]/export/sessions - Exporter les sessions au format Excel
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
    
    // Récupérer toutes les sessions de l'événement
    const sessions = await prisma.$queryRaw`
      SELECT *
      FROM event_sessions
      WHERE event_id = ${id}
      ORDER BY start_date ASC, start_time ASC
    `;
    
    // Si aucune session n'est trouvée
    if (!Array.isArray(sessions) || sessions.length === 0) {
      return NextResponse.json(
        { message: "Aucune session trouvée pour cet événement" },
        { status: 404 }
      );
    }
    
    // Formater les données pour l'export Excel
    const formattedSessions = (sessions as SessionData[]).map((session) => ({
      ID: session.id,
      Titre: session.title,
      Description: session.description || '',
      "Date de début": format(new Date(session.start_date), 'dd/MM/yyyy'),
      "Date de fin": format(new Date(session.end_date), 'dd/MM/yyyy'),
      "Heure de début": session.start_time,
      "Heure de fin": session.end_time,
      Lieu: session.location || '',
      Intervenant: session.speaker || '',
      Capacité: session.capacity || '',
      "Date de création": format(new Date(session.created_at), 'dd/MM/yyyy HH:mm:ss'),
      "Dernière modification": format(new Date(session.updated_at), 'dd/MM/yyyy HH:mm:ss')
    }));
    
    // Créer un classeur Excel
    const worksheet = XLSX.utils.json_to_sheet(formattedSessions);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sessions");
    
    // Générer le fichier Excel
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    
    // Créer un nom de fichier avec le nom de l'événement et la date
    const eventName = event[0].name.replace(/[^a-zA-Z0-9]/g, '_');
    const fileName = `Sessions_${eventName}_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
    
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
    console.error("Erreur lors de l'exportation des sessions:", error);
    return NextResponse.json(
      { message: "Erreur lors de l'exportation des sessions" },
      { status: 500 }
    );
  }
} 