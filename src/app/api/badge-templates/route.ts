import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/badge-templates - Récupérer tous les templates de badges
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json(
      { message: "Non autorisé" },
      { status: 401 }
    );
  }

  const url = new URL(request.url);
  const eventId = url.searchParams.get('eventId');
  const includeGlobal = url.searchParams.get('includeGlobal') !== 'false';

  try {
    const whereConditions: any = {
      isActive: true
    };

    // Si eventId est spécifié, récupérer les templates pour cet événement + globaux
    if (eventId) {
      if (includeGlobal) {
        whereConditions.OR = [
          { eventId: eventId },
          { isGlobal: true }
        ];
      } else {
        whereConditions.eventId = eventId;
      }
    } else if (includeGlobal) {
      // Seulement les templates globaux
      whereConditions.isGlobal = true;
    }

    const templates = await prisma.badgeTemplate.findMany({
      where: whereConditions,
      include: {
        event: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        _count: {
          select: {
            participantBadges: true
          }
        }
      },
      orderBy: [
        { isGlobal: 'desc' }, // Templates globaux en premier
        { createdAt: 'desc' }
      ]
    });

    return NextResponse.json({
      success: true,
      templates: templates.map(template => ({
        id: template.id,
        name: template.name,
        description: template.description,
        isGlobal: template.isGlobal,
        eventId: template.eventId,
        eventName: template.event?.name,
        isActive: template.isActive,
        usageCount: template._count.participantBadges,
        createdAt: template.createdAt,
        updatedAt: template.updatedAt,
        // Ne pas exposer canvasData dans la liste pour des raisons de performance
        hasDesign: !!template.canvasData
      }))
    });

  } catch (error) {
    console.error("Erreur lors de la récupération des templates:", error);
    return NextResponse.json(
      { message: "Erreur lors de la récupération des templates" },
      { status: 500 }
    );
  }
}

// POST /api/badge-templates - Créer un nouveau template
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json(
      { message: "Non autorisé" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { name, description, canvasData, isGlobal, eventId } = body;

    // Validations
    if (!name || !canvasData) {
      return NextResponse.json(
        { message: "Le nom et les données de design sont requis" },
        { status: 400 }
      );
    }

    // Si ce n'est pas global, eventId est requis
    if (!isGlobal && !eventId) {
      return NextResponse.json(
        { message: "eventId est requis pour les templates spécifiques" },
        { status: 400 }
      );
    }

    // Vérifier les permissions pour les templates globaux
    if (isGlobal && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Seuls les administrateurs peuvent créer des templates globaux" },
        { status: 403 }
      );
    }

    // Pour les templates spécifiques, vérifier l'accès à l'événement
    if (!isGlobal && eventId) {
      const event = await prisma.event.findUnique({
        where: { id: eventId },
        select: { userId: true }
      });

      if (!event) {
        return NextResponse.json(
          { message: "Événement non trouvé" },
          { status: 404 }
        );
      }

      // Vérifier que l'utilisateur est propriétaire de l'événement ou admin
      if (session.user.role !== "ADMIN" && event.userId !== session.user.id) {
        return NextResponse.json(
          { message: "Non autorisé pour cet événement" },
          { status: 403 }
        );
      }
    }

    const template = await prisma.badgeTemplate.create({
      data: {
        name,
        description,
        canvasData: JSON.stringify(canvasData),
        isGlobal: !!isGlobal,
        eventId: isGlobal ? null : eventId
      },
      include: {
        event: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      template: {
        id: template.id,
        name: template.name,
        description: template.description,
        isGlobal: template.isGlobal,
        eventId: template.eventId,
        eventName: template.event?.name,
        isActive: template.isActive,
        createdAt: template.createdAt,
        updatedAt: template.updatedAt
      }
    }, { status: 201 });

  } catch (error) {
    console.error("Erreur lors de la création du template:", error);
    return NextResponse.json(
      { message: "Erreur lors de la création du template" },
      { status: 500 }
    );
  }
} 