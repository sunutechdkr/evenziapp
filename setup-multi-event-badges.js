const { PrismaClient } = require('./src/generated/prisma');
const prisma = new PrismaClient();

async function setupMultiEventBadges() {
  try {
    console.log('🚀 Configuration du système de badges multi-événements...\n');
    
    // 1. Créer des templates globaux réutilisables
    console.log('📋 Création des templates globaux...');
    
    const corporateTemplate = await prisma.badgeTemplate.create({
      data: {
        name: 'Template Corporate',
        description: 'Design professionnel pour événements d\'entreprise',
        isGlobal: true,
        canvasData: JSON.stringify({
          background: '#ffffff',
          elements: [
            {
              type: 'text',
              text: '{name}',
              x: 50,
              y: 120,
              fontSize: 28,
              fontFamily: 'Arial',
              color: '#2c3e50',
              align: 'center',
              width: 400,
              fontWeight: 'bold'
            },
            {
              type: 'text',
              text: '{jobTitle}',
              x: 50,
              y: 160,
              fontSize: 16,
              fontFamily: 'Arial',
              color: '#7f8c8d',
              align: 'center',
              width: 400
            },
            {
              type: 'text',
              text: '{company}',
              x: 50,
              y: 180,
              fontSize: 18,
              fontFamily: 'Arial',
              color: '#34495e',
              align: 'center',
              width: 400,
              fontWeight: 'bold'
            },
            {
              type: 'text',
              text: 'PARTICIPANT',
              x: 50,
              y: 220,
              fontSize: 14,
              fontFamily: 'Arial',
              color: '#3498db',
              align: 'center',
              width: 400,
              fontWeight: 'bold'
            },
            {
              type: 'qrCode',
              x: 350,
              y: 250,
              width: 80,
              height: 80
            }
          ]
        })
      }
    });
    
    const conferenceTemplate = await prisma.badgeTemplate.create({
      data: {
        name: 'Template Conférence',
        description: 'Design moderne pour conférences et symposiums',
        isGlobal: true,
        canvasData: JSON.stringify({
          background: '#f8f9fa',
          elements: [
            {
              type: 'text',
              text: '{name}',
              x: 50,
              y: 100,
              fontSize: 24,
              fontFamily: 'Helvetica',
              color: '#212529',
              align: 'center',
              width: 400
            },
            {
              type: 'text',
              text: '{company}',
              x: 50,
              y: 140,
              fontSize: 16,
              fontFamily: 'Helvetica',
              color: '#6c757d',
              align: 'center',
              width: 400
            },
            {
              type: 'text',
              text: 'CONFÉRENCE 2024',
              x: 50,
              y: 50,
              fontSize: 20,
              fontFamily: 'Helvetica',
              color: '#007bff',
              align: 'center',
              width: 400,
              fontWeight: 'bold'
            },
            {
              type: 'qrCode',
              x: 200,
              y: 200,
              width: 100,
              height: 100
            }
          ]
        })
      }
    });
    
    console.log(`✅ Templates globaux créés: ${corporateTemplate.id}, ${conferenceTemplate.id}\n`);
    
    // 2. Récupérer l'événement existant
    const event = await prisma.event.findFirst({
      where: { name: 'Test sample' }
    });
    
    if (!event) {
      console.log('❌ Événement Test sample non trouvé');
      return;
    }
    
    // 3. Créer un template spécifique à cet événement
    console.log('🎨 Création d\'un template spécifique à l\'événement...');
    
    const eventSpecificTemplate = await prisma.badgeTemplate.create({
      data: {
        name: 'Badge Test Sample - Edition Spéciale',
        description: 'Design personnalisé pour l\'événement Test Sample',
        isGlobal: false,
        eventId: event.id,
        canvasData: JSON.stringify({
          background: '#e8f5e8',
          elements: [
            {
              type: 'text',
              text: 'TEST SAMPLE 2024',
              x: 50,
              y: 40,
              fontSize: 22,
              fontFamily: 'Arial',
              color: '#2d5a2d',
              align: 'center',
              width: 400,
              fontWeight: 'bold'
            },
            {
              type: 'text',
              text: '{name}',
              x: 50,
              y: 100,
              fontSize: 26,
              fontFamily: 'Arial',
              color: '#1a4d1a',
              align: 'center',
              width: 400,
              fontWeight: 'bold'
            },
            {
              type: 'text',
              text: '{jobTitle}',
              x: 50,
              y: 140,
              fontSize: 16,
              fontFamily: 'Arial',
              color: '#4a7c4a',
              align: 'center',
              width: 400
            },
            {
              type: 'text',
              text: '{company}',
              x: 50,
              y: 160,
              fontSize: 18,
              fontFamily: 'Arial',
              color: '#2d5a2d',
              align: 'center',
              width: 400
            },
            {
              type: 'qrCode',
              x: 50,
              y: 220,
              width: 90,
              height: 90
            },
            {
              type: 'text',
              text: 'Centre de Conférences',
              x: 160,
              y: 250,
              fontSize: 12,
              fontFamily: 'Arial',
              color: '#666666',
              align: 'left',
              width: 200
            }
          ]
        })
      }
    });
    
    console.log(`✅ Template spécifique créé: ${eventSpecificTemplate.id}\n`);
    
    // 4. Récupérer tous les participants
    const registrations = await prisma.registration.findMany({
      where: { eventId: event.id }
    });
    
    console.log(`👥 Trouvé ${registrations.length} participant(s)\n`);
    
    // 5. Créer des badges participants avec différents templates
    console.log('🏷️ Création des badges participants...');
    
    for (let i = 0; i < registrations.length; i++) {
      const registration = registrations[i];
      
      // Alterner entre les templates pour la démonstration
      const templates = [corporateTemplate, conferenceTemplate, eventSpecificTemplate];
      const selectedTemplate = templates[i % templates.length];
      
      const participantBadge = await prisma.participantBadge.create({
        data: {
          registrationId: registration.id,
          eventId: event.id,
          templateId: selectedTemplate.id,
          status: 'GENERATED',
          qrCodeData: registration.qrCode,
          customData: JSON.stringify({
            participantName: `${registration.firstName} ${registration.lastName}`,
            eventName: event.name,
            registrationDate: registration.createdAt,
            specialNotes: `Badge généré automatiquement pour ${registration.email}`
          })
        }
      });
      
      console.log(`✅ Badge créé pour ${registration.firstName} ${registration.lastName} (Template: ${selectedTemplate.name})`);
    }
    
    // 6. Créer un second événement pour démontrer le multi-événements
    console.log('\n🆕 Création d\'un second événement...');
    
    const adminUser = await prisma.user.findFirst({
      where: { email: 'admin@ineventapp.com' }
    });
    
    let event2 = await prisma.event.findFirst({
      where: { name: 'Conférence Tech 2024' }
    });
    
    if (!event2) {
      event2 = await prisma.event.create({
        data: {
          name: 'Conférence Tech 2024',
          description: 'Grande conférence technologique annuelle',
          location: 'Palais des Congrès',
          slug: 'conference-tech-2024',
          startDate: new Date('2024-07-20T09:00:00Z'),
          endDate: new Date('2024-07-20T18:00:00Z'),
          userId: adminUser.id
        }
      });
      console.log(`✅ Événement 2 créé: ${event2.id}`);
    }
    
    // 7. Inscrire le même participant aux deux événements
    let registration2 = await prisma.registration.findFirst({
      where: { 
        email: 'bouba@ineventapp.com',
        eventId: event2.id
      }
    });
    
    if (!registration2) {
      registration2 = await prisma.registration.create({
        data: {
          firstName: 'Bouba',
          lastName: 'Test',
          email: 'bouba@ineventapp.com',
          phone: '+33123456789',
          type: 'SPEAKER', // Différent rôle pour le second événement
          company: 'InEvent Corp',
          jobTitle: 'Senior Developer',
          eventId: event2.id,
          qrCode: 'QR_BOUBA_TECH_' + Date.now(),
          shortCode: 'BOUBA456'
        }
      });
      console.log(`✅ Registration 2 créée: ${registration2.id}`);
    }
    
    // 8. Créer un badge pour le second événement
    const participantBadge2 = await prisma.participantBadge.create({
      data: {
        registrationId: registration2.id,
        eventId: event2.id,
        templateId: corporateTemplate.id, // Utiliser le template corporate
        status: 'PRINTED', // Statut différent pour démonstration
        printedAt: new Date(),
        qrCodeData: registration2.qrCode,
        customData: JSON.stringify({
          participantName: `${registration2.firstName} ${registration2.lastName}`,
          eventName: event2.name,
          role: 'SPEAKER',
          specialAccess: true
        })
      }
    });
    
    console.log(`✅ Badge 2 créé: ${participantBadge2.id}\n`);
    
    // 9. Afficher le résumé final
    console.log('📊 RÉSUMÉ DU SYSTÈME MULTI-ÉVÉNEMENTS:\n');
    
    const summary = await prisma.badgeTemplate.findMany({
      include: {
        _count: {
          select: { participantBadges: true }
        },
        event: {
          select: { name: true }
        }
      }
    });
    
    console.log('🏷️ TEMPLATES:');
    summary.forEach(template => {
      console.log(`   • ${template.name} (${template.isGlobal ? 'Global' : 'Événement: ' + template.event?.name}) - ${template._count.participantBadges} badge(s)`);
    });
    
    const participantBadges = await prisma.participantBadge.findMany({
      include: {
        registration: true,
        event: true,
        template: true
      }
    });
    
    console.log('\n👤 BADGES PAR PARTICIPANT:');
    const participantGroups = {};
    participantBadges.forEach(badge => {
      const email = badge.registration.email;
      if (!participantGroups[email]) {
        participantGroups[email] = [];
      }
      participantGroups[email].push(badge);
    });
    
    Object.entries(participantGroups).forEach(([email, badges]) => {
      console.log(`   • ${email}: ${badges.length} badge(s)`);
      badges.forEach(badge => {
        console.log(`     → ${badge.event.name} (${badge.status}) - Template: ${badge.template.name}`);
      });
    });
    
    console.log('\n✅ Configuration terminée avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupMultiEventBadges(); 