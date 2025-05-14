import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { v4 as uuidv4 } from 'uuid';

// GET /api/events - Récupérer la liste des événements
export async function GET() {
  try {
    // Utiliser une requête SQL directe
    const events = await prisma.$queryRaw`
      SELECT * FROM events ORDER BY created_at DESC
    `;
    
    return NextResponse.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 }
    );
  }
}

// POST /api/events - Créer un nouvel événement
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
    
    // Récupérer les données de la requête
    const eventData = await request.json();
    
    // Valider les données requises
    if (!eventData.name || !eventData.location || !eventData.startDate || !eventData.endDate) {
      return NextResponse.json(
        { error: "Données incomplètes: nom, lieu, dates de début et de fin sont requis" },
        { status: 400 }
      );
    }
    
    // Générer un slug unique basé sur le nom de l'événement
    let slug = eventData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    
    // Vérifier si le slug existe déjà
    const existingSlug = await prisma.$queryRaw`
      SELECT slug FROM events WHERE slug = ${slug}
    `;
    
    // Si le slug existe, ajouter un identifiant unique
    if (existingSlug && Array.isArray(existingSlug) && existingSlug.length > 0) {
      const uniqueId = uuidv4().substring(0, 8);
      slug = `${slug}-${uniqueId}`;
    }
    
    // Générer un ID unique
    const id = uuidv4();
    
    // Créer l'événement avec une requête SQL brute
    await prisma.$executeRaw`
      INSERT INTO events (
        id,
        name,
        description,
        location,
        slug,
        banner,
        logo,
        start_date,
        end_date,
        start_time,
        end_time,
        sector,
        type,
        format,
        timezone,
        video_url,
        support_email,
        created_at,
        updated_at,
        user_id
      ) VALUES (
        ${id},
        ${eventData.name},
        ${eventData.description || null},
        ${eventData.location},
        ${slug},
        ${eventData.banner || null},
        ${eventData.logo || null},
        ${eventData.startDate}::date,
        ${eventData.endDate}::date,
        ${eventData.startTime || null},
        ${eventData.endTime || null},
        ${eventData.sector || null},
        ${eventData.type || null},
        ${eventData.format || null},
        ${eventData.timezone || null},
        ${eventData.videoUrl || null},
        ${eventData.supportEmail || null},
        NOW(),
        NOW(),
        ${session.user.id}
      )
    `;
    
    // Récupérer l'événement créé pour le retourner
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
    
    const createdEvent = Array.isArray(event) ? event[0] : null;
    
    // Formatter l'événement pour la réponse
    const formattedEvent = {
      ...createdEvent,
      registrations: 0,
      checkedInCount: 0,
      checkInRate: 0
    };
    
    return NextResponse.json(formattedEvent, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création de l'événement:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la création de l'événement" },
      { status: 500 }
    );
  }
}