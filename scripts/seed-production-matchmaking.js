const https = require('https');

const PRODUCTION_URL = 'https://inevent-q622eus2d-sunutech.vercel.app';

// Configuration pour l'appel API
const postData = JSON.stringify({});

const options = {
  hostname: 'inevent-q622eus2d-sunutech.vercel.app',
  port: 443,
  path: '/api/admin/seed-matchmaking',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('🌱 Lancement du seeding des données de matchmaking en production...');

const req = https.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers: ${JSON.stringify(res.headers)}`);
  
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      console.log('✅ Résultat du seeding:');
      console.log(`📊 Profils créés: ${result.createdProfiles || 0}`);
      console.log(`⏭️  Profils existants: ${result.skippedProfiles || 0}`);
      console.log(`📝 Total registrations: ${result.totalRegistrations || 0}`);
      console.log(`💬 Message: ${result.message || 'Terminé'}`);
    } catch (error) {
      console.log('Response data:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Erreur lors de l\'appel API:', error.message);
});

// Écrire les données et fermer la requête
req.write(postData);
req.end();

console.log('🚀 Requête envoyée à l\'API de seeding...'); 