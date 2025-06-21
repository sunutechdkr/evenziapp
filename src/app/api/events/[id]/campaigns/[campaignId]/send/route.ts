import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/resend';

export const dynamic = 'force-dynamic';

// POST - Envoyer une campagne email
export async function POST(
  request: NextRequest,
  context: { params: { id: string; campaignId: string } }
) {
  try {
    const { id, campaignId } = context.params;
    
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Vérifier que l'utilisateur a accès à cet événement
    const event = await prisma.event.findFirst({
      where: {
        id,
        ...(session.user.role === 'ORGANIZER' ? { userId: session.user.id } : {}),
      },
    });

    if (!event) {
      return NextResponse.json({ error: 'Événement non trouvé' }, { status: 404 });
    }

    // Récupérer la campagne
    const campaign = await prisma.emailCampaign.findFirst({
      where: {
        id: campaignId,
        eventId: id,
      },
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Campagne non trouvée' }, { status: 404 });
    }

    if (campaign.status === 'SENT' || campaign.status === 'SENDING') {
      return NextResponse.json(
        { error: 'Cette campagne a déjà été envoyée' },
        { status: 400 }
      );
    }

    // Marquer la campagne comme en cours d'envoi
    await prisma.emailCampaign.update({
      where: { id: campaignId },
      data: { status: 'SENDING' },
    });

    // Récupérer les destinataires selon le type
    let recipients: { email: string; name: string }[] = [];

    switch (campaign.recipientType) {
      case 'ALL_PARTICIPANTS':
      case 'PARTICIPANTS':
        const participants = await prisma.registration.findMany({
          where: { 
            eventId: id,
            ...(campaign.recipientType === 'PARTICIPANTS' ? { type: 'PARTICIPANT' } : {}),
          },
          select: { email: true, firstName: true, lastName: true },
        });
        recipients = participants.map((p: { email: string; firstName: string; lastName: string }) => ({
          email: p.email,
          name: `${p.firstName} ${p.lastName}`,
        }));
        break;

      case 'SPEAKERS':
        const speakers = await prisma.registration.findMany({
          where: { eventId: id, type: 'SPEAKER' },
          select: { email: true, firstName: true, lastName: true },
        });
        recipients = speakers.map((s: { email: string; firstName: string; lastName: string }) => ({
          email: s.email,
          name: `${s.firstName} ${s.lastName}`,
        }));
        break;

      case 'EXHIBITORS':
        const exhibitors = await prisma.registration.findMany({
          where: { eventId: id, type: 'EXHIBITOR' },
          select: { email: true, firstName: true, lastName: true },
        });
        recipients = exhibitors.map((e: { email: string; firstName: string; lastName: string }) => ({
          email: e.email,
          name: `${e.firstName} ${e.lastName}`,
        }));
        break;

      default:
        return NextResponse.json(
          { error: 'Type de destinataire non supporté' },
          { status: 400 }
        );
    }

    if (recipients.length === 0) {
      await prisma.emailCampaign.update({
        where: { id: campaignId },
        data: { 
          status: 'FAILED',
          totalRecipients: 0,
          failureCount: 0,
        },
      });
      return NextResponse.json(
        { error: 'Aucun destinataire trouvé' },
        { status: 400 }
      );
    }

    // Mettre à jour le nombre total de destinataires
    await prisma.emailCampaign.update({
      where: { id: campaignId },
      data: { totalRecipients: recipients.length },
    });

    let successCount = 0;
    let failureCount = 0;

    // Envoyer les emails
    for (const recipient of recipients) {
      try {
        await sendEmail({
          from: 'InEvent <noreply@ineventapp.com>',
          to: recipient.email,
          subject: campaign.subject,
          html: campaign.htmlContent.replace(/{{name}}/g, recipient.name),
          text: campaign.textContent?.replace(/{{name}}/g, recipient.name),
        });

        // Enregistrer la livraison
        await prisma.emailLog.create({
          data: {
            campaignId,
            recipientEmail: recipient.email,
            recipientName: recipient.name,
            status: 'SENT',
            sentAt: new Date(),
          },
        });

        successCount++;
      } catch (error) {
        console.error(`Erreur envoi email à ${recipient.email}:`, error);
        
        // Enregistrer l'échec
        await prisma.emailLog.create({
          data: {
            campaignId,
            recipientEmail: recipient.email,
            recipientName: recipient.name,
            status: 'FAILED',
            errorMessage: error instanceof Error ? error.message : 'Erreur inconnue',
          },
        });

        failureCount++;
      }
    }

    // Mettre à jour la campagne avec les résultats
    await prisma.emailCampaign.update({
      where: { id: campaignId },
      data: {
        status: 'SENT',
        sentAt: new Date(),
        successCount,
        failureCount,
      },
    });

    return NextResponse.json({
      message: 'Campagne envoyée avec succès',
      totalRecipients: recipients.length,
      successCount,
      failureCount,
    });

  } catch (error) {
    console.error('Erreur lors de l\'envoi de la campagne:', error);
    
    // Marquer la campagne comme échouée
    await prisma.emailCampaign.update({
      where: { id: context.params.campaignId },
      data: { status: 'FAILED' },
    });

    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
} 