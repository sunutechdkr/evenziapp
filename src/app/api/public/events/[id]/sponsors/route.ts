import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/public/events/[id]/sponsors - Récupérer la liste des sponsors publics
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const paramsData = await params;
    const id = paramsData.id;
    
    // Vérifier que l'événement existe
    const event = await prisma.event.findUnique({
      where: { id },
    });
    
    if (!event) {
      return NextResponse.json(
        { message: "Événement non trouvé" },
        { status: 404 }
      );
    }

    // Récupérer seulement les sponsors visibles (publics)
    const sponsors = await prisma.sponsor.findMany({
      where: { 
        eventId: id,
        visible: true  // Seulement les sponsors publics
      },
      orderBy: [
        { level: 'asc' },  // Par niveau d'abord
        { name: 'asc' }    // Puis par nom
      ],
      select: {
        id: true,
        name: true,
        description: true,
        logo: true,
        website: true,
        level: true,
        visible: true,
        location: true,
        address: true,
        phone: true,
        mobile: true,
        email: true,
        linkedinUrl: true,
        twitterUrl: true,
        facebookUrl: true,
        eventId: true,
        createdAt: true,
        updatedAt: true
      }
    });

    // Pour chaque sponsor, calculer les statistiques publiques
    const sponsorsWithStats = await Promise.all(
      sponsors.map(async (sponsor: any) => {
        // Nombre de membres/participants associés au sponsor
        const membersCount = await prisma.registration.count({
          where: {
            eventId: id,
            company: {
              contains: sponsor.name,
              mode: 'insensitive'
            }
          }
        });

        // Nombre de sessions où le sponsor intervient
        const sessionsCount = await prisma.event_sessions.count({
          where: {
            event_id: id,
            OR: [
              {
                speaker: {
                  contains: sponsor.name,
                  mode: 'insensitive'
                }
              },
              {
                description: {
                  contains: sponsor.name,
                  mode: 'insensitive'
                }
              }
            ]
          }
        });

        return {
          ...sponsor,
          stats: {
            members: membersCount,
            sessions: sessionsCount,
            documents: 0, // Public n'a pas accès aux documents
            appointments: 0, // Public n'a pas accès aux RDV
            products: 0 // Public n'a pas accès aux produits
          }
        };
      })
    );
    
    return NextResponse.json(sponsorsWithStats);
  } catch (error: unknown) {
    console.error("❌ Erreur lors de la récupération des sponsors publics:", error);
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    return NextResponse.json(
      { message: "Erreur lors de la récupération des sponsors", error: errorMessage },
      { status: 500 }
    );
  }
}
