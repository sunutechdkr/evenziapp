import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import * as XLSX from 'xlsx';
import { format } from 'date-fns';

// Interface pour les données de sponsor
interface SponsorData {
  id: string;
  name: string;
  description: string | null;
  logo: string | null;
  website: string | null;
  level: string;
  visible: boolean;
  event_id: string;
  created_at: Date | string;
  updated_at: Date | string;
}

// GET /api/events/[id]/export/sponsors - Exporter les sponsors au format Excel
export async function GET(
  request: Request, 
  { params }: { params: { id: string } }
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
    
    // Récupérer tous les sponsors de l'événement
    const sponsors = await prisma.$queryRaw`
      SELECT *
      FROM sponsors
      WHERE event_id = ${id}
      ORDER BY name ASC
    `;
    
    // Si aucun sponsor n'est trouvé
    if (!Array.isArray(sponsors) || sponsors.length === 0) {
      return NextResponse.json(
        { message: "Aucun exposant trouvé pour cet événement" },
        { status: 404 }
      );
    }
    
    // Formater les données pour l'export Excel
    const formattedSponsors = (sponsors as SponsorData[]).map((sponsor) => ({
      ID: sponsor.id,
      Nom: sponsor.name,
      Description: sponsor.description || '',
      Logo: sponsor.logo || '',
      "Site Web": sponsor.website || '',
      Niveau: sponsor.level,
      Visible: sponsor.visible ? 'Oui' : 'Non',
      "Date de création": format(new Date(sponsor.created_at), 'dd/MM/yyyy HH:mm:ss'),
      "Dernière modification": format(new Date(sponsor.updated_at), 'dd/MM/yyyy HH:mm:ss')
    }));
    
    // Créer un classeur Excel
    const worksheet = XLSX.utils.json_to_sheet(formattedSponsors);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Exposants");
    
    // Générer le fichier Excel
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    
    // Créer un nom de fichier avec le nom de l'événement et la date
    const eventName = event[0].name.replace(/[^a-zA-Z0-9]/g, '_');
    const fileName = `Exposants_${eventName}_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
    
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
    console.error("Erreur lors de l'exportation des exposants:", error);
    return NextResponse.json(
      { message: "Erreur lors de l'exportation des exposants" },
      { status: 500 }
    );
  }
} 