import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Accéder à l'ID de l'événement de manière sûre
    const { id } = await params;
    
    // Si l'ID est manquant, retourner une erreur
    if (!id) {
      return NextResponse.json(
        { error: "L'identifiant de l'événement est manquant" },
        { status: 400 }
      );
    }
    
    // Récupérer l'événement par son ID
    const event = await prisma.$queryRaw`
      SELECT 
        id, 
        name, 
        description, 
        location, 
        slug, 
        banner,
        logo,
        start_date as "startDate", 
        end_date as "endDate",
        start_time as "startTime", 
        end_time as "endTime",
        sector, 
        type, 
        format, 
        timezone,
        video_url as "videoUrl", 
        support_email as "supportEmail",
        created_at as "createdAt", 
        updated_at as "updatedAt",
        user_id as "userId"
      FROM events
      WHERE id = ${id}
    `;
    
    // Vérifier si l'événement existe
    const eventData = Array.isArray(event) ? event[0] : null;
    
    if (!eventData) {
      return NextResponse.json(
        { error: "Événement non trouvé" },
        { status: 404 }
      );
    }
    
    // Récupérer le nombre d'inscriptions pour cet événement de manière fiable
    const registrationsCount = await prisma.registration.count({
      where: { eventId: id }
    });
    
    // Compter les participants enregistrés (check-in)
    const checkedInCount = await prisma.registration.count({
      where: { 
        eventId: id,
        checkedIn: true
      }
    });
    
    // Formatter l'événement avec le nombre d'inscriptions et autres statistiques
    const formattedEvent = {
      ...eventData,
      registrations: registrationsCount,
      checkedInCount: checkedInCount,
      checkInRate: registrationsCount > 0 ? Math.round((checkedInCount / registrationsCount) * 100) : 0
    };

    return NextResponse.json(formattedEvent);
  } catch (error) {
    console.error("Erreur lors de la récupération de l'événement:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la récupération de l'événement" },
      { status: 500 }
    );
  }
}

// PUT /api/events/[id] - Mettre à jour un événement
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Vérifier l'authentification
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: "Vous devez être connecté pour modifier un événement" },
        { status: 401 }
      );
    }

    // 2. Récupérer l'ID de l'événement
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { error: "L'identifiant de l'événement est manquant" },
        { status: 400 }
      );
    }

    // 3. Vérifier si l'événement existe
    const existingEvent = await prisma.event.findUnique({
      where: { id }
    });

    if (!existingEvent) {
      return NextResponse.json(
        { error: "Événement non trouvé" },
        { status: 404 }
      );
    }

    // 4. Vérifier les autorisations (propriétaire de l'événement ou admin)
    if (existingEvent.userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Vous n'êtes pas autorisé à modifier cet événement" },
        { status: 403 }
      );
    }

    // 5. Récupérer et valider les données envoyées
    const eventData = await request.json();
    
    // Validation des champs obligatoires
    const requiredFields = ['name', 'location', 'startDate', 'endDate'];
    const missingFields = requiredFields.filter(field => !eventData[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          error: "Données incomplètes", 
          missingFields,
          message: `Les champs suivants sont requis: ${missingFields.join(', ')}` 
        },
        { status: 400 }
      );
    }

    // 6. Traitement des dates
    let startDate: Date;
    let endDate: Date;

    try {
      // Essayer de parser les dates
      startDate = new Date(eventData.startDate);
      endDate = new Date(eventData.endDate);
      
      // Vérifier si les dates sont valides
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new Error("Format de date invalide");
      }
    } catch (error) {
      console.error("Erreur de traitement des dates:", error, {
        startDate: eventData.startDate,
        endDate: eventData.endDate
      });
      
      return NextResponse.json(
        { error: "Les dates fournies sont invalides" },
        { status: 400 }
      );
    }

    // 7. Mise à jour de l'événement avec Prisma
    try {
      const updatedEvent = await prisma.event.update({
        where: { id },
        data: {
          name: eventData.name,
          description: eventData.description || null,
          location: eventData.location,
          slug: eventData.slug || existingEvent.slug,
          banner: eventData.banner || existingEvent.banner,
          logo: eventData.logo || existingEvent.logo,
          startDate: startDate,
          endDate: endDate,
          startTime: eventData.startTime || null,
          endTime: eventData.endTime || null,
          sector: eventData.sector || null,
          type: eventData.type || null,
          format: eventData.format || null,
          timezone: eventData.timezone || null,
          videoUrl: eventData.videoUrl || null,
          supportEmail: eventData.supportEmail || null,
          updatedAt: new Date()
        }
      });

      // 8. Récupérer les statistiques pour la réponse
      const registrationsCount = await prisma.registration.count({
        where: { eventId: id }
      });
      
      const checkedInCount = await prisma.registration.count({
        where: { 
          eventId: id,
          checkedIn: true
        }
      });
      
      // 9. Formater et retourner la réponse
      const formattedEvent = {
        ...updatedEvent,
        registrations: registrationsCount,
        checkedInCount: checkedInCount,
        checkInRate: registrationsCount > 0 ? Math.round((checkedInCount / registrationsCount) * 100) : 0
      };
      
      return NextResponse.json(formattedEvent);
      
    } catch (dbError: { code?: string; meta?: { target?: string[] } } & Error) {
      console.error("Erreur lors de la mise à jour dans la base de données:", dbError);
      
      // Gérer les erreurs spécifiques
      if (dbError.code === 'P2002' && dbError.meta?.target?.includes('slug')) {
        return NextResponse.json(
          { error: "Ce slug est déjà utilisé par un autre événement" },
          { status: 409 }
        );
      }
      
      return NextResponse.json(
        { error: "Erreur lors de la mise à jour dans la base de données" },
        { status: 500 }
      );
    }
  } catch (error: unknown) {
    console.error("Erreur lors de la mise à jour de l'événement:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la mise à jour de l'événement" },
      { status: 500 }
    );
  }
}

// DELETE /api/events/[id] - Supprimer un événement
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: "Vous devez être connecté pour supprimer un événement" },
        { status: 401 }
      );
    }

    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { error: "L'identifiant de l'événement est manquant" },
        { status: 400 }
      );
    }

    // Vérifier que l'événement existe
    const existingEvent = await prisma.event.findUnique({
      where: { id }
    });
    
    if (!existingEvent) {
      return NextResponse.json(
        { error: "Événement non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier les autorisations (propriétaire de l'événement ou admin)
    if (existingEvent.userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Vous n'êtes pas autorisé à supprimer cet événement" },
        { status: 403 }
      );
    }

    // Supprimer l'événement
    await prisma.event.delete({
      where: { id }
    });

    return NextResponse.json(
      { message: "Événement supprimé avec succès" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de la suppression de l'événement:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la suppression" },
      { status: 500 }
    );
  }
}
