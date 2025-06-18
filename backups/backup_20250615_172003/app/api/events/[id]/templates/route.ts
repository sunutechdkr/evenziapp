import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id: eventId } = await params;

    // Vérifier que l'événement existe et que l'utilisateur y a accès
    const event = await prisma.event.findFirst({
      where: {
        id: eventId,
        ...(session.user.role === 'ORGANIZER' ? { userId: session.user.id } : {}),
      },
    });

    if (!event) {
      return NextResponse.json({ error: 'Événement non trouvé' }, { status: 404 });
    }

    // Récupérer les templates par catégorie avec limitation
    const templatesByCategory = await Promise.all([
      // 1 template d'inscription
      prisma.emailTemplate.findMany({
        where: {
          OR: [
            { isGlobal: true, category: 'CONFIRMATION_INSCRIPTION' },
            { eventId: eventId, category: 'CONFIRMATION_INSCRIPTION' }
          ]
        },
        orderBy: [{ createdAt: 'desc' }],
        take: 1
      }),
      
      // 3 templates participants  
      prisma.emailTemplate.findMany({
        where: {
          OR: [
            { isGlobal: true, category: { in: ['BIENVENUE_PARTICIPANT', 'RAPPEL_EVENEMENT', 'INFOS_PRATIQUES'] } },
            { eventId: eventId, category: { in: ['BIENVENUE_PARTICIPANT', 'RAPPEL_EVENEMENT', 'INFOS_PRATIQUES'] } }
          ]
        },
        orderBy: [{ createdAt: 'desc' }],
        take: 3
      }),
      
      // 3 templates exposants
      prisma.emailTemplate.findMany({
        where: {
          OR: [
            { isGlobal: true, category: { in: ['GUIDE_EXPOSANT', 'RAPPEL_INSTALLATION', 'INFOS_TECHNIQUES_STAND'] } },
            { eventId: eventId, category: { in: ['GUIDE_EXPOSANT', 'RAPPEL_INSTALLATION', 'INFOS_TECHNIQUES_STAND'] } }
          ]
        },
        orderBy: [{ createdAt: 'desc' }],
        take: 3
      }),
      
      // 3 templates speakers
      prisma.emailTemplate.findMany({
        where: {
          OR: [
            { isGlobal: true, category: { in: ['CONFIRMATION_SPEAKER', 'INFOS_TECHNIQUES_PRESENTATION', 'RAPPEL_PRESENTATION'] } },
            { eventId: eventId, category: { in: ['CONFIRMATION_SPEAKER', 'INFOS_TECHNIQUES_PRESENTATION', 'RAPPEL_PRESENTATION'] } }
          ]
        },
        orderBy: [{ createdAt: 'desc' }],
        take: 3
      }),
      
      // 3 templates marketing (utiliser d'autres catégories disponibles comme fallback)
      prisma.emailTemplate.findMany({
        where: {
          OR: [
            { isGlobal: true, category: { in: ['SUIVI_POST_EVENEMENT', 'BILAN_PARTICIPATION', 'REMERCIEMENT_SPEAKER'] } },
            { eventId: eventId, category: { in: ['SUIVI_POST_EVENEMENT', 'BILAN_PARTICIPATION', 'REMERCIEMENT_SPEAKER'] } }
          ]
        },
        orderBy: [{ createdAt: 'desc' }],
        take: 3
      })
    ]);

    // Combiner tous les templates et éliminer les doublons
    const allTemplates = templatesByCategory.flat();
    const uniqueTemplates = allTemplates.filter((template, index, self) => 
      index === self.findIndex(t => t.id === template.id)
    );

    // Si on a moins de 13 templates, récupérer des templates par défaut génériques
    if (uniqueTemplates.length < 13) {
      const additionalTemplates = await prisma.emailTemplate.findMany({
        where: {
          isGlobal: true,
          isDefault: true,
          id: {
            notIn: uniqueTemplates.map(t => t.id)
          }
        },
        orderBy: [{ name: 'asc' }],
        take: 13 - uniqueTemplates.length
      });
      
      uniqueTemplates.push(...additionalTemplates);
    }

    return NextResponse.json(uniqueTemplates.slice(0, 13));
  } catch (error) {
    console.error('Erreur lors de la récupération des templates :', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id: eventId } = await params;

    // Vérifier que l'événement existe et que l'utilisateur y a accès
    const event = await prisma.event.findFirst({
      where: {
        id: eventId,
        ...(session.user.role === 'ORGANIZER' ? { userId: session.user.id } : {}),
      },
    });

    if (!event) {
      return NextResponse.json({ error: 'Événement non trouvé' }, { status: 404 });
    }

    const body = await request.json();
    const { name, subject, description, category, htmlContent, textContent, isActive, isDefault, isGlobal } = body;

    // Validation des champs obligatoires
    if (!name || !subject || !category || !htmlContent) {
      return NextResponse.json({ 
        error: 'Les champs nom, sujet, catégorie et contenu HTML sont obligatoires' 
      }, { status: 400 });
    }

    // Créer le nouveau template
    const newTemplate = await prisma.emailTemplate.create({
      data: {
        name,
        subject,
        description: description || null,
        category,
        htmlContent,
        textContent: textContent || null,
        isActive: isActive || false,
        isDefault: isDefault || false,
        isGlobal: isGlobal || false,
        eventId: eventId,
      },
    });

    return NextResponse.json(newTemplate, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création du template :', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
} 