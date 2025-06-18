import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/participant-badges - Récupérer les badges d'un participant
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json(
      { message: "Non autorisé" },
      { status: 401 }
    );
  }

  const url = new URL(request.url);
  const participantEmail = url.searchParams.get('email');
  const eventId = url.searchParams.get('eventId');

  try {
    // Pour les participants, ils ne peuvent voir que leurs propres badges
    // Pour les admins/organisateurs, ils peuvent voir tous les badges
    const isParticipant = session.user.role === 'USER';
    
    if (isParticipant && participantEmail && participantEmail !== session.user.email) {
      return NextResponse.json(
        { message: "Non autorisé - vous ne pouvez voir que vos propres badges" },
        { status: 403 }
      );
    }

    // Si c'est un participant et qu'aucun email n'est spécifié, utiliser le sien
    const targetEmail = isParticipant ? session.user.email : participantEmail;

    const whereConditions: any = {};

    // Filtrer par email si spécifié
    if (targetEmail) {
      whereConditions.registration = {
        email: targetEmail
      };
    }

    // Filtrer par événement si spécifié
    if (eventId) {
      whereConditions.eventId = eventId;
    }

    // Pour les organisateurs, limiter aux événements qu'ils possèdent
    if (session.user.role === 'ORGANIZER' && !participantEmail) {
      whereConditions.event = {
        userId: session.user.id
      };
    }

    const participantBadges = await prisma.participantBadge.findMany({
      where: whereConditions,
      include: {
        registration: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            company: true,
            jobTitle: true,
            type: true
          }
        },
        event: {
          select: {
            id: true,
            name: true,
            slug: true,
            location: true,
            startDate: true,
            endDate: true
          }
        },
        template: {
          select: {
            id: true,
            name: true,
            description: true,
            isGlobal: true
          }
        }
      },
      orderBy: [
        { event: { startDate: 'desc' } },
        { createdAt: 'desc' }
      ]
    });

    return NextResponse.json({
      success: true,
      badges: participantBadges.map(badge => ({
        id: badge.id,
        status: badge.status,
        generatedAt: badge.generatedAt,
        printedAt: badge.printedAt,
        deliveredAt: badge.deliveredAt,
        participant: {
          name: `${badge.registration.firstName} ${badge.registration.lastName}`,
          email: badge.registration.email,
          company: badge.registration.company,
          jobTitle: badge.registration.jobTitle,
          type: badge.registration.type
        },
        event: {
          id: badge.event.id,
          name: badge.event.name,
          slug: badge.event.slug,
          location: badge.event.location,
          startDate: badge.event.startDate,
          endDate: badge.event.endDate
        },
        template: {
          id: badge.template.id,
          name: badge.template.name,
          description: badge.template.description,
          isGlobal: badge.template.isGlobal
        },
        qrCodeData: badge.qrCodeData,
        customData: badge.customData ? JSON.parse(badge.customData) : null,
        createdAt: badge.createdAt,
        updatedAt: badge.updatedAt
      }))
    });

  } catch (error) {
    console.error("Erreur lors de la récupération des badges:", error);
    return NextResponse.json(
      { message: "Erreur lors de la récupération des badges" },
      { status: 500 }
    );
  }
}

// POST /api/participant-badges - Créer un badge pour un participant
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json(
      { message: "Non autorisé" },
      { status: 401 }
    );
  }

  // Seuls les organisateurs et admins peuvent créer des badges
  if (session.user.role === 'USER') {
    return NextResponse.json(
      { message: "Non autorisé - permission insuffisante" },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { registrationId, templateId, customData, qrCodeData } = body;

    // Validations
    if (!registrationId || !templateId) {
      return NextResponse.json(
        { message: "registrationId et templateId sont requis" },
        { status: 400 }
      );
    }

    // Vérifier que la registration existe
    const registration = await prisma.registration.findUnique({
      where: { id: registrationId },
      include: {
        event: {
          select: {
            id: true,
            userId: true
          }
        }
      }
    });

    if (!registration) {
      return NextResponse.json(
        { message: "Registration non trouvée" },
        { status: 404 }
      );
    }

    // Vérifier les permissions pour l'événement
    if (session.user.role !== "ADMIN" && registration.event.userId !== session.user.id) {
      return NextResponse.json(
        { message: "Non autorisé pour cet événement" },
        { status: 403 }
      );
    }

    // Vérifier que le template existe
    const template = await prisma.badgeTemplate.findUnique({
      where: { id: templateId }
    });

    if (!template) {
      return NextResponse.json(
        { message: "Template non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier qu'un badge n'existe pas déjà pour ce participant/événement
    const existingBadge = await prisma.participantBadge.findUnique({
      where: {
        registrationId_eventId: {
          registrationId: registrationId,
          eventId: registration.eventId
        }
      }
    });

    if (existingBadge) {
      return NextResponse.json(
        { message: "Un badge existe déjà pour ce participant dans cet événement" },
        { status: 400 }
      );
    }

    // Créer le badge
    const participantBadge = await prisma.participantBadge.create({
      data: {
        registrationId,
        eventId: registration.eventId,
        templateId,
        qrCodeData: qrCodeData || registration.qrCode,
        customData: customData ? JSON.stringify(customData) : null
      },
      include: {
        registration: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        },
        event: {
          select: {
            name: true
          }
        },
        template: {
          select: {
            name: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      badge: {
        id: participantBadge.id,
        status: participantBadge.status,
        generatedAt: participantBadge.generatedAt,
        participant: participantBadge.registration,
        event: participantBadge.event,
        template: participantBadge.template
      }
    }, { status: 201 });

  } catch (error) {
    console.error("Erreur lors de la création du badge:", error);
    return NextResponse.json(
      { message: "Erreur lors de la création du badge" },
      { status: 500 }
    );
  }
} 