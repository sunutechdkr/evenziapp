import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Schema for QR code check-in
const qrCheckInSchema = z.object({
  qrCode: z.string().min(1),
  eventId: z.string().min(1),
});

// Schema for short code check-in
const shortCodeCheckInSchema = z.object({
  shortCode: z.string().min(1),
  eventId: z.string().min(1),
});

// Schema for manual check-in by email
const emailCheckInSchema = z.object({
  email: z.string().email(),
  eventId: z.string().min(1),
});

// Schema for participant ID check-in
const participantIdCheckInSchema = z.object({
  participantId: z.string().min(1),
  eventId: z.string().min(1),
});

export async function POST(request: Request) {
  // Check for authentication
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }
  
  try {
    const body = await request.json();
    
    // Logging pour le débogage
    console.log("Check-in request:", JSON.stringify(body));
    
    // Determine check-in method
    const isQrCheckIn = "qrCode" in body;
    const isShortCodeCheckIn = "shortCode" in body;
    const isEmailCheckIn = "email" in body;
    const isParticipantIdCheckIn = "participantId" in body;
    
    if (!isQrCheckIn && !isShortCodeCheckIn && !isEmailCheckIn && !isParticipantIdCheckIn) {
      console.error("Invalid check-in data, missing required fields");
      return NextResponse.json(
        { message: "Invalid check-in data. Must provide either qrCode, shortCode, email, or participantId." },
        { status: 400 }
      );
    }
    
    const { eventId } = body;
    
    // Get the event using direct SQL
    const eventQuery = await prisma.$queryRaw`
      SELECT id, name FROM events 
      WHERE id = ${eventId}
    `;
    
    const event = Array.isArray(eventQuery) && eventQuery.length > 0 ? eventQuery[0] : null;
    
    if (!event) {
      console.error(`Event with ID ${eventId} not found`);
      return NextResponse.json(
        { message: "Event not found" },
        { status: 404 }
      );
    }
    
    // Recherche du participant
    let registrationQuery;
    
    try {
      if (isQrCheckIn) {
        // Validate QR code check-in data
        const validationResult = qrCheckInSchema.safeParse(body);
        
        if (!validationResult.success) {
            console.error("QR code validation error:", validationResult.error.flatten());
          return NextResponse.json(
            { message: "Invalid check-in data", errors: validationResult.error.flatten() },
            { status: 400 }
          );
        }
        
        const { qrCode } = validationResult.data;
        console.log(`Vérification de check-in avec code: ${qrCode} pour l'événement: ${eventId}`);
        
        // D'abord essayer de rechercher par short_code (prioritaire)
        registrationQuery = await prisma.$queryRaw`
          SELECT id, first_name, last_name, email, checked_in, check_in_time, event_id, type, short_code
          FROM registrations 
          WHERE short_code = ${qrCode} AND event_id = ${eventId}
        `;
        
        // Si aucun résultat avec le short_code, essayer avec le qr_code complet (pour rétrocompatibilité)
        if (!Array.isArray(registrationQuery) || registrationQuery.length === 0) {
          console.log(`Participant non trouvé avec short_code: ${qrCode}, essai avec qr_code complet`);
          // Find registration by QR code using direct SQL
          registrationQuery = await prisma.$queryRaw`
            SELECT id, first_name, last_name, email, checked_in, check_in_time, event_id, type, short_code
            FROM registrations 
            WHERE qr_code = ${qrCode} AND event_id = ${eventId}
          `;
        }
      } else if (isShortCodeCheckIn) {
        // Validate short code check-in data
        const validationResult = shortCodeCheckInSchema.safeParse(body);
        
        if (!validationResult.success) {
            console.error("Short code validation error:", validationResult.error.flatten());
          return NextResponse.json(
            { message: "Invalid check-in data", errors: validationResult.error.flatten() },
            { status: 400 }
          );
        }
        
        const { shortCode } = validationResult.data;
        
        console.log(`Looking for participant with short code: ${shortCode} in event: ${eventId}`);
        
        // Find registration by short code using direct SQL
        registrationQuery = await prisma.$queryRaw`
          SELECT id, first_name, last_name, email, checked_in, check_in_time, event_id, type, short_code
          FROM registrations 
          WHERE short_code = ${shortCode} AND event_id = ${eventId}
        `;
      } else if (isEmailCheckIn) {
        // Validate email check-in data
        const validationResult = emailCheckInSchema.safeParse(body);
        
        if (!validationResult.success) {
            console.error("Email validation error:", validationResult.error.flatten());
          return NextResponse.json(
            { message: "Invalid check-in data", errors: validationResult.error.flatten() },
            { status: 400 }
          );
        }
        
        const { email } = validationResult.data;
        
          // Find registration by email using direct SQL
          registrationQuery = await prisma.$queryRaw`
            SELECT id, first_name, last_name, email, checked_in, check_in_time, event_id, type, short_code
            FROM registrations 
            WHERE email = ${email} AND event_id = ${eventId}
          `;
      } else if (isParticipantIdCheckIn) {
        // Validate participant ID check-in data
        const validationResult = participantIdCheckInSchema.safeParse(body);
        
        if (!validationResult.success) {
          console.error("ParticipantID validation error:", validationResult.error.flatten());
          return NextResponse.json(
            { message: "Invalid check-in data", errors: validationResult.error.flatten() },
            { status: 400 }
          );
        }
        
        const { participantId } = validationResult.data;
        
        console.log(`Looking for participant with ID: ${participantId} in event: ${eventId}`);
        
        // Find registration by ID using direct SQL
        registrationQuery = await prisma.$queryRaw`
          SELECT id, first_name, last_name, email, checked_in, check_in_time, event_id, type, short_code
          FROM registrations 
          WHERE id = ${participantId} AND event_id = ${eventId}
        `;
      }
    } catch (searchError) {
      console.error("Error searching for registration:", searchError);
      return NextResponse.json(
        { message: "Error searching for registration" },
        { status: 500 }
      );
    }
    
    const registration = Array.isArray(registrationQuery) && registrationQuery.length > 0
      ? {
          id: registrationQuery[0].id,
          firstName: registrationQuery[0].first_name,
          lastName: registrationQuery[0].last_name,
          email: registrationQuery[0].email,
          checkedIn: registrationQuery[0].checked_in,
          checkInTime: registrationQuery[0].check_in_time,
          eventId: registrationQuery[0].event_id,
          type: registrationQuery[0].type,
          shortCode: registrationQuery[0].short_code
        }
      : null;
    
    if (!registration) {
      console.error("Registration not found");
      return NextResponse.json(
        { message: "Registration not found" },
        { status: 404 }
      );
    }
    
    if (registration.checkedIn) {
      console.log(`Participant ${registration.id} already checked in at ${registration.checkInTime}`);
      return NextResponse.json(
        { 
          message: "Attendee already checked in",
          registration,
        },
        { status: 200 }
      );
    }
    
    // Update the registration as checked in using direct SQL
    try {
      await prisma.$executeRaw`
        UPDATE registrations 
        SET checked_in = true, check_in_time = NOW() 
        WHERE id = ${registration.id}
      `;
      
      // Get updated registration data
      const updatedRegistrationQuery = await prisma.$queryRaw`
        SELECT id, first_name, last_name, email, checked_in, check_in_time, event_id, type, short_code
        FROM registrations 
        WHERE id = ${registration.id}
      `;
      
      const updatedRegistration = Array.isArray(updatedRegistrationQuery) && updatedRegistrationQuery.length > 0
        ? {
            id: updatedRegistrationQuery[0].id,
            firstName: updatedRegistrationQuery[0].first_name,
            lastName: updatedRegistrationQuery[0].last_name,
            email: updatedRegistrationQuery[0].email,
            checkedIn: updatedRegistrationQuery[0].checked_in,
            checkInTime: updatedRegistrationQuery[0].check_in_time,
            eventId: updatedRegistrationQuery[0].event_id,
            type: updatedRegistrationQuery[0].type,
            shortCode: updatedRegistrationQuery[0].short_code
          }
        : null;
      
      if (!updatedRegistration) {
        console.error("Failed to retrieve updated registration data");
        return NextResponse.json(
          { message: "Error retrieving updated check-in status" },
          { status: 500 }
        );
      }
      
      console.log(`Successfully checked in participant ${updatedRegistration.id}`);
    
      return NextResponse.json({
        message: "Check-in successful",
        registration: updatedRegistration,
      });
    } catch (updateError) {
      console.error("Error updating registration:", updateError);
      return NextResponse.json(
        { message: "Error updating check-in status" },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error("Check-in global error:", error);
    return NextResponse.json(
      { message: "Error processing check-in" },
      { status: 500 }
    );
  }
} 