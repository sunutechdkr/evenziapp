const { PrismaClient } = require('./src/generated/prisma');

// Charger les variables d'environnement
require('dotenv').config({ path: '.env.local' });

const prisma = new PrismaClient();

async function testOTPVerification() {
  try {
    console.log('=== TEST VERIFICATION OTP ===');
    
    // Récupérer le dernier code OTP créé pour bouba@ineventapp.com
    const latestOTP = await prisma.otpCode.findFirst({
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

    if (!latestOTP) {
      console.log('❌ Aucun code OTP valide trouvé');
      return;
    }

    console.log('✅ Code OTP trouvé:', latestOTP.code);
    console.log('Email:', latestOTP.email);
    console.log('Expire à:', latestOTP.expiresAt);

    // Tester la vérification avec le code correct
    console.log('\n--- Test avec le code correct ---');
    const response = await fetch('http://localhost:3000/api/auth/participant-verify-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'bouba@ineventapp.com',
        code: latestOTP.code
      })
    });

    const result = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(result, null, 2));

    if (response.ok) {
      console.log('✅ Vérification OTP réussie !');
    } else {
      console.log('❌ Erreur lors de la vérification:', result.error);
    }

    // Vérifier si le code a été marqué comme utilisé
    const usedOTP = await prisma.otpCode.findUnique({
      where: { id: latestOTP.id }
    });
    
    console.log('\nÉtat du code après vérification:');
    console.log('- Utilisé:', usedOTP?.used ? 'Oui' : 'Non');

  } catch (error) {
    console.error('Erreur:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testOTPVerification(); 