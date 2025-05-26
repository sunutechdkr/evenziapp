import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; registrationId: string }> }
) {
  // Vérification de l'authentification
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json(
      { message: "Non autorisé" },
      { status: 401 }
    );
  }
  
  // Autoriser les utilisateurs connectés (pas seulement les admin)
  // Pour raisons de sécurité, nous vérifions plus tard si l'utilisateur a le droit d'accéder à cet événement
  
  try {
    const { id: eventId, registrationId } = await params;
    
    console.log(`API de check-in: eventId=${eventId}, registrationId=${registrationId}`);
    
    // Vérifier si l'événement existe avec SQL direct
    const eventQuery = await prisma.$queryRaw`
      SELECT id, name, user_id FROM events 
      WHERE id = ${eventId}
    `;
    
    const event = Array.isArray(eventQuery) && eventQuery.length > 0 ? eventQuery[0] : null;
    
    if (!event) {
      console.error(`Événement avec ID ${eventId} non trouvé`);
      return NextResponse.json(
        { message: "Événement non trouvé" },
        { status: 404 }
      );
    }
    
    console.log(`Événement trouvé: ${event.name} (ID: ${event.id})`);
    
    // Vérifier que l'utilisateur est soit admin, soit propriétaire de l'événement
    if (session.user.role !== "ADMIN" && event.user_id !== session.user.id) {
      console.error(`Utilisateur ${session.user.id} non autorisé pour l'événement ${eventId}`);
      return NextResponse.json(
        { message: "Vous n'êtes pas autorisé à gérer cet événement" },
        { status: 403 }
      );
    }
    
    // Vérifier si le participant existe et est inscrit à cet événement avec SQL direct
    const registrationQuery = await prisma.$queryRaw`
      SELECT id, first_name, last_name, email, checked_in, check_in_time, event_id, short_code
      FROM registrations 
      WHERE id = ${registrationId} AND event_id = ${eventId}
    `;
    
    const registration = Array.isArray(registrationQuery) && registrationQuery.length > 0 
      ? {
          id: registrationQuery[0].id,
          firstName: registrationQuery[0].first_name,
          lastName: registrationQuery[0].last_name,
          email: registrationQuery[0].email,
          checkedIn: registrationQuery[0].checked_in,
          checkInTime: registrationQuery[0].check_in_time,
          eventId: registrationQuery[0].event_id,
          shortCode: registrationQuery[0].short_code
        }
      : null;
    
    if (!registration) {
      console.error(`Participant ${registrationId} non trouvé pour l'événement ${eventId}`);
      return NextResponse.json(
        { message: "Participant non trouvé ou n'est pas inscrit à cet événement" },
        { status: 404 }
      );
    }
    
    console.log(`Participant trouvé: ${registration.firstName} ${registration.lastName} (ID: ${registration.id})`);
    
    // Vérifier si le participant est déjà enregistré
    if (registration.checkedIn) {
      console.log(`Participant ${registration.id} déjà enregistré à ${registration.checkInTime}`);
      return NextResponse.json({
        message: "Ce participant est déjà enregistré",
        registration,
      });
    }
    
    // Mettre à jour le statut de check-in avec SQL direct
    try {
      console.log(`Mise à jour du statut check-in pour le participant ${registrationId}`);
      await prisma.$executeRaw`
        UPDATE registrations 
        SET checked_in = true, check_in_time = NOW() 
        WHERE id = ${registrationId}
      `;
      console.log(`Statut check-in mis à jour avec succès pour ${registrationId}`);
    } catch (updateError) {
      console.error("Erreur lors de la mise à jour du check-in:", updateError);
      return NextResponse.json(
        { message: "Erreur lors de la mise à jour du statut de check-in" },
        { status: 500 }
      );
    }
    
    // Récupérer les informations actualisées
    const updatedRegistrationQuery = await prisma.$queryRaw`
      SELECT id, first_name, last_name, email, checked_in, check_in_time, event_id, type, short_code
      FROM registrations 
      WHERE id = ${registrationId}
    `;
    
    const updatedRegistration = Array.isArray(updatedRegistrationQuery) && updatedRegistrationQuery.length > 0
      ? {
          id: updatedRegistrationQuery[0].id,
          firstName: updatedRegistrationQuery[0].first_name,
          lastName: updatedRegistrationQuery[0].last_name,
          email: updatedRegistrationQuery[0].email,
          checkedIn: updatedRegistrationQuery[0].checked_in,
          checkInTime: updatedRegistrationQuery[0].check_in_time,
          type: updatedRegistrationQuery[0].type,
          eventId: updatedRegistrationQuery[0].event_id,
          shortCode: updatedRegistrationQuery[0].short_code
        }
      : null;
    
    console.log(`Check-in réussi pour le participant ${registrationId}`);
    
    return NextResponse.json({
      message: "Check-in effectué avec succès",
      registration: updatedRegistration,
    });
    
  } catch (error) {
    console.error("Erreur lors du check-in:", error);
    return NextResponse.json(
      { message: "Erreur lors du traitement de la demande de check-in" },
      { status: 500 }
    );
  }
} 