const { PrismaClient } = require('./src/generated/prisma');
const prisma = new PrismaClient();

async function createTestData() {
  try {
    // Créer un utilisateur admin d'abord
    let user = await prisma.user.findFirst({
      where: { email: 'admin@ineventapp.com' }
    });
    
    if (!user) {
      user = await prisma.user.create({
        data: {
          name: 'Admin User',
          email: 'admin@ineventapp.com',
          role: 'ADMIN'
        }
      });
      console.log('Utilisateur admin créé:', user.id);
    }
    
    // Créer l'événement Test sample
    let event = await prisma.event.findFirst({
      where: { name: 'Test sample' }
    });
    
    if (!event) {
      event = await prisma.event.create({
        data: {
          name: 'Test sample',
          description: 'Un événement de test pour les badges',
          location: 'Centre de Conférences',
          slug: 'test-sample-badges',
          startDate: new Date('2024-06-15T09:00:00Z'),
          endDate: new Date('2024-06-15T18:00:00Z'),
          userId: user.id
        }
      });
      console.log('Événement créé:', event.id);
    }
    
    // Créer une registration pour bouba@ineventapp.com
    let registration = await prisma.registration.findFirst({
      where: { 
        email: 'bouba@ineventapp.com',
        eventId: event.id
      }
    });
    
    if (!registration) {
      registration = await prisma.registration.create({
        data: {
          firstName: 'Bouba',
          lastName: 'Test',
          email: 'bouba@ineventapp.com',
          phone: '+33123456789',
          type: 'PARTICIPANT',
          company: 'InEvent Corp',
          jobTitle: 'Developer',
          eventId: event.id,
          qrCode: 'QR_BOUBA_' + Date.now(),
          shortCode: 'BOUBA123'
        }
      });
      console.log('Registration créée:', registration.id);
    }
    
    // Créer l'utilisateur bouba en table users
    let boubaUser = await prisma.user.findFirst({
      where: { email: 'bouba@ineventapp.com' }
    });
    
    if (!boubaUser) {
      boubaUser = await prisma.user.create({
        data: {
          name: 'Bouba Test',
          email: 'bouba@ineventapp.com',
          role: 'USER'
        }
      });
      console.log('Utilisateur bouba créé:', boubaUser.id);
    }
    
    console.log('Données de test créées avec succès !');
    
  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestData(); 