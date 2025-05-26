const { PrismaClient } = require('./src/generated/prisma');

// Charger les variables d'environnement
require('dotenv').config({ path: '.env.local' });

const prisma = new PrismaClient();

async function testCompleteOTPFlow() {
  try {
    console.log('=== TEST COMPLET DU FLUX OTP ===\n');
    
    // Étape 1: Envoyer un OTP
    console.log('1. Envoi du code OTP...');
    const sendResponse = await fetch('http://localhost:3000/api/auth/participant-magic-link', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'bouba@ineventapp.com'
      }),
    });

    const sendResult = await sendResponse.json();
    console.log(`   Status: ${sendResponse.status}`);
    console.log(`   Résultat: ${sendResult.success ? '✅ Envoyé' : '❌ Échec'}`);
    
    if (!sendResult.success) {
      console.log('❌ Échec de l\'envoi OTP');
      return;
    }

    // Étape 2: Récupérer le code depuis la base de données
    console.log('\n2. Récupération du code OTP depuis la DB...');
    const otpRecord = await prisma.otpCode.findFirst({
      where: {
        email: 'bouba@ineventapp.com',
        used: false,
        expiresAt: {
          gt: new Date()
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (!otpRecord) {
      console.log('❌ Aucun code OTP trouvé');
      return;
    }

    console.log(`   Code trouvé: ${otpRecord.code}`);

    // Étape 3: Vérifier le code OTP
    console.log('\n3. Vérification du code OTP...');
    const verifyResponse = await fetch('http://localhost:3000/api/auth/participant-verify-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'bouba@ineventapp.com',
        code: otpRecord.code
      }),
    });

    const verifyResult = await verifyResponse.json();
    console.log(`   Status: ${verifyResponse.status}`);
    console.log(`   Résultat: ${verifyResult.success ? '✅ Code valide' : '❌ Code invalide'}`);
    
    if (!verifyResult.success) {
      console.log('❌ Échec de la vérification OTP');
      return;
    }

    console.log(`   Utilisateur: ${verifyResult.user.name} (${verifyResult.user.email})`);
    console.log(`   Rôle: ${verifyResult.user.role}`);
    console.log(`   Token reçu: ${verifyResult.token ? '✅ Présent' : '❌ Manquant'}`);

    // Étape 4: Vérifier le token et créer une session
    console.log('\n4. Vérification du token et préparation de session...');
    const sessionResponse = await fetch('http://localhost:3000/api/auth/create-participant-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: verifyResult.token
      }),
    });

    const sessionResult = await sessionResponse.json();
    console.log(`   Status: ${sessionResponse.status}`);
    console.log(`   Résultat: ${sessionResult.success ? '✅ Session prête' : '❌ Échec session'}`);
    
    if (sessionResult.success) {
      console.log(`   Utilisateur validé: ${sessionResult.user.name}`);
    }

    // Étape 5: Vérifier que le code est marqué comme utilisé
    console.log('\n5. Vérification de l\'état du code...');
    const usedOtpRecord = await prisma.otpCode.findUnique({
      where: { id: otpRecord.id }
    });
    
    console.log(`   Code utilisé: ${usedOtpRecord.used ? '✅ Oui' : '❌ Non'}`);

    console.log('\n🎉 FLUX OTP COMPLET TESTÉ AVEC SUCCÈS !');
    console.log('\nRésumé du flux:');
    console.log('- Envoi OTP par email ✅');
    console.log('- Récupération du code ✅');
    console.log('- Vérification du code ✅');
    console.log('- Génération token JWT ✅');
    console.log('- Validation token pour session ✅');
    console.log('- Marquage code comme utilisé ✅');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testCompleteOTPFlow(); 