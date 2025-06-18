import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Fonction pour générer un code OTP à 6 chiffres
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: NextRequest) {
  try {
    // Vérifier que la clé API Resend est configurée
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY non configurée');
      return NextResponse.json(
        { error: 'Configuration email manquante' },
        { status: 500 }
      );
    }

    const { email } = await request.json();
    console.log('Demande OTP pour email:', email);

    if (!email) {
      return NextResponse.json(
        { error: 'Email requis' },
        { status: 400 }
      );
    }

    // Chercher le participant dans les inscriptions (modèle Registration)
    console.log('Recherche du participant...');
    const participant = await prisma.registration.findFirst({
      where: {
        email: email.toLowerCase(),
      },
      include: {
        event: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!participant) {
      console.log('Aucun participant trouvé pour:', email);
      return NextResponse.json(
        { error: 'Aucune inscription trouvée avec cet email' },
        { status: 404 }
      );
    }

    console.log('Participant trouvé:', participant.firstName, participant.lastName);

    // Générer un code OTP
    const otpCode = generateOTP();
    console.log('Code OTP généré:', otpCode);
    
    // Supprimer les anciens codes non utilisés pour cet email
    await prisma.otpCode.deleteMany({
      where: {
        email: email.toLowerCase(),
        used: false,
      },
    });

    // Stocker le nouveau code avec expiration de 10 minutes
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    await prisma.otpCode.create({
      data: {
        email: email.toLowerCase(),
        code: otpCode,
        eventId: participant.event.id,
        expiresAt,
      },
    });

    console.log('Code OTP stocké en base de données');

    // Envoyer l'email avec le code
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Code de connexion - ${participant.event.name}</title>
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">🔐 Code de Connexion</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 16px;">${participant.event.name}</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
            <p style="font-size: 18px; margin-bottom: 20px;">
              Bonjour <strong>${participant.firstName}</strong>,
            </p>
            
            <p style="font-size: 16px; margin-bottom: 25px;">
              Voici votre code de connexion pour accéder à votre espace participant :
            </p>
            
            <div style="background: white; border: 2px solid #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 25px 0;">
              <div style="font-size: 36px; font-weight: bold; color: #667eea; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                ${otpCode}
              </div>
              <p style="margin: 10px 0 0 0; font-size: 14px; color: #6c757d;">
                Ce code expire dans <strong>10 minutes</strong>
              </p>
            </div>
            
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 6px; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; font-size: 14px; color: #856404;">
                <strong>⚠️ Important :</strong> Ce code est personnel et confidentiel. Ne le partagez avec personne.
              </p>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
              <p style="font-size: 14px; color: #6c757d; margin: 0;">
                <strong>Événement :</strong> ${participant.event.name}<br>
                <strong>Code événement :</strong> ${participant.event.slug}<br>
                <strong>Votre email :</strong> ${participant.email}
              </p>
            </div>
            
            <div style="margin-top: 25px; text-align: center;">
              <p style="font-size: 14px; color: #6c757d;">
                Si vous n'avez pas demandé ce code, vous pouvez ignorer cet email en toute sécurité.
              </p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px;">
            <p style="font-size: 12px; color: #adb5bd;">
              © 2024 InEvent - Système de gestion d'événements
            </p>
          </div>
        </body>
      </html>
    `;

    console.log('Tentative d\'envoi d\'email avec Resend...');
    
    const emailResult = await resend.emails.send({
      from: "InEvent <noreply@ineventapp.com>", // Utilise le domaine vérifié
      to: [email],
      subject: `🔐 Code de connexion - ${participant.event.name}`,
      html: emailHtml,
    });

    console.log('Résultat envoi email:', emailResult);

    if (emailResult.error) {
      console.error('Erreur Resend:', emailResult.error);
      return NextResponse.json(
        { error: 'Erreur lors de l\'envoi de l\'email' },
        { status: 500 }
      );
    }

    console.log('✅ Email OTP envoyé avec succès !');

    return NextResponse.json({
      success: true,
      message: "Code envoyé avec succès",
      eventName: participant.event.name,
    });

  } catch (error) {
    console.error("Erreur lors de l'envoi du code:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'envoi du code" },
      { status: 500 }
    );
  }
} 