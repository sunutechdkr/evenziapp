import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");

    if (!eventId) {
      return NextResponse.json({ message: "ID d'événement requis" }, { status: 400 });
    }

    // Vérifier que l'utilisateur est inscrit à l'événement
    const registration = await prisma.registration.findFirst({
      where: {
        eventId,
        email: session.user.email!
      }
    });

    if (!registration) {
      return NextResponse.json({ message: "Utilisateur non inscrit à cet événement" }, { status: 403 });
    }

    // Récupérer le profil de matchmaking
    const profile = await prisma.userMatchProfile.findUnique({
      where: {
        userId_eventId: {
          userId: session.user.id,
          eventId
        }
      }
    });

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Erreur API profile:", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const { eventId, headline, bio, jobTitle, company, interests, goals, availability } = body;

    if (!eventId) {
      return NextResponse.json({ message: "ID d'événement requis" }, { status: 400 });
    }

    // Vérifier que l'utilisateur est inscrit à l'événement
    const registration = await prisma.registration.findFirst({
      where: {
        eventId,
        email: session.user.email!
      }
    });

    if (!registration) {
      return NextResponse.json({ message: "Utilisateur non inscrit à cet événement" }, { status: 403 });
    }

    // Créer ou mettre à jour le profil de matchmaking
    const profile = await prisma.userMatchProfile.upsert({
      where: {
        userId_eventId: {
          userId: session.user.id,
          eventId
        }
      },
      update: {
        headline,
        bio,
        jobTitle,
        company,
        interests: interests || [],
        goals: goals || [],
        availability: availability || []
      },
      create: {
        userId: session.user.id,
        eventId,
        headline,
        bio,
        jobTitle,
        company,
        interests: interests || [],
        goals: goals || [],
        availability: availability || []
      }
    });

    // Mettre à jour également le profil de registration si jobTitle et company sont fournis
    if (jobTitle || company) {
      await prisma.registration.update({
        where: { id: registration.id },
        data: {
          ...(jobTitle && { jobTitle }),
          ...(company && { company })
        }
      });
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Erreur API profile POST:", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
} 