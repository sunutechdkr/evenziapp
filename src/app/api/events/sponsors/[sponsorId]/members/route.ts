import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ sponsorId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { sponsorId } = await params;

    // Récupérer le sponsor pour obtenir son nom
    const sponsor = await prisma.sponsor.findUnique({
      where: { id: sponsorId },
      select: { name: true, eventId: true }
    });

    if (!sponsor) {
      return NextResponse.json({ error: 'Sponsor non trouvé' }, { status: 404 });
    }

    // Récupérer les participants de l'événement dont la company correspond au nom du sponsor
    const members = await prisma.registration.findMany({
      where: {
        eventId: sponsor.eventId,
        company: {
          contains: sponsor.name,
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
        createdAt: true
      },
      orderBy: {
        lastName: 'asc'
      }
    });

    // Transformer les données pour le frontend
    const formattedMembers = members.map((member: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      jobTitle: string | null;
      company: string | null;
      type: string;
      createdAt: Date;
    }) => ({
      id: member.id,
      name: `${member.firstName} ${member.lastName}`,
      firstName: member.firstName,
      lastName: member.lastName,
      email: member.email,
      jobTitle: member.jobTitle,
      company: member.company,
      type: member.type,
      joinedAt: member.createdAt
    }));

    return NextResponse.json(formattedMembers);
  } catch (error) {
    console.error('Erreur lors de la récupération des membres:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des membres' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ sponsorId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { sponsorId } = await params;
    const body = await request.json();
    const { participantId } = body;

    if (!participantId) {
      return NextResponse.json({ error: 'ID du participant requis' }, { status: 400 });
    }

    // Récupérer le sponsor
    const sponsor = await prisma.sponsor.findUnique({
      where: { id: sponsorId },
      select: { name: true, eventId: true }
    });

    if (!sponsor) {
      return NextResponse.json({ error: 'Sponsor non trouvé' }, { status: 404 });
    }

    // Mettre à jour la company du participant pour l'associer au sponsor
    const updatedParticipant = await prisma.registration.update({
      where: { 
        id: participantId,
        eventId: sponsor.eventId // Sécurité: s'assurer que le participant est bien de cet événement
      },
      data: {
        company: sponsor.name
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        jobTitle: true,
        company: true,
        type: true,
        createdAt: true
      }
    });

    // Retourner le membre ajouté formaté
    const formattedMember = {
      id: updatedParticipant.id,
      name: `${updatedParticipant.firstName} ${updatedParticipant.lastName}`,
      firstName: updatedParticipant.firstName,
      lastName: updatedParticipant.lastName,
      email: updatedParticipant.email,
      jobTitle: updatedParticipant.jobTitle,
      company: updatedParticipant.company,
      type: updatedParticipant.type,
      joinedAt: updatedParticipant.createdAt
    };

    return NextResponse.json(formattedMember);
  } catch (error) {
    console.error('Erreur lors de l\'ajout du membre:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'ajout du membre' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ sponsorId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { sponsorId } = await params;
    const { searchParams } = new URL(request.url);
    const participantId = searchParams.get('participantId');

    if (!participantId) {
      return NextResponse.json({ error: 'ID du participant requis' }, { status: 400 });
    }

    // Récupérer le sponsor
    const sponsor = await prisma.sponsor.findUnique({
      where: { id: sponsorId },
      select: { name: true, eventId: true }
    });

    if (!sponsor) {
      return NextResponse.json({ error: 'Sponsor non trouvé' }, { status: 404 });
    }

    // Retirer l'association en vidant la company du participant
    await prisma.registration.update({
      where: { 
        id: participantId,
        eventId: sponsor.eventId // Sécurité: s'assurer que le participant est bien de cet événement
      },
      data: {
        company: null
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de la suppression du membre:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du membre' },
      { status: 500 }
    );
  }
}
