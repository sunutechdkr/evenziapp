import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { encode } from "next-auth/jwt";

export async function POST(request: NextRequest) {
  try {
    const { userId, email } = await request.json();

    if (!userId || !email) {
      return NextResponse.json(
        { error: "UserId et email requis" },
        { status: 400 }
      );
    }

    // Récupérer l'utilisateur
    const user = await prisma.user.findUnique({
      where: { 
        id: userId,
        email: email.toLowerCase(),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        emailVerified: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier que l'utilisateur a un rôle USER (participant)
    if (user.role !== 'USER') {
      return NextResponse.json(
        { error: "Utilisateur non autorisé" },
        { status: 403 }
      );
    }

    console.log('Création de session pour:', user.email);

    // Créer un token de session NextAuth
    const sessionToken = await encode({
      token: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        sub: user.id, // subject standard JWT
        iat: Math.floor(Date.now() / 1000), // issued at
        exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // expires in 30 days
      },
      secret: process.env.NEXTAUTH_SECRET!,
      maxAge: 30 * 24 * 60 * 60, // 30 jours
    });

    // Créer la réponse avec le cookie de session
    const response = NextResponse.json({ 
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
    
    // Définir le cookie de session NextAuth
    response.cookies.set('next-auth.session-token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 jours
      path: '/',
    });

    // Créer aussi un account et une session dans la base de données pour NextAuth
    try {
      // Vérifier si un account existe déjà
      const existingAccount = await prisma.account.findFirst({
        where: {
          userId: user.id,
          provider: 'email',
        },
      });

      if (!existingAccount) {
        // Créer un account pour NextAuth
        await prisma.account.create({
          data: {
            userId: user.id,
            type: 'email',
            provider: 'email',
            providerAccountId: user.email,
          },
        });
      }

      // Créer une session en base pour NextAuth
      await prisma.session.create({
        data: {
          sessionToken: sessionToken,
          userId: user.id,
          expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours
        },
      });

      console.log('Session NextAuth créée en base de données');
    } catch (dbError) {
      console.warn('Erreur lors de la création de session en base:', dbError);
      // Ne pas faire échouer la requête pour cette erreur
    }

    // Mettre à jour la dernière connexion
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    console.log('Session participant créée avec succès pour:', user.email);

    return response;

  } catch (error) {
    console.error("Erreur lors de la création de session participant:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de session" },
      { status: 500 }
    );
  }
} 