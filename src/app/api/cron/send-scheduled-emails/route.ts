import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/resend';

export async function POST(request: NextRequest) {
  try {
    // Vérifier la clé de sécurité pour les tâches cron
    const cronSecret = request.headers.get('authorization');
    if (cronSecret !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const now = new Date();
    
    // Trouver toutes les campagnes programmées dont l'heure d'envoi est passée
    const scheduledCampaigns = await prisma.emailCampaign.findMany({
      where: {
        status: 'SCHEDULED',
        scheduledAt: {
          lte: now
        }
      },
      include: {
        event: {
          select: {
            name: true,
            startDate: true,
            location: true,
            banner: true
          }
        },
        emailLogs: {
          where: {
            status: 'PENDING'
          }
        }
      }
    });

    console.log(`Traitement de ${scheduledCampaigns.length} campagnes programmées`);

    let totalProcessed = 0;
    let totalSent = 0;
    let totalFailed = 0;

    for (const campaign of scheduledCampaigns) {
      try {
        // Marquer la campagne comme en cours d'envoi
        await prisma.emailCampaign.update({
          where: { id: campaign.id },
          data: { status: 'SENDING' }
        });

        let campaignSent = 0;
        let campaignFailed = 0;

        // Logo base64 pour les emails
        const logoBase64 = `data:image/svg+xml;base64,${Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="100" viewBox="0 0 400 100"><rect width="400" height="100" fill="#81B441"/><text x="200" y="60" font-family="Arial" font-size="24" font-weight="bold" text-anchor="middle" fill="white">Evenzi App</text></svg>`).toString('base64')}`;

        // Envoyer les emails en attente
        for (const emailLog of campaign.emailLogs) {
          try {
            const processedContent = campaign.htmlContent
              .replace(/\{\{eventBanner\}\}/g, logoBase64)
              .replace(/\{\{eventName\}\}/g, campaign.event.name)
              .replace(/\{\{participantName\}\}/g, emailLog.recipientName || 'Participant')
              .replace(/\{\{eventDate\}\}/g, new Date(campaign.event.startDate).toLocaleDateString())
              .replace(/\{\{eventTime\}\}/g, '14h00')
              .replace(/\{\{eventLocation\}\}/g, campaign.event.location)
              .replace(/\{\{organizerName\}\}/g, 'Organisateur')
              .replace(/\{\{supportEmail\}\}/g, 'support@evenzi.io');

            const processedSubject = campaign.subject
              .replace(/\{\{eventName\}\}/g, campaign.event.name)
              .replace(/\{\{participantName\}\}/g, emailLog.recipientName || 'Participant')
              .replace(/\{\{eventDate\}\}/g, new Date(campaign.event.startDate).toLocaleDateString());

            await sendEmail({
              from: 'noreply@evenzi.io',
              to: emailLog.recipientEmail,
              subject: processedSubject,
              html: processedContent,
            });

            // Mettre à jour le log
            await prisma.emailLog.update({
              where: { id: emailLog.id },
              data: {
                status: 'SENT',
                sentAt: new Date()
              }
            });

            campaignSent++;
            totalSent++;

          } catch (emailError) {
            console.error(`Erreur envoi à ${emailLog.recipientEmail}:`, emailError);
            
            // Mettre à jour le log avec l'erreur
            await prisma.emailLog.update({
              where: { id: emailLog.id },
              data: {
                status: 'FAILED',
                errorMessage: emailError instanceof Error ? emailError.message : 'Erreur inconnue'
              }
            });

            campaignFailed++;
            totalFailed++;
          }
        }

        // Mettre à jour la campagne
        await prisma.emailCampaign.update({
          where: { id: campaign.id },
          data: {
            status: 'SENT',
            sentAt: new Date(),
            successCount: campaignSent,
            failureCount: campaignFailed
          }
        });

        totalProcessed++;
        console.log(`Campagne ${campaign.name}: ${campaignSent} envoyés, ${campaignFailed} échecs`);

      } catch (campaignError) {
        console.error(`Erreur campagne ${campaign.id}:`, campaignError);
        
        // Marquer la campagne comme échouée
        await prisma.emailCampaign.update({
          where: { id: campaign.id },
          data: {
            status: 'FAILED',
            failureCount: campaign.emailLogs.length
          }
        });
      }
    }

    return NextResponse.json({
      success: true,
      processed: totalProcessed,
      sent: totalSent,
      failed: totalFailed,
      message: `${totalProcessed} campagnes traitées, ${totalSent} emails envoyés, ${totalFailed} échecs`
    });

  } catch (error) {
    console.error('Erreur cron scheduled emails:', error);
    return NextResponse.json(
      { error: 'Erreur lors du traitement des emails programmés' },
      { status: 500 }
    );
  }
} 