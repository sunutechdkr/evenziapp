# 🎉 InEvent - Plateforme de Gestion d'Événements

Une plateforme moderne et complète pour la gestion d'événements, développée avec Next.js 15, Prisma, et PostgreSQL.

## ✨ Fonctionnalités

- 📅 **Gestion d'événements** : Création, modification et gestion complète d'événements
- 👥 **Gestion des participants** : Inscriptions, check-in QR code, badges personnalisés
- 📊 **Analytiques avancées** : Tableaux de bord avec graphiques interactifs
- 📧 **Communication** : Système d'emailing intégré avec templates personnalisables
- 🎨 **Interface moderne** : Design responsive avec Tailwind CSS et Radix UI
- 🔒 **Authentification sécurisée** : NextAuth.js avec support multi-providers
- 📱 **Mobile-first** : Interface entièrement responsive

## 🚀 Déploiement sur Railway

### Prérequis
- Compte [Railway](https://railway.app)
- Base de données PostgreSQL (fournie par Railway)

### Étapes de déploiement

1. **Cloner le repository**
```bash
git clone <your-repo-url>
cd inevent
```

2. **Créer un nouveau projet Railway**
- Connectez-vous à Railway
- Cliquez sur "New Project"
- Sélectionnez "Deploy from GitHub repo"

3. **Configurer la base de données**
- Ajoutez un service PostgreSQL à votre projet Railway
- Copiez la `DATABASE_URL` générée

4. **Variables d'environnement**
Configurez ces variables dans Railway :

```env
# Base de données (fournie par Railway)
DATABASE_URL=postgresql://...

# NextAuth (générez une clé secrète forte)
NEXTAUTH_SECRET=your-super-secret-key-here
NEXTAUTH_URL=https://your-app.railway.app

# Email (optionnel)
RESEND_API_KEY=your-resend-api-key

# Production
NODE_ENV=production
PORT=3000
```

5. **Déployer**
- Railway détectera automatiquement le `railway.toml`
- Le déploiement se lancera automatiquement
- Les migrations Prisma s'exécuteront automatiquement

### Génération du NEXTAUTH_SECRET

```bash
openssl rand -base64 32
```

## 🛠️ Développement local

### Installation

```bash
# Installer les dépendances
npm install

# Configurer la base de données
cp env.example .env.local
# Éditez .env.local avec vos variables

# Générer le client Prisma
npx prisma generate

# Appliquer les migrations
npx prisma db push

# Lancer le serveur de développement
npm run dev
```

### Scripts disponibles

```bash
npm run dev      # Serveur de développement
npm run build    # Build de production
npm run start    # Serveur de production
npm run lint     # Linter ESLint
```

## 📁 Structure du projet

```
src/
├── app/                 # App Router (Next.js 13+)
│   ├── api/            # Routes API
│   ├── dashboard/      # Interface d'administration
│   └── auth/           # Pages d'authentification
├── components/         # Composants réutilisables
│   ├── ui/            # Composants UI de base
│   └── dashboard/     # Composants du dashboard
├── lib/               # Utilitaires et configurations
├── types/             # Types TypeScript
└── generated/         # Client Prisma généré
```

## 🔧 Technologies utilisées

- **Framework** : Next.js 15 (App Router)
- **Base de données** : PostgreSQL + Prisma ORM
- **Authentification** : NextAuth.js
- **UI** : Tailwind CSS + Radix UI
- **Graphiques** : Chart.js + React-Chartjs-2
- **Email** : Resend
- **QR Codes** : html5-qrcode + qrcode
- **Déploiement** : Railway

## 📊 Fonctionnalités détaillées

### Dashboard
- Vue d'ensemble des événements
- Statistiques en temps réel
- Graphiques interactifs

### Gestion d'événements
- Création d'événements avec formulaire complet
- Upload d'images (bannières, logos)
- Gestion des sessions et intervenants
- Système de sponsoring

### Participants
- Inscription en ligne
- Génération automatique de QR codes
- Check-in mobile
- Export des données

### Communication
- Templates d'emails personnalisables
- Campagnes d'emailing
- Notifications automatiques

## 🔒 Sécurité

- Headers de sécurité configurés
- Validation des données avec Zod
- Authentification sécurisée
- Protection CSRF
- Chiffrement des mots de passe

## 📞 Support

Pour toute question ou problème :
- Email : support@inevent.com
- Documentation : [docs.inevent.com](https://docs.inevent.com)

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.
