const { PrismaClient } = require('./src/generated/prisma');

// Charger les variables d'environnement
require('dotenv').config({ path: '.env.local' });

const prisma = new PrismaClient();

async function testUserRegistrations() {
  try {
    console.log('=== TEST DES INSCRIPTIONS UTILISATEUR ===\n');
    
    const email = 'bouba@ineventapp.com';
    
    // Vérifier l'utilisateur dans la table users
    console.log('1. 👤 Vérification utilisateur...');
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      }
    });

    if (user) {
      console.log(`   ✅ Utilisateur trouvé: ${user.name} (${user.email})`);
      console.log(`   Rôle: ${user.role}`);
    } else {
      console.log('   ❌ Utilisateur non trouvé');
      return;
    }

    // Vérifier les inscriptions dans la table registrations
    console.log('\n2. 📝 Vérification des inscriptions...');
    const registrations = await prisma.registration.findMany({
      where: {
        email: email.toLowerCase(),
      },
      include: {
        event: {
          select: {
            id: true,
            name: true,
            slug: true,
            startDate: true,
            endDate: true,
            location: true,
          },
        },
      },
    });

    console.log(`   Nombre d'inscriptions trouvées: ${registrations.length}`);

    if (registrations.length > 0) {
      console.log('\n   📋 Détails des inscriptions:');
      registrations.forEach((reg, index) => {
        console.log(`   ${index + 1}. Événement: ${reg.event?.name || 'N/A'}`);
        console.log(`      - ID inscription: ${reg.id}`);
        console.log(`      - Slug événement: ${reg.event?.slug || 'N/A'}`);
        console.log(`      - Participant: ${reg.firstName} ${reg.lastName}`);
        console.log(`      - Type: ${reg.type}`);
        console.log(`      - Check-in: ${reg.checkedIn ? 'Oui' : 'Non'}`);
        console.log(`      - Date inscription: ${reg.createdAt}`);
        console.log(`      - Date événement: ${reg.event?.startDate || 'N/A'}`);
        console.log('');
      });
    } else {
      console.log('   ❌ Aucune inscription trouvée');
    }

    // Vérifier aussi les inscriptions par firstName/lastName
    console.log('3. 🔍 Recherche par nom (au cas où email différent)...');
    if (registrations.length > 0) {
      const firstName = registrations[0].firstName;
      const lastName = registrations[0].lastName;
      
      const regsByName = await prisma.registration.findMany({
        where: {
          firstName: firstName,
          lastName: lastName,
        },
        include: {
          event: {
            select: {
              name: true,
              slug: true,
            },
          },
        },
      });

      console.log(`   Inscriptions trouvées pour ${firstName} ${lastName}: ${regsByName.length}`);
      regsByName.forEach(reg => {
        console.log(`   - Email: ${reg.email}, Événement: ${reg.event?.name}`);
      });
    }

    // Statistiques générales
    console.log('\n4. 📊 Statistiques générales...');
    const totalRegistrations = await prisma.registration.count();
    const totalEvents = await prisma.event.count();
    const totalUsers = await prisma.user.count();

    console.log(`   Total inscriptions: ${totalRegistrations}`);
    console.log(`   Total événements: ${totalEvents}`);
    console.log(`   Total utilisateurs: ${totalUsers}`);

    console.log('\n✅ Vérification terminée !');
    
  } catch (error) {
    console.error('\n❌ **ERREUR LORS DE LA VÉRIFICATION:**');
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

testUserRegistrations(); 