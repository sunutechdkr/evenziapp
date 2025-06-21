import { prisma } from "@/lib/prisma";

export async function createDefaultTemplates(eventId: string) {
  const defaultTemplates = [
    {
      name: "Confirmation d'inscription",
      subject: "Votre inscription à {{eventName}} est confirmée !",
      category: "CONFIRMATION_INSCRIPTION",
      description: "Email automatique envoyé après inscription",
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
          <div style="background: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <img src="{{eventBanner}}" alt="{{eventName}}" style="max-width: 100%; height: auto; border-radius: 8px;" />
            </div>
            
            <h1 style="color: #81B441; text-align: center; margin-bottom: 20px;">Inscription confirmée !</h1>
            
            <p style="color: #374151; line-height: 1.6; font-size: 16px;">
              Bonjour {{participantName}},
            </p>
            
            <p style="color: #374151; line-height: 1.6; font-size: 16px;">
              Nous avons le plaisir de confirmer votre inscription à <strong>{{eventName}}</strong>.
            </p>
            
            <div style="background: #f3f4f6; border-radius: 6px; padding: 20px; margin: 25px 0;">
              <h3 style="color: #374151; margin: 0 0 15px 0;">📅 Détails de l'événement</h3>
              <p style="margin: 5px 0; color: #6b7280;"><strong>Date :</strong> {{eventDate}}</p>
              <p style="margin: 5px 0; color: #6b7280;"><strong>Heure :</strong> {{eventTime}}</p>
              <p style="margin: 5px 0; color: #6b7280;"><strong>Lieu :</strong> {{eventLocation}}</p>
            </div>
            
            <p style="color: #374151; line-height: 1.6; font-size: 16px;">
              Nous avons hâte de vous accueillir !
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <p style="color: #6b7280; font-size: 14px;">
                Pour toute question : <a href="mailto:{{supportEmail}}" style="color: #81B441;">{{supportEmail}}</a>
              </p>
            </div>
            
            <p style="color: #374151; line-height: 1.6;">
              Cordialement,<br>
              L'équipe {{organizerName}}
            </p>
          </div>
        </div>
      `,
      isActive: true,
      isDefault: true
    },
    {
      name: "Bienvenue participant",
      subject: "Bienvenue à {{eventName}} - Toutes les informations pratiques",
      category: "BIENVENUE_PARTICIPANT",
      description: "Email de bienvenue avec informations pratiques",
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
          <div style="background: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <img src="{{eventBanner}}" alt="{{eventName}}" style="max-width: 100%; height: auto; border-radius: 8px;" />
            </div>
            
            <h1 style="color: #81B441; text-align: center; margin-bottom: 20px;">Bienvenue {{participantName}} !</h1>
            
            <p style="color: #374151; line-height: 1.6; font-size: 16px;">
              Nous sommes ravis de vous accueillir à <strong>{{eventName}}</strong>.
            </p>
            
            <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 25px 0;">
              <h3 style="color: #1e40af; margin: 0 0 15px 0;">ℹ️ Informations importantes</h3>
              <ul style="color: #1e3a8a; margin: 0; padding-left: 20px;">
                <li>Arrivez 15 minutes avant le début</li>
                <li>Munissez-vous d'une pièce d'identité</li>
                <li>Pensez à apporter votre badge (QR code ci-joint)</li>
              </ul>
            </div>
            
            <div style="background: #f3f4f6; border-radius: 6px; padding: 20px; margin: 25px 0;">
              <h3 style="color: #374151; margin: 0 0 15px 0;">📍 Lieu et accès</h3>
              <p style="margin: 5px 0; color: #6b7280;"><strong>Adresse :</strong> {{eventLocation}}</p>
              <p style="margin: 5px 0; color: #6b7280;"><strong>Transport :</strong> Métro ligne X, arrêt Y</p>
              <p style="margin: 5px 0; color: #6b7280;"><strong>Parking :</strong> Disponible sur place</p>
            </div>
            
            <p style="color: #374151; line-height: 1.6; font-size: 16px;">
              À très bientôt !
            </p>
            
            <p style="color: #374151; line-height: 1.6;">
              L'équipe {{organizerName}}
            </p>
          </div>
        </div>
      `,
      isActive: false,
      isDefault: true
    },
    {
      name: "Rappel événement",
      subject: "🔔 N'oubliez pas {{eventName}} demain !",
      category: "RAPPEL_EVENEMENT",
      description: "Rappel envoyé la veille de l'événement",
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
          <div style="background: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h1 style="color: #f59e0b; text-align: center; margin-bottom: 20px;">🔔 Rappel important</h1>
            
            <p style="color: #374151; line-height: 1.6; font-size: 16px;">
              Bonjour {{participantName}},
            </p>
            
            <p style="color: #374151; line-height: 1.6; font-size: 16px;">
              Nous vous rappelons que <strong>{{eventName}}</strong> a lieu <strong>demain</strong> !
            </p>
            
            <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 20px; margin: 25px 0; text-align: center;">
              <h3 style="color: #92400e; margin: 0 0 10px 0;">📅 Rendez-vous demain</h3>
              <p style="margin: 5px 0; color: #92400e; font-size: 18px; font-weight: bold;">{{eventDate}} à {{eventTime}}</p>
              <p style="margin: 5px 0; color: #92400e;">{{eventLocation}}</p>
            </div>
            
            <div style="background: #dcfce7; border-left: 4px solid #16a34a; padding: 20px; margin: 25px 0;">
              <h3 style="color: #15803d; margin: 0 0 15px 0;">✅ Check-list de dernière minute</h3>
              <ul style="color: #166534; margin: 0; padding-left: 20px;">
                <li>Votre badge d'accès (QR code)</li>
                <li>Une pièce d'identité</li>
                <li>Votre bonne humeur !</li>
              </ul>
            </div>
            
            <p style="color: #374151; line-height: 1.6; font-size: 16px;">
              Nous avons hâte de vous voir !
            </p>
            
            <p style="color: #374151; line-height: 1.6;">
              À demain,<br>
              L'équipe {{organizerName}}
            </p>
          </div>
        </div>
      `,
      isActive: false,
      isDefault: true
    },
    {
      name: "Guide exposant",
      subject: "Guide pratique pour votre participation à {{eventName}}",
      category: "GUIDE_EXPOSANT",
      description: "Informations pratiques pour les exposants",
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
          <div style="background: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h1 style="color: #7c3aed; text-align: center; margin-bottom: 20px;">🏢 Guide Exposant</h1>
            
            <p style="color: #374151; line-height: 1.6; font-size: 16px;">
              Cher exposant,
            </p>
            
            <p style="color: #374151; line-height: 1.6; font-size: 16px;">
              Merci de participer à <strong>{{eventName}}</strong> en tant qu'exposant.
            </p>
            
            <div style="background: #f3f4f6; border-radius: 6px; padding: 20px; margin: 25px 0;">
              <h3 style="color: #374151; margin: 0 0 15px 0;">📦 Installation</h3>
              <p style="color: #6b7280; margin: 5px 0;"><strong>Montage :</strong> {{eventDate}} de 8h00 à 9h00</p>
              <p style="color: #6b7280; margin: 5px 0;"><strong>Démontage :</strong> {{eventDate}} après 18h00</p>
              <p style="color: #6b7280; margin: 5px 0;"><strong>Accès :</strong> Entrée exposants - Porte C</p>
            </div>
            
            <div style="background: #ede9fe; border-left: 4px solid #7c3aed; padding: 20px; margin: 25px 0;">
              <h3 style="color: #5b21b6; margin: 0 0 15px 0;">📋 À prévoir</h3>
              <ul style="color: #6b21a8; margin: 0; padding-left: 20px;">
                <li>Matériel de démonstration</li>
                <li>Documentation commerciale</li>
                <li>Badges pour votre équipe</li>
                <li>Rallonges électriques si nécessaire</li>
              </ul>
            </div>
            
            <p style="color: #374151; line-height: 1.6;">
              Cordialement,<br>
              L'équipe {{organizerName}}
            </p>
          </div>
        </div>
      `,
      isActive: false,
      isDefault: true
    },
    {
      name: "Confirmation speaker",
      subject: "Confirmation de votre intervention à {{eventName}}",
      category: "CONFIRMATION_SPEAKER",
      description: "Confirmation pour les intervenants",
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
          <div style="background: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h1 style="color: #ea580c; text-align: center; margin-bottom: 20px;">🎤 Confirmation Speaker</h1>
            
            <p style="color: #374151; line-height: 1.6; font-size: 16px;">
              Cher {{participantName}},
            </p>
            
            <p style="color: #374151; line-height: 1.6; font-size: 16px;">
              Nous confirmons votre intervention à <strong>{{eventName}}</strong>.
            </p>
            
            <div style="background: #fed7aa; border: 1px solid #ea580c; border-radius: 6px; padding: 20px; margin: 25px 0;">
              <h3 style="color: #c2410c; margin: 0 0 15px 0;">🎯 Votre session</h3>
              <p style="color: #9a3412; margin: 5px 0;"><strong>Titre :</strong> [Titre de votre présentation]</p>
              <p style="color: #9a3412; margin: 5px 0;"><strong>Horaire :</strong> {{eventDate}} à [Heure]</p>
              <p style="color: #9a3412; margin: 5px 0;"><strong>Durée :</strong> [Durée] minutes</p>
              <p style="color: #9a3412; margin: 5px 0;"><strong>Salle :</strong> [Nom de la salle]</p>
            </div>
            
            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 25px 0;">
              <h3 style="color: #92400e; margin: 0 0 15px 0;">⚡ Infos techniques</h3>
              <ul style="color: #78350f; margin: 0; padding-left: 20px;">
                <li>Projecteur et écran disponibles</li>
                <li>Micro-casque fourni</li>
                <li>Connexion HDMI et USB-C</li>
                <li>Test technique 30 min avant</li>
              </ul>
            </div>
            
            <p style="color: #374151; line-height: 1.6; font-size: 16px;">
              Merci pour votre participation !
            </p>
            
            <p style="color: #374151; line-height: 1.6;">
              L'équipe {{organizerName}}
            </p>
          </div>
        </div>
      `,
      isActive: false,
      isDefault: true
    }
  ];

  // Créer tous les templates par défaut
  for (const template of defaultTemplates) {
    await prisma.emailTemplate.create({
      data: {
        ...template,
        eventId,
        type: "CUSTOM",
        isGlobal: false,
        textContent: template.htmlContent.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
      }
    });
  }

  console.log(`✅ ${defaultTemplates.length} templates par défaut créés pour l'événement ${eventId}`);
} 