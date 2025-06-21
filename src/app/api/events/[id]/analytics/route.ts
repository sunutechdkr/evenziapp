import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const { id: eventId } = context.params;
    
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
    
    // Récupérer le nombre de participants par type
    const participantTypesQuery = await prisma.$queryRaw`
      SELECT 
        type, 
        COUNT(*) as count
      FROM registrations
      WHERE event_id = ${eventId}
      GROUP BY type
      ORDER BY count DESC
    `;
    
    const participantTypes = Array.isArray(participantTypesQuery)
      ? participantTypesQuery.map(type => ({
          type: type.type,
          count: Number(type.count)
        }))
      : [];
    
    // Récupérer les sessions de l'événement avec le nombre de participants pour chacune
    const sessionsQuery = await prisma.$queryRaw`
      SELECT 
        es.id,
        es.title,
        COUNT(sp.id) as participant_count
      FROM 
        event_sessions es
      LEFT JOIN 
        session_participants sp ON es.id = sp.session_id
      WHERE 
        es.event_id = ${eventId}
      GROUP BY 
        es.id, es.title
      ORDER BY 
        participant_count DESC
      LIMIT 5
    `;
    
    const topSessions = Array.isArray(sessionsQuery)
      ? sessionsQuery.map(session => ({
          id: session.id,
          title: session.title,
          participantCount: Number(session.participant_count)
        }))
      : [];
    
    // Récupérer les inscriptions par jour pour les 7 derniers jours
    const dailyRegistrationsQuery = await prisma.$queryRaw`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
      FROM 
        registrations
      WHERE 
        event_id = ${eventId}
        AND created_at > CURRENT_DATE - INTERVAL '7 days'
      GROUP BY 
        DATE(created_at)
      ORDER BY 
        date ASC
    `;
    
    const dailyRegistrations = Array.isArray(dailyRegistrationsQuery)
      ? dailyRegistrationsQuery.map(day => ({
          date: day.date,
          count: Number(day.count)
        }))
      : [];
    
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
      participantTypes,
      topSessions,
      dailyRegistrations,
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