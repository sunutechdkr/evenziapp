import fetch from 'node-fetch';
import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function testCreateEvent() {
  try {
    // 1. Trouver un utilisateur administrateur dans la base de données
    const admin = await prisma.user.findFirst({
      where: {
        role: 'ADMIN'
      }
    });

    if (!admin) {
      console.error('Aucun utilisateur admin trouvé dans la base de données');
      return;
    }

    console.log(`Utilisateur admin trouvé: ${admin.email}`);

    // 3. Préparer les données de l'événement
    const eventData = {
      name: `Test Event ${new Date().toISOString()}`,
      description: 'This is a test event created via API',
      location: 'Online',
      startDate: '2023-07-01',
      endDate: '2023-07-03',
      sector: 'Technology',
      type: 'Conference',
      format: 'Virtual',
      supportEmail: 'support@example.com'
    };

    console.log('Tentative de création d\'un événement avec les données:', eventData);

    // 4. Créer directement l'événement dans la base de données
    // (contournement de l'API pour le test)
    const slug = eventData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const createdEvent = await prisma.event.create({
      data: {
        name: eventData.name,
        description: eventData.description,
        location: eventData.location,
        slug: slug,
        startDate: new Date(eventData.startDate),
        endDate: new Date(eventData.endDate),
        sector: eventData.sector,
        type: eventData.type,
        format: eventData.format,
        supportEmail: eventData.supportEmail,
        userId: admin.id
      }
    });

    console.log('Événement créé avec succès:', createdEvent);

    // 5. Récupérer la liste des événements pour vérifier
    const response = await fetch('http://localhost:3000/api/events');
    const events = await response.json();
    
    console.log(`Nombre d'événements dans la base: ${events.length}`);
    console.log('Événements:', events.map(e => ({ id: e.id, name: e.name })));

  } catch (error) {
    console.error('Erreur lors du test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testCreateEvent(); 