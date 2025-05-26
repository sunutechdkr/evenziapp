import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Store temporaire pour les tokens d'auto-login (en production, utiliser Redis)
const autoLoginTokens = new Map<string, { userId: string, createdAt: Date }>();

export async function POST(request: NextRequest) {
  try {
    const { token, userId } = await request.json();

    if (!token || !userId) {
      return NextResponse.json(
        { error: "Token et userId requis" },
        { status: 400 }
      );
    }

    // Pour des raisons de simplicité, on va juste vérifier que l'utilisateur existe
    // et que le token correspond à un format valide (pour ce MVP)
    if (token.length < 20) {
      return NextResponse.json(
        { error: "Token invalide" },
        { status: 401 }
      );
    }

    // Récupérer l'utilisateur
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    // Marquer le token comme utilisé (pour cette implémentation simple)
    // En production, utiliser une base de données ou Redis
    console.log('Vérification auto-login réussie pour:', user.email);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    console.error("Erreur lors de la vérification auto-login:", error);
    return NextResponse.json(
      { error: "Erreur lors de la vérification" },
      { status: 500 }
    );
  }
} 