const { PrismaClient } = require('./src/generated/prisma');
const prisma = new PrismaClient();

async function auditDatabase() {
  try {
    console.log('🔍 AUDIT COMPLET DE LA BASE DE DONNÉES\n');
    
    // 1. Utilisateurs
    console.log('👥 UTILISATEURS:');
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });
    
    if (users.length === 0) {
      console.log('   ❌ Aucun utilisateur trouvé');
    } else {
      users.forEach(user => {
        console.log(`   • ${user.name} (${user.email}) - ${user.role} - Créé: ${user.createdAt.toISOString().split('T')[0]}`);
      });
    }
    
    // 2. Événements
    console.log('\n🎪 ÉVÉNEMENTS:');
    const events = await prisma.event.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        location: true,
        startDate: true,
        userId: true,
        createdAt: true
      }
    });
    
    if (events.length === 0) {
      console.log('   ❌ Aucun événement trouvé');
    } else {
      events.forEach(event => {
        console.log(`   • ${event.name} (${event.slug}) - ${event.location}`);
        console.log(`     → Date: ${event.startDate.toISOString().split('T')[0]} - Créé: ${event.createdAt.toISOString().split('T')[0]}`);
      });
    }
    
    // 3. Registrations
    console.log('\n📝 REGISTRATIONS:');
    const registrations = await prisma.registration.findMany({
      include: {
        event: {
          select: { name: true }
        }
      }
    });
    
    if (registrations.length === 0) {
      console.log('   ❌ Aucune registration trouvée');
    } else {
      registrations.forEach(reg => {
        console.log(`   • ${reg.firstName} ${reg.lastName} (${reg.email})`);
        console.log(`     → Événement: ${reg.event.name} - Type: ${reg.type}`);
        console.log(`     → Société: ${reg.company} - Poste: ${reg.jobTitle}`);
        console.log(`     → QR: ${reg.qrCode} - Code court: ${reg.shortCode}`);
        console.log('');
      });
    }
    
    // 4. Badges legacy
    console.log('🏷️ BADGES LEGACY:');
    const badges = await prisma.badge.findMany({
      include: {
        event: {
          select: { name: true }
        }
      }
    });
    
    if (badges.length === 0) {
      console.log('   ❌ Aucun badge legacy trouvé');
    } else {
      badges.forEach(badge => {
        console.log(`   • ${badge.name} - Événement: ${badge.event.name}`);
        console.log(`     → Par défaut: ${badge.isDefault} - Créé: ${badge.createdAt.toISOString().split('T')[0]}`);
      });
    }
    
    // 5. Templates de badges
    console.log('\n🎨 TEMPLATES DE BADGES:');
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
    
    if (templates.length === 0) {
      console.log('   ❌ Aucun template trouvé');
    } else {
      templates.forEach(template => {
        console.log(`   • ${template.name} - ${template.isGlobal ? 'Global' : 'Événement: ' + template.event?.name}`);
        console.log(`     → Description: ${template.description}`);
        console.log(`     → Actif: ${template.isActive} - Utilisé: ${template._count.participantBadges} fois`);
        console.log(`     → Créé: ${template.createdAt.toISOString().split('T')[0]}`);
        console.log('');
      });
    }
    
    // 6. Badges participants
    console.log('🏷️ BADGES PARTICIPANTS:');
    const participantBadges = await prisma.participantBadge.findMany({
      include: {
        registration: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            company: true
          }
        },
        event: {
          select: {
            name: true
          }
        },
        template: {
          select: {
            name: true
          }
        }
      }
    });
    
    if (participantBadges.length === 0) {
      console.log('   ❌ Aucun badge participant trouvé');
    } else {
      participantBadges.forEach(badge => {
        console.log(`   • ${badge.registration.firstName} ${badge.registration.lastName} (${badge.registration.email})`);
        console.log(`     → Événement: ${badge.event.name}`);
        console.log(`     → Template: ${badge.template.name}`);
        console.log(`     → Statut: ${badge.status}`);
        console.log(`     → Généré: ${badge.generatedAt.toISOString().split('T')[0]}`);
        if (badge.printedAt) {
          console.log(`     → Imprimé: ${badge.printedAt.toISOString().split('T')[0]}`);
        }
        if (badge.customData) {
          const custom = JSON.parse(badge.customData);
          console.log(`     → Données custom: ${Object.keys(custom).join(', ')}`);
        }
        console.log('');
      });
    }
    
    // 7. Sessions d'événements
    console.log('🗓️ SESSIONS D\'ÉVÉNEMENTS:');
    const sessions = await prisma.event_sessions.findMany({
      include: {
        events: {
          select: { name: true }
        }
      }
    });
    
    if (sessions.length === 0) {
      console.log('   ❌ Aucune session trouvée');
    } else {
      sessions.forEach(session => {
        console.log(`   • ${session.title} - Événement: ${session.events.name}`);
        console.log(`     → Date: ${session.start_date.toISOString().split('T')[0]} - Lieu: ${session.location || 'Non spécifié'}`);
      });
    }
    
    // 8. Résumé
    console.log('\n📊 RÉSUMÉ:');
    console.log(`   • Utilisateurs: ${users.length}`);
    console.log(`   • Événements: ${events.length}`);
    console.log(`   • Registrations: ${registrations.length}`);
    console.log(`   • Badges legacy: ${badges.length}`);
    console.log(`   • Templates: ${templates.length}`);
    console.log(`   • Badges participants: ${participantBadges.length}`);
    console.log(`   • Sessions: ${sessions.length}`);
    
    // 9. Vérifier s'il manque des données importantes
    console.log('\n⚠️ ANALYSE:');
    
    if (users.length === 0) {
      console.log('   🔴 PROBLÈME: Aucun utilisateur - il faut recréer les utilisateurs');
    }
    
    if (events.length === 0) {
      console.log('   🔴 PROBLÈME: Aucun événement - il faut recréer les événements');
    }
    
    if (registrations.length === 0) {
      console.log('   🔴 PROBLÈME: Aucune registration - il faut recréer les participants');
    }
    
    const boubaUser = users.find(u => u.email === 'bouba@ineventapp.com');
    if (!boubaUser) {
      console.log('   🟡 ATTENTION: Utilisateur bouba@ineventapp.com manquant');
    }
    
    const testEvent = events.find(e => e.name === 'Test sample');
    if (!testEvent) {
      console.log('   🟡 ATTENTION: Événement "Test sample" manquant');
    }
    
    console.log('\n✅ Audit terminé');
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'audit:', error);
  } finally {
    await prisma.$disconnect();
  }
}

auditDatabase(); 