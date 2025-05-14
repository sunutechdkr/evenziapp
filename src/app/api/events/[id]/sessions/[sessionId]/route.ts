import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// PUT /api/events/[id]/sessions/[sessionId]
export async function PUT(
  request: Request,
  { params }: { params: { id: string; sessionId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id, sessionId } = await params;
    const body = await request.json();
    const {
      title,
      description,
      start_date,
      end_date,
      start_time,
      end_time,
      location,
      speaker,
      capacity,
      format,
      banner,
    } = body;

    // Vérifier que la date de début est égale ou postérieure à la date de début de l'événement
    const event = await prisma.event.findUnique({
      where: { id },
      select: { startDate: true, endDate: true }
    });
    
    if (!event) {
      return NextResponse.json(
        { error: "Événement non trouvé" },
        { status: 404 }
      );
    }
    
    const sessionStartDate = new Date(start_date);
    const eventStartDate = event.startDate;
    const eventEndDate = event.endDate;
    
    if (sessionStartDate < eventStartDate) {
      return NextResponse.json(
        { error: "La date de début de la session doit être égale ou postérieure à la date de début de l'événement" },
        { status: 400 }
      );
    }
    
    if (sessionStartDate > eventEndDate) {
      return NextResponse.json(
        { error: "La date de début de la session ne peut pas être postérieure à la date de fin de l'événement" },
        { status: 400 }
      );
    }

    const now = new Date();

    // Utiliser $executeRaw pour mettre à jour la session
    await prisma.$executeRaw`
      UPDATE event_sessions 
      SET 
        title = ${title},
        description = ${description},
        start_date = ${new Date(start_date)},
        end_date = ${new Date(end_date)},
        start_time = ${start_time},
        end_time = ${end_time},
        location = ${location},
        speaker = ${speaker},
        capacity = ${capacity ? parseInt(capacity) : null},
        format = ${format},
        banner = ${banner},
        updated_at = ${now}
      WHERE 
        id = ${sessionId} 
        AND event_id = ${id}
    `;

    // Récupérer la session mise à jour
    const updatedSession = await prisma.$queryRaw`
      SELECT * FROM event_sessions 
      WHERE id = ${sessionId}
    `;

    return NextResponse.json(updatedSession[0]);
  } catch (error) {
    console.error("Error updating session:", error);
    return NextResponse.json(
      { error: "Error updating session" },
      { status: 500 }
    );
  }
}

// DELETE /api/events/[id]/sessions/[sessionId]
export async function DELETE(
  request: Request,
  { params }: { params: { id: string; sessionId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id, sessionId } = await params;
    
    // Utiliser $executeRaw pour supprimer la session
    await prisma.$executeRaw`
      DELETE FROM event_sessions 
      WHERE id = ${sessionId} AND event_id = ${id}
    `;

    return NextResponse.json({ message: "Session deleted successfully" });
  } catch (error) {
    console.error("Error deleting session:", error);
    return NextResponse.json(
      { error: "Error deleting session" },
      { status: 500 }
    );
  }
} 