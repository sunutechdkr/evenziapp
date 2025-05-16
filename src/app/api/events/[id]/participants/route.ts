import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query") || "";
    
    if (!id) {
      return NextResponse.json(
        { message: "ID d'événement requis" },
        { status: 400 }
      );
    }

    // Récupérer l'événement avec son slug pour maintenir la compatibilité
    const eventQuery = await prisma.$queryRaw`
      SELECT id, slug FROM events 
      WHERE id = ${id}
    `;
    
    const event = Array.isArray(eventQuery) && eventQuery.length > 0 ? eventQuery[0] : null;

    if (!event) {
      return NextResponse.json(
        { message: "Événement non trouvé" },
        { status: 404 }
      );
    }

    // Récupérer les participants qui correspondent au filtre avec SQL direct
    const participantsQuery = await prisma.$queryRaw`
      SELECT 
        id, first_name, last_name, email, type, checked_in, check_in_time, short_code
      FROM 
        registrations
      WHERE 
        event_id = ${id}
        AND (
          LOWER(first_name) LIKE LOWER(${'%' + query + '%'})
          OR LOWER(last_name) LIKE LOWER(${'%' + query + '%'})
          OR LOWER(email) LIKE LOWER(${'%' + query + '%'})
          OR LOWER(short_code) LIKE LOWER(${'%' + query + '%'})
        )
      ORDER BY 
        last_name ASC
      LIMIT 50
    `;
    
    // Transformer les résultats avec camelCase pour le frontend
    const participants = Array.isArray(participantsQuery) 
      ? participantsQuery.map(p => ({
          id: p.id,
          firstName: p.first_name,
          lastName: p.last_name,
          email: p.email,
          type: p.type,
          checkedIn: p.checked_in,
          checkInTime: p.check_in_time,
          shortCode: p.short_code
        }))
      : [];

    return NextResponse.json(participants);
  } catch (error) {
    console.error("Erreur lors de la récupération des participants:", error);
    return NextResponse.json(
      { message: "Une erreur est survenue lors de la récupération des participants" },
      { status: 500 }
    );
  }
} 