const { PrismaClient } = require('./src/generated/prisma');

async function testEventsAPI() {
  const prisma = new PrismaClient();
  
  try {
    // Vérifier les événements dans la base de données
    console.log('=== Vérification des événements dans la DB ===');
    const events = await prisma.event.findMany({
      select: {
        id: true,
        name: true,
        archived: true,
        startDate: true
      }
    });
    
    console.log(`Nombre d'événements trouvés: ${events.length}`);
    events.forEach((event, index) => {
      console.log(`${index + 1}. ${event.name} (ID: ${event.id})`);
      console.log(`   Archivé: ${event.archived}`);
      console.log(`   Date début: ${event.startDate}`);
    });
    
    // Tester l'API directement
    console.log('\n=== Test de l\'API via fetch ===');
    const fetch = require('node-fetch');
    
    try {
      const response = await fetch('http://localhost:3000/api/events');
      console.log(`Status: ${response.status}`);
      
      const data = await response.json();
      console.log('Réponse API:', JSON.stringify(data, null, 2));
    } catch (fetchError) {
      console.error('Erreur API:', fetchError.message);
    }
    
  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testEventsAPI(); 