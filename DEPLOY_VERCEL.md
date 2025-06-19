# 🚀 Guide de déploiement Vercel + Neon

## 📋 **Étapes de déploiement**

### **1. Configuration de la base de données Neon**

1. **Créer un compte Neon** : [https://neon.tech](https://neon.tech)
2. **Créer un nouveau projet** PostgreSQL
3. **Copier la DATABASE_URL** générée (format : `postgresql://username:password@hostname.neon.tech/database?sslmode=require`)

### **2. Déploiement sur Vercel**

1. **Connecter GitHub à Vercel** :
   - Allez sur [https://vercel.com](https://vercel.com)
   - Cliquez sur "Import Project"
   - Sélectionnez votre repository GitHub : `sunutechdkr/ineventapp`

2. **Configuration automatique** :
   - Vercel détecte automatiquement Next.js
   - Le `vercel.json` configure les optimisations

3. **Variables d'environnement** :
   Dans Vercel Dashboard → Settings → Environment Variables :

   ```env
   # Base de données Neon
   DATABASE_URL=postgresql://username:password@hostname.neon.tech/database?sslmode=require
   
   # NextAuth
   NEXTAUTH_SECRET=PEXbatCXAe2/K+nmZiaFvoKYDjnudP8kbLs5IdQ7L1A=
   NEXTAUTH_URL=https://your-app.vercel.app
   
   # Production
   NODE_ENV=production
   
   # Email (optionnel)
   RESEND_API_KEY=your-resend-api-key
   ```

### **3. Migration automatique**

Les migrations Prisma s'exécutent automatiquement lors du build grâce au script `postinstall`.

### **4. Première connexion**

Après le déploiement, créez un utilisateur admin :

1. **SSH dans le terminal Vercel** ou **localement** :
```bash
npx ts-node scripts/create-admin-user.ts
```

2. **Ou créez directement dans Neon Dashboard** :
```sql
INSERT INTO users (id, email, name, password, role, created_at, updated_at) 
VALUES (
  gen_random_uuid(), 
  'admin@yourdomain.com', 
  'Admin User', 
  '$2a$10$hashed_password_here', 
  'ADMIN', 
  NOW(), 
  NOW()
);
```

## ✅ **Checklist de déploiement**

- [ ] **Compte Neon créé** et DATABASE_URL copiée
- [ ] **Repository connecté** à Vercel
- [ ] **Variables d'environnement** configurées dans Vercel
- [ ] **Premier déploiement** réussi
- [ ] **NEXTAUTH_URL** mis à jour avec l'URL Vercel
- [ ] **Utilisateur admin** créé
- [ ] **Test de l'application** en production

## 🔧 **Optimisations incluses**

- ✅ **Région CDG1** (Paris) pour la latence
- ✅ **Headers de sécurité** automatiques
- ✅ **Fonctions API** optimisées (30s timeout)
- ✅ **Build optimisé** pour Next.js
- ✅ **ESLint ignoré** pendant le build (fichiers Prisma)

## 🌐 **URLs importantes**

- **Application** : `https://your-app.vercel.app`
- **Dashboard Vercel** : `https://vercel.com/dashboard`
- **Dashboard Neon** : `https://console.neon.tech`

## 🆘 **Dépannage**

### Erreur de build
```bash
# Vérifier les logs Vercel
vercel logs your-deployment-url
```

### Problème de base de données
```bash
# Tester la connexion Prisma
npx prisma db push
```

### Variables d'environnement
- Vérifiez que `DATABASE_URL` contient `?sslmode=require`
- `NEXTAUTH_SECRET` doit être défini
- `NEXTAUTH_URL` doit correspondre à votre URL Vercel

## 🎯 **Coûts**

- **Vercel** : Gratuit (limites généreuses)
- **Neon** : Gratuit jusqu'à 500MB
- **Total** : 100% gratuit pour commencer ! 🎉 