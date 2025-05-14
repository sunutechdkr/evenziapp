import fs from 'fs/promises';
import path from 'path';

const content = `import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import crypto from "crypto";

// GET /api/events - Récupérer la liste des événements
export async function GET() {
  try {
    // Utiliser une requête SQL directe
    const events = await prisma.$queryRaw\`
      SELECT * FROM events ORDER BY created_at DESC
    \`;
    
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
    if (!eventData.name || !eventData.location || !eventData.slug) {
      return NextResponse.json(
        { error: "Données incomplètes: nom, lieu et slug sont requis" },
        { status: 400 }
      );
    }
    
    // Vérifier si le slug est unique
    const existingEventCheck = await prisma.$queryRaw\`
      SELECT id FROM events WHERE slug = \${eventData.slug} LIMIT 1
    \`;
    
    if (existingEventCheck && Array.isArray(existingEventCheck) && existingEventCheck.length > 0) {
      return NextResponse.json(
        { error: "Un événement avec ce slug existe déjà" },
        { status: 400 }
      );
    }
    
    // Générer un ID unique pour l'événement
    const eventId = \`evnt\${crypto.randomBytes(4).toString('hex')}\`;
    const now = new Date();
    
    // Créer l'événement avec une requête SQL brute
    await prisma.$executeRaw\`
      INSERT INTO events (
        id, name, description, location, slug, banner, logo,
        start_date, end_date, start_time, end_time,
        sector, type, format, timezone, video_url, support_email,
        created_at, updated_at, user_id
      ) VALUES (
        \${eventId}, \${eventData.name}, \${eventData.description || null}, \${eventData.location}, \${eventData.slug}, \${eventData.banner || null}, \${eventData.logo || null},
        \${eventData.startDate ? new Date(eventData.startDate) : now}, \${eventData.endDate ? new Date(eventData.endDate) : now}, \${eventData.startTime || null}, \${eventData.endTime || null},
        \${eventData.sector || null}, \${eventData.type || null}, \${eventData.format || null}, \${eventData.timezone || null}, \${eventData.videoUrl || null}, \${eventData.supportEmail || null},
        \${now}, \${now}, \${session.user.id}
      )
    \`;
    
    // Récupérer l'événement créé pour le retourner
    const event = await prisma.$queryRaw\`
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
      WHERE id = \${eventId}
    \`;
    
    const eventResult = Array.isArray(event) ? event[0] : null;
    
    return NextResponse.json(eventResult);
  } catch (error) {
    console.error("Erreur lors de la création de l'événement:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la création de l'événement" },
      { status: 500 }
    );
  }
}`;

async function writeFile() {
  try {
    const filePath = path.join(process.cwd(), 'src', 'app', 'api', 'events', 'route.ts');
    await fs.writeFile(filePath, content, 'utf8');
    console.log('Fichier créé avec succès:', filePath);
  } catch (error) {
    console.error('Erreur lors de la création du fichier:', error);
  }
}

writeFile(); 