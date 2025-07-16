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

  // Migrer tous les types
  if (envContent.includes('BLOB_MIGRATION_TYPES=')) {
    envContent = envContent.replace(
      /BLOB_MIGRATION_TYPES=.*/,
      'BLOB_MIGRATION_TYPES="avatar,sponsors,images"'
    )
  } else {
    envContent += 'BLOB_MIGRATION_TYPES="avatar,sponsors,images"\n'
  }

  fs.writeFileSync(ENV_FILE, envContent)
}

console.log('🎯 Migration COMPLÈTE vers Vercel Blob...\n')

updateEnvFile()

console.log('✅ Configuration mise à jour:')
console.log('   - Blob storage: ACTIVÉ')
console.log('   - Types migrés: TOUS (avatar, sponsors, images)')
console.log('')
console.log('🧪 Tests recommandés:')
console.log('1. Redémarrer le serveur de développement')
console.log('2. Tester les uploads dans:')
console.log('   - Profils (avatars)')
console.log('   - Sponsors (logos)')
console.log('   - Événements (bannières)')
console.log('   - Communications (images)')
console.log('')
console.log('🔍 Tous les uploads devraient utiliser Vercel Blob')
console.log('📊 Vérifier avec: node scripts/test-blob-status.js')
console.log('')
console.log('⚠️  Rollback: node scripts/toggle-blob.js sponsors') 