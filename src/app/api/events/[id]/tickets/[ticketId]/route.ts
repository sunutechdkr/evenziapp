import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET - Récupérer un billet spécifique
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string; ticketId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { message: "Non autorisé" },
        { status: 401 }
      );
    }

    const { id, ticketId } = await context.params;

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

    // Récupérer le billet spécifique
    const ticket = await prisma.ticket.findFirst({
      where: {
        id: ticketId,
        eventId: id
      }
    });

    if (!ticket) {
      return NextResponse.json(
        { message: "Billet non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      ticket
    });

  } catch (error) {
    console.error("Erreur lors de la récupération du billet:", error);
    return NextResponse.json(
      { message: "Erreur serveur" },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour un billet
export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string; ticketId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { message: "Non autorisé" },
        { status: 401 }
      );
    }

    const { id, ticketId } = await context.params;
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

    // Vérifier que le billet existe
    const existingTicket = await prisma.ticket.findFirst({
      where: {
        id: ticketId,
        eventId: id
      }
    });

    if (!existingTicket) {
      return NextResponse.json(
        { message: "Billet non trouvé" },
        { status: 404 }
      );
    }

    // Mettre à jour le billet
    const updatedTicket = await prisma.ticket.update({
      where: {
        id: ticketId
      },
      data: {
        name,
        description: description || null,
        price: parseFloat(price) || 0,
        quantity: quantity ? parseInt(quantity) : null,
        status: status || existingTicket.status,
        visibility: visibility || existingTicket.visibility,
        validFrom: new Date(validFrom),
        validUntil: new Date(validUntil),
        group: group || existingTicket.group
      }
    });

    return NextResponse.json({
      success: true,
      ticket: updatedTicket
    });

  } catch (error) {
    console.error("Erreur lors de la mise à jour du billet:", error);
    return NextResponse.json(
      { message: "Erreur serveur" },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un billet
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string; ticketId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { message: "Non autorisé" },
        { status: 401 }
      );
    }

    const { id, ticketId } = await context.params;

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

    // Vérifier que le billet existe
    const existingTicket = await prisma.ticket.findFirst({
      where: {
        id: ticketId,
        eventId: id
      }
    });

    if (!existingTicket) {
      return NextResponse.json(
        { message: "Billet non trouvé" },
        { status: 404 }
      );
    }

    // Supprimer le billet
    await prisma.ticket.delete({
      where: {
        id: ticketId
      }
    });

    return NextResponse.json({
      success: true,
      message: "Billet supprimé avec succès"
    });

  } catch (error) {
    console.error("Erreur lors de la suppression du billet:", error);
    return NextResponse.json(
      { message: "Erreur serveur" },
      { status: 500 }
    );
  }
} 