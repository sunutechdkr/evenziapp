#!/bin/bash

# Script de sauvegarde pour InEvent utilisant Git

# Vérifier que le script est exécuté depuis le répertoire du projet
if [ ! -d ".git" ]; then
  echo "Erreur: Ce script doit être exécuté depuis le répertoire racine du projet InEvent."
  echo "Utilisez: cd /chemin/vers/inevent && ./scripts/save.sh"
  exit 1
fi

# Récupérer le nom de la version
if [ -z "$1" ]; then
  echo "Aucun nom de version fourni. Utilisation de la date actuelle."
  VERSION_NAME="inevent_$(date +%Y%m%d_%H%M%S)"
else
  VERSION_NAME=$1
fi

echo "Sauvegarde d'InEvent avec le tag: $VERSION_NAME"

# Ajouter tous les fichiers modifiés
git add .

# Créer un commit avec un message descriptif
git commit -m "Sauvegarde InEvent - $VERSION_NAME"

# Créer un tag Git pour cette version
git tag -a $VERSION_NAME -m "Sauvegarde InEvent - $VERSION_NAME"

echo "Sauvegarde terminée. Version $VERSION_NAME créée."
echo "Pour restaurer cette version, utilisez: ./scripts/restore.sh $VERSION_NAME" 