const { PrismaClient } = require('./src/generated/prisma');

// Charger les variables d'environnement
require('dotenv').config({ path: '.env.local' });

const prisma = new PrismaClient();

async function createTestParticipant() {
  try {
    console.log('Création d\'un participant de test...');
    
    // Récupérer le premier événement
    const firstEvent = await prisma.event.findFirst({
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });

    if (!firstEvent) {
      console.log('Aucun événement trouvé. Création d\'un événement de test...');
      
      const testEvent = await prisma.event.create({
        data: {
          name: 'Événement de Test OTP',
          slug: 'test-otp-event',
          description: 'Événement de test pour le système OTP',
          location: 'En ligne',
          startDate: new Date('2024-12-15'),
          endDate: new Date('2024-12-15'),
          startTime: '09:00',
          endTime: '18:00',
          userId: 'test-user-id', // ID utilisateur fictif
        },
      });
      
      console.log('✅ Événement de test créé:', testEvent.name);
      firstEvent = testEvent;
    }

    console.log('Utilisation de l\'événement:', firstEvent.name);

    // Créer un participant de test
    const testParticipant = await prisma.registration.create({
      data: {
        firstName: 'Test',
        lastName: 'Participant',
        email: 'test.participant@example.com',
        phone: '+33123456789',
        type: 'PARTICIPANT',
        eventId: firstEvent.id,
        qrCode: `QR-${Date.now()}`, // QR code unique
      },
    });

    console.log('✅ Participant de test créé:');
    console.log('   Nom:', testParticipant.firstName, testParticipant.lastName);
    console.log('   Email:', testParticipant.email);
    console.log('   Événement:', firstEvent.name);
    
    console.log('\n🧪 Vous pouvez maintenant tester l\'OTP avec:');
    console.log(`curl -X POST http://localhost:3000/api/auth/participant-magic-link -H "Content-Type: application/json" -d '{"email":"${testParticipant.email}"}'`);
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestParticipant(); 