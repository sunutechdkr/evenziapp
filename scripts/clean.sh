#!/bin/bash

# Script de nettoyage pour l'application InEvent

# Vérifier que le script est exécuté depuis le répertoire du projet
if [ ! -d "node_modules" ] || [ ! -d ".next" ]; then
  echo "Erreur: Ce script doit être exécuté depuis le répertoire racine du projet InEvent."
  echo "Utilisez: cd /chemin/vers/inevent && ./scripts/clean.sh"
  exit 1
fi

echo "Nettoyage de l'application InEvent..."

# Arrêter tout processus Node.js en cours
echo "Arrêt des processus Node.js..."
pkill -f "node" || true

# Supprimer les fichiers temporaires et les caches
echo "Suppression des fichiers temporaires et des caches..."
rm -rf .next
rm -rf node_modules/.cache
rm -rf tmp
rm -rf temp

# Nettoyer le cache npm
echo "Nettoyage du cache npm..."
npm cache clean --force

# Réinstaller les dépendances
echo "Réinstallation des dépendances..."
npm install

# Reconstruire l'application
echo "Reconstruction de l'application..."
npm run build

echo "Nettoyage terminé. L'application a été réinitialisée."
echo "Pour démarrer l'application, utilisez: npm run dev" 