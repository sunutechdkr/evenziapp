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
  { params }: { params: Promise<{ id: string }> }
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
    const { id } = await params;
    
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
        email,
        job_title as "jobTitle",
        company,
        type,
        checked_in as "checkedIn",
        avatar
      FROM registrations
      WHERE event_id = ${id} AND type = 'SPEAKER'
    `;

    // Créer un map des intervenants pour un accès rapide
    const speakerMap = new Map();
    (registrations as any[]).forEach((speaker: any) => {
      speakerMap.set(speaker.id, speaker);
    });

    // Enrichir les sessions avec les informations complètes des intervenants
    const enrichedSessions = await Promise.all(Array.from(sessions as any[]).map(async (session: any) => {
      let speakerInfo: string | Speaker | Speaker[] = session.speaker;
      let sessionSpeakers: Speaker[] = [];

      // Si le champ speaker n'est pas vide, traiter les différents formats
      if (session.speaker) {
        console.log(`Processing speaker field for session ${session.title}:`, session.speaker);
        
        // Si c'est déjà un tableau d'objets Speaker
        if (Array.isArray(session.speaker)) {
          sessionSpeakers = session.speaker.map((speaker: any) => ({
            id: speaker.id,
            firstName: speaker.firstName || speaker.first_name,
            lastName: speaker.lastName || speaker.last_name,
            email: speaker.email,
            jobTitle: speaker.jobTitle || speaker.job_title,
            company: speaker.company,
            type: speaker.type || 'SPEAKER',
            checkedIn: speaker.checkedIn || speaker.checked_in || false,
            avatar: speaker.avatar
          }));
        }
        // Si le champ contient des IDs séparés par des virgules
        else if (session.speaker.includes(',')) {
          const speakerIds = session.speaker.split(',').map((id: string) => id.trim());
          sessionSpeakers = speakerIds
            .map((id: string) => speakerMap.get(id))
            .filter(Boolean)
            .map((speaker: any) => ({
              id: speaker.id,
              firstName: speaker.firstName,
              lastName: speaker.lastName,
              email: speaker.email,
              jobTitle: speaker.jobTitle,
              company: speaker.company,
              type: speaker.type,
              checkedIn: speaker.checkedIn,
              avatar: speaker.avatar
            }));
        }
        // Si c'est un seul ID
        else if (speakerMap.has(session.speaker)) {
          const speaker = speakerMap.get(session.speaker);
          sessionSpeakers = [{
            id: speaker.id,
            firstName: speaker.firstName,
            lastName: speaker.lastName,
            email: speaker.email,
            jobTitle: speaker.jobTitle,
            company: speaker.company,
            type: speaker.type,
            checkedIn: speaker.checkedIn,
            avatar: speaker.avatar
          }];
        }
        // Sinon, essayer de parser comme JSON
        else if (session.speaker.startsWith('{') || session.speaker.startsWith('[')) {
          try {
            const parsed = JSON.parse(session.speaker);
            if (Array.isArray(parsed)) {
              sessionSpeakers = parsed.map((speaker: any) => ({
                id: speaker.id || `speaker-${session.id}-${Date.now()}`,
                firstName: speaker.firstName || speaker.first_name || "",
                lastName: speaker.lastName || speaker.last_name || "",
                email: speaker.email || "",
                jobTitle: speaker.jobTitle || speaker.job_title || "",
                company: speaker.company || "",
                type: speaker.type || 'SPEAKER',
                checkedIn: speaker.checkedIn || speaker.checked_in || false,
                avatar: speaker.avatar || null
              }));
            } else {
              sessionSpeakers = [{
                id: parsed.id || `speaker-${session.id}`,
                firstName: parsed.firstName || parsed.first_name || "",
                lastName: parsed.lastName || parsed.last_name || "",
                email: parsed.email || "",
                jobTitle: parsed.jobTitle || parsed.job_title || "",
                company: parsed.company || "",
                type: parsed.type || 'SPEAKER',
                checkedIn: parsed.checkedIn || parsed.checked_in || false,
                avatar: parsed.avatar || null
              }];
            }
          } catch (e) {
            console.error("Erreur de parsing JSON pour la session", session.title, e);
          }
        }
        // Si c'est juste une chaîne de caractères (nom simple)
        else {
          const nameParts = session.speaker.trim().split(' ');
          sessionSpeakers = [{
            id: `speaker-${session.id}`,
            firstName: nameParts[0] || "Intervenant",
            lastName: nameParts.slice(1).join(' ') || "",
            email: "",
            jobTitle: "",
            company: "",
            type: 'SPEAKER',
            checkedIn: false,
            avatar: null
          }];
        }
      }
      
      // Compter les participants inscrits à cette session
      const participantCount = await prisma.$queryRaw`
        SELECT COUNT(*) as count
        FROM session_participants
        WHERE session_id = ${session.id}
      `;
      
      return {
        ...session,
        speakers: sessionSpeakers,
        participantCount: Number((participantCount as any[])[0]?.count || 0)
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
  { params }: { params: Promise<{ id: string }> }
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
    const { id } = await params;
    
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