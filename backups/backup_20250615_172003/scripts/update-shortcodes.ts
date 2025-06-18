// Utiliser require au lieu de import pour la compatibilité CommonJS
const { prisma } = require("../lib/prisma");
const { generateShortCode } = require("../lib/shortcodes");

/**
 * Script pour mettre à jour tous les shortCodes des participants
 * afin qu'ils soient standardisés à 9 caractères (lettres et chiffres)
 */
async function updateAllShortCodes() {
  console.log("🔄 Mise à jour des shortCodes pour tous les participants...");

  try {
    // 1. Récupérer tous les enregistrements avec SQL brut pour éviter les problèmes de typage
    const registrationsRaw = await prisma.$queryRaw`
      SELECT id, first_name as "firstName", last_name as "lastName", short_code as "shortCode"
      FROM registrations
    `;
    
    const registrations = registrationsRaw;

    console.log(`📋 Nombre total d'enregistrements trouvés: ${registrations.length}`);
    
    // 2. Mettre à jour chaque enregistrement avec un nouveau shortCode
    let updated = 0;

    for (const registration of registrations) {
      // Générer un nouveau shortCode unique
      let isUnique = false;
      let newShortCode = "";
      
      while (!isUnique) {
        newShortCode = generateShortCode(); // 9 caractères par défaut
        
        // Vérifier si ce shortCode existe déjà
        const existingWithCode = await prisma.$queryRaw`
          SELECT id FROM registrations WHERE short_code = ${newShortCode}
        `;
        
        isUnique = !Array.isArray(existingWithCode) || existingWithCode.length === 0;
      }
      
      // Mettre à jour l'enregistrement avec SQL brut
      await prisma.$executeRaw`
        UPDATE registrations
        SET short_code = ${newShortCode}
        WHERE id = ${registration.id}
      `;
      
      console.log(`👤 ${registration.firstName} ${registration.lastName}: ${registration.shortCode || 'N/A'} -> ${newShortCode}`);
      updated++;
    }
    
    console.log(`✅ Mise à jour réussie pour ${updated} participants`);
  } catch (error) {
    console.error("❌ Erreur lors de la mise à jour des shortCodes:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le script
updateAllShortCodes()
  .then(() => {
    console.log("✨ Script terminé avec succès!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Erreur:", error);
    process.exit(1);
  }); 