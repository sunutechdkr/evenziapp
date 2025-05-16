import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { v4 as uuidv4 } from 'uuid';

// GET /api/events/[id]/sessions - Récupérer toutes les sessions d'un événement
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { message: "Non autorisé" },
        { status: 401 }
      );
    }
    
    const { id } = params;
    
    // Vérifier que l'événement existe
    const event = await prisma.event.findUnique({
      where: { id },
    });
    
    if (!event) {
      return NextResponse.json(
        { message: "Événement non trouvé" },
        { status: 404 }
      );
    }

    // Récupérer toutes les sessions de l'événement
    const sessions = await prisma.$queryRaw`
      SELECT 
        id,
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
        created_at,
        updated_at
      FROM event_sessions
      WHERE event_id = ${id}
      ORDER BY start_date ASC, start_time ASC
    `;

    return NextResponse.json(sessions);
  } catch (error) {
    console.error("Erreur lors de la récupération des sessions:", error);
    return NextResponse.json(
      { message: "Erreur lors de la récupération des sessions", error: String(error) },
      { status: 500 }
    );
  }
}

// POST /api/events/[id]/sessions - Créer une nouvelle session
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { message: "Non autorisé" },
        { status: 401 }
      );
    }
    
    const { id } = params;
    
    // Vérifier que l'événement existe
    const event = await prisma.event.findUnique({
      where: { id },
    });
    
    if (!event) {
      return NextResponse.json(
        { message: "Événement non trouvé" },
        { status: 404 }
      );
    }

    // Récupérer les données de la session depuis le corps de la requête
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
      banner
    } = body;

    // Valider les données obligatoires
    if (!title || !start_date || !start_time) {
      return NextResponse.json(
        { message: "Le titre, la date et l'heure de début sont obligatoires" },
        { status: 400 }
      );
    }

    // Vérifier que la date de début est égale ou postérieure à la date de début de l'événement
    const sessionStartDate = new Date(start_date);
    const eventStartDate = event.startDate;
    const eventEndDate = event.endDate;
    
    if (sessionStartDate < eventStartDate) {
      return NextResponse.json(
        { message: "La date de début de la session doit être égale ou postérieure à la date de début de l'événement" },
        { status: 400 }
      );
    }
    
    if (eventEndDate && sessionStartDate > eventEndDate) {
      return NextResponse.json(
        { message: "La date de début de la session ne peut pas être postérieure à la date de fin de l'événement" },
        { status: 400 }
      );
    }

    // Générer un ID unique pour la session
    const sessionId = uuidv4();
    const now = new Date();

    // Créer la nouvelle session
    await prisma.$executeRaw`
      INSERT INTO event_sessions (
        id,
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
        event_id,
        created_at,
        updated_at
      ) VALUES (
        ${sessionId},
        ${title},
        ${description || null},
        ${new Date(start_date)},
        ${end_date ? new Date(end_date) : new Date(start_date)},
        ${start_time},
        ${end_time || start_time},
        ${location || null},
        ${speaker || null},
        ${capacity ? parseInt(capacity) : null},
        ${format || null},
        ${banner || null},
        ${id},
        ${now},
        ${now}
      )
    `;

    // Récupérer la session créée
    const createdSession = await prisma.$queryRaw`
      SELECT * FROM event_sessions 
      WHERE id = ${sessionId}
    `;

    return NextResponse.json(createdSession[0], { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création de la session:", error);
    return NextResponse.json(
      { message: "Erreur lors de la création de la session", error: String(error) },
      { status: 500 }
    );
  }
} 