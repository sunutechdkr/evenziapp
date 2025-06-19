# 🚀 Guide de Déploiement InEvent - Production

## ✅ Étape 1 : GitHub ✅ TERMINÉ
Votre code est maintenant sur : **https://github.com/sunutechdkr/ineventapp**

---

## 🚀 Étape 2 : Déploiement Vercel (Recommandé)

### 2.1 Connecter à Vercel
1. **Allez sur** : https://vercel.com/new
2. **Connectez votre compte GitHub** si ce n'est pas fait
3. **Importez le repository** : `sunutechdkr/ineventapp`
4. **Vercel détecte automatiquement** Next.js
5. **Cliquez "Deploy"**

### 2.2 Configuration des variables d'environnement sur Vercel

Dans les **Settings > Environment Variables** de votre projet Vercel, ajoutez :

```bash
# Base de données
DATABASE_URL=postgresql://username:password@host:5432/database?sslmode=require

# NextAuth
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=https://votre-app.vercel.app

# Email (Resend)
RESEND_API_KEY=re_xxxxxxxxxx

# Uploads (Cloudinary ou autre)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Google OAuth (optionnel)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

---

## 🗄️ Étape 3 : Base de données Neon

### 3.1 Créer une base de données Neon
1. **Allez sur** : https://neon.tech
2. **Créez un compte** et un nouveau projet
3. **Copiez la DATABASE_URL** fournie
4. **Ajoutez-la dans Vercel** (Variables d'environnement)

### 3.2 Migrer la base de données
Une fois Vercel configuré, les migrations Prisma se feront automatiquement.

---

## 📧 Étape 4 : Configuration Email (Resend)

### 4.1 Créer un compte Resend
1. **Allez sur** : https://resend.com
2. **Créez un compte**
3. **Générez une API Key**
4. **Ajoutez RESEND_API_KEY** dans Vercel

### 4.2 Vérifier votre domaine (optionnel)
- Pour des emails professionnels, vérifiez votre domaine dans Resend

---

## 🔐 Étape 5 : NextAuth Configuration

### 5.1 Générer NEXTAUTH_SECRET
```bash
# Générer un secret sécurisé
openssl rand -base64 32
```

### 5.2 Configurer NEXTAUTH_URL
- Remplacez par votre URL Vercel : `https://votre-app.vercel.app`

---

## 🎯 Étape 6 : Tests en production

### 6.1 Vérifications à faire
- [ ] **Connexion/inscription** fonctionne
- [ ] **Création d'événements** fonctionne
- [ ] **Upload d'images** fonctionne
- [ ] **Envoi d'emails** fonctionne
- [ ] **Sidebar responsive** fonctionne
- [ ] **Base de données** connectée

### 6.2 Tests email
- Testez l'envoi d'emails depuis l'interface
- Vérifiez les templates d'email

---

## 🌐 Étape 7 : Domaine personnalisé (optionnel)

### 7.1 Configurer un domaine
1. **Dans Vercel** > Settings > Domains
2. **Ajoutez votre domaine** : `inevent.votre-domaine.com`
3. **Configurez les DNS** selon les instructions Vercel

### 7.2 Mettre à jour NextAuth
- Mettez à jour `NEXTAUTH_URL` avec votre nouveau domaine

---

## 📊 Monitoring et maintenance

### 8.1 Monitoring Vercel
- **Analytics** : Activez dans Vercel Dashboard
- **Logs** : Surveillez les erreurs dans Functions

### 8.2 Sauvegardes base de données
- **Neon** propose des sauvegardes automatiques
- Configurez des sauvegardes régulières

---

## 🚨 Dépannage

### Erreurs communes
- **Build failed** : Vérifiez les variables d'environnement
- **Database connection** : Vérifiez DATABASE_URL
- **Email not working** : Vérifiez RESEND_API_KEY
- **Auth issues** : Vérifiez NEXTAUTH_SECRET et NEXTAUTH_URL

### Logs utiles
```bash
# Voir les logs Vercel
vercel logs

# Voir les logs en temps réel
vercel logs --follow
```

---

## ✅ Checklist finale

- [ ] ✅ Code sur GitHub
- [ ] 🚀 Déployé sur Vercel
- [ ] 🗄️ Base de données Neon configurée
- [ ] 📧 Emails Resend configurés
- [ ] 🔐 NextAuth configuré
- [ ] 🎯 Tests fonctionnels passés
- [ ] 🌐 Domaine configuré (optionnel)
- [ ] 📊 Monitoring activé

---

## 🎉 Félicitations !

Une fois toutes ces étapes terminées, votre application **InEvent** sera entièrement déployée et accessible en production !

**URL de production** : `https://votre-app.vercel.app`

---

## 📞 Support

- **Documentation Vercel** : https://vercel.com/docs
- **Documentation Neon** : https://neon.tech/docs
- **Documentation Resend** : https://resend.com/docs 