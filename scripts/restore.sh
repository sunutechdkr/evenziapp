#!/bin/bash

# Script de restauration pour InEvent utilisant Git

# Vérifier que le script est exécuté depuis le répertoire du projet
if [ ! -d ".git" ]; then
  echo "Erreur: Ce script doit être exécuté depuis le répertoire racine du projet InEvent."
  echo "Utilisez: cd /chemin/vers/inevent && ./scripts/restore.sh <nom_version>"
  exit 1
fi

# Vérifier qu'un nom de version a été fourni
if [ -z "$1" ]; then
  echo "Erreur: Vous devez spécifier un nom de version à restaurer."
  echo "Utilisez: ./scripts/restore.sh <nom_version>"
  echo ""
  echo "Versions disponibles:"
  git tag -l
  exit 1
fi

VERSION_NAME=$1

# Vérifier que la version existe
if ! git tag -l | grep -q "^$VERSION_NAME$"; then
  echo "Erreur: La version '$VERSION_NAME' n'existe pas."
  echo "Versions disponibles:"
  git tag -l
  exit 1
fi

echo "Restauration d'InEvent vers la version: $VERSION_NAME"

# Sauvegarder l'état actuel avant de restaurer
CURRENT_DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_BRANCH="backup_avant_restauration_$CURRENT_DATE"
git branch $BACKUP_BRANCH

echo "État actuel sauvegardé dans la branche: $BACKUP_BRANCH"

# Restaurer la version spécifiée
git checkout $VERSION_NAME

echo "Restauration terminée. La version $VERSION_NAME a été restaurée."
echo "Pour revenir à l'état précédent, utilisez: git checkout $BACKUP_BRANCH" 