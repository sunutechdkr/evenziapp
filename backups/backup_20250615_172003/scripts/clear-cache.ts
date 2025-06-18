import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

// Convertir fs.rmdir en promesse pour pouvoir utiliser async/await
const rmdir = promisify(fs.rm);

/**
 * Script pour vider le cache de Next.js et forcer un rafraîchissement complet
 * Cela forcera la régénération des QR codes avec les nouveaux shortCodes
 */
async function clearNextCache() {
  console.log("🔄 Nettoyage du cache de Next.js en cours...");

  try {
    const cacheDir = path.join(process.cwd(), '.next/cache');
    
    if (fs.existsSync(cacheDir)) {
      await rmdir(cacheDir, { recursive: true, force: true });
      console.log("✅ Cache Next.js supprimé avec succès!");
    } else {
      console.log("⚠️ Aucun cache Next.js trouvé.");
    }
    
    console.log("🔔 Redémarrez votre serveur Next.js pour appliquer les changements.");
  } catch (error) {
    console.error("❌ Erreur lors du nettoyage du cache:", error);
    process.exit(1);
  }
}

clearNextCache()
  .then(() => {
    console.log("✨ Script terminé avec succès!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Erreur:", error);
    process.exit(1);
  }); 