import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// POST /api/events/[id]/registrations/bulk-delete - Supprimer plusieurs participants
export async function POST(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { message: "Non autorisé" },
        { status: 401 }
      );
    }

    const { id: eventId } = context.params;
    const { participantIds } = await request.json();

    // Valider les données
    if (!participantIds || !Array.isArray(participantIds) || participantIds.length === 0) {
      return NextResponse.json(
        { message: "Liste des participants à supprimer requise" },
        { status: 400 }
      );
    }

    // Vérifier que l'événement existe
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true, name: true }
    });

    if (!event) {
      return NextResponse.json(
        { message: "Événement non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier que les participants existent et appartiennent à cet événement
    const existingParticipants = await prisma.registration.findMany({
      where: {
        id: { in: participantIds },
        eventId: eventId
      },
      select: { id: true, firstName: true, lastName: true }
    });

    if (existingParticipants.length !== participantIds.length) {
      return NextResponse.json(
        { message: "Certains participants n'existent pas ou n'appartiennent pas à cet événement" },
        { status: 400 }
      );
    }

    // Supprimer les participants
    const deleteResult = await prisma.registration.deleteMany({
      where: {
        id: { in: participantIds },
        eventId: eventId
      }
    });

    console.log(`✅ Suppression multiple: ${deleteResult.count} participant(s) supprimé(s) de l'événement ${event.name} par ${session.user.email}`);

    return NextResponse.json({
      message: `${deleteResult.count} participant(s) supprimé(s) avec succès`,
      deletedCount: deleteResult.count,
      deletedParticipants: existingParticipants.map((p: { id: string; firstName: string; lastName: string }) => ({
        id: p.id,
        name: `${p.firstName} ${p.lastName}`
      }))
    });

  } catch (error) {
    console.error("Erreur lors de la suppression multiple:", error);
    return NextResponse.json(
      { message: "Erreur lors de la suppression des participants" },
      { status: 500 }
    );
  }
} 