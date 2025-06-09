const { PrismaClient } = require('../src/generated/prisma');

const prisma = new PrismaClient();

const emailTemplates = [
  // INSCRIPTION (1 template)
  {
    name: "Confirmation d'inscription",
    description: "Email de confirmation envoyé automatiquement après inscription",
    subject: "✅ Inscription confirmée - {{eventName}}",
    category: "CONFIRMATION_INSCRIPTION",
    type: "INVITATION",
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #81B441 0%, #6a9635 100%); padding: 30px; text-align: center;">
          {{#if eventBanner}}
          <img src="{{eventBanner}}" alt="{{eventName}}" style="max-width: 200px; margin-bottom: 20px;">
          {{/if}}
          <h1 style="color: white; margin: 0; font-size: 28px;">Inscription confirmée !</h1>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333; margin-bottom: 20px;">Bonjour {{participantName}},</h2>
          
          <p style="color: #666; line-height: 1.6; font-size: 16px;">
            Votre inscription à <strong>{{eventName}}</strong> a été confirmée avec succès !
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #81B441;">
            <h3 style="color: #333; margin-top: 0;">Détails de l'événement</h3>
            <p style="margin: 5px 0;"><strong>📅 Date :</strong> {{eventDate}}</p>
            <p style="margin: 5px 0;"><strong>🕐 Heure :</strong> {{eventTime}}</p>
            <p style="margin: 5px 0;"><strong>📍 Lieu :</strong> {{eventLocation}}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{eventUrl}}" style="background: #81B441; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              Voir les détails de l'événement
            </a>
          </div>
          
          <p style="color: #666; line-height: 1.6;">
            Vous recevrez prochainement d'autres informations importantes concernant l'événement.
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <p style="color: #999; font-size: 14px; text-align: center;">
            Cet email a été envoyé par {{organizerName}}<br>
            Pour toute question : {{supportEmail}}
          </p>
        </div>
      </div>
    `,
    textContent: `
Inscription confirmée - {{eventName}}

Bonjour {{participantName}},

Votre inscription à {{eventName}} a été confirmée avec succès !

Détails de l'événement :
- Date : {{eventDate}}
- Heure : {{eventTime}}
- Lieu : {{eventLocation}}

Vous recevrez prochainement d'autres informations importantes.

Pour toute question : {{supportEmail}}
    `
  },

  // PARTICIPANTS (4 templates)
  {
    name: "Bienvenue participant",
    description: "Message de bienvenue pour les participants",
    subject: "🎉 Bienvenue à {{eventName}} !",
    category: "BIENVENUE_PARTICIPANT",
    type: "ANNOUNCEMENT",
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #81B441 0%, #6a9635 100%); padding: 30px; text-align: center;">
          {{#if eventBanner}}
          <img src="{{eventBanner}}" alt="{{eventName}}" style="max-width: 200px; margin-bottom: 20px;">
          {{/if}}
          <h1 style="color: white; margin: 0; font-size: 28px;">Bienvenue !</h1>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333;">Bonjour {{participantName}},</h2>
          
          <p style="color: #666; line-height: 1.6; font-size: 16px;">
            Nous sommes ravis de vous accueillir à <strong>{{eventName}}</strong> ! 
            Cet événement promet d'être une expérience enrichissante.
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Ce qui vous attend :</h3>
            <ul style="color: #666; line-height: 1.8;">
              <li>Des conférences inspirantes</li>
              <li>Des opportunités de networking</li>
              <li>Des ateliers pratiques</li>
              <li>Des rencontres avec des experts</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{eventUrl}}" style="background: #81B441; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              Découvrir le programme
            </a>
          </div>
          
          <p style="color: #666; line-height: 1.6;">
            N'hésitez pas à nous contacter si vous avez des questions.
          </p>
        </div>
      </div>
    `
  },

  {
    name: "Rappel événement J-7",
    description: "Rappel envoyé 7 jours avant l'événement",
    subject: "⏰ Plus que 7 jours avant {{eventName}} !",
    category: "RAPPEL_EVENEMENT",
    type: "REMINDER",
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #81B441 0%, #6a9635 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Plus que 7 jours !</h1>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333;">Bonjour {{participantName}},</h2>
          
          <p style="color: #666; line-height: 1.6; font-size: 16px;">
            <strong>{{eventName}}</strong> approche à grands pas ! Plus que 7 jours avant cet événement exceptionnel.
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #81B441;">
            <h3 style="color: #333; margin-top: 0;">Rappel des informations importantes</h3>
            <p style="margin: 5px 0;"><strong>📅 Date :</strong> {{eventDate}}</p>
            <p style="margin: 5px 0;"><strong>🕐 Heure :</strong> {{eventTime}}</p>
            <p style="margin: 5px 0;"><strong>📍 Lieu :</strong> {{eventLocation}}</p>
          </div>
          
          <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <h4 style="color: #856404; margin-top: 0;">À prévoir :</h4>
            <ul style="color: #856404; margin-bottom: 0;">
              <li>Votre badge d'accès (à imprimer ou sur mobile)</li>
              <li>Une pièce d'identité</li>
              <li>Vos cartes de visite pour le networking</li>
            </ul>
          </div>
        </div>
      </div>
    `
  },

  {
    name: "Informations pratiques",
    description: "Informations pratiques pour les participants",
    subject: "📋 Informations pratiques - {{eventName}}",
    category: "INFOS_PRATIQUES",
    type: "ANNOUNCEMENT",
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #81B441 0%, #6a9635 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Informations pratiques</h1>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333;">Bonjour {{participantName}},</h2>
          
          <p style="color: #666; line-height: 1.6;">
            Voici toutes les informations pratiques pour profiter pleinement de <strong>{{eventName}}</strong>.
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">🚗 Accès et parking</h3>
            <p style="color: #666;">Parking gratuit disponible sur site. Accès par l'entrée principale.</p>
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">🍽️ Restauration</h3>
            <p style="color: #666;">Pause-café et déjeuner inclus. Merci de signaler vos allergies alimentaires.</p>
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">📱 Application mobile</h3>
            <p style="color: #666;">Téléchargez notre app pour accéder au programme et échanger avec les participants.</p>
          </div>
        </div>
      </div>
    `
  },

  {
    name: "Suivi post-événement",
    description: "Email de suivi après l'événement",
    subject: "🙏 Merci pour votre participation à {{eventName}}",
    category: "SUIVI_POST_EVENEMENT",
    type: "FOLLOW_UP",
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #81B441 0%, #6a9635 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Merci !</h1>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333;">Bonjour {{participantName}},</h2>
          
          <p style="color: #666; line-height: 1.6; font-size: 16px;">
            Merci d'avoir participé à <strong>{{eventName}}</strong> ! Nous espérons que cet événement a répondu à vos attentes.
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">📊 Votre avis nous intéresse</h3>
            <p style="color: #666;">Aidez-nous à améliorer nos futurs événements en répondant à notre enquête de satisfaction.</p>
            <div style="text-align: center; margin-top: 15px;">
              <a href="{{surveyUrl}}" style="background: #81B441; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                Répondre à l'enquête
              </a>
            </div>
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">📄 Ressources</h3>
            <p style="color: #666;">Les présentations et supports de l'événement seront bientôt disponibles.</p>
          </div>
        </div>
      </div>
    `
  },

  // EXPOSANTS (4 templates)
  {
    name: "Guide exposant",
    description: "Guide complet pour les exposants",
    subject: "📖 Guide exposant - {{eventName}}",
    category: "GUIDE_EXPOSANT",
    type: "ANNOUNCEMENT",
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #81B441 0%, #6a9635 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Guide Exposant</h1>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333;">Bonjour {{exposantName}},</h2>
          
          <p style="color: #666; line-height: 1.6;">
            Bienvenue parmi les exposants de <strong>{{eventName}}</strong> ! Voici votre guide complet.
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">📦 Votre emplacement</h3>
            <p style="color: #666;"><strong>Stand :</strong> {{standNumber}}</p>
            <p style="color: #666;"><strong>Zone :</strong> {{standZone}}</p>
            <p style="color: #666;"><strong>Dimensions :</strong> {{standSize}}</p>
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">🚚 Livraisons et montage</h3>
            <p style="color: #666;"><strong>Montage :</strong> {{setupDate}} de {{setupTime}}</p>
            <p style="color: #666;"><strong>Démontage :</strong> {{teardownDate}} de {{teardownTime}}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{exhibitorGuideUrl}}" style="background: #81B441; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              Télécharger le guide complet
            </a>
          </div>
        </div>
      </div>
    `
  },

  {
    name: "Rappel installation",
    description: "Rappel pour l'installation du stand",
    subject: "🔧 Rappel installation - {{eventName}}",
    category: "RAPPEL_INSTALLATION",
    type: "REMINDER",
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #81B441 0%, #6a9635 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Installation du stand</h1>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333;">Bonjour {{exposantName}},</h2>
          
          <p style="color: #666; line-height: 1.6;">
            Rappel important : l'installation de votre stand pour <strong>{{eventName}}</strong> commence bientôt !
          </p>
          
          <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <h3 style="color: #856404; margin-top: 0;">⏰ Créneaux d'installation</h3>
            <p style="color: #856404; margin: 5px 0;"><strong>Date :</strong> {{setupDate}}</p>
            <p style="color: #856404; margin: 5px 0;"><strong>Heure :</strong> {{setupTime}}</p>
            <p style="color: #856404; margin: 5px 0;"><strong>Stand :</strong> {{standNumber}} - {{standZone}}</p>
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">📋 À prévoir</h3>
            <ul style="color: #666;">
              <li>Badge exposant (obligatoire)</li>
              <li>Matériel de montage</li>
              <li>Supports de communication</li>
              <li>Équipe de montage</li>
            </ul>
          </div>
          
          <div style="background: #d1ecf1; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #17a2b8;">
            <p style="color: #0c5460; margin: 0;"><strong>Contact technique :</strong> {{technicalContact}}</p>
          </div>
        </div>
      </div>
    `
  },

  {
    name: "Informations techniques stand",
    description: "Informations techniques pour le stand",
    subject: "⚡ Infos techniques - {{eventName}}",
    category: "INFOS_TECHNIQUES_STAND",
    type: "ANNOUNCEMENT",
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #81B441 0%, #6a9635 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Infos Techniques</h1>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333;">Bonjour {{exposantName}},</h2>
          
          <p style="color: #666; line-height: 1.6;">
            Voici les informations techniques pour votre stand à <strong>{{eventName}}</strong>.
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">⚡ Électricité</h3>
            <p style="color: #666;">Puissance disponible : {{electricPower}}</p>
            <p style="color: #666;">Prises : {{electricOutlets}}</p>
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">🌐 Internet</h3>
            <p style="color: #666;">WiFi gratuit disponible</p>
            <p style="color: #666;">Réseau : {{wifiNetwork}}</p>
            <p style="color: #666;">Mot de passe : {{wifiPassword}}</p>
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">📦 Stockage</h3>
            <p style="color: #666;">Espace de stockage sécurisé disponible sur demande</p>
          </div>
        </div>
      </div>
    `
  },

  {
    name: "Bilan participation",
    description: "Bilan après l'événement pour les exposants",
    subject: "📊 Bilan de votre participation - {{eventName}}",
    category: "BILAN_PARTICIPATION",
    type: "FOLLOW_UP",
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #81B441 0%, #6a9635 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Bilan de participation</h1>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333;">Bonjour {{exposantName}},</h2>
          
          <p style="color: #666; line-height: 1.6;">
            Merci pour votre participation à <strong>{{eventName}}</strong> ! Voici le bilan de votre présence.
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">📈 Statistiques de votre stand</h3>
            <p style="color: #666;">Visiteurs : {{standVisitors}}</p>
            <p style="color: #666;">Contacts collectés : {{contactsCollected}}</p>
            <p style="color: #666;">Brochures distribuées : {{brochuresDistributed}}</p>
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">📋 Votre feedback</h3>
            <p style="color: #666;">Aidez-nous à améliorer nos futurs événements.</p>
            <div style="text-align: center; margin-top: 15px;">
              <a href="{{feedbackUrl}}" style="background: #81B441; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                Donner votre avis
              </a>
            </div>
          </div>
        </div>
      </div>
    `
  },

  // SPEAKERS (4 templates)
  {
    name: "Confirmation speaker",
    description: "Confirmation de participation en tant que speaker",
    subject: "🎤 Confirmation speaker - {{eventName}}",
    category: "CONFIRMATION_SPEAKER",
    type: "INVITATION",
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #81B441 0%, #6a9635 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Bienvenue Speaker !</h1>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333;">Bonjour {{speakerName}},</h2>
          
          <p style="color: #666; line-height: 1.6; font-size: 16px;">
            Nous sommes ravis de vous confirmer en tant que speaker pour <strong>{{eventName}}</strong> !
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #81B441;">
            <h3 style="color: #333; margin-top: 0;">🎯 Votre présentation</h3>
            <p style="margin: 5px 0;"><strong>Titre :</strong> {{presentationTitle}}</p>
            <p style="margin: 5px 0;"><strong>Date :</strong> {{presentationDate}}</p>
            <p style="margin: 5px 0;"><strong>Heure :</strong> {{presentationTime}}</p>
            <p style="margin: 5px 0;"><strong>Durée :</strong> {{presentationDuration}}</p>
            <p style="margin: 5px 0;"><strong>Salle :</strong> {{presentationRoom}}</p>
          </div>
          
          <div style="background: #d4edda; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
            <h4 style="color: #155724; margin-top: 0;">📋 Prochaines étapes</h4>
            <ul style="color: #155724; margin-bottom: 0;">
              <li>Envoi de votre présentation avant le {{deadlineDate}}</li>
              <li>Test technique le {{techTestDate}}</li>
              <li>Briefing speakers le {{briefingDate}}</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{speakerPortalUrl}}" style="background: #81B441; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              Accéder à l'espace speaker
            </a>
          </div>
        </div>
      </div>
    `
  },

  {
    name: "Informations techniques présentation",
    description: "Informations techniques pour la présentation",
    subject: "🔧 Infos techniques - {{eventName}}",
    category: "INFOS_TECHNIQUES_PRESENTATION",
    type: "ANNOUNCEMENT",
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #81B441 0%, #6a9635 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Infos Techniques</h1>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333;">Bonjour {{speakerName}},</h2>
          
          <p style="color: #666; line-height: 1.6;">
            Voici les informations techniques pour votre présentation à <strong>{{eventName}}</strong>.
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">💻 Équipement disponible</h3>
            <ul style="color: #666;">
              <li>Projecteur HD 1920x1080</li>
              <li>Écran de 3m x 2m</li>
              <li>Micro-casque sans fil</li>
              <li>Ordinateur portable de secours</li>
              <li>Télécommande de présentation</li>
            </ul>
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">📄 Format de présentation</h3>
            <p style="color: #666;">Formats acceptés : PowerPoint (.pptx), PDF, Keynote</p>
            <p style="color: #666;">Résolution recommandée : 1920x1080 (16:9)</p>
            <p style="color: #666;">Taille max : 100 MB</p>
          </div>
          
          <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <h4 style="color: #856404; margin-top: 0;">⚠️ Important</h4>
            <p style="color: #856404; margin-bottom: 0;">
              Test technique obligatoire le {{techTestDate}} à {{techTestTime}}<br>
              Envoi de la présentation avant le {{deadlineDate}}
            </p>
          </div>
        </div>
      </div>
    `
  },

  {
    name: "Rappel présentation",
    description: "Rappel avant la présentation",
    subject: "⏰ Rappel présentation - {{eventName}}",
    category: "RAPPEL_PRESENTATION",
    type: "REMINDER",
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #81B441 0%, #6a9635 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">C'est bientôt à vous !</h1>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333;">Bonjour {{speakerName}},</h2>
          
          <p style="color: #666; line-height: 1.6; font-size: 16px;">
            Votre présentation à <strong>{{eventName}}</strong> approche ! Voici un rappel des informations importantes.
          </p>
          
          <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <h3 style="color: #856404; margin-top: 0;">🎯 Votre créneau</h3>
            <p style="color: #856404; margin: 5px 0;"><strong>Titre :</strong> {{presentationTitle}}</p>
            <p style="color: #856404; margin: 5px 0;"><strong>Date :</strong> {{presentationDate}}</p>
            <p style="color: #856404; margin: 5px 0;"><strong>Heure :</strong> {{presentationTime}}</p>
            <p style="color: #856404; margin: 5px 0;"><strong>Salle :</strong> {{presentationRoom}}</p>
            <p style="color: #856404; margin: 5px 0;"><strong>Durée :</strong> {{presentationDuration}}</p>
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">📋 Checklist</h3>
            <ul style="color: #666;">
              <li>✅ Présentation envoyée et validée</li>
              <li>✅ Test technique effectué</li>
              <li>🔄 Arrivée 30 min avant votre créneau</li>
              <li>🔄 Badge speaker à récupérer à l'accueil</li>
            </ul>
          </div>
          
          <div style="background: #d1ecf1; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #17a2b8;">
            <p style="color: #0c5460; margin: 0;"><strong>Contact urgence :</strong> {{emergencyContact}}</p>
          </div>
        </div>
      </div>
    `
  },

  {
    name: "Remerciement speaker",
    description: "Remerciement après la présentation",
    subject: "🙏 Merci pour votre présentation - {{eventName}}",
    category: "REMERCIEMENT_SPEAKER",
    type: "FOLLOW_UP",
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #81B441 0%, #6a9635 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Merci !</h1>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333;">Bonjour {{speakerName}},</h2>
          
          <p style="color: #666; line-height: 1.6; font-size: 16px;">
            Un grand merci pour votre excellente présentation "<strong>{{presentationTitle}}</strong>" lors de <strong>{{eventName}}</strong> !
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">📊 Impact de votre présentation</h3>
            <p style="color: #666;">Participants présents : {{attendeesCount}}</p>
            <p style="color: #666;">Note moyenne : {{averageRating}}/5 ⭐</p>
            <p style="color: #666;">Questions posées : {{questionsCount}}</p>
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">📄 Ressources</h3>
            <p style="color: #666;">Votre présentation sera mise à disposition des participants.</p>
            <div style="text-align: center; margin-top: 15px;">
              <a href="{{presentationUrl}}" style="background: #81B441; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                Voir votre présentation
              </a>
            </div>
          </div>
          
          <div style="background: #d4edda; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
            <p style="color: #155724; margin: 0;">
              Nous serions ravis de vous revoir lors de nos prochains événements !
            </p>
          </div>
        </div>
      </div>
    `
  }
];

async function seedEmailTemplates() {
  console.log('🌱 Insertion des templates email par défaut...');
  
  try {
    // Supprimer les anciens templates par défaut
    await prisma.emailTemplate.deleteMany({
      where: {
        isDefault: true
      }
    });
    
    // Insérer les nouveaux templates
    for (const template of emailTemplates) {
      await prisma.emailTemplate.create({
        data: {
          ...template,
          isDefault: true,
          isGlobal: true,
          isActive: false // Désactivés par défaut comme demandé
        }
      });
    }
    
    console.log(`✅ ${emailTemplates.length} templates email insérés avec succès !`);
    console.log('📧 Répartition :');
    console.log('   - 1 template Inscription');
    console.log('   - 4 templates Participants');
    console.log('   - 4 templates Exposants');
    console.log('   - 4 templates Speakers');
    console.log('');
    console.log('ℹ️  Tous les templates sont désactivés par défaut.');
    console.log('   Les organisateurs peuvent les activer et personnaliser depuis l\'interface.');
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'insertion des templates :', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le script si appelé directement
if (require.main === module) {
  seedEmailTemplates();
}

module.exports = { seedEmailTemplates }; 