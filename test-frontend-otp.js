const { PrismaClient } = require('./src/generated/prisma');

// Charger les variables d'environnement
require('dotenv').config({ path: '.env.local' });

const prisma = new PrismaClient();

async function testFrontendOTPFlow() {
  try {
    console.log('=== TEST COMPLET DU FLUX OTP FRONTEND ===\n');
    
    const email = 'bouba@ineventapp.com';
    
    // Étape 1: Envoyer un OTP
    console.log('1. 📧 Envoi du code OTP...');
    const sendResponse = await fetch('http://localhost:3002/api/auth/participant-magic-link', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const sendResult = await sendResponse.json();
    console.log(`   Status: ${sendResponse.status}`);
    console.log(`   Résultat: ${sendResult.success ? '✅ Envoyé' : '❌ Erreur'}`);
    
    if (!sendResult.success) {
      console.log(`   Erreur: ${sendResult.error}`);
      return;
    }
    
    console.log(`   Événement: ${sendResult.eventName}\n`);

    // Récupérer le dernier code OTP
    console.log('2. 🔍 Récupération du code OTP...');
    const latestOTP = await prisma.otpCode.findFirst({
      where: {
        email: email.toLowerCase(),
        used: false,
        expiresAt: {
          gt: new Date()
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (!latestOTP) {
      console.log('❌ Aucun code OTP valide trouvé');
      return;
    }

    console.log(`   ✅ Code trouvé: ${latestOTP.code}\n`);

    // Étape 2: Vérifier le code OTP
    console.log('3. ✅ Vérification du code OTP...');
    const verifyResponse = await fetch('http://localhost:3002/api/auth/participant-verify-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        code: latestOTP.code
      }),
    });

    const verifyResult = await verifyResponse.json();
    console.log(`   Status: ${verifyResponse.status}`);
    console.log(`   Résultat: ${verifyResult.success ? '✅ Vérifié' : '❌ Erreur'}`);
    
    if (!verifyResult.success) {
      console.log(`   Erreur: ${verifyResult.error}`);
      return;
    }

    console.log(`   Token JWT: ${verifyResult.token ? '✅ Généré' : '❌ Manquant'}`);
    console.log(`   Utilisateur: ${verifyResult.user.firstName} ${verifyResult.user.lastName}`);
    console.log(`   Redirection: ${verifyResult.redirectUrl}\n`);

    // Étape 3: Tester la redirection
    console.log('4. 🔄 Test de la redirection...');
    const redirectResponse = await fetch(`http://localhost:3002${verifyResult.redirectUrl}`, {
      headers: {
        'Cookie': `next-auth.session-token=${verifyResult.token}`,
      },
    });

    console.log(`   Status: ${redirectResponse.status}`);
    
    if (redirectResponse.status === 200) {
      console.log('   ✅ Redirection réussie vers /dashboard/user');
    } else {
      console.log(`   ⚠️  Redirection avec statut: ${redirectResponse.status}`);
      console.log(`   Headers: ${JSON.stringify([...redirectResponse.headers.entries()])}`);
    }

    // Étape 4: Test du frontend login
    console.log('\n5. 🌐 Test de la page de login...');
    const loginResponse = await fetch('http://localhost:3002/login');
    console.log(`   Status: ${loginResponse.status}`);
    
    if (loginResponse.status === 200) {
      console.log('   ✅ Page de login accessible');
    } else {
      console.log(`   ❌ Erreur sur la page de login: ${loginResponse.status}`);
    }

    console.log('\n🎉 **FLUX OTP FRONTEND TESTÉ AVEC SUCCÈS !**');
    
  } catch (error) {
    console.error('\n❌ **ERREUR LORS DU TEST:**');
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

testFrontendOTPFlow(); 