const { PrismaClient } = require('./src/generated/prisma');
const prisma = new PrismaClient();

async function testNewBadgeAPIs() {
  try {
    console.log('🧪 Test des nouvelles APIs de badges...\n');
    
    // 1. Test de l'API badge-templates
    console.log('📋 Test API badge-templates:');
    
    const templates = await prisma.badgeTemplate.findMany({
      include: {
        event: {
          select: { name: true }
        },
        _count: {
          select: { participantBadges: true }
        }
      }
    });
    
    console.log(`   ✅ ${templates.length} templates trouvés:`);
    templates.forEach(template => {
      console.log(`     • ${template.name} (${template.isGlobal ? 'Global' : 'Event: ' + template.event?.name}) - ${template._count.participantBadges} badge(s)`);
    });
    
    // 2. Test de l'API participant-badges
    console.log('\n🏷️ Test API participant-badges:');
    
    const participantBadges = await prisma.participantBadge.findMany({
      include: {
        registration: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            company: true,
            jobTitle: true,
            type: true
          }
        },
        event: {
          select: {
            name: true,
            location: true,
            startDate: true
          }
        },
        template: {
          select: {
            name: true,
            isGlobal: true
          }
        }
      }
    });
    
    console.log(`   ✅ ${participantBadges.length} badges trouvés:`);
    participantBadges.forEach(badge => {
      console.log(`     • ${badge.registration.firstName} ${badge.registration.lastName} (${badge.registration.email})`);
      console.log(`       → Événement: ${badge.event.name}`);
      console.log(`       → Template: ${badge.template.name} (${badge.template.isGlobal ? 'Global' : 'Spécifique'})`);
      console.log(`       → Statut: ${badge.status}`);
      console.log(`       → QR Code: ${badge.qrCodeData}`);
      if (badge.customData) {
        const custom = JSON.parse(badge.customData);
        console.log(`       → Données custom: ${Object.keys(custom).join(', ')}`);
      }
      console.log('');
    });
    
    // 3. Test simulation des appels API
    console.log('🌐 Simulation des appels API HTTP:');
    
    // Simulation GET /api/badge-templates
    console.log('\n   📋 GET /api/badge-templates (simulation):');
    const templatesForAPI = templates.map(template => ({
      id: template.id,
      name: template.name,
      description: template.description,
      isGlobal: template.isGlobal,
      eventId: template.eventId,
      eventName: template.event?.name,
      isActive: template.isActive,
      usageCount: template._count.participantBadges,
      createdAt: template.createdAt,
      updatedAt: template.updatedAt,
      hasDesign: !!template.canvasData
    }));
    
    console.log(`   ✅ Réponse: ${templatesForAPI.length} templates formatés`);
    
    // Simulation GET /api/participant-badges?email=bouba@ineventapp.com
    console.log('\n   🏷️ GET /api/participant-badges?email=bouba@ineventapp.com (simulation):');
    const boubaEmail = 'bouba@ineventapp.com';
    const boubaBadges = participantBadges.filter(badge => badge.registration.email === boubaEmail);
    
    const badgesForAPI = boubaBadges.map(badge => ({
      id: badge.id,
      status: badge.status,
      generatedAt: badge.generatedAt,
      printedAt: badge.printedAt,
      deliveredAt: badge.deliveredAt,
      participant: {
        name: `${badge.registration.firstName} ${badge.registration.lastName}`,
        email: badge.registration.email,
        company: badge.registration.company,
        jobTitle: badge.registration.jobTitle,
        type: badge.registration.type
      },
      event: {
        name: badge.event.name,
        location: badge.event.location,
        startDate: badge.event.startDate
      },
      template: {
        name: badge.template.name,
        isGlobal: badge.template.isGlobal
      },
      qrCodeData: badge.qrCodeData,
      customData: badge.customData ? JSON.parse(badge.customData) : null,
      createdAt: badge.createdAt,
      updatedAt: badge.updatedAt
    }));
    
    console.log(`   ✅ Réponse: ${badgesForAPI.length} badges pour ${boubaEmail}`);
    badgesForAPI.forEach(badge => {
      console.log(`     • ${badge.event.name} - ${badge.template.name} (${badge.status})`);
    });
    
    // 4. Test statistiques avancées
    console.log('\n📊 Statistiques du système:');
    
    const stats = {
      totalTemplates: templates.length,
      globalTemplates: templates.filter(t => t.isGlobal).length,
      eventSpecificTemplates: templates.filter(t => !t.isGlobal).length,
      totalBadges: participantBadges.length,
      generatedBadges: participantBadges.filter(b => b.status === 'GENERATED').length,
      printedBadges: participantBadges.filter(b => b.status === 'PRINTED').length,
      deliveredBadges: participantBadges.filter(b => b.status === 'DELIVERED').length,
      uniqueParticipants: new Set(participantBadges.map(b => b.registration.email)).size,
      uniqueEvents: new Set(participantBadges.map(b => b.eventId)).size
    };
    
    console.log(`   • Templates totaux: ${stats.totalTemplates} (${stats.globalTemplates} globaux, ${stats.eventSpecificTemplates} spécifiques)`);
    console.log(`   • Badges totaux: ${stats.totalBadges}`);
    console.log(`   • Par statut: ${stats.generatedBadges} générés, ${stats.printedBadges} imprimés, ${stats.deliveredBadges} livrés`);
    console.log(`   • Participants uniques: ${stats.uniqueParticipants}`);
    console.log(`   • Événements avec badges: ${stats.uniqueEvents}`);
    
    // 5. Test requête multi-événements pour un participant
    console.log('\n🎯 Test scénario multi-événements:');
    
    const multiEventParticipants = {};
    participantBadges.forEach(badge => {
      const email = badge.registration.email;
      if (!multiEventParticipants[email]) {
        multiEventParticipants[email] = [];
      }
      multiEventParticipants[email].push({
        eventName: badge.event.name,
        status: badge.status,
        templateName: badge.template.name
      });
    });
    
    Object.entries(multiEventParticipants).forEach(([email, events]) => {
      if (events.length > 1) {
        console.log(`   🌟 Participant multi-événements: ${email}`);
        events.forEach(event => {
          console.log(`     → ${event.eventName} (${event.status}) - ${event.templateName}`);
        });
      }
    });
    
    console.log('\n✅ Tests terminés avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testNewBadgeAPIs(); 