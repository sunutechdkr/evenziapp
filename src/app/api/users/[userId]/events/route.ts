import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { UserRole } from '@/types/models';

const prisma = new PrismaClient();

type EventRecord = {
  id: string;
  name: string;
  start_date: Date;
  end_date: Date;
  slug: string | null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    // Vérifier l'authentification et les autorisations
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Vérifier que l'utilisateur est autorisé (admin ou l'utilisateur lui-même)
    const isAdmin = session.user?.role === UserRole.ADMIN;
    const isSelf = session.user?.id === (await params).userId;

    if (!isAdmin && !isSelf) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    // Récupérer les événements de l'utilisateur
    const events = await prisma.events.findMany({
      where: {
        user_id: (await params).userId
      },
      select: {
        id: true,
        name: true,
        start_date: true,
        end_date: true,
        slug: true,
      },
      orderBy: {
        start_date: 'desc'
      }
    });

    // Formater les données pour la réponse
    const formattedEvents = events.map((event: EventRecord) => ({
      id: event.id,
      name: event.name,
      startDate: event.start_date,
      endDate: event.end_date,
      slug: event.slug
    }));

    return NextResponse.json({ events: formattedEvents });
  } catch (error) {
    console.error('Erreur lors de la récupération des événements:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
