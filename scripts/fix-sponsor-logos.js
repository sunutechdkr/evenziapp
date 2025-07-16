#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('../src/generated/prisma');

const prisma = new PrismaClient();

console.log('🔧 Script de réparation des logos de sponsors\n');

async function main() {
  try {
    // 1. Vérifier les sponsors avec logo null
    console.log('📊 Vérification des sponsors...');
    const allSponsors = await prisma.sponsor.findMany({
      include: {
        event: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    console.log(`   Total sponsors: ${allSponsors.length}`);
    
    const sponsorsWithLogo = allSponsors.filter(s => s.logo);
    const sponsorsWithoutLogo = allSponsors.filter(s => !s.logo);
    
    console.log(`   ✅ Avec logo: ${sponsorsWithLogo.length}`);
    console.log(`   ❌ Sans logo: ${sponsorsWithoutLogo.length}\n`);

    // 2. Afficher les détails des sponsors sans logo
    if (sponsorsWithoutLogo.length > 0) {
      console.log('🚨 Sponsors sans logo:');
      sponsorsWithoutLogo.forEach(sponsor => {
        console.log(`   - ${sponsor.name} (ID: ${sponsor.id})`);
        console.log(`     Événement: ${sponsor.event.name}`);
        console.log(`     Visible: ${sponsor.visible ? 'Oui' : 'Non'}`);
        console.log(`     Niveau: ${sponsor.level}`);
        console.log('');
      });
    }

    // 3. Afficher les détails des sponsors avec logo
    if (sponsorsWithLogo.length > 0) {
      console.log('✅ Sponsors avec logo:');
      sponsorsWithLogo.forEach(sponsor => {
        console.log(`   - ${sponsor.name} (ID: ${sponsor.id})`);
        console.log(`     Logo: ${sponsor.logo}`);
        console.log(`     Événement: ${sponsor.event.name}`);
        console.log('');
      });
    }

    // 4. Vérifier les variables d'environnement
    console.log('🔍 Vérification de la configuration Blob:');
    const useBlob = process.env.NEXT_PUBLIC_USE_BLOB_STORAGE === 'true';
    const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
    const migrationTypes = process.env.BLOB_MIGRATION_TYPES || '';
    
    console.log(`   USE_BLOB_STORAGE: ${useBlob ? 'Activé' : 'Désactivé'}`);
    console.log(`   BLOB_TOKEN: ${blobToken ? 'Configuré' : 'Manquant'}`);
    console.log(`   MIGRATION_TYPES: ${migrationTypes}`);
    console.log(`   Sponsors inclus: ${migrationTypes.includes('sponsors') ? 'Oui' : 'Non'}\n`);

    // 5. Instructions de correction
    console.log('🛠️ Instructions de correction:\n');
    
    if (sponsorsWithoutLogo.length > 0) {
      console.log('Pour corriger les sponsors sans logo:');
      console.log('1. Ouvrez l\'application: npm run dev');
      console.log('2. Connectez-vous et allez sur l\'événement concerné');
      console.log('3. Section Sponsors → Cliquez sur le sponsor à corriger');
      console.log('4. Cliquez sur "Modifier" et ajoutez un logo');
      console.log('5. Sauvegardez les modifications\n');
      
      console.log('URLs de test pour chaque sponsor:');
      sponsorsWithoutLogo.forEach(sponsor => {
        console.log(`   http://localhost:3000/dashboard/events/${sponsor.event.id}/sponsors`);
      });
      console.log('');
    }

    if (!useBlob || !migrationTypes.includes('sponsors')) {
      console.log('⚠️  Configuration Blob pour sponsors non activée!');
      console.log('   Exécutez: node scripts/toggle-blob.js on');
      console.log('   Puis: node scripts/migrate-sponsors.js\n');
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 