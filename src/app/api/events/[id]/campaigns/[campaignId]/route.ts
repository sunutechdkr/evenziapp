import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Récupérer une campagne spécifique
export async function GET(
  request: NextRequest,
  context: { params: { id: string; campaignId: string } }
) {
  try {
    const { id, campaignId } = context.params;
    
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Vérifier que l'utilisateur a accès à cet événement
    const event = await prisma.event.findFirst({
      where: {
        id,
        ...(session.user.role === 'ORGANIZER' ? { userId: session.user.id } : {}),
      },
    });

    if (!event) {
      return NextResponse.json({ error: 'Événement non trouvé' }, { status: 404 });
    }

    // Récupérer la campagne
    const campaign = await prisma.emailCampaign.findFirst({
      where: {
        id: campaignId,
        eventId: id,
      },
      include: {
        recipients: true,
        _count: {
          select: { recipients: true }
        }
      },
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Campagne non trouvée' }, { status: 404 });
    }

    return NextResponse.json(campaign);
  } catch (error) {
    console.error('Erreur lors de la récupération de la campagne:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour une campagne
export async function PUT(
  request: NextRequest,
  context: { params: { id: string; campaignId: string } }
) {
  try {
    const { id, campaignId } = context.params;
    
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Vérifier que l'utilisateur a accès à cet événement
    const event = await prisma.event.findFirst({
      where: {
        id,
        ...(session.user.role === 'ORGANIZER' ? { userId: session.user.id } : {}),
      },
    });

    if (!event) {
      return NextResponse.json({ error: 'Événement non trouvé' }, { status: 404 });
    }

    // Vérifier que la campagne existe
    const existingCampaign = await prisma.emailCampaign.findFirst({
      where: {
        id: campaignId,
        eventId: id,
      },
    });

    if (!existingCampaign) {
      return NextResponse.json({ error: 'Campagne non trouvée' }, { status: 404 });
    }

    // Vérifier que la campagne peut être modifiée
    if (existingCampaign.status === 'SENT') {
      return NextResponse.json(
        { error: 'Impossible de modifier une campagne déjà envoyée' },
        { status: 400 }
      );
    }

    const body = await request.json();
    
    const {
      name,
      description,
      type,
      recipientType,
      subject,
      htmlContent,
      textContent,
      scheduledAt,
    } = body;

    // Mettre à jour la campagne
    const campaign = await prisma.emailCampaign.update({
      where: { id: campaignId },
      data: {
        name,
        description,
        type,
        recipientType,
        subject,
        htmlContent,
        textContent,
        status: scheduledAt ? 'SCHEDULED' : 'DRAFT',
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      },
    });

    return NextResponse.json(campaign);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la campagne:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer une campagne
export async function DELETE(
  request: NextRequest,
  context: { params: { id: string; campaignId: string } }
) {
  try {
    const { id, campaignId } = context.params;
    
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Vérifier que l'utilisateur a accès à cet événement
    const event = await prisma.event.findFirst({
      where: {
        id,
        ...(session.user.role === 'ORGANIZER' ? { userId: session.user.id } : {}),
      },
    });

    if (!event) {
      return NextResponse.json({ error: 'Événement non trouvé' }, { status: 404 });
    }

    // Vérifier que la campagne existe
    const campaign = await prisma.emailCampaign.findFirst({
      where: {
        id: campaignId,
        eventId: id,
      },
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Campagne non trouvée' }, { status: 404 });
    }

    // Supprimer les logs d'email associés et la campagne
    await prisma.emailLog.deleteMany({
      where: { campaignId },
    });

    await prisma.emailCampaign.delete({
      where: { id: campaignId },
    });

    return NextResponse.json({ message: 'Campagne supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la campagne:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}