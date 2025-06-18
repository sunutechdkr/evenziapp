import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';
import { startOfMonth, endOfMonth, format, subMonths } from "date-fns";



export async function GET() {
  try {
    // Récupérer les 6 derniers mois
    const months = Array.from({ length: 6 }, (_, i) => {
      const date = subMonths(new Date(), i);
      return {
        startDate: startOfMonth(date),
        endDate: endOfMonth(date),
        label: format(date, "MMM yyyy") // ex: "Jan 2023"
      };
    }).reverse(); // Pour afficher dans l'ordre chronologique

    // Récupérer les inscriptions par mois
    const registrationsByMonth = await Promise.all(
      months.map(async (month) => {
        const count = await prisma.registration.count({
          where: {
            createdAt: {
              gte: month.startDate,
              lte: month.endDate
            }
          }
        });
        return {
          month: month.label,
          count
        };
      })
    );

    // Récupérer les check-ins par mois
    const checkInsByMonth = await Promise.all(
      months.map(async (month) => {
        const count = await prisma.registration.count({
          where: {
            checkInTime: {
              gte: month.startDate,
              lte: month.endDate
            }
          }
        });
        return {
          month: month.label,
          count
        };
      })
    );

    // Récupérer le top 5 des événements avec le plus d'inscriptions
    const topEvents = await prisma.event.findMany({
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            registrations: true
          }
        }
      },
      orderBy: {
        registrations: {
          _count: 'desc'
        }
      },
      take: 5
    });

    // Formater les données du top des événements
    const topEventsData = topEvents.map((event: { name: string; _count: { registrations: number } }) => ({
      name: event.name,
      count: event._count.registrations
    }));

    return NextResponse.json({
      registrationsByMonth,
      checkInsByMonth,
      topEventsData
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des données analytiques:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des données analytiques" },
      { status: 500 }
    );
  }
} 