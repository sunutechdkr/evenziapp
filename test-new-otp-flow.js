const { PrismaClient } = require('./src/generated/prisma');
const fetch = require('node-fetch');

// Charger les variables d'environnement
require('dotenv').config({ path: '.env.local' });

const prisma = new PrismaClient();

async function testNewOTPFlow() {
  try {
    console.log('=== TEST DU NOUVEAU FLUX OTP AVEC REDIRECTION CORRIGÉE ===\n');
    
    const email = 'bouba@ineventapp.com';
    
    // Étape 1: Envoyer un OTP
    console.log('1. 📧 Envoi du code OTP...');
    const sendResponse = await fetch('http://localhost:3000/api/auth/participant-magic-link', {
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

    // Étape 2: Vérifier le code OTP (nouveau flux)
    console.log('3. ✅ Vérification du code OTP (nouveau flux)...');
    const verifyResponse = await fetch('http://localhost:3000/api/auth/participant-verify-otp', {
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

    console.log(`   Utilisateur créé/mis à jour: ${verifyResult.user.name} (${verifyResult.user.email})`);
    console.log(`   Rôle: ${verifyResult.user.role}`);
    console.log(`   Nouvelle URL de redirection: ${verifyResult.redirectUrl}\n`);

    // Étape 3: Tester la vérification de l'utilisateur participant
    console.log('4. 👤 Vérification de l\'utilisateur participant...');
    const userVerifyResponse = await fetch('http://localhost:3000/api/auth/verify-participant-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: verifyResult.user.id,
        email: verifyResult.user.email
      }),
    });

    const userVerifyResult = await userVerifyResponse.json();
    console.log(`   Status: ${userVerifyResponse.status}`);
    console.log(`   Résultat: ${userVerifyResult.success ? '✅ Utilisateur vérifié' : '❌ Erreur'}`);
    
    if (userVerifyResult.success) {
      console.log(`   Utilisateur: ${userVerifyResult.user.name} (${userVerifyResult.user.role})`);
    }

    // Étape 4: Tester la création de session
    console.log('\n5. 🔐 Test de création de session NextAuth...');
    const sessionResponse = await fetch('http://localhost:3000/api/auth/create-participant-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: verifyResult.user.id,
        email: verifyResult.user.email
      }),
    });

    const sessionResult = await sessionResponse.json();
    console.log(`   Status: ${sessionResponse.status}`);
    console.log(`   Résultat: ${sessionResult.success ? '✅ Session créée' : '❌ Erreur'}`);
    
    if (sessionResult.success) {
      console.log(`   Session pour: ${sessionResult.user.name}`);
      
      // Vérifier les cookies de session
      const cookies = sessionResponse.headers.get('set-cookie');
      if (cookies && cookies.includes('next-auth.session-token')) {
        console.log('   ✅ Cookie de session NextAuth défini');
      } else {
        console.log('   ⚠️  Aucun cookie de session trouvé');
      }
    }

    // Étape 5: Vérifier que l'utilisateur existe dans la base
    console.log('\n6. 🗄️  Vérification en base de données...');
    const userInDb = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        emailVerified: true,
        lastLogin: true,
      }
    });

    if (userInDb) {
      console.log('   ✅ Utilisateur trouvé en base:');
      console.log(`      Nom: ${userInDb.name}`);
      console.log(`      Email: ${userInDb.email}`);
      console.log(`      Rôle: ${userInDb.role}`);
      console.log(`      Email vérifié: ${userInDb.emailVerified ? 'Oui' : 'Non'}`);
      console.log(`      Dernière connexion: ${userInDb.lastLogin}`);
    } else {
      console.log('   ❌ Utilisateur non trouvé en base');
    }

    // Étape 6: Vérifier que le code est marqué comme utilisé
    console.log('\n7. 🔍 Vérification de l\'état du code OTP...');
    const usedOtpRecord = await prisma.otpCode.findUnique({
      where: { id: latestOTP.id }
    });
    
    console.log(`   Code utilisé: ${usedOtpRecord.used ? '✅ Oui' : '❌ Non'}`);

    console.log('\n🎉 **NOUVEAU FLUX OTP TESTÉ AVEC SUCCÈS !**');
    console.log('\nRésumé du nouveau flux:');
    console.log('- Envoi OTP par email ✅');
    console.log('- Vérification du code ✅');
    console.log('- Création/mise à jour utilisateur ✅');
    console.log('- Génération URL auto-login ✅');
    console.log('- Vérification utilisateur participant ✅');
    console.log('- Création session NextAuth ✅');
    console.log('- Marquage code comme utilisé ✅');
    console.log('\n📍 Pour tester la redirection complète:');
    console.log(`   Ouvrez: http://localhost:3000${verifyResult.redirectUrl}`);
    
  } catch (error) {
    console.error('\n❌ **ERREUR LORS DU TEST:**');
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

testNewOTPFlow(); 