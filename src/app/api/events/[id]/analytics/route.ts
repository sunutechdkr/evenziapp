import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = params.id;
    
    // Récupérer le paramètre de période depuis l'URL
    const url = new URL(request.url);
    const period = url.searchParams.get('period') || '7j';
    
    // Vérifier si l'événement existe avec une requête prisma brute
    const eventQuery = await prisma.$queryRaw`
      SELECT 
        id, 
        name, 
        start_date as "startDate", 
        end_date as "endDate",
        created_at as "createdAt"
      FROM events
      WHERE id = ${eventId}
      LIMIT 1
    `;
    
    // Vérifier si l'événement a été trouvé
    if (!Array.isArray(eventQuery) || eventQuery.length === 0) {
      return NextResponse.json(
        { message: "Event not found" },
        { status: 404 }
      );
    }
    
    const event = eventQuery[0];
    
    // Récupérer les statistiques d'inscription
    const registrationStatsQuery = await prisma.$queryRaw`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN checked_in = true THEN 1 ELSE 0 END) as checked_in
      FROM registrations
      WHERE event_id = ${eventId}
    `;
    
    const registrationStats = Array.isArray(registrationStatsQuery) && registrationStatsQuery.length > 0
      ? registrationStatsQuery[0]
      : { total: 0, checked_in: 0 };
    
    // Formater les résultats
    const stats = {
      event: {
        id: event.id,
        name: event.name,
        startDate: event.startDate,
        endDate: event.endDate
      },
      registrations: {
        total: Number(registrationStats.total) || 0,
        checkedIn: Number(registrationStats.checked_in) || 0
      },
      period: period
    };
    
    // Retourner les statistiques
    return NextResponse.json(stats);
    
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json(
      { message: "An error occurred while fetching analytics data" },
      { status: 500 }
    );
  }
} 