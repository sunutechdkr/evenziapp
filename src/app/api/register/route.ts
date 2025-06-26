import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';
import { generateShortCode } from "@/lib/shortcodes";
import { sendRegistrationConfirmationEmail } from "@/lib/registrationEmail";

// POST /api/register - Create a new registration without authentication
export async function POST(request: Request) {
  try {
    // Parse request body
    const { firstName, lastName, email, phone, jobTitle, company, type, eventId } = await request.json();
    
    // Validate required fields
    if (!firstName || !lastName || !email || !eventId) {
      return NextResponse.json(
        { message: "Tous les champs obligatoires sont requis" },
        { status: 400 }
      );
    }

    // Check if the event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });
    
    if (!event) {
      return NextResponse.json(
        { message: "Événement non trouvé" },
        { status: 404 }
      );
    }
    
    // Check if email is already registered for this event
    const existingRegistration = await prisma.registration.findFirst({
      where: {
        email,
        eventId,
      },
    });
    
    if (existingRegistration) {
      return NextResponse.json(
        { message: "Cette adresse email est déjà inscrite à cet événement" },
        { status: 409 }
      );
    }
    
    // Generate a short code for the badge QR
    let shortCode = generateShortCode();
    let isUniqueShortCode = false;
    
    // Ensure the shortCode is unique
    while (!isUniqueShortCode) {
      // Check if the shortCode already exists
      const existingCode = await prisma.registration.findFirst({
        where: { shortCode },
      });
      
      if (!existingCode) {
        isUniqueShortCode = true;
      } else {
        // If collision, generate a new code
        shortCode = generateShortCode();
      }
    }
    
    // Use the shortCode as the QR code value
    const qrCode = shortCode;
    
    // Create the registration
    const registration = await prisma.registration.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        type: type || "PARTICIPANT",
        jobTitle,
        company,
        qrCode,
        shortCode,
        eventId,
      },
    });

    // Envoyer l'email de confirmation d'inscription
    try {
      await sendRegistrationConfirmationEmail({
        eventId: eventId,
        participantEmail: email,
        participantName: `${firstName} ${lastName}`,
        registrationId: registration.id
      });
      
      console.log(`📧 Email de confirmation d'inscription envoyé à ${email} pour l'événement ${event.name}`);
    } catch (emailError) {
      console.error('⚠️ Erreur lors de l\'envoi de l\'email de confirmation d\'inscription:', emailError);
      // On ne fait pas échouer l'inscription si l'email échoue
    }
    
    return NextResponse.json(
      { 
        message: "Inscription réussie",
        registrationId: registration.id,
        eventSlug: event.slug
      }, 
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating registration:", error);
    return NextResponse.json(
      { message: "Erreur lors de l'inscription", details: String(error) },
      { status: 500 }
    );
  }
} 