const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/app/api/events/route.ts');

// Lire le fichier
let content = fs.readFileSync(filePath, 'utf8');

// Code à insérer pour la création du billet par défaut
const defaultTicketCode = `
    // Créer le billet par défaut
    try {
      const defaultTicket = await prisma.ticket.create({
        data: {
          name: \`Billet \${newEvent.name}\`,
          description: \`Billet d'accès gratuit pour \${newEvent.name}\`,
          price: 0,
          currency: 'XOF',
          quantity: null, // Illimité
          status: 'ACTIVE',
          visibility: 'VISIBLE',
          validFrom: newEvent.startDate,
          validUntil: newEvent.endDate,
          group: 'Attendees',
          eventId: newEvent.id
        }
      });
      console.log('✅ Billet par défaut créé pour l\\'événement:', newEvent.id, defaultTicket.id);
    } catch (ticketError) {
      console.error('⚠️ Erreur lors de la création du billet par défaut:', ticketError);
      // On ne fait pas échouer la création de l'événement si le billet échoue
    }
    `;

// Chercher la ligne après laquelle insérer le code
const insertAfter = "console.log('✅ Événement créé avec succès:', newEvent.id);";
const insertBefore = "// Créer les templates par défaut";

// Vérifier si le code n'est pas déjà présent
if (content.includes('Billet par défaut créé')) {
  console.log('✅ Le code de création du billet par défaut est déjà présent');
  process.exit(0);
}

// Remplacer le contenu
const newContent = content.replace(
  insertAfter,
  insertAfter + defaultTicketCode
);

// Écrire le fichier modifié
fs.writeFileSync(filePath, newContent, 'utf8');
console.log('✅ Fichier modifié avec succès !'); 