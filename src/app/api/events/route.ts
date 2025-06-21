import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { createDefaultTemplates } from "@/lib/defaultTemplates";

// GET /api/events - Récupérer la liste des événements
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    
    const { searchParams } = new URL(request.url);
    const includeArchived = searchParams.get('includeArchived') === 'true';
    const onlyArchived = searchParams.get('onlyArchived') === 'true';
    
    let whereCondition: any = {};
    if (onlyArchived) {
      whereCondition.archived = true;
    } else if (!includeArchived) {
      whereCondition.archived = false;
    }
    
    if (session.user.role === "ORGANIZER") {
      whereCondition.userId = session.user.id;
    } else if (session.user.role === "USER" || session.user.role === "STAFF") {
      return NextResponse.json([]);
    }
    
    const events = await prisma.event.findMany({
      where: whereCondition,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        description: true,
        location: true,
        slug: true,
        banner: true,
        logo: true,
        startDate: true,
        endDate: true,
        startTime: true,
        endTime: true,
        sector: true,
        type: true,
        format: true,
        timezone: true,
        videoUrl: true,
        supportEmail: true,
        archived: true,
        archivedAt: true,
        createdAt: true,
        updatedAt: true,
        userId: true,
        _count: {
          select: {
            registrations: true
          }
        }
      }
    });
    
    const formattedEvents = events.map((event: any) => ({
      ...event,
      start_date: event.startDate,
      end_date: event.endDate,
      registrations: event._count.registrations,
      checkedInCount: 0,
      checkInRate: 0
    }));
    
    return NextResponse.json(formattedEvents);
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
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }
    
    const eventData = await request.json();
    
    if (!eventData.name || !eventData.location || !eventData.startDate || !eventData.endDate) {
      return NextResponse.json(
        { error: "Données incomplètes: nom, lieu, dates de début et de fin sont requis" },
        { status: 400 }
      );
    }
    
    let slug = eventData.slug || eventData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    
    const existingEvent = await prisma.event.findFirst({
      where: { slug }
    });
    
    if (existingEvent) {
      const timestamp = Date.now().toString().slice(-6);
      slug = `${slug}-${timestamp}`;
    }
    
    const newEvent = await prisma.event.create({
      data: {
        name: eventData.name,
        description: eventData.description || null,
        location: eventData.location,
        slug: slug,
        banner: eventData.banner || null,
        logo: eventData.logo || null,
        startDate: new Date(eventData.startDate),
        endDate: new Date(eventData.endDate),
        startTime: eventData.startTime || null,
        endTime: eventData.endTime || null,
        sector: eventData.sector || null,
        type: eventData.type || null,
        format: eventData.format || null,
        timezone: eventData.timezone || null,
        videoUrl: eventData.videoUrl || null,
        supportEmail: eventData.supportEmail || null,
        userId: session.user.id
      }
    });
    
    console.log('✅ Événement créé avec succès:', newEvent.id);
    
    // Créer les templates par défaut
    try {
      await createDefaultTemplates(newEvent.id);
      console.log('✅ Templates par défaut créés pour l\'événement:', newEvent.id);
    } catch (templateError) {
      console.error('⚠️ Erreur lors de la création des templates par défaut:', templateError);
      // On ne fait pas échouer la création de l'événement si les templates échouent
    }
    
    return NextResponse.json({
      id: newEvent.id,
      name: newEvent.name,
      description: newEvent.description,
      location: newEvent.location,
      slug: newEvent.slug,
      startDate: newEvent.startDate,
      endDate: newEvent.endDate,
      startTime: newEvent.startTime,
      endTime: newEvent.endTime,
      sector: newEvent.sector,
      type: newEvent.type,
      format: newEvent.format,
      timezone: newEvent.timezone,
      videoUrl: newEvent.videoUrl,
      supportEmail: newEvent.supportEmail,
      archived: newEvent.archived,
      archivedAt: newEvent.archivedAt,
      createdAt: newEvent.createdAt,
      updatedAt: newEvent.updatedAt,
      userId: newEvent.userId,
      registrations: 0,
      checkedInCount: 0,
      checkInRate: 0
    }, { status: 201 });
    
  } catch (error) {
    console.error("❌ Erreur lors de la création de l'événement:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la création de l'événement" },
      { status: 500 }
    );
  }
} 