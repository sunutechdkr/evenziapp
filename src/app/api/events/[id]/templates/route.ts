import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id: eventId } = await params;

    // Vérifier que l'événement existe et que l'utilisateur y a accès
    const event = await prisma.event.findFirst({
      where: {
        id: eventId,
        ...(session.user.role === 'ORGANIZER' ? { userId: session.user.id } : {}),
      },
    });

    if (!event) {
      return NextResponse.json({ error: 'Événement non trouvé' }, { status: 404 });
    }

    // Récupérer les templates (par défaut + spécifiques à l'événement)
    const templates = await prisma.emailTemplate.findMany({
      where: {
        OR: [
          { isGlobal: true }, // Templates globaux par défaut
          { eventId: eventId } // Templates spécifiques à l'événement
        ]
      },
      orderBy: [
        { name: 'asc' }
      ]
    });

    return NextResponse.json(templates);
  } catch (error) {
    console.error('Erreur lors de la récupération des templates :', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
} 