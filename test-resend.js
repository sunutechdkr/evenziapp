const { Resend } = require('resend');

// Charger les variables d'environnement
require('dotenv').config({ path: '.env.local' });

const resend = new Resend(process.env.RESEND_API_KEY);

async function testResend() {
  try {
    console.log('Test de l\'envoi d\'email avec Resend...');
    console.log('Clé API:', process.env.RESEND_API_KEY ? 'Configurée' : 'NON CONFIGURÉE');
    
    const result = await resend.emails.send({
      from: 'InEvent <noreply@ineventapp.com>',
      to: ['bouba@ineventapp.com'], // Utilisez votre email principal pour tester
      subject: 'Test Resend - InEvent OTP',
      html: `
        <h1>🔐 Test d'envoi d'email OTP</h1>
        <p>Si vous recevez cet email, Resend fonctionne correctement pour InEvent !</p>
        <div style="background: white; border: 2px solid #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 25px 0;">
          <div style="font-size: 36px; font-weight: bold; color: #667eea; letter-spacing: 8px; font-family: 'Courier New', monospace;">
            123456
          </div>
          <p style="margin: 10px 0 0 0; font-size: 14px; color: #6c757d;">
            Code de test OTP
          </p>
        </div>
        <p>Timestamp: ${new Date().toISOString()}</p>
      `,
    });

    console.log('Résultat:', result);
    
    if (result.error) {
      console.error('Erreur:', result.error);
    } else {
      console.log('✅ Email envoyé avec succès !');
      console.log('ID:', result.data?.id);
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  }
}

testResend(); 