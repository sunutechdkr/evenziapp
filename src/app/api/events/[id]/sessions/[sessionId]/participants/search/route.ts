import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/events/[id]/sessions/[sessionId]/participants/search
// Rechercher des participants d'un événement qui ne sont pas déjà inscrits à cette session
export async function GET(
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
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query") || "";
    
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
    const eventSession = await prisma.event_sessions.findUnique({
      where: { 
        id: sessionId,
      },
    });

    if (!eventSession || eventSession.event_id !== id) {
      return NextResponse.json(
        { error: "Session non trouvée pour cet événement" },
        { status: 404 }
      );
    }

    // Récupérer les participants déjà inscrits à cette session
    const alreadyRegistered = await prisma.sessionParticipant.findMany({
      where: {
        sessionId,
      },
      select: {
        participantId: true,
      },
    });

    const alreadyRegisteredIds = alreadyRegistered.map((p: { participantId: string }) => p.participantId);

    // Rechercher les participants de l'événement qui ne sont pas encore inscrits à cette session
    const participants = await prisma.registration.findMany({
      where: {
        eventId: id,
        id: {
          notIn: alreadyRegisteredIds,
        },
        OR: [
          { firstName: { contains: query, mode: 'insensitive' } },
          { lastName: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
          { company: { contains: query, mode: 'insensitive' } },
        ],
      },
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
      },
      orderBy: [
        { lastName: 'asc' },
        { firstName: 'asc' },
      ],
      take: 20,
    });

    return NextResponse.json(participants);
  } catch (error) {
    console.error("Error searching for event participants:", error);
    return NextResponse.json(
      { error: "Error searching for event participants", details: String(error) },
      { status: 500 }
    );
  }
} 