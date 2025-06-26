import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/resend";

export interface RegistrationEmailData {
  eventId: string;
  participantEmail: string;
  participantName: string;
  registrationId: string;
}

export async function sendRegistrationConfirmationEmail(data: RegistrationEmailData) {
  try {
    // 1. Récupérer les informations de l'événement
    const event = await prisma.event.findUnique({
      where: { id: data.eventId },
      select: {
        name: true,
        location: true,
        startDate: true,
        startTime: true,
        supportEmail: true,
        banner: true
      }
    });

    if (!event) {
      console.error(`Événement ${data.eventId} non trouvé pour l'envoi d'email d'inscription`);
      return false;
    }

    // 2. Récupérer le template de confirmation d'inscription
    const template = await prisma.emailTemplate.findFirst({
      where: {
        eventId: data.eventId,
        category: "CONFIRMATION_INSCRIPTION",
        isActive: true
      }
    });

    if (!template) {
      console.error(`Template de confirmation d'inscription non trouvé pour l'événement ${data.eventId}`);
      return false;
    }

    // 3. Préparer les variables de substitution (sans image)
    const variables = {
      eventName: event.name,
      eventLocation: event.location,
      eventDate: new Date(event.startDate).toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      eventTime: event.startTime || 'À définir',
      participantName: data.participantName,
      supportEmail: event.supportEmail || 'support@evenzi.io',
      organizerName: 'Evenzi',
      eventBanner: '', // Suppression de l'image pour éviter les problèmes d'affichage
      registrationId: data.registrationId
    };

    // 4. Remplacer les variables dans le contenu
    let htmlContent = template.htmlContent;
    let subject = template.subject;

    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      htmlContent = htmlContent.replace(new RegExp(placeholder, 'g'), value);
      subject = subject.replace(new RegExp(placeholder, 'g'), value);
    });

    // 5. Créer une campagne email pour les statistiques
    const campaign = await prisma.emailCampaign.create({
      data: {
        eventId: data.eventId,
        name: `Confirmation d'inscription - ${data.participantName}`,
        description: 'Email automatique de confirmation d\'inscription',
        type: 'CUSTOM',
        recipientType: 'PARTICIPANTS',
        subject: subject,
        htmlContent: htmlContent,
        status: 'SENT',
        totalRecipients: 1,
        successCount: 0,
        failureCount: 0,
        sentAt: new Date()
      }
    });

    // 6. Créer le log d'email
    const emailLog = await prisma.emailLog.create({
      data: {
        campaignId: campaign.id,
        recipientEmail: data.participantEmail,
        recipientName: data.participantName,
        status: 'PENDING'
      }
    });

    try {
      // 7. Envoyer l'email
      await sendEmail({
        from: 'Evenzi <noreply@evenzi.io>',
        to: [data.participantEmail],
        subject: subject,
        html: htmlContent
      });

      // 8. Mettre à jour les statistiques en cas de succès
      await Promise.all([
        prisma.emailLog.update({
          where: { id: emailLog.id },
          data: {
            status: 'SENT',
            sentAt: new Date()
          }
        }),
        prisma.emailCampaign.update({
          where: { id: campaign.id },
          data: {
            successCount: 1
          }
        })
      ]);

      console.log(`✅ Email de confirmation d'inscription envoyé à ${data.participantEmail} pour l'événement ${event.name}`);
      return true;

    } catch (emailError) {
      // 9. Mettre à jour les statistiques en cas d'erreur
      const errorMessage = emailError instanceof Error ? emailError.message : 'Erreur inconnue';
      
      await Promise.all([
        prisma.emailLog.update({
          where: { id: emailLog.id },
          data: {
            status: 'FAILED',
            errorMessage: errorMessage
          }
        }),
        prisma.emailCampaign.update({
          where: { id: campaign.id },
          data: {
            failureCount: 1
          }
        })
      ]);

      throw emailError;
    }

  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email de confirmation d\'inscription:', error);
    return false;
  }
} 