import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.redirect(new URL('/login?error=token_missing', request.url));
    }

    // Vérifier le token JWT
    const payload = await verifyJWT(token);
    
    if (!payload || payload.type !== 'participant-magic-link') {
      return NextResponse.redirect(new URL('/login?error=invalid_token', request.url));
    }

    // Vérifier que le participant existe toujours
    const participant = await prisma.registration.findUnique({
      where: { 
        id: payload.participantId,
        email: payload.email,
      },
      include: {
        event: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    });

    if (!participant) {
      return NextResponse.redirect(new URL('/login?error=participant_not_found', request.url));
    }

    // Créer ou récupérer l'utilisateur USER dans la table users
    let user = await prisma.user.findUnique({
      where: { email: participant.email }
    });

    if (!user) {
      // Créer un utilisateur USER pour ce participant
      user = await prisma.user.create({
        data: {
          email: participant.email,
          name: `${participant.firstName} ${participant.lastName}`,
          role: 'USER',
          emailVerified: new Date(),
          // Pas de mot de passe - connexion uniquement par Magic Link
        }
      });
    } else {
      // Mettre à jour les informations si l'utilisateur existe
      user = await prisma.user.update({
        where: { email: participant.email },
        data: {
          name: `${participant.firstName} ${participant.lastName}`,
          role: 'USER',
          emailVerified: new Date(),
        }
      });
    }

    // Mettre à jour la dernière connexion
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    // Rediriger vers une page de connexion automatique
    const autoLoginUrl = new URL('/auth/auto-login', request.url);
    autoLoginUrl.searchParams.set('email', user.email);
    autoLoginUrl.searchParams.set('token', token);

    return NextResponse.redirect(autoLoginUrl);

  } catch (error) {
    console.error('Erreur lors de la vérification du participant:', error);
    return NextResponse.redirect(new URL('/login?error=verification_failed', request.url));
  }
} 