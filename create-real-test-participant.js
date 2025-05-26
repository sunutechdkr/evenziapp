const { PrismaClient } = require('./src/generated/prisma');

// Charger les variables d'environnement
require('dotenv').config({ path: '.env.local' });

const prisma = new PrismaClient();

async function createRealTestParticipant() {
  try {
    console.log('Création d\'un participant de test avec email réel...');
    
    // Récupérer le premier événement
    const firstEvent = await prisma.event.findFirst({
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });

    if (!firstEvent) {
      console.error('Aucun événement trouvé !');
      return;
    }

    console.log('Utilisation de l\'événement:', firstEvent.name);

    // Vérifier si le participant existe déjà
    const existingParticipant = await prisma.registration.findFirst({
      where: {
        email: 'bouba@ineventapp.com',
        eventId: firstEvent.id,
      },
    });

    if (existingParticipant) {
      console.log('✅ Participant déjà existant:');
      console.log('   Nom:', existingParticipant.firstName, existingParticipant.lastName);
      console.log('   Email:', existingParticipant.email);
    } else {
      // Créer un participant de test avec email réel
      const testParticipant = await prisma.registration.create({
        data: {
          firstName: 'Bouba',
          lastName: 'Test',
          email: 'bouba@ineventapp.com',
          phone: '+33123456789',
          type: 'PARTICIPANT',
          eventId: firstEvent.id,
          qrCode: `QR-BOUBA-${Date.now()}`, // QR code unique
        },
      });

      console.log('✅ Participant de test créé:');
      console.log('   Nom:', testParticipant.firstName, testParticipant.lastName);
      console.log('   Email:', testParticipant.email);
    }
    
    console.log('   Événement:', firstEvent.name);
    
    console.log('\n🧪 Testez maintenant l\'OTP avec:');
    console.log(`curl -X POST http://localhost:3000/api/auth/participant-magic-link -H "Content-Type: application/json" -d '{"email":"bouba@ineventapp.com"}'`);
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createRealTestParticipant(); 