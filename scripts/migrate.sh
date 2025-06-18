#!/bin/bash

# Script de migration pour Railway
echo "🚀 Démarrage des migrations Prisma..."

# Générer le client Prisma
echo "📦 Génération du client Prisma..."
npx prisma generate

# Appliquer les migrations en mode production
echo "🔄 Application des migrations..."
npx prisma migrate deploy

echo "✅ Migrations terminées avec succès!" 