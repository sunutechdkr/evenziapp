import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 API users/registrations appelée');
    
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    console.log('Session récupérée:', session ? {
      user: session.user?.email,
      expires: session.expires
    } : 'null');
    
    if (!session?.user?.email) {
      console.log('❌ Pas de session ou email manquant');
      return NextResponse.json(
        { error: "Non autorisé - session manquante" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    console.log('Email demandé:', email);
    console.log('Email de session:', session.user.email);

    // Vérifier que l'utilisateur demande ses propres inscriptions
    if (!email || email.toLowerCase() !== session.user.email.toLowerCase()) {
      console.log('❌ Email non autorisé ou manquant');
      return NextResponse.json(
        { error: "Email non autorisé" },
        { status: 403 }
      );
    }

    console.log('✅ Récupération des inscriptions pour:', email);

    // Récupérer toutes les inscriptions de cet utilisateur
    const registrations = await prisma.registration.findMany({
      where: {
        email: email.toLowerCase(),
      },
      include: {
        event: {
          select: {
            id: true,
            name: true,
            description: true,
            location: true,
            slug: true,
            banner: true,
            logo: true,
            startDate: true,
            endDate: true,
            startTime: true,
            endTime: true,
            sector: true,
            type: true,
            format: true,
            timezone: true,
            videoUrl: true,
            supportEmail: true,
            createdAt: true,
            updatedAt: true,
            userId: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log(`✅ Trouvé ${registrations.length} inscription(s) pour ${email}`);

    // Formatter les données pour correspondre à l'interface attendue
    const formattedRegistrations = registrations.map((reg: any) => ({
      id: reg.id,
      eventId: reg.eventId,
      firstName: reg.firstName,
      lastName: reg.lastName,
      email: reg.email,
      phone: reg.phone,
      type: reg.type,
      jobTitle: reg.jobTitle,
      company: reg.company,
      qrCode: reg.qrCode,
      shortCode: reg.shortCode,
      checkedIn: reg.checkedIn,
      checkInTime: reg.checkInTime?.toISOString(),
      createdAt: reg.createdAt.toISOString(),
      updatedAt: reg.updatedAt.toISOString(),
      event: reg.event ? {
        id: reg.event.id,
        name: reg.event.name,
        description: reg.event.description,
        location: reg.event.location,
        slug: reg.event.slug,
        banner: reg.event.banner,
        logo: reg.event.logo,
        startDate: reg.event.startDate.toISOString(),
        endDate: reg.event.endDate.toISOString(),
        startTime: reg.event.startTime,
        endTime: reg.event.endTime,
        sector: reg.event.sector,
        type: reg.event.type,
        format: reg.event.format,
        timezone: reg.event.timezone,
        videoUrl: reg.event.videoUrl,
        supportEmail: reg.event.supportEmail,
        createdAt: reg.event.createdAt.toISOString(),
        updatedAt: reg.event.updatedAt.toISOString(),
        userId: reg.event.userId,
      } : null,
    }));

    console.log('✅ Données formatées, retour API');
    return NextResponse.json(formattedRegistrations);

  } catch (error) {
    console.error("❌ Erreur lors de la récupération des inscriptions:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des inscriptions" },
      { status: 500 }
    );
  }
} 