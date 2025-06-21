import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/resend";

interface CheckinEmailData {
  eventId: string;
  participantEmail: string;
  participantName: string;
  checkInTime: string;
}

export async function sendCheckinConfirmationEmail(data: CheckinEmailData) {
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
      console.error(`Événement ${data.eventId} non trouvé pour l'envoi d'email de check-in`);
      return false;
    }

    // 2. Récupérer le template de confirmation de check-in
    const template = await prisma.emailTemplate.findFirst({
      where: {
        eventId: data.eventId,
        category: "CONFIRMATION_CHECKIN",
        isActive: true
      }
    });

    if (!template) {
      console.error(`Template de confirmation de check-in non trouvé pour l'événement ${data.eventId}`);
      return false;
    }

    // 3. Préparer les variables de substitution
    const logoBase64 = `data:image/svg+xml;base64,${Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="100" viewBox="0 0 400 100"><rect width="400" height="100" fill="#81B441"/><text x="200" y="60" font-family="Arial" font-size="24" font-weight="bold" text-anchor="middle" fill="white">Evenzi</text></svg>`).toString('base64')}`;
    
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
      checkInTime: data.checkInTime,
      supportEmail: event.supportEmail || 'support@evenzi.io',
      organizerName: 'Evenzi',
      eventBanner: event.banner || logoBase64
    };

    // 4. Remplacer les variables dans le contenu
    let htmlContent = template.htmlContent;
    let subject = template.subject;

    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      htmlContent = htmlContent.replace(new RegExp(placeholder, 'g'), value);
      subject = subject.replace(new RegExp(placeholder, 'g'), value);
    });

    // 5. Envoyer l'email
    await sendEmail({
      from: 'Evenzi <noreply@evenzi.io>',
      to: [data.participantEmail],
      subject: subject,
      html: htmlContent
    });

    console.log(`✅ Email de confirmation de check-in envoyé à ${data.participantEmail} pour l'événement ${event.name}`);
    return true;

  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email de confirmation de check-in:', error);
    return false;
  }
} 