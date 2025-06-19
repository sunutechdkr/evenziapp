import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@/types/models';

export async function GET(
  request: NextRequest,
  context: { params: { userId: string } }
) {
  try {
    const { userId } = context.params;
    
    // Vérifier l'authentification et les autorisations
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Vérifier que l'utilisateur est autorisé (admin ou l'utilisateur lui-même)
    const isAdmin = session.user?.role === UserRole.ADMIN;
    const isSelf = session.user?.id === userId;

    if (!isAdmin && !isSelf) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    // Récupérer les événements de l'utilisateur
    const events = await prisma.event.findMany({
      where: {
        userId: userId
      },
      select: {
        id: true,
        name: true,
        startDate: true,
        endDate: true,
        slug: true,
      },
      orderBy: {
        startDate: 'desc'
      }
    });

    // Formater les données pour la réponse
    const formattedEvents = events.map((event) => ({
      id: event.id,
      name: event.name,
      startDate: event.startDate,
      endDate: event.endDate,
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
