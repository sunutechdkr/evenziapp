import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Fonction pour calculer la similarité entre deux profils
function calculateSimilarity(profile1: any, profile2: any): { score: number; reason: string } {
  let score = 0;
  let reasons: string[] = [];

  // Similarité basée sur les intérêts communs
  const commonInterests = profile1.interests.filter((interest: string) => 
    profile2.interests.includes(interest)
  );
  if (commonInterests.length > 0) {
    score += Math.min(commonInterests.length * 0.2, 0.6);
    reasons.push(`${commonInterests.length} intérêt(s) commun(s): ${commonInterests.slice(0, 3).join(', ')}`);
  }

  // Similarité basée sur les objectifs communs
  const commonGoals = profile1.goals.filter((goal: string) => 
    profile2.goals.includes(goal)
  );
  if (commonGoals.length > 0) {
    score += Math.min(commonGoals.length * 0.15, 0.4);
    reasons.push(`${commonGoals.length} objectif(s) commun(s): ${commonGoals.slice(0, 2).join(', ')}`);
  }

  // Bonus si l'un cherche du recrutement et l'autre du networking
  const isComplementary = 
    (profile1.goals.includes('recrutement') && profile2.goals.includes('networking')) ||
    (profile1.goals.includes('networking') && profile2.goals.includes('recrutement')) ||
    (profile1.goals.includes('vente') && profile2.goals.includes('achat'));
  
  if (isComplementary) {
    score += 0.3;
    reasons.push('Objectifs complémentaires');
  }

  // Similarité textuelle basique sur la bio/headline
  if (profile1.bio && profile2.bio) {
    const bio1Words = profile1.bio.toLowerCase().split(' ');
    const bio2Words = profile2.bio.toLowerCase().split(' ');
    const commonWords = bio1Words.filter((word: string) => 
      bio2Words.includes(word) && word.length > 3
    );
    if (commonWords.length > 0) {
      score += Math.min(commonWords.length * 0.05, 0.2);
    }
  }

  return {
    score: Math.min(score, 1), // Cap à 1
    reason: reasons.join(' • ')
  };
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { eventId } = await request.json();
    if (!eventId) {
      return NextResponse.json({ error: 'eventId requis' }, { status: 400 });
    }

    // Vérifier que l'utilisateur est inscrit à l'événement
    const userRegistration = await prisma.registration.findFirst({
      where: {
        eventId,
        email: session.user.email!
      }
    });

    if (!userRegistration) {
      return NextResponse.json({ error: 'Utilisateur non inscrit à cet événement' }, { status: 403 });
    }

    // Récupérer ou créer le profil de matchmaking de l'utilisateur
    let userProfile = await prisma.userMatchProfile.findUnique({
      where: {
        userId_eventId: {
          userId: session.user.id,
          eventId
        }
      }
    });

    if (!userProfile || (!userProfile.interests.length && !userProfile.goals.length)) {
      return NextResponse.json({ 
        error: 'Profil de matchmaking incomplet', 
        message: 'Veuillez d\'abord compléter votre profil avec vos intérêts et objectifs'
      }, { status: 400 });
    }

    // Récupérer tous les autres profils de l'événement
    const otherProfiles = await prisma.userMatchProfile.findMany({
      where: {
        eventId,
        userId: { not: session.user.id }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        }
      }
    });

    // Calculer les suggestions
    const suggestions = otherProfiles.map(profile => {
      const similarity = calculateSimilarity(userProfile, profile);
      return {
        userId: session.user.id,
        suggestedId: profile.userId,
        eventId,
        score: similarity.score,
        reason: similarity.reason,
        profile: profile,
        user: profile.user
      };
    })
    .filter(s => s.score > 0.1) // Seuil minimum
    .sort((a, b) => b.score - a.score)
    .slice(0, 10); // Top 10

    // Supprimer les anciennes suggestions pour cet utilisateur/événement
    await prisma.matchSuggestion.deleteMany({
      where: {
        userId: session.user.id,
        eventId
      }
    });

    // Sauvegarder les nouvelles suggestions
    if (suggestions.length > 0) {
      await prisma.matchSuggestion.createMany({
        data: suggestions.map(s => ({
          userId: s.userId,
          suggestedId: s.suggestedId,
          eventId: s.eventId,
          score: s.score,
          reason: s.reason
        }))
      });
    }

    return NextResponse.json({
      suggestions: suggestions.map(s => ({
        id: s.suggestedId,
        user: s.user,
        profile: {
          headline: s.profile.headline,
          bio: s.profile.bio,
          interests: s.profile.interests,
          goals: s.profile.goals
        },
        score: s.score,
        reason: s.reason
      }))
    });

  } catch (error) {
    console.error('Erreur génération suggestions:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la génération des suggestions' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');

    if (!eventId) {
      return NextResponse.json({ error: 'eventId requis' }, { status: 400 });
    }

    // Récupérer les suggestions existantes
    const suggestions = await prisma.matchSuggestion.findMany({
      where: {
        userId: session.user.id,
        eventId
      },
      include: {
        suggested: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        }
      },
      orderBy: {
        score: 'desc'
      }
    });

    // Récupérer les profils associés
    const suggestedIds = suggestions.map(s => s.suggestedId);
    const profiles = await prisma.userMatchProfile.findMany({
      where: {
        userId: { in: suggestedIds },
        eventId
      }
    });

    const profileMap = new Map(profiles.map(p => [p.userId, p]));

    return NextResponse.json({
      suggestions: suggestions.map(s => ({
        id: s.suggestedId,
        user: s.suggested,
        profile: profileMap.get(s.suggestedId) || null,
        score: s.score,
        reason: s.reason,
        createdAt: s.createdAt
      }))
    });

  } catch (error) {
    console.error('Erreur récupération suggestions:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des suggestions' },
      { status: 500 }
    );
  }
} 