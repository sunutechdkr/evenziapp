const { PrismaClient } = require('./src/generated/prisma');
const fetch = require('node-fetch');

// Charger les variables d'environnement
require('dotenv').config({ path: '.env.local' });

const prisma = new PrismaClient();

async function testRegistrationsAPI() {
  try {
    console.log('=== TEST API INSCRIPTIONS UTILISATEUR ===\n');
    
    const email = 'bouba@ineventapp.com';
    
    // D'abord, créer une session comme le fait notre auto-login
    console.log('1. 🔐 Création de session...');
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      console.log('❌ Utilisateur non trouvé');
      return;
    }

    const sessionResponse = await fetch('http://localhost:3000/api/auth/create-participant-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: user.id,
        email: user.email
      }),
    });

    if (!sessionResponse.ok) {
      console.log('❌ Échec création session');
      return;
    }

    // Récupérer les cookies de session
    const sessionCookies = sessionResponse.headers.get('set-cookie');
    console.log('   ✅ Session créée');
    console.log(`   Cookies: ${sessionCookies ? 'Présents' : 'Absents'}`);

    // Maintenant tester l'API des inscriptions avec les cookies
    console.log('\n2. 📝 Test API inscriptions...');
    const registrationsResponse = await fetch(`http://localhost:3000/api/users/registrations?email=${encodeURIComponent(email)}`, {
      method: 'GET',
      headers: {
        'Cookie': sessionCookies || '',
        'Content-Type': 'application/json',
      },
    });

    console.log(`   Status: ${registrationsResponse.status}`);
    
    if (registrationsResponse.ok) {
      const registrations = await registrationsResponse.json();
      console.log(`   ✅ ${registrations.length} inscription(s) récupérée(s)`);
      
      if (registrations.length > 0) {
        console.log('\n   📋 Détails:');
        registrations.forEach((reg, index) => {
          console.log(`   ${index + 1}. ${reg.event?.name || 'Événement inconnu'}`);
          console.log(`      - Participant: ${reg.firstName} ${reg.lastName}`);
          console.log(`      - Email: ${reg.email}`);
          console.log(`      - Check-in: ${reg.checkedIn ? 'Oui' : 'Non'}`);
        });
      }
    } else {
      const error = await registrationsResponse.json();
      console.log(`   ❌ Erreur: ${error.error || 'Erreur inconnue'}`);
    }

    // Test aussi sans session pour confirmer la sécurité
    console.log('\n3. 🔒 Test sans session (doit échouer)...');
    const noSessionResponse = await fetch(`http://localhost:3000/api/users/registrations?email=${encodeURIComponent(email)}`);
    console.log(`   Status: ${noSessionResponse.status}`);
    
    if (noSessionResponse.status === 401) {
      console.log('   ✅ Bien sécurisé - accès refusé sans session');
    } else {
      console.log('   ⚠️  Problème de sécurité - accès autorisé sans session');
    }

    console.log('\n✅ Test terminé !');
    
  } catch (error) {
    console.error('\n❌ **ERREUR LORS DU TEST:**');
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

testRegistrationsAPI(); 