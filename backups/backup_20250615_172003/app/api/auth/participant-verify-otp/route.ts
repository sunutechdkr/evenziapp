import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json();
    console.log('Vérification OTP pour:', email, 'avec code:', code);

    if (!email || !code) {
      return NextResponse.json(
        { error: "Email et code requis" },
        { status: 400 }
      );
    }

    // Vérifier le code OTP
    console.log('Recherche du code OTP...');
    const otpRecord = await prisma.otpCode.findFirst({
      where: {
        email: email.toLowerCase(),
        code: code,
        used: false,
        expiresAt: {
          gt: new Date(), // Le code n'est pas expiré
        },
      },
    });

    if (!otpRecord) {
      console.log('Code OTP invalide ou expiré');
      return NextResponse.json(
        { error: "Code invalide ou expiré" },
        { status: 401 }
      );
    }

    console.log('Code OTP valide trouvé, recherche du participant...');
    
    // Vérifier que l'utilisateur est bien un participant enregistré
    const participant = await prisma.registration.findFirst({
      where: {
        email: email.toLowerCase(),
      },
      include: {
        event: {
          select: {
            slug: true,
            name: true,
          },
        },
      },
    });

    if (!participant) {
      console.log('Participant non trouvé');
      return NextResponse.json(
        { error: "Participant non trouvé" },
        { status: 404 }
      );
    }

    console.log('Participant trouvé:', participant.firstName, participant.lastName);

    // Marquer le code OTP comme utilisé
    await prisma.otpCode.update({
      where: { id: otpRecord.id },
      data: { used: true },
    });

    console.log('Code OTP marqué comme utilisé');

    // Créer ou mettre à jour l'utilisateur dans la table users
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
          // Pas de mot de passe - connexion uniquement par OTP
        }
      });
      console.log('Utilisateur créé:', user.email);
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
      console.log('Utilisateur mis à jour:', user.email);
    }

    // Mettre à jour la dernière connexion
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    console.log('Session participant préparée');

    return NextResponse.json({
      success: true,
      message: "Code vérifié avec succès",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        firstName: participant.firstName,
        lastName: participant.lastName,
        eventName: participant.event?.name,
        eventSlug: participant.event?.slug,
        role: 'USER'
      },
      // Rediriger vers la page d'auto-login avec l'ID de l'utilisateur
      redirectUrl: `/auth/auto-login-participant?userId=${user.id}&email=${encodeURIComponent(user.email)}`
    });
  } catch (error) {
    console.error("Erreur lors de la vérification OTP:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
} 