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

    console.log("Données reçues pour mise à jour de billet:", body);

    const {
      name,
      description,
      price,
      currency,
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

    // Validation et conversion des dates
    let startDate, endDate;
    try {
      // Supporter les formats "DD/MM/YYYY HH:mm" et ISO
      if (validFrom.includes('/')) {
        // Format DD/MM/YYYY HH:mm -> convertir en ISO
        const [datePart, timePart] = validFrom.split(' ');
        const [day, month, year] = datePart.split('/');
        const isoString = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${timePart || '00:00'}:00.000Z`;
        startDate = new Date(isoString);
      } else {
        startDate = new Date(validFrom);
      }

      if (validUntil.includes('/')) {
        const [datePart, timePart] = validUntil.split(' ');
        const [day, month, year] = datePart.split('/');
        const isoString = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${timePart || '23:59'}:00.000Z`;
        endDate = new Date(isoString);
      } else {
        endDate = new Date(validUntil);
      }

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new Error("Format de date invalide");
      }
    } catch (dateError) {
      console.error("Erreur de conversion de date:", dateError);
      return NextResponse.json(
        { message: "Format de date invalide. Utilisez DD/MM/YYYY HH:mm" },
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
        price: parseFloat(price.toString()) || 0,
        currency: currency || existingTicket.currency,
        quantity: quantity && quantity !== "" ? parseInt(quantity.toString()) : null,
        status: status || existingTicket.status,
        visibility: visibility || existingTicket.visibility,
        validFrom: startDate,
        validUntil: endDate,
        group: group || existingTicket.group
      }
    });

    console.log("Billet mis à jour avec succès:", updatedTicket);

    return NextResponse.json({
      success: true,
      ticket: updatedTicket
    });

  } catch (error) {
    console.error("Erreur lors de la mise à jour du billet:", error);
    
    // Erreur spécifique pour la base de données
    if (error instanceof Error && (error.message.includes('connect') || error.message.includes('database'))) {
      return NextResponse.json(
        { message: "Erreur de connexion à la base de données. Vérifiez la configuration DATABASE_URL." },
        { status: 500 }
      );
    }

    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    return NextResponse.json(
      { message: `Erreur serveur: ${errorMessage}` },
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