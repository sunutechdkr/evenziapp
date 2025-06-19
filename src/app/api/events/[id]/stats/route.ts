import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { format, isToday, isPast, isFuture } from "date-fns";

export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    // Accéder à l'ID de l'événement de manière sûre en attendant les paramètres
    const { id } = context.params;
    
    // Si l'ID est manquant, retourner une erreur
    if (!id) {
      return NextResponse.json(
        { error: "L'identifiant de l'événement est manquant" },
        { status: 400 }
      );
    }
    
    // Récupérer l'événement par son ID
    const eventQuery = await prisma.$queryRaw`
      SELECT 
        id, 
        name, 
        description, 
        location, 
        start_date as "startDate", 
        end_date as "endDate"
      FROM events
      WHERE id = ${id}
    `;
    
    // Vérifier si l'événement existe
    const eventData = Array.isArray(eventQuery) && eventQuery.length > 0 ? eventQuery[0] : null;
    
    if (!eventData) {
      return NextResponse.json(
        { error: "Événement non trouvé" },
        { status: 404 }
      );
    }
    
    // Récupérer les inscriptions pour cet événement avec SQL direct
    const registrationsQuery = await prisma.$queryRaw`
      SELECT 
        id, 
        first_name, 
        last_name, 
        email, 
        checked_in, 
        check_in_time, 
        type
      FROM registrations
      WHERE event_id = ${id}
    `;
    
    const registrations = Array.isArray(registrationsQuery) ? registrationsQuery : [];
    
    // Nombre total d'inscrits
    const totalRegistrations = registrations.length;
    
    // Nombre de participants ayant fait leur check-in
    const checkedInCount = registrations.filter(reg => reg.checked_in).length;
    
    // Taux de check-in (en pourcentage)
    const checkInRate = totalRegistrations > 0 
      ? Math.round((checkedInCount / totalRegistrations) * 100)
      : 0;
    
    // Calculer les données temporelles
    const now = new Date();
    const startDate = new Date(eventData.startDate);
    const endDate = new Date(eventData.endDate);
    
    // Statut de l'événement
    let status = "à venir";
    if (isPast(endDate)) {
      status = "terminé";
    } else if (isToday(startDate) || (startDate <= now && endDate >= now)) {
      status = "en cours";
    }
    
    // Jours restants avant l'événement
    const daysUntilEvent = isFuture(startDate)
      ? Math.ceil((startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      : 0;
    
    // Durée de l'événement en jours
    const eventDuration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Analyse des types d'inscriptions (simulé ici)
    const registrationTypes = {
      vip: Math.round(totalRegistrations * 0.15),
      standard: Math.round(totalRegistrations * 0.75),
      invité: Math.round(totalRegistrations * 0.10),
    };
    
    // Répartition par genre (simulée)
    const genderDistribution = {
      hommes: Math.round(totalRegistrations * 0.55),
      femmes: Math.round(totalRegistrations * 0.45),
    };
    
    // Évolution des inscriptions (simulée)
    const registrationsTimeline = [
      { date: format(new Date(new Date().setDate(now.getDate() - 30)), 'dd/MM'), count: Math.round(totalRegistrations * 0.10) },
      { date: format(new Date(new Date().setDate(now.getDate() - 25)), 'dd/MM'), count: Math.round(totalRegistrations * 0.15) },
      { date: format(new Date(new Date().setDate(now.getDate() - 20)), 'dd/MM'), count: Math.round(totalRegistrations * 0.25) },
      { date: format(new Date(new Date().setDate(now.getDate() - 15)), 'dd/MM'), count: Math.round(totalRegistrations * 0.40) },
      { date: format(new Date(new Date().setDate(now.getDate() - 10)), 'dd/MM'), count: Math.round(totalRegistrations * 0.65) },
      { date: format(new Date(new Date().setDate(now.getDate() - 5)), 'dd/MM'), count: Math.round(totalRegistrations * 0.85) },
      { date: format(new Date(), 'dd/MM'), count: totalRegistrations },
    ];
    
    // Revenus estimés (simulés)
    const estimatedRevenue = totalRegistrations * 50; // 50€ par participant en moyenne
    
    // 5 participants récents (simulés)
    const recentParticipants = Array.from({ length: Math.min(5, totalRegistrations) }, (_, i) => ({
      id: `p-${i+1}`,
      name: `Participant ${i+1}`,
      email: `participant${i+1}@example.com`,
      registrationDate: format(new Date(new Date().setDate(now.getDate() - Math.floor(Math.random() * 10))), 'dd/MM/yyyy'),
      type: Math.random() > 0.8 ? 'VIP' : 'Standard'
    }));

    return NextResponse.json({
      totalRegistrations,
      checkedInCount,
      checkInRate,
      status,
      daysUntilEvent,
      eventDuration,
      registrationTypes,
      genderDistribution,
      registrationsTimeline,
      estimatedRevenue,
      recentParticipants
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la récupération des statistiques" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 