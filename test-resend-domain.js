const { Resend } = require('resend');

// Charger les variables d'environnement
require('dotenv').config({ path: '.env.local' });

const resend = new Resend(process.env.RESEND_API_KEY);

async function testResendDomains() {
  try {
    console.log('Vérification des domaines Resend...');
    
    // D'abord, testons avec le domaine par défaut de Resend
    const result1 = await resend.emails.send({
      from: 'Acme <onboarding@resend.dev>', // Domaine par défaut Resend
      to: ['bouba@ineventapp.com'],
      subject: 'Test Resend avec domaine par défaut',
      html: '<h1>Test avec domaine par défaut resend.dev</h1>',
    });

    console.log('Résultat avec resend.dev:', result1);
    
    // Ensuite, testons avec notre domaine personnalisé
    const result2 = await resend.emails.send({
      from: 'InEvent <noreply@ineventapp.com>',
      to: ['bouba@ineventapp.com'],
      subject: 'Test Resend avec domaine personnalisé',
      html: '<h1>Test avec domaine personnalisé ineventapp.com</h1>',
    });

    console.log('Résultat avec ineventapp.com:', result2);
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  }
}

testResendDomains(); 