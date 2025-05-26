import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

// Type pour les événements récupérés
type EventToModify = {
  id: string;
  name: string;
  userId: string;
  archived: boolean;
};

// POST /api/events/bulk-actions - Actions en masse sur les événements
export async function POST(request: Request) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    // Vérifier les permissions - seuls ADMIN et ORGANIZER peuvent effectuer ces actions
    if (session.user.role !== "ADMIN" && session.user.role !== "ORGANIZER") {
      return NextResponse.json(
        { error: "Permissions insuffisantes. Seuls les administrateurs et organisateurs peuvent effectuer cette action." },
        { status: 403 }
      );
    }

    // Récupérer les données de la requête
    const { action, eventIds } = await request.json();

    // Valider les données
    if (!action || !eventIds || !Array.isArray(eventIds) || eventIds.length === 0) {
      return NextResponse.json(
        { error: "Action et liste d'événements requises" },
        { status: 400 }
      );
    }

    // Valider l'action
    if (!["archive", "unarchive", "delete", "delete-safe"].includes(action)) {
      return NextResponse.json(
        { error: "Action non valide. Actions supportées: archive, unarchive, delete, delete-safe" },
        { status: 400 }
      );
    }

    // Vérifier que l'utilisateur a le droit de modifier ces événements
    const eventsToModify = await prisma.event.findMany({
      where: {
        id: { in: eventIds }
      },
      select: {
        id: true,
        name: true,
        userId: true,
        archived: true
      }
    });

    // Vérifier que tous les événements existent
    if (eventsToModify.length !== eventIds.length) {
      return NextResponse.json(
        { error: "Certains événements n'ont pas été trouvés" },
        { status: 404 }
      );
    }

    // Vérifier les permissions pour chaque événement
    const unauthorizedEvents = eventsToModify.filter((event: EventToModify) => 
      session.user.role !== "ADMIN" && event.userId !== session.user.id
    );

    if (unauthorizedEvents.length > 0) {
      return NextResponse.json(
        { 
          error: "Vous n'êtes pas autorisé à modifier certains événements",
          unauthorizedEvents: unauthorizedEvents.map((e: EventToModify) => ({ id: e.id, name: e.name }))
        },
        { status: 403 }
      );
    }

    let result;

    switch (action) {
      case "archive":
        result = await prisma.event.updateMany({
          where: {
            id: { in: eventIds },
            archived: false // Ne pas archiver les événements déjà archivés
          },
          data: {
            archived: true,
            archivedAt: new Date(),
            updatedAt: new Date()
          }
        });
        break;

      case "unarchive":
        result = await prisma.event.updateMany({
          where: {
            id: { in: eventIds },
            archived: true // Ne pas désarchiver les événements non archivés
          },
          data: {
            archived: false,
            archivedAt: null,
            updatedAt: new Date()
          }
        });
        break;

      case "delete":
        // Vérifier s'il y a des inscriptions actives pour chaque événement
        const eventsWithRegistrations = await prisma.event.findMany({
          where: {
            id: { in: eventIds }
          },
          select: {
            id: true,
            name: true,
            _count: {
              select: {
                registrations: true
              }
            }
          }
        });

        const eventsWithActiveRegistrations = eventsWithRegistrations.filter(
          event => event._count.registrations > 0
        );
        const eventsToDelete = eventsWithRegistrations.filter(
          event => event._count.registrations === 0
        );

        if (eventsWithActiveRegistrations.length > 0) {
          // Si tous les événements ont des inscriptions, empêcher la suppression
          if (eventsToDelete.length === 0) {
            return NextResponse.json(
              { 
                error: `Impossible de supprimer les événements. ${eventsWithActiveRegistrations.length} événement(s) avec inscriptions actives.`,
                eventsWithRegistrations: eventsWithActiveRegistrations.map(e => ({
                  id: e.id,
                  name: e.name,
                  registrations: e._count.registrations
                })),
                suggestion: "Archivez plutôt ces événements ou supprimez d'abord toutes les inscriptions"
              },
              { status: 400 }
            );
          }

          // Si seulement certains événements ont des inscriptions, informer l'utilisateur
          return NextResponse.json(
            { 
              error: `${eventsWithActiveRegistrations.length} événement(s) ne peuvent pas être supprimés car ils ont des inscriptions actives.`,
              eventsWithRegistrations: eventsWithActiveRegistrations.map(e => ({
                id: e.id,
                name: e.name,
                registrations: e._count.registrations
              })),
              deletableEvents: eventsToDelete.map(e => ({
                id: e.id,
                name: e.name
              })),
              suggestion: "Voulez-vous supprimer uniquement les événements sans inscriptions ?"
            },
            { status: 400 }
          );
        }

        // Supprimer les événements (Prisma s'occupera des relations avec onDelete: Cascade)
        result = await prisma.event.deleteMany({
          where: {
            id: { in: eventIds }
          }
        });
        break;

      case "delete-safe":
        // Supprimer uniquement les événements sans inscriptions
        const eventsToDeleteSafely = await prisma.event.findMany({
          where: {
            id: { in: eventIds }
          },
          select: {
            id: true,
            name: true,
            _count: {
              select: {
                registrations: true
              }
            }
          }
        });

        const safeEventIds = eventsToDeleteSafely
          .filter(event => event._count.registrations === 0)
          .map(event => event.id);

        if (safeEventIds.length === 0) {
          return NextResponse.json(
            { 
              error: "Aucun événement ne peut être supprimé car tous ont des inscriptions actives.",
              suggestion: "Archivez plutôt ces événements"
            },
            { status: 400 }
          );
        }

        result = await prisma.event.deleteMany({
          where: {
            id: { in: safeEventIds }
          }
        });

        const skippedEvents = eventsToDeleteSafely.filter(event => event._count.registrations > 0);
        
        console.log(`✅ Suppression sécurisée: ${result.count} événement(s) supprimé(s), ${skippedEvents.length} ignoré(s) par ${session.user.email}`);

        return NextResponse.json({
          success: true,
          action: "delete-safe",
          affectedCount: result.count,
          skippedCount: skippedEvents.length,
          skippedEvents: skippedEvents.map(e => ({ id: e.id, name: e.name, registrations: e._count.registrations })),
          message: `${result.count} événement(s) supprimé(s) avec succès. ${skippedEvents.length} événement(s) ignoré(s) car ils ont des inscriptions.`
        });
    }

    console.log(`✅ Action '${action}' effectuée sur ${result.count} événement(s) par ${session.user.email}`);

    return NextResponse.json({
      success: true,
      action,
      affectedCount: result.count,
      message: `${result.count} événement(s) ${action === 'archive' ? 'archivé(s)' : action === 'unarchive' ? 'désarchivé(s)' : 'supprimé(s)'} avec succès`
    });

  } catch (error) {
    console.error("❌ Erreur lors de l'action en masse sur les événements:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de l'opération" },
      { status: 500 }
    );
  }
} 