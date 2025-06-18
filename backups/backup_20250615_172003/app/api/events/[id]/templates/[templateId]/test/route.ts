import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Resend } from 'resend';
import { prisma } from '@/lib/prisma';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; templateId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user.role !== 'ORGANIZER' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id: eventId, templateId } = await params;
    const { email, previewContent, subject } = await request.json();

    // Variables disponibles pour utilisation future si nécessaire
    console.log(`Envoi email test pour événement ${eventId}, template ${templateId}`);

    if (!email || !previewContent || !subject) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 });
    }

    // Valider l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Adresse email invalide' }, { status: 400 });
    }

    // Récupérer les informations de l'événement
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: {
        name: true,
        startDate: true,
        location: true,
        banner: true
      }
    });

    if (!event) {
      return NextResponse.json({ error: 'Événement non trouvé' }, { status: 404 });
    }

    // Traiter le contenu avec les variables d'événement
    // Utiliser une image SVG simple et compacte pour assurer l'affichage dans les emails
    const logoBase64 = `data:image/svg+xml;base64,${Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="100" viewBox="0 0 400 100"><rect width="400" height="100" fill="#81B441"/><text x="200" y="60" font-family="Arial" font-size="24" font-weight="bold" text-anchor="middle" fill="white">InEvent App</text></svg>`).toString('base64')}`;
    
    const processedHtmlContent = previewContent
      .replace(/\{\{eventBanner\}\}/g, logoBase64)
      .replace(/\{\{eventName\}\}/g, event.name)
      .replace(/\{\{participantName\}\}/g, 'Participant de test')
      .replace(/\{\{eventDate\}\}/g, new Date(event.startDate).toLocaleDateString())
      .replace(/\{\{eventTime\}\}/g, '14h00')
      .replace(/\{\{eventLocation\}\}/g, event.location)
      .replace(/\{\{organizerName\}\}/g, 'Organisateur')
      .replace(/\{\{supportEmail\}\}/g, 'support@ineventapp.com');

    const processedSubject = subject
      .replace(/\{\{eventName\}\}/g, event.name)
      .replace(/\{\{participantName\}\}/g, 'Jean Dupont')
      .replace(/\{\{eventDate\}\}/g, new Date(event.startDate).toLocaleDateString())
      .replace(/\{\{eventTime\}\}/g, '14h00')
      .replace(/\{\{eventLocation\}\}/g, event.location)
      .replace(/\{\{organizerName\}\}/g, 'Organisateur')
      .replace(/\{\{supportEmail\}\}/g, 'support@ineventapp.com');

    // Envoyer l'email de test
    await resend.emails.send({
      from: 'noreply@ineventapp.com',
      to: email,
      subject: `[TEST] ${processedSubject}`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #374151; margin: 0; font-size: 18px;">📧 Email de test</h2>
            <p style="color: #6b7280; margin: 5px 0 0 0; font-size: 14px;">
              Ceci est un aperçu du template pour l'événement. L'email final sera envoyé depuis l'adresse officielle de l'événement.
            </p>
          </div>
          ${processedHtmlContent}
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280;">
            <p>Cet email de test a été envoyé via la plateforme InEvent.</p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ success: true, message: 'Email de test envoyé avec succès!' });
  } catch (error) {
    console.error('Erreur envoi email test:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi de l\'email de test' },
      { status: 500 }
    );
  }
} 