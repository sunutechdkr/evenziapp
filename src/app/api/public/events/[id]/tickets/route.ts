import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Récupérer tous les billets actifs et visibles d'un événement (accès public)
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    // Vérifier que l'événement existe
    const event = await prisma.event.findUnique({
      where: { id },
      select: { id: true, name: true }
    });

    if (!event) {
      return NextResponse.json(
        { message: "Événement non trouvé" },
        { status: 404 }
      );
    }

    // Récupérer seulement les billets actifs et visibles pour le public
    const tickets = await prisma.ticket.findMany({
      where: {
        eventId: id,
        status: 'ACTIVE',
        visibility: 'VISIBLE'
      },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        currency: true,
        quantity: true,
        sold: true,
        status: true,
        visibility: true,
        validFrom: true,
        validUntil: true,
        group: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      tickets
    });

  } catch (error) {
    console.error("Erreur lors de la récupération des billets publics:", error);
    return NextResponse.json(
      { message: "Erreur serveur" },
      { status: 500 }
    );
  }
} 