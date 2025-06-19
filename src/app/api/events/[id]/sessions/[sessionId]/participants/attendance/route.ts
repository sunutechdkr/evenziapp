import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// PATCH /api/events/[id]/sessions/[sessionId]/participants/attendance
// Marquer la présence d'un participant à une session
export async function PATCH(
  request: Request,
  context: { params: { id: string; sessionId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    const { id, sessionId } = context.params;
    const { participantId, attended } = await request.json();

    if (!participantId) {
      return NextResponse.json(
        { error: "L'ID du participant est requis" },
        { status: 400 }
      );
    }

    // Vérifier que l'événement existe
    const event = await prisma.event.findUnique({
      where: { id },
    });
    
    if (!event) {
      return NextResponse.json(
        { error: "Événement non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier que la session existe
    const sessionExists = await prisma.event_sessions.findUnique({
      where: { id: sessionId },
    });

    if (!sessionExists) {
      return NextResponse.json(
        { error: "Session non trouvée" },
        { status: 404 }
      );
    }

    // Vérifier que le participant est inscrit à cette session
    const participation = await prisma.sessionParticipant.findFirst({
      where: {
        sessionId,
        participantId,
      },
    });

    if (!participation) {
      return NextResponse.json(
        { error: "Ce participant n'est pas inscrit à cette session" },
        { status: 404 }
      );
    }

    // Mettre à jour la présence du participant
    const updatedParticipation = await prisma.sessionParticipant.update({
      where: {
        id: participation.id,
      },
      data: {
        attendedSession: Boolean(attended),
        attendanceTime: Boolean(attended) ? new Date() : null,
      },
    });

    return NextResponse.json(updatedParticipation);
  } catch (error) {
    console.error("Error updating participant attendance:", error);
    return NextResponse.json(
      { error: "Error updating participant attendance", details: String(error) },
      { status: 500 }
    );
  }
} 