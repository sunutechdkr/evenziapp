import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { error: 'Vous devez être connecté' },
        { status: 401 }
      );
    }

    // Mettre à jour la date de dernière connexion pour l'utilisateur actuel
    await prisma.user.update({
      where: { id: session.user.id },
      data: { lastLogin: new Date() }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la date de dernière connexion:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de la date de dernière connexion' },
      { status: 500 }
    );
  }
} 