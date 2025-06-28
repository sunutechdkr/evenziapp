import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { v4 as uuidv4 } from 'uuid';
import { generateShortCode } from "@/lib/shortcodes";

// GET /api/events/[id]/registrations - Get registrations for an event
export async function GET(
  request: Request, 
  context: { params: { id: string } }
) {
  // Check for authentication
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }
  
  const { id } = context.params;
  const url = new URL(request.url);
  const userEmail = url.searchParams.get('userEmail');
  
  try {
    // Check if the event exists using raw SQL query to avoid schema mismatches
    const event = await prisma.$queryRaw`
      SELECT 
        id, 
        name, 
        description, 
        location, 
        start_date as "startDate", 
        end_date as "endDate",
        user_id as "userId"
      FROM events
      WHERE id = ${id}
    `;

    // If no event found
    if (!event || !Array.isArray(event) || event.length === 0) {
      return NextResponse.json(
        { message: "Event not found" },
        { status: 404 }
      );
    }
    
    // Autoriser l'accès aux administrateurs, aux propriétaires de l'événement ET aux participants inscrits
    const isAdmin = session.user.role === "ADMIN";
    const isEventOwner = event[0].userId === session.user.id;
    
    // Vérifier si l'utilisateur est inscrit à l'événement
    let isParticipant = false;
    if (!isAdmin && !isEventOwner) {
      const userRegistration = await prisma.$queryRaw`
        SELECT id FROM registrations 
        WHERE event_id = ${id} AND email = ${session.user.email}
      `;
      isParticipant = Array.isArray(userRegistration) && userRegistration.length > 0;
    }
    
    // Autoriser l'accès si l'utilisateur est admin, propriétaire ou participant
    if (!isAdmin && !isEventOwner && !isParticipant) {
      return NextResponse.json(
        { message: "Unauthorized - You must be registered for this event to view participants" },
        { status: 401 }
      );
    }
    
    // Si un userEmail est spécifié, retourner seulement l'enregistrement de cet utilisateur
    if (userEmail) {
      const userRegistration = await prisma.$queryRaw`      SELECT 
        id, 
        first_name as "firstName", 
        last_name as "lastName", 
        email, 
        phone, 
        type, 
        job_title as "jobTitle",
        company,
        event_id as "eventId", 
        ticket_id as "ticketId",
        qr_code as "qrCode", 
        short_code as "shortCode",
        created_at as "createdAt",
        updated_at as "updatedAt",
        checked_in as "checkedIn", 
        check_in_time as "checkInTime"
      FROM registrations
        WHERE event_id = ${id} AND email = ${userEmail}
        LIMIT 1
      `;
      
      if (Array.isArray(userRegistration) && userRegistration.length > 0) {
        return NextResponse.json({
          registration: userRegistration[0],
        });
      } else {
        return NextResponse.json(
          { message: "Registration not found for this user" },
          { status: 404 }
        );
      }
    }
    
    // Get registrations for the event with SQL query to ensure all fields are included
    const registrations = await prisma.$queryRaw`      SELECT 
        id, 
        first_name as "firstName", 
        last_name as "lastName", 
        email, 
        phone, 
        type, 
        job_title as "jobTitle",
        company,
        event_id as "eventId", 
        ticket_id as "ticketId",
        qr_code as "qrCode", 
        short_code as "shortCode",
        created_at as "createdAt",
        updated_at as "updatedAt",
        checked_in as "checkedIn", 
        check_in_time as "checkInTime"
      FROM registrations
      WHERE event_id = ${id}
      ORDER BY created_at DESC
    `;
    
    return NextResponse.json({
      registrations,
    });
    
  } catch (error) {
    console.error("Error fetching registrations:", error);
    return NextResponse.json(
      { message: "Error fetching registrations" },
      { status: 500 }
    );
  }
} 

// POST /api/events/[id]/registrations - Create a new registration
export async function POST(
  request: Request, 
  context: { params: { id: string } }
) {
  // Check for authentication
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }
  
  const { id } = context.params;
  
  try {
    // Check if the event exists using raw SQL query
    const event = await prisma.$queryRaw`
      SELECT 
        id, 
        name, 
        description, 
        location, 
        start_date as "startDate", 
        end_date as "endDate"
      FROM events
      WHERE id = ${id}
    `;
    
    if (!event || !Array.isArray(event) || event.length === 0) {
      return NextResponse.json(
        { message: "Event not found" },
        { status: 404 }
      );
    }
    
    // Parse request body
    const { firstName, lastName, email, phone, jobTitle, company, type, ticketId } = await request.json();
    

    // If ticketId is provided, validate the ticket
    if (ticketId) {
      const ticket = await prisma.ticket.findFirst({
        where: {
          id: ticketId,
          eventId: id,
          status: 'ACTIVE',
          visibility: 'VISIBLE'
        }
      });

      if (!ticket) {
        return NextResponse.json(
          { message: "Billet non valide ou non disponible" },
          { status: 400 }
        );
      }

      // Check if ticket has reached its limit
      if (ticket.quantity && ticket.sold >= ticket.quantity) {
        return NextResponse.json(
          { message: "Ce billet n'est plus disponible" },
          { status: 400 }
        );
      }
    }

    // Validate required fields
    if (!firstName || !lastName || !email || !phone) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }
    
    // Generate a short code for the badge QR
    let shortCode = generateShortCode();
    let isUniqueShortCode = false;
    
    // Ensure the shortCode is unique
    while (!isUniqueShortCode) {
      // Vérifiez si le shortCode existe déjà
      const existingRegistration = await prisma.$queryRaw`
        SELECT id FROM registrations WHERE short_code = ${shortCode}
      `;
      
      if (!Array.isArray(existingRegistration) || existingRegistration.length === 0) {
        isUniqueShortCode = true;
      } else {
        // If collision, generate a new code
        shortCode = generateShortCode();
      }
    }
    
    // Utiliser le shortCode comme valeur pour qrCode également
    const qrCode = shortCode;
    
    // Générer un ID unique pour le nouvel enregistrement
    const registrationId = uuidv4();
    
    // Insertion directe avec SQL brut pour éviter les problèmes de typage
    await prisma.$executeRaw`
      INSERT INTO registrations (
        id, 
        first_name, 
        last_name, 
        email, 
        phone, 
        type, 
        job_title,
        company,
        qr_code, 
        short_code, 
        event_id, 
        created_at, 
        updated_at, 
        checked_in
      ) 
      VALUES (
        ${registrationId}, 
        ${firstName}, 
        ${lastName}, 
        ${email}, 
        ${phone}, 
        ${type || "PARTICIPANT"}, 
        ${jobTitle || null},
        ${company || null},
        ${qrCode}, 
        ${shortCode}, 
        ${id}, 
        NOW(), 
        NOW(),
        false
      )
    `;
    
    // Récupérer l'enregistrement nouvellement créé
    const newRegistration = await prisma.$queryRaw`
      SELECT 
        id, 
        first_name as "firstName", 
        last_name as "lastName", 
        email, 
        phone, 
        type, 
        job_title as "jobTitle",
        company,
        qr_code as "qrCode", 
        short_code as "shortCode", 
        created_at as "createdAt",
        checked_in as "checkedIn"
      FROM registrations 
      WHERE id = ${registrationId}
    `;
    
    // Loguer les informations additionnelles pour référence future
    if (jobTitle || company) {
      console.log(`Registration ${registrationId} includes professional info: jobTitle=${jobTitle}, company=${company}`);
    }
    
    console.log(`Created registration with ID: ${registrationId}, shortCode/qrCode: ${shortCode}`);
    
    return NextResponse.json({
      registration: Array.isArray(newRegistration) && newRegistration.length > 0 ? newRegistration[0] : null,
      message: "Registration created successfully"
    }, { status: 201 });
    
  } catch (error) {
    console.error("Error creating registration:", error);
    return NextResponse.json(
      { message: "Error creating registration" },
      { status: 500 }
    );
  }
} 