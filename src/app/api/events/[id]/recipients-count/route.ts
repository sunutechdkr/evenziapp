import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user.role !== 'ORGANIZER' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id: eventId } = await params;

    // Compter tous les participants
    const allParticipants = await prisma.registration.count({
      where: { eventId }
    });

    // Compter les participants par type (pour l'instant on simule car le type n'est pas encore différencié)
    const participants = await prisma.registration.count({
      where: { 
        eventId,
        type: 'PARTICIPANT'
      }
    });

    // Pour l'instant, on simule les autres types car ils ne sont pas encore implémentés
    const speakers = 0; // Sera implémenté avec la table speakers
    const exhibitors = 0; // Sera implémenté avec la table exhibitors
    const sponsors = await prisma.sponsor.count({
      where: { eventId }
    });

    return NextResponse.json({
      ALL_PARTICIPANTS: allParticipants,
      PARTICIPANTS: participants,
      SPEAKERS: speakers,
      EXHIBITORS: exhibitors,
      SPONSORS: sponsors
    });

  } catch (error) {
    console.error('Erreur API recipients-count:', error);
    return NextResponse.json(
      { error: 'Erreur lors du chargement des destinataires' },
      { status: 500 }
    );
  }
} 