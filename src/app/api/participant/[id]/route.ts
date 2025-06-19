import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { message: "Non autorisé" },
        { status: 401 }
      );
    }

    const { id } = context.params;
    
    if (!id) {
      return NextResponse.json(
        { message: "ID de participant requis" },
        { status: 400 }
      );
    }

    // Récupérer le participant avec SQL direct pour avoir le contrôle total sur l'accès au qrCode
    const participantQuery = await prisma.$queryRaw`
      SELECT 
        id, 
        first_name as "firstName", 
        last_name as "lastName", 
        email, 
        qr_code as "qrCode", 
        short_code as "shortCode",
        checked_in as "checkedIn", 
        check_in_time as "checkInTime"
      FROM registrations 
      WHERE id = ${id}
    `;
    
    // Vérifier que le participant existe
    const participant = Array.isArray(participantQuery) && participantQuery.length > 0
      ? participantQuery[0]
      : null;
    
    if (!participant) {
      return NextResponse.json(
        { message: "Participant non trouvé" },
        { status: 404 }
      );
    }

    // Retourner les informations du participant avec le QR code original non modifié
    return NextResponse.json({
      participant: {
        id: participant.id,
        firstName: participant.firstName,
        lastName: participant.lastName,
        email: participant.email,
        qrCode: participant.qrCode, // Valeur exacte du QR code tel que stocké en base
        shortCode: participant.shortCode,
        checkedIn: participant.checkedIn,
        checkInTime: participant.checkInTime,
      }
    });
    
  } catch (error) {
    console.error("Erreur lors de la récupération du participant:", error);
    return NextResponse.json(
      { message: "Erreur lors du traitement de la demande" },
      { status: 500 }
    );
  }
} 