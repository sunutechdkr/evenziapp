import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { v4 as uuidv4 } from 'uuid';

// Définir des types pour les intervenants
type Speaker = {
  id: string;
  firstName: string;
  lastName: string;
  [key: string]: any; // Pour permettre d'autres propriétés
};

// GET /api/events/[id]/sessions - Récupérer toutes les sessions d'un événement
export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { message: "Non autorisé" },
        { status: 401 }
      );
    }
    
    // Accéder directement aux paramètres depuis le contexte
    const { id } = context.params;
    
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
        video_url,
        created_at,
        updated_at
      FROM event_sessions
      WHERE event_id = ${id}
      ORDER BY start_date ASC, start_time ASC
    `;

    // Récupérer tous les intervenants de cet événement pour enrichir les données
    const registrations = await prisma.$queryRaw`
      SELECT 
        id, 
        first_name as "firstName", 
        last_name as "lastName", 
        type
      FROM registrations
      WHERE event_id = ${id} AND type = 'SPEAKER'
    `;

    // Transformer les données des sessions pour enrichir les informations des intervenants
    const enrichedSessions = await Promise.all(Array.from(sessions as any[]).map(async (session: any) => {
      let speakerInfo: string | Speaker | Speaker[] = session.speaker;
      
      // Si le speaker est un ID, essayer de le convertir en objet avec firstName et lastName
      if (session.speaker && typeof session.speaker === 'string') {
        // Essayer de détecter si c'est un UUID (format d'ID typique)
        if (session.speaker.includes('-') && !session.speaker.includes(',') && !session.speaker.includes('{')) {
          // Chercher l'intervenant correspondant dans les inscriptions
          const speakerMatch = Array.from(registrations as any[]).find((reg: any) => reg.id === session.speaker);
          
          if (speakerMatch) {
            // Remplacer l'ID par un objet formaté avec firstName et lastName
            speakerInfo = {
              id: speakerMatch.id,
              firstName: speakerMatch.firstName,
              lastName: speakerMatch.lastName
            };
          } else {
            // Si pas trouvé, créer un nom générique pour éviter d'afficher l'ID
            speakerInfo = {
              id: session.speaker,
              firstName: `Intervenant`,
              lastName: `${session.speaker.substring(0, 5)}`
            };
          }
        }
        
        // Si le champ contient une virgule, c'est probablement une liste de noms
        else if (session.speaker.includes(',')) {
          const speakerNames = session.speaker.split(',');
          speakerInfo = speakerNames.map((name: string, index: number) => {
            const trimmedName = name.trim();
            const nameParts = trimmedName.split(' ');
            return {
              id: `speaker-${session.id}-${index}`,
              firstName: nameParts[0] || "Intervenant",
              lastName: nameParts.slice(1).join(' ') || ""
            };
          });
        }
        
        // Sinon, essayer de parser comme JSON
        else if (session.speaker.startsWith('{') || session.speaker.startsWith('[')) {
          try {
            const parsed = JSON.parse(session.speaker);
            speakerInfo = parsed;
          } catch (e) {
            // Garder la valeur originale si le parsing échoue
          }
        }
        
        // Si c'est juste une chaîne de caractères (nom simple)
        else {
          const nameParts = session.speaker.trim().split(' ');
          speakerInfo = {
            id: `speaker-${session.id}`,
            firstName: nameParts[0] || "Intervenant",
            lastName: nameParts.slice(1).join(' ') || ""
          };
        }
      }
      
      return {
        ...session,
        speaker: speakerInfo
      };
    }));

    return NextResponse.json(enrichedSessions);
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
  context: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { message: "Non autorisé" },
        { status: 401 }
      );
    }
    
    // Accéder directement aux paramètres depuis le contexte
    const { id } = context.params;
    
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
      banner,
      video_url
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
        video_url,
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
        ${video_url || null},
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