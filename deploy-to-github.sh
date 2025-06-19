#!/bin/bash

# Script de déploiement InEvent vers GitHub
# Repository: https://github.com/sunutechdkr/ineventapp.git
# Compte: sunutechdkr

echo "🚀 Déploiement InEvent vers GitHub (sunutechdkr/ineventapp)"
echo "=========================================================="

# Vérifier l'état du repository
echo "📋 Vérification de l'état du repository..."
git status

# Ajouter tous les fichiers
echo "📦 Ajout des fichiers modifiés..."
git add -A

# Créer un commit si nécessaire
if ! git diff-index --quiet HEAD --; then
    echo "💾 Création d'un commit..."
    git commit -m "🚀 Deploy to GitHub - $(date '+%Y-%m-%d %H:%M:%S')"
else
    echo "✅ Aucun changement à committer"
fi

# Information sur l'authentification
echo ""
echo "🔐 AUTHENTIFICATION GITHUB REQUISE"
echo "=================================="
echo "Repository: https://github.com/sunutechdkr/ineventapp.git"
echo ""
echo "Lors du push, vous devrez fournir:"
echo "- Username: sunutechdkr"
echo "- Password: [Votre Personal Access Token GitHub]"
echo ""
echo "📝 Si vous n'avez pas de Personal Access Token:"
echo "   1. Allez sur: https://github.com/settings/tokens"
echo "   2. Cliquez 'Generate new token' > 'Generate new token (classic)'"
echo "   3. Sélectionnez les scopes: 'repo' (Full control of private repositories)"
echo "   4. Copiez le token généré et utilisez-le comme mot de passe"
echo ""

# Effacer le cache d'authentification
echo "🔄 Nettoyage du cache d'authentification..."
if command -v osascript >/dev/null 2>&1; then
    # Sur macOS, vider le keychain
    security delete-internet-password -s github.com 2>/dev/null || true
fi

# Tenter le push
echo "🚀 Push vers GitHub..."
echo "Vous allez être invité à entrer vos identifiants GitHub..."
echo ""

git push origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ SUCCÈS! 🎉"
    echo "=============="
    echo "Votre application InEvent a été déployée sur:"
    echo "🔗 https://github.com/sunutechdkr/ineventapp"
    echo ""
    echo "📋 Prochaines étapes pour le déploiement:"
    echo "1. 🚀 Déployer sur Vercel: https://vercel.com/new"
    echo "2. 🗄️  Connecter la base de données Neon"
    echo "3. ⚙️  Configurer les variables d'environnement"
    echo "4. 🔐 Configurer NextAuth pour la production"
    echo ""
    echo "📖 Consultez README.md pour les instructions détaillées"
else
    echo ""
    echo "❌ ÉCHEC DU PUSH"
    echo "==============="
    echo "Vérifications à faire:"
    echo "1. ✅ Username correct: sunutechdkr"
    echo "2. 🔑 Token d'accès valide (pas le mot de passe du compte)"
    echo "3. 🔐 Permissions 'repo' sur le token"
    echo "4. 🌐 Connexion internet stable"
    echo ""
    echo "💡 Tip: Utilisez un Personal Access Token, pas votre mot de passe!"
fi 