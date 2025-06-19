import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Type pour les participants de session avec les informations supplémentaires
interface SessionParticipantWithInfo {
  id: string;
  sessionId: string;
  participantId: string;
  registeredAt: Date;
  attendedSession: boolean;
  attendanceTime: Date | null;
  participant: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    type: string;
    jobTitle: string | null;
    company: string | null;
    qrCode: string;
    shortCode: string | null;
    checkedIn: boolean;
    checkInTime: Date | null;
  };
}

// GET /api/events/[id]/sessions/[sessionId]/participants
// Récupère tous les participants d'une session
export async function GET(
  request: Request,
  context: { params: { id: string; sessionId: string } }
) {
  try {
    const { id, sessionId } = context.params;

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
      where: { 
        id: sessionId,
      },
    });

    if (!sessionExists) {
      return NextResponse.json(
        { error: "Session non trouvée" },
        { status: 404 }
      );
    }

    // Récupérer tous les participants de la session avec leurs informations
    const participants = await prisma.sessionParticipant.findMany({
      where: {
        sessionId,
      },
      include: {
        participant: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            type: true,
            jobTitle: true,
            company: true,
            qrCode: true,
            shortCode: true,
            checkedIn: true,
            checkInTime: true,
          },
        },
      },
      orderBy: {
        registeredAt: 'desc',
      },
    });

    // Formater les données pour le frontend
    const formattedParticipants = participants.map((p: SessionParticipantWithInfo) => ({
      id: p.id,
      sessionId: p.sessionId,
      participantId: p.participantId,
      registeredAt: p.registeredAt,
      attendedSession: p.attendedSession,
      attendanceTime: p.attendanceTime,
      participant: p.participant,
    }));

    return NextResponse.json(formattedParticipants);
  } catch (error) {
    console.error("Error fetching session participants:", error);
    return NextResponse.json(
      { error: "Error fetching session participants", details: String(error) },
      { status: 500 }
    );
  }
}

// POST /api/events/[id]/sessions/[sessionId]/participants
// Ajouter un participant à une session
export async function POST(
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
    const { participantId } = await request.json();

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

    // Vérifier que la session existe et appartient à l'événement
    const sessionExists = await prisma.event_sessions.findUnique({
      where: { 
        id: sessionId,
      },
    });

    if (!sessionExists || sessionExists.event_id !== id) {
      return NextResponse.json(
        { error: "Session non trouvée pour cet événement" },
        { status: 404 }
      );
    }

    // Vérifier que le participant existe et appartient à l'événement
    const participant = await prisma.registration.findUnique({
      where: {
        id: participantId,
      },
    });

    if (!participant || participant.eventId !== id) {
      return NextResponse.json(
        { error: "Participant non trouvé pour cet événement" },
        { status: 404 }
      );
    }

    // Vérifier si le participant est déjà inscrit à cette session
    const existingParticipation = await prisma.sessionParticipant.findFirst({
      where: {
        sessionId,
        participantId,
      },
    });

    if (existingParticipation) {
      return NextResponse.json(
        { error: "Ce participant est déjà inscrit à cette session" },
        { status: 409 }
      );
    }

    // Ajouter le participant à la session
    const newParticipation = await prisma.sessionParticipant.create({
      data: {
        sessionId,
        participantId,
        registeredAt: new Date(),
        attendedSession: false,
      },
    });

    return NextResponse.json(newParticipation, { status: 201 });
  } catch (error) {
    console.error("Error adding participant to session:", error);
    return NextResponse.json(
      { error: "Error adding participant to session", details: String(error) },
      { status: 500 }
    );
  }
}

// DELETE /api/events/[id]/sessions/[sessionId]/participants
// Supprimer un participant d'une session
export async function DELETE(
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

    const { sessionId } = await params;
    const url = new URL(request.url);
    const participantId = url.searchParams.get('participantId');

    if (!participantId) {
      return NextResponse.json(
        { error: "L'ID du participant est requis" },
        { status: 400 }
      );
    }

    // Vérifier que la participation existe
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

    // Supprimer la participation
    await prisma.sessionParticipant.delete({
      where: {
        id: participation.id,
      },
    });

    return NextResponse.json({ message: "Participant retiré de la session avec succès" });
  } catch (error) {
    console.error("Error removing participant from session:", error);
    return NextResponse.json(
      { error: "Error removing participant from session", details: String(error) },
      { status: 500 }
    );
  }
} 