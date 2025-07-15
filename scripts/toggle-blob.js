#!/usr/bin/env node

/**
 * Script pour activer/désactiver Vercel Blob
 * Usage: node scripts/toggle-blob.js [on|off|status]
 */

const fs = require('fs');
const path = require('path');

const ENV_FILE = '.env.local';
const args = process.argv.slice(2);
const command = args[0] || 'status';

function readEnvFile() {
  if (!fs.existsSync(ENV_FILE)) {
    console.log('❌ Fichier .env.local non trouvé');
    process.exit(1);
  }
  return fs.readFileSync(ENV_FILE, 'utf8');
}

function writeEnvFile(content) {
  fs.writeFileSync(ENV_FILE, content);
}

function updateEnvVar(content, varName, newValue) {
  const regex = new RegExp(`^${varName}=".*"$`, 'm');
  const replacement = `${varName}="${newValue}"`;
  
  if (regex.test(content)) {
    return content.replace(regex, replacement);
  } else {
    // Ajouter la variable si elle n'existe pas
    return content + `\n${replacement}\n`;
  }
}

function getEnvValue(content, varName) {
  const regex = new RegExp(`^${varName}="(.*)"$`, 'm');
  const match = content.match(regex);
  return match ? match[1] : null;
}

function showStatus() {
  const content = readEnvFile();
  const useBlobStorage = getEnvValue(content, 'NEXT_PUBLIC_USE_BLOB_STORAGE');
  const migrationTypes = getEnvValue(content, 'BLOB_MIGRATION_TYPES');
  const hasToken = getEnvValue(content, 'BLOB_READ_WRITE_TOKEN');

  console.log('📊 Status Vercel Blob:');
  console.log('='.repeat(30));
  console.log(`🔧 Blob activé: ${useBlobStorage === 'true' ? '✅ OUI' : '❌ NON'}`);
  console.log(`📁 Types migrés: ${migrationTypes || 'aucun'}`);
  console.log(`🔑 Token configuré: ${hasToken && hasToken.length > 10 ? '✅ OUI' : '❌ NON'}`);
  
  if (useBlobStorage === 'true') {
    console.log('\n🌟 Vercel Blob est ACTIF');
    console.log(`📂 Fichiers ${migrationTypes} utilisent Blob`);
  } else {
    console.log('\n📁 Système classique ACTIF');
    console.log('💾 Fichiers stockés localement');
  }
}

function enableBlob() {
  let content = readEnvFile();
  
  content = updateEnvVar(content, 'NEXT_PUBLIC_USE_BLOB_STORAGE', 'true');
  
  writeEnvFile(content);
  
  console.log('✅ Vercel Blob ACTIVÉ !');
  console.log('🔄 Redémarrez le serveur : npm run dev');
  console.log('🧪 Testez sur : http://localhost:3000/dashboard/test-blob');
}

function disableBlob() {
  let content = readEnvFile();
  
  content = updateEnvVar(content, 'NEXT_PUBLIC_USE_BLOB_STORAGE', 'false');
  
  writeEnvFile(content);
  
  console.log('❌ Vercel Blob DÉSACTIVÉ');
  console.log('📁 Retour au système classique');
  console.log('🔄 Redémarrez le serveur : npm run dev');
}

function setMigrationTypes(types) {
  let content = readEnvFile();
  
  content = updateEnvVar(content, 'BLOB_MIGRATION_TYPES', types);
  
  writeEnvFile(content);
  
  console.log(`📂 Types de migration mis à jour: ${types}`);
}

// Traitement des commandes
switch (command.toLowerCase()) {
  case 'on':
  case 'enable':
    enableBlob();
    break;
    
  case 'off':
  case 'disable':
    disableBlob();
    break;
    
  case 'avatar':
    setMigrationTypes('avatar');
    console.log('🧑‍💼 Migration: avatars uniquement');
    break;
    
  case 'sponsor':
    setMigrationTypes('avatar,sponsor');
    console.log('🏢 Migration: avatars + sponsors');
    break;
    
  case 'all':
    setMigrationTypes('avatar,sponsor,image');
    console.log('🌟 Migration: tous types de fichiers');
    break;
    
  case 'status':
  default:
    showStatus();
    break;
}

console.log('\n💡 Usage:');
console.log('  node scripts/toggle-blob.js status    # Voir le status');
console.log('  node scripts/toggle-blob.js on        # Activer Blob');
console.log('  node scripts/toggle-blob.js off       # Désactiver Blob');
console.log('  node scripts/toggle-blob.js avatar    # Migrer avatars');
console.log('  node scripts/toggle-blob.js sponsor   # Migrer avatars+sponsors');
console.log('  node scripts/toggle-blob.js all       # Migrer tout'); 