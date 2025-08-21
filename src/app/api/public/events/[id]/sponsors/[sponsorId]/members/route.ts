import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/public/events/[id]/sponsors/[sponsorId]/members - Récupérer les membres publics d'un sponsor
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; sponsorId: string }> }
) {
  try {
    const paramsData = await params;
    const { id: eventId, sponsorId } = paramsData;
    
    // Vérifier que l'événement et le sponsor existent
    const sponsor = await prisma.sponsor.findFirst({
      where: { 
        id: sponsorId,
        eventId: eventId,
        visible: true  // Seulement les sponsors publics
      },
    });
    
    if (!sponsor) {
      return NextResponse.json(
        { message: "Sponsor non trouvé ou non visible" },
        { status: 404 }
      );
    }

    // Récupérer les participants associés au sponsor (par nom d'entreprise)
    const members = await prisma.registration.findMany({
      where: {
        eventId: eventId,
        company: {
          equals: sponsor.name,
          mode: 'insensitive'
        }
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        jobTitle: true,
        company: true,
        type: true,
        createdAt: true,
        user: {
          select: {
            image: true // Récupérer l'avatar de l'utilisateur
          }
        }
        // Pas de données sensibles exposées aux participants
      },
      orderBy: [
        { firstName: 'asc' },
        { lastName: 'asc' }
      ]
    });

    // Formater les données pour l'affichage public
    const formattedMembers = members.map((member: any) => ({
      id: member.id,
      name: `${member.firstName} ${member.lastName}`,
      firstName: member.firstName,
      lastName: member.lastName,
      email: member.email, // Email visible pour contact professionnel
      jobTitle: member.jobTitle || "Non renseigné",
      company: member.company || sponsor.name,
      type: member.type,
      joinedAt: member.createdAt,
      avatar: member.user?.image || null, // Avatar de l'utilisateur
    }));
    
    return NextResponse.json(formattedMembers);
  } catch (error: unknown) {
    console.error("❌ Erreur lors de la récupération des membres publics:", error);
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    return NextResponse.json(
      { message: "Erreur lors de la récupération des membres", error: errorMessage },
      { status: 500 }
    );
  }
}
