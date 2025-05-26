const { PrismaClient } = require('./src/generated/prisma');
const prisma = new PrismaClient();

async function createDefaultBadge() {
  try {
    const testEvent = await prisma.event.findFirst({
      where: { name: 'Test sample' }
    });
    
    if (!testEvent) {
      console.log('Événement Test sample non trouvé');
      return;
    }
    
    console.log('Événement trouvé:', testEvent.id);
    
    const canvasData = JSON.stringify({
      background: '#ffffff',
      elements: [
        {
          type: 'text',
          text: '{name}',
          x: 50,
          y: 100,
          fontSize: 24,
          fontFamily: 'Helvetica',
          color: '#000000',
          align: 'center',
          width: 400
        },
        {
          type: 'text',
          text: '{company}',
          x: 50,
          y: 150,
          fontSize: 16,
          fontFamily: 'Helvetica',
          color: '#666666',
          align: 'center',
          width: 400
        },
        {
          type: 'text',
          text: 'Test sample',
          x: 50,
          y: 50,
          fontSize: 18,
          fontFamily: 'Helvetica',
          color: '#333333',
          align: 'center',
          width: 400
        },
        {
          type: 'qrCode',
          x: 350,
          y: 200,
          width: 100,
          height: 100
        }
      ]
    });
    
    const badge = await prisma.badge.create({
      data: {
        eventId: testEvent.id,
        name: 'Badge par défaut',
        canvasData: canvasData,
        isDefault: true
      }
    });
    
    console.log('Badge créé avec succès:', badge.id);
    
  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createDefaultBadge(); 