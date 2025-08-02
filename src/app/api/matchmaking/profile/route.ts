import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');

    if (!eventId) {
      return NextResponse.json({ error: 'eventId requis' }, { status: 400 });
    }

    // Récupérer le profil de matchmaking
    const profile = await prisma.userMatchProfile.findUnique({
      where: {
        userId_eventId: {
          userId: session.user.id,
          eventId
        }
      }
    });

    return NextResponse.json(profile);

  } catch (error) {
    console.error('Erreur récupération profil:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du profil' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { eventId, headline, bio, interests, goals } = await request.json();

    if (!eventId) {
      return NextResponse.json({ error: 'eventId requis' }, { status: 400 });
    }

    // Vérifier que l'utilisateur est inscrit à l'événement
    const userRegistration = await prisma.registration.findFirst({
      where: {
        eventId,
        email: session.user.email!
      }
    });

    if (!userRegistration) {
      return NextResponse.json({ error: 'Utilisateur non inscrit à cet événement' }, { status: 403 });
    }

    // Créer ou mettre à jour le profil
    const profile = await prisma.userMatchProfile.upsert({
      where: {
        userId_eventId: {
          userId: session.user.id,
          eventId
        }
      },
      update: {
        headline: headline || null,
        bio: bio || null,
        interests: interests || [],
        goals: goals || []
      },
      create: {
        userId: session.user.id,
        eventId,
        headline: headline || null,
        bio: bio || null,
        interests: interests || [],
        goals: goals || []
      }
    });

    return NextResponse.json(profile);

  } catch (error) {
    console.error('Erreur mise à jour profil:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du profil' },
      { status: 500 }
    );
  }
} 