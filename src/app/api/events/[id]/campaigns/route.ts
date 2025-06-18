import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Récupérer toutes les campagnes d'un événement
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Await params for Next.js 15 compatibility
    const { id } = await params;
    
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

    // Récupérer les campagnes
    const campaigns = await prisma.emailCampaign.findMany({
      where: { eventId: id },
      include: {
        _count: {
          select: { recipients: true }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(campaigns);
  } catch (error) {
    console.error('Erreur lors de la récupération des campagnes:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// POST - Créer une nouvelle campagne
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Await params for Next.js 15 compatibility
    const { id } = await params;
    
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

    // Validation des données
    if (!name || !subject || !htmlContent) {
      return NextResponse.json(
        { error: 'Nom, sujet et contenu HTML sont requis' },
        { status: 400 }
      );
    }

    // Créer la campagne
    const campaign = await prisma.emailCampaign.create({
      data: {
        eventId: id,
        name,
        description,
        type: type || 'CUSTOM',
        recipientType: recipientType || 'ALL_PARTICIPANTS',
        subject,
        htmlContent,
        textContent,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        status: 'DRAFT',
      },
    });

    return NextResponse.json(campaign, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création de la campagne:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
} 