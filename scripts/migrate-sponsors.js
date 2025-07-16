#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

const ENV_FILE = '.env.local'

function updateEnvFile() {
  let envContent = ''
  
  if (fs.existsSync(ENV_FILE)) {
    envContent = fs.readFileSync(ENV_FILE, 'utf8')
  }

  // Activer Blob storage
  if (envContent.includes('NEXT_PUBLIC_USE_BLOB_STORAGE=')) {
    envContent = envContent.replace(
      /NEXT_PUBLIC_USE_BLOB_STORAGE=.*/,
      'NEXT_PUBLIC_USE_BLOB_STORAGE="true"'
    )
  } else {
    envContent += '\nNEXT_PUBLIC_USE_BLOB_STORAGE="true"\n'
  }

  // Ajouter les sponsors aux types migrés
  if (envContent.includes('BLOB_MIGRATION_TYPES=')) {
    const currentTypes = envContent.match(/BLOB_MIGRATION_TYPES="([^"]*)"/)?.[1] || ''
    const types = currentTypes.split(',').filter(t => t.trim())
    
    if (!types.includes('avatar')) types.push('avatar')
    if (!types.includes('sponsors')) types.push('sponsors')
    
    envContent = envContent.replace(
      /BLOB_MIGRATION_TYPES=.*/,
      `BLOB_MIGRATION_TYPES="${types.join(',')}"`
    )
  } else {
    envContent += 'BLOB_MIGRATION_TYPES="avatar,sponsors"\n'
  }

  fs.writeFileSync(ENV_FILE, envContent)
}

console.log('🚀 Migration des Sponsors vers Vercel Blob...\n')

updateEnvFile()

console.log('✅ Configuration mise à jour:')
console.log('   - Blob storage: ACTIVÉ')
console.log('   - Types migrés: avatar, sponsors')
console.log('')
console.log('🧪 Tests recommandés:')
console.log('1. Redémarrer le serveur de développement')
console.log('2. Aller sur: http://localhost:3000/dashboard/events/[ID]/sponsors')
console.log('3. Tester l\'upload d\'un logo de sponsor')
console.log('4. Vérifier que l\'URL contient "vercel-storage.com"')
console.log('')
console.log('📊 Vérifier le statut avec: node scripts/test-blob-status.js')
console.log('')
console.log('⚠️  En cas de problème: node scripts/toggle-blob.js avatar') 