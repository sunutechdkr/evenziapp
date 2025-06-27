import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET - Récupérer tous les billets d'un événement
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { message: "Non autorisé" },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    // Vérifier que l'événement existe et appartient à l'utilisateur
    const event = await prisma.event.findFirst({
      where: {
        id,
        user: { email: session.user.email }
      }
    });

    if (!event) {
      return NextResponse.json(
        { message: "Événement non trouvé" },
        { status: 404 }
      );
    }

    // Récupérer tous les billets de l'événement
    const tickets = await prisma.ticket.findMany({
      where: {
        eventId: id
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
    console.error("Erreur lors de la récupération des billets:", error);
    return NextResponse.json(
      { message: "Erreur serveur" },
      { status: 500 }
    );
  }
}

// POST - Créer un nouveau billet
export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { message: "Non autorisé" },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const body = await request.json();

    const {
      name,
      description,
      price,
      quantity,
      status,
      visibility,
      validFrom,
      validUntil,
      group
    } = body;

    // Validation des données
    if (!name || !validFrom || !validUntil) {
      return NextResponse.json(
        { message: "Nom, date de début et date de fin sont requis" },
        { status: 400 }
      );
    }

    // Vérifier que l'événement existe et appartient à l'utilisateur
    const event = await prisma.event.findFirst({
      where: {
        id,
        user: { email: session.user.email }
      }
    });

    if (!event) {
      return NextResponse.json(
        { message: "Événement non trouvé" },
        { status: 404 }
      );
    }

    // Créer le billet
    const ticket = await prisma.ticket.create({
      data: {
        name,
        description: description || null,
        price: parseFloat(price) || 0,
        quantity: quantity ? parseInt(quantity) : null,
        status: status || 'ACTIVE',
        visibility: visibility || 'VISIBLE',
        validFrom: new Date(validFrom),
        validUntil: new Date(validUntil),
        group: group || 'Attendees',
        eventId: id
      }
    });

    return NextResponse.json({
      success: true,
      ticket
    }, { status: 201 });

  } catch (error) {
    console.error("Erreur lors de la création du billet:", error);
    return NextResponse.json(
      { message: "Erreur serveur" },
      { status: 500 }
    );
  }
} 