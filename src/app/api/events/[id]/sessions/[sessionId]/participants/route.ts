import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/events/[id]/sessions/[sessionId]/participants - Récupérer les participants d'une session
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; sessionId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { message: "Non autorisé" },
        { status: 401 }
      );
    }
    
    const { id: eventId, sessionId } = await params;
    
    // Vérifier que l'événement existe
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });
    
    if (!event) {
      return NextResponse.json(
        { message: "Événement non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier que la session existe
    const sessionExists = await prisma.$queryRaw`
      SELECT id FROM event_sessions 
      WHERE id = ${sessionId} AND event_id = ${eventId}
    `;
    
    if (!Array.isArray(sessionExists) || sessionExists.length === 0) {
      return NextResponse.json(
        { message: "Session non trouvée" },
        { status: 404 }
      );
    }

    // Récupérer les participants de la session
    const participants = await prisma.$queryRaw`
      SELECT 
        r.id,
        r.first_name as "firstName",
        r.last_name as "lastName",
        r.email,
        r.phone,
        r.job_title as "jobTitle",
        r.company,
        r.type,
        r.checked_in as "checkedIn",
        r.avatar
      FROM session_participants sp
      JOIN registrations r ON sp.participant_id = r.id
      WHERE sp.session_id = ${sessionId}
      ORDER BY r.first_name, r.last_name
    `;

    return NextResponse.json(participants);
  } catch (error) {
    console.error("Erreur lors de la récupération des participants de la session:", error);
    return NextResponse.json(
      { message: "Erreur lors de la récupération des participants", error: String(error) },
      { status: 500 }
    );
  }
}

// POST /api/events/[id]/sessions/[sessionId]/participants
// Ajouter un participant à une session
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; sessionId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    const { id, sessionId } = await params;
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
  { params }: { params: Promise<{ id: string; sessionId: string }> }
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