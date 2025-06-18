#!/bin/bash

# Script de nettoyage avant déploiement InEvent
echo "🧹 Nettoyage du projet InEvent pour déploiement..."

# 1. Supprimer les caches corrompus
echo "  📂 Suppression des caches..."
rm -rf .next
rm -rf node_modules/.cache
rm -rf .npm

# 2. Nettoyer les fichiers temporaires
echo "  🗑️ Suppression des fichiers temporaires..."
find . -name "*.tmp" -delete
find . -name "*.bak" -delete
find . -name "temp_*" -delete
rm -rf tmp/ temp/ tmp_files/

# 3. Nettoyer les logs de développement
echo "  📋 Suppression des logs..."
find . -name "*.log" -not -path "./node_modules/*" -delete

# 4. Nettoyer les fichiers de test
echo "  🧪 Suppression des fichiers de test temporaires..."
rm -f create-test-data.js
rm -f test-*.js
rm -f check-*.js
rm -f update-*.js

# 5. Vérifier les dépendances critiques
echo "  🔍 Vérification des dépendances..."
if [ ! -f "package.json" ]; then
    echo "❌ Erreur: package.json introuvable"
    exit 1
fi

if [ ! -f "prisma/schema.prisma" ]; then
    echo "❌ Erreur: schema.prisma introuvable"
    exit 1
fi

# 6. Réinstaller les dépendances proprement
echo "  📦 Réinstallation des dépendances..."
npm ci --only=production

# 7. Génération Prisma
echo "  🗄️ Génération du client Prisma..."
npx prisma generate

# 8. Vérification du build
echo "  ⚡ Test de build..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Nettoyage terminé avec succès!"
    echo "📊 Statistiques:"
    echo "   - Taille du projet: $(du -sh . | cut -f1)"
    echo "   - Nombre de fichiers: $(find . -type f | wc -l)"
    echo "🚀 Projet prêt pour le déploiement!"
else
    echo "❌ Erreur lors du build de test"
    exit 1
fi 