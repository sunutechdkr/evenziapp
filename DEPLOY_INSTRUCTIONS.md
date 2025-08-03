# 🚀 Guide de Déploiement - GitHub + Vercel

## ✅ Code Prêt à Déployer
Votre système Game est entièrement implémenté et committé localement !

## 📋 **Étape 1 : Repository GitHub**

### 1.1 Créer le repository
1. Allez sur **https://github.com/new**
2. **Nom** : `evenzi` (ou votre choix)
3. **Description** : "Plateforme Evenzi avec système de scoring gamifié"
4. **Visibilité** : Public ou Private
5. ⚠️ **IMPORTANT** : Ne cochez PAS "Add a README file"
6. Cliquez **"Create repository"**

### 1.2 Configurer l'URL remote
```bash
# Remplacez VOTRE_USERNAME par votre nom GitHub
git remote set-url origin https://github.com/VOTRE_USERNAME/evenzi.git

# Vérifier la nouvelle URL
git remote -v

# Pousser vers GitHub
git push -u origin main
```

## 🔧 **Étape 2 : Déploiement Vercel**

### 2.1 Connexion à Vercel
1. Allez sur **https://vercel.com**
2. Connectez-vous avec votre compte GitHub
3. Cliquez **"New Project"**
4. Importez votre repository `evenzi`

### 2.2 Configuration du projet
```
Framework Preset: Next.js
Root Directory: ./
Build Command: npm run build (par défaut)
Output Directory: .next (par défaut)
Install Command: npm install (par défaut)
```

### 2.3 Variables d'environnement
Dans les settings Vercel, ajoutez ces variables :

```env
# Base de données (OBLIGATOIRE)
DATABASE_URL=postgresql://username:password@hostname:port/database

# NextAuth (OBLIGATOIRE)
NEXTAUTH_SECRET=votre-secret-super-fort-aleatoire-32-chars-min
NEXTAUTH_URL=https://votre-app.vercel.app

# Email (optionnel)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre-email@gmail.com
SMTP_PASSWORD=votre-mot-de-passe-app

# Resend (optionnel)
RESEND_API_KEY=votre-cle-resend

# Vercel Blob (optionnel)
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxx

# Production
NODE_ENV=production
PRISMA_GENERATE_DATAPROXY=true
```

### 2.4 Configuration Base de Données
Pour PostgreSQL, vous pouvez utiliser :
- **Neon** (recommandé) : https://neon.tech
- **Railway** : https://railway.app
- **Supabase** : https://supabase.com

## ⚡ **Étape 3 : Migration Database**

Une fois déployé sur Vercel :

### 3.1 Via terminal local (avec DB_URL production)
```bash
# Configurer l'URL production dans .env temporairement
DATABASE_URL="postgresql://prod-url-here"

# Exécuter la migration
npx prisma migrate deploy

# Remettre l'URL locale
DATABASE_URL="postgresql://local-url-here"
```

### 3.2 Ou via Vercel CLI
```bash
# Installer Vercel CLI
npm i -g vercel

# Se connecter
vercel login

# Lancer la migration sur production
vercel env pull .env.production
DATABASE_URL=$(cat .env.production | grep DATABASE_URL | cut -d '=' -f2) npx prisma migrate deploy
```

## 🎯 **Étape 4 : Test du Déploiement**

### 4.1 Vérifications
- [ ] Application accessible sur l'URL Vercel
- [ ] Connexion base de données OK
- [ ] Authentification fonctionne
- [ ] Page Game accessible : `/dashboard/events/[id]/game`
- [ ] APIs Game répondent : `/api/events/[id]/game/*`

### 4.2 Test du système Game
1. Créer un événement
2. Ajouter des participants
3. Aller sur la page Game
4. Vérifier l'affichage du classement

## 🔄 **Workflow de développement**

### Futures mises à jour
```bash
# Développement local
git add .
git commit -m "✨ nouvelle fonctionnalité"
git push origin main

# Vercel déploiera automatiquement !
```

### Intégration du scoring
Suivez les exemples dans `docs/INTEGRATION_GAME_EXAMPLES.md` pour ajouter le scoring aux fonctionnalités existantes.

## 🆘 **Dépannage**

### Erreurs communes
- **Build failed** : Vérifier les variables d'environnement
- **Database error** : Vérifier DATABASE_URL et migration
- **404 on Game page** : Vérifier que tous les fichiers sont bien poussés
- **Auth error** : Vérifier NEXTAUTH_SECRET et NEXTAUTH_URL

### Support
- GitHub Issues : Documenter les bugs
- Vercel Logs : Vérifier les erreurs de build/runtime
- Prisma Studio : `npx prisma studio` pour debug DB

---

## 🎉 **Résultat Final**

Vous aurez :
- ✅ Code sur GitHub (source control)
- ✅ App déployée sur Vercel (production)
- ✅ Base de données migrée
- ✅ Système Game fonctionnel
- ✅ Déploiement automatique sur chaque push

**URL finale** : `https://votre-app.vercel.app/dashboard/events/[id]/game` 