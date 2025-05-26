import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Schema pour la recherche par code participant
const idLookupSchema = z.object({
  qrCode: z.string().min(1),
  eventId: z.string().min(1),
});

// Schema pour la recherche par email
const emailLookupSchema = z.object({
  email: z.string().email(),
  eventId: z.string().min(1),
});

export async function POST(request: Request) {
  // Vérifier l'authentification
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json(
      { message: "Non autorisé" },
      { status: 401 }
    );
  }
  
  try {
    const body = await request.json();
    
    // Déterminer la méthode de recherche
    const isIdLookup = "qrCode" in body;
    const isEmailLookup = "email" in body;
    
    if (!isIdLookup && !isEmailLookup) {
      return NextResponse.json(
        { message: "Données de recherche invalides. Veuillez fournir un code participant ou un email." },
        { status: 400 }
      );
    }
    
    const { eventId } = body;
    
    // Récupérer l'événement avec SQL direct
    const eventQuery = await prisma.$queryRaw`
      SELECT id, name, user_id FROM events 
      WHERE id = ${eventId}
    `;
    
    const event = Array.isArray(eventQuery) && eventQuery.length > 0 ? eventQuery[0] : null;
    
    if (!event) {
      return NextResponse.json(
        { message: "Événement non trouvé" },
        { status: 404 }
      );
    }
    
    // Vérifier que l'utilisateur est soit admin, soit propriétaire de l'événement
    if (session.user.role !== "ADMIN" && event.user_id !== session.user.id) {
      return NextResponse.json(
        { message: "Vous n'êtes pas autorisé à accéder aux participants de cet événement" },
        { status: 403 }
      );
    }
    
    let participantQuery;
    
    if (isIdLookup) {
      // Valider les données de recherche par code participant
      const validationResult = idLookupSchema.safeParse(body);
      
      if (!validationResult.success) {
        console.error("Validation de code participant échouée:", validationResult.error.flatten());
        return NextResponse.json(
          { message: "Données de recherche invalides", errors: validationResult.error.flatten() },
          { status: 400 }
        );
      }
      
      const { qrCode: participantId } = validationResult.data;
      
      console.log(`Recherche de participant avec identifiant: "${participantId}" dans l'événement: ${eventId}`);
      
      // Traiter le code (éliminer les espaces et caractères non alphanumériques)
      const cleanedCode = participantId.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
      
      // Utiliser le code comme shortCode directement
      try {
        console.log(`Recherche par shortCode exact: "${cleanedCode}"`);
        
        participantQuery = await prisma.$queryRaw`
          SELECT id, first_name, last_name, email, type, checked_in, check_in_time, event_id, short_code
          FROM registrations 
          WHERE short_code = ${cleanedCode} AND event_id = ${eventId}
        `;
        
        console.log(`Résultat de recherche par shortCode (direct) pour "${cleanedCode}":`, 
                   Array.isArray(participantQuery) ? participantQuery.length : 0);
        
        // Si le participant n'est pas trouvé par shortCode direct, essayer une recherche plus flexible
        if (Array.isArray(participantQuery) && participantQuery.length === 0) {
          console.log(`Participant non trouvé avec shortCode: "${cleanedCode}", essai de recherche approchée`);
          
          // Tentative de recherche approchée en utilisant LIKE
          participantQuery = await prisma.$queryRaw`
            SELECT id, first_name, last_name, email, type, checked_in, check_in_time, event_id, short_code
            FROM registrations 
            WHERE (
              short_code LIKE ${`%${cleanedCode}%`}
            ) AND event_id = ${eventId}
            LIMIT 1
          `;
          
          console.log(`Résultat de recherche approchée pour "${cleanedCode}":`, 
                     Array.isArray(participantQuery) ? participantQuery.length : 0);
        }
                   
      } catch (error) {
        console.error("Erreur de base de données lors de la recherche par identifiant:", error);
        return NextResponse.json(
          { message: "Erreur lors de la recherche du participant" },
          { status: 500 }
        );
      }
    } else if (isEmailLookup) {
      // Valider les données de recherche par email
      const validationResult = emailLookupSchema.safeParse(body);
      
      if (!validationResult.success) {
        return NextResponse.json(
          { message: "Données de recherche invalides", errors: validationResult.error.flatten() },
          { status: 400 }
        );
      }
      
      const { email } = validationResult.data;
      
      // Rechercher l'inscription par email avec SQL direct
      participantQuery = await prisma.$queryRaw`
        SELECT id, first_name, last_name, email, type, checked_in, check_in_time, event_id, short_code
        FROM registrations 
        WHERE email = ${email} AND event_id = ${eventId}
      `;
    }
    
    const participant = Array.isArray(participantQuery) && participantQuery.length > 0
      ? {
          id: participantQuery[0].id,
          firstName: participantQuery[0].first_name,
          lastName: participantQuery[0].last_name,
          email: participantQuery[0].email,
          type: participantQuery[0].type,
          checkedIn: participantQuery[0].checked_in,
          checkInTime: participantQuery[0].check_in_time,
          eventId: participantQuery[0].event_id,
          shortCode: participantQuery[0].short_code
        }
      : null;
    
    if (!participant) {
      return NextResponse.json(
        { message: "Participant non trouvé" },
        { status: 404 }
      );
    }
    
    // Retourner les informations du participant
    return NextResponse.json({
      message: "Participant trouvé",
      participant,
    });
    
  } catch (error) {
    console.error("Erreur lors de la recherche du participant:", error);
    return NextResponse.json(
      { message: "Erreur lors du traitement de la demande" },
      { status: 500 }
    );
  }
} 