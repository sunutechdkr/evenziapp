import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { userId, email } = await request.json();

    if (!userId || !email) {
      return NextResponse.json(
        { error: "UserId et email requis" },
        { status: 400 }
      );
    }

    // Vérifier que l'utilisateur existe et correspond aux paramètres fournis
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

    console.log('Utilisateur participant vérifié:', user.email);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
      },
    });

  } catch (error) {
    console.error("Erreur lors de la vérification de l'utilisateur participant:", error);
    return NextResponse.json(
      { error: "Erreur lors de la vérification" },
      { status: 500 }
    );
  }
} 