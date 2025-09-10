  # 🎉 Evenzi - Plateforme de Gestion d'Événements Moderne

> **Plateforme complète de gestion d'événements avec système de gamification et networking avancé**

[![Next.js](https://img.shields.io/badge/Next.js-15.3.0-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.6.0-2D3748?logo=prisma)](https://www.prisma.io/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4.17-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-black?logo=vercel)](https://vercel.com/)

## 🌟 Vue d'ensemble

**Evenzi** est une plateforme moderne de gestion d'événements construite avec les dernières technologies web. Elle offre une expérience complète pour l'organisation, la participation et le networking lors d'événements professionnels et corporatifs.

### 🎯 Caractéristiques principales
- **Gestion complète d'événements** - De la création à l'analyse post-événement
- **Système de gamification** - Scoring et classements en temps réel
- **Networking intelligent** - Matchmaking et rendez-vous automatisés
- **Check-in mobile** - Scanner QR avec caméra optimisée
- **Multi-rôles** - Admin, Organisateur, Participant avec permissions granulaires
- **Interface responsive** - Design moderne et accessible sur tous appareils

## 🚀 Déploiement en production

- **🎯 Production** : [https://evenzi-q7jg18ggy-sunutech.vercel.app](https://evenzi-q7jg18ggy-sunutech.vercel.app)
- **📊 Dashboard Vercel** : [Vercel Project](https://vercel.com/sunutech/evenzi)
- **💾 Repository GitHub** : [sunutechdkr/evenzi](https://github.com/sunutechdkr/evenzi)

## 🛠️ Stack Technologique

### Frontend
- **Framework** : Next.js 15.3.0 (App Router)
- **Language** : TypeScript 5.8.3
- **Styling** : TailwindCSS 3.4.17
- **UI Components** : Shadcn/ui + Radix UI
- **Icons** : Heroicons + Lucide React
- **Forms** : React Hook Form + Zod validation

### Backend
- **Runtime** : Node.js
- **Database** : PostgreSQL
- **ORM** : Prisma 6.6.0
- **Auth** : NextAuth.js 4.24.11
- **Email** : Resend + React Email
- **Storage** : Vercel Blob
- **QR Codes** : html5-qrcode + qrcode.react

### Outils de développement
- **Package Manager** : npm
- **Linting** : ESLint + TypeScript
- **Testing** : Playwright
- **Deployment** : Vercel
- **Analytics** : Chart.js + Recharts

## 🏗️ Architecture du projet

```
evenzi/
├── src/
│   ├── app/                    # App Router (Next.js 15)
│   │   ├── api/               # API Routes
│   │   ├── auth/              # Pages d'authentification
│   │   ├── checkin/           # Check-in mobile
│   │   ├── dashboard/         # Tableaux de bord
│   │   │   ├── admin/         # Interface administrateur
│   │   │   ├── events/        # Gestion d'événements
│   │   │   └── user/          # Interface participant
│   │   └── event/             # Pages publiques d'événements
│   ├── components/            # Composants réutilisables
│   │   ├── ui/               # Composants UI de base
│   │   ├── dashboard/        # Composants dashboard
│   │   └── forms/            # Formulaires
│   ├── lib/                  # Utilitaires et configurations
│   ├── hooks/                # Hooks React personnalisés
│   └── types/                # Définitions TypeScript
├── prisma/                   # Schéma et migrations DB
├── public/                   # Assets statiques
└── docs/                     # Documentation
```

## ✨ Fonctionnalités complètes

### 🎯 Gestion d'événements

#### Pour les administrateurs
- ✅ **Création et édition** - Interface intuitive avec formulaires avancés
- ✅ **Gestion multi-événements** - Support illimité d'événements simultanés
- ✅ **Branding personnalisé** - Logos, bannières, couleurs par événement
- ✅ **Configuration flexible** - Dates, lieux, formats (présentiel/virtuel/hybride)
- ✅ **Archivage intelligent** - Système d'archivage avec restauration

#### Sessions et programme
- ✅ **Planning avancé** - Création de sessions avec horaires précis
- ✅ **Gestion des intervenants** - Profils complets des speakers
- ✅ **Salles virtuelles** - Support vidéo et liens de streaming
- ✅ **Documents de session** - Upload et partage de supports
- ✅ **Suivi de participation** - Analytics de présence par session

### 👥 Système de participants

#### Inscription et profils
- ✅ **Inscription simplifiée** - Formulaires adaptatifs par événement
- ✅ **Profils enrichis** - Informations professionnelles complètes
- ✅ **Types de participants** - Participant, Speaker, Organisateur, VIP
- ✅ **Import en masse** - Upload CSV/Excel avec validation
- ✅ **QR codes uniques** - Génération automatique pour check-in (9 caractères)

#### Gestion avancée
- ✅ **Recherche et filtres** - Outils puissants de recherche
- ✅ **Actions en lot** - Opérations groupées sur participants
- ✅ **Exports détaillés** - Rapports Excel personnalisables
- ✅ **Communication ciblée** - Envoi d'emails segmentés

### 🎮 Système de gamification

#### Scoring automatique
| Action | Points | Déclencheur |
|--------|--------|-------------|
| **Check-in** | 50 pts | Présence à l'événement |
| **Entrée session** | 20 pts | Rejoindre une session |
| **Participation** | 30 pts | Présence complète session |
| **Scan QR participant** | 10 pts | Networking entre participants |
| **Demande RDV** | 15 pts | Initiative de rendez-vous |
| **RDV confirmé** | 30 pts | Rendez-vous accepté |

#### Interface de classement
- 🏆 **Podium Top 3** - Affichage avec médailles et mise en valeur
- 📊 **Classement complet** - Tableau avec rangs et statistiques
- 📈 **Statistiques temps réel** - Mise à jour automatique des scores
- 🎯 **Challenges visibles** - Liste des actions et points associés
- 📱 **Interface responsive** - Optimisée mobile et desktop

### 🤝 Networking et rendez-vous

#### Matchmaking intelligent
- ✅ **Algorithme de suggestions** - Basé sur les profils et intérêts
- ✅ **Configuration de profil** - Wizard en 5 étapes pour optimiser les matches
- ✅ **Intérêts sectoriels** - Suggestions automatiques selon l'événement
- ✅ **Disponibilités** - Gestion des créneaux de networking
- ✅ **Récapitulatif intelligent** - Vue d'ensemble des préférences

#### Système de rendez-vous
- ✅ **Demandes automatisées** - Interface simple pour proposer des RDV
- ✅ **Gestion des créneaux** - Horaires et lieux configurables
- ✅ **Notifications en temps réel** - Alertes pour nouvelles demandes
- ✅ **Statuts de suivi** - En attente, confirmé, refusé, terminé
- ✅ **Historique complet** - Suivi de tous les échanges

### 🏢 Gestion des sponsors

#### Profils enrichis
- ✅ **Informations complètes** - Contact, réseaux sociaux, description
- ✅ **Niveaux de partenariat** - Platinum, Gold, Silver, Bronze, etc.
- ✅ **Logos haute qualité** - Support Vercel Blob avec optimisation
- ✅ **Documents marketing** - Brochures, présentations (PDF, DOC)
- ✅ **Géolocalisation** - Adresses et emplacements stands

#### Interface de gestion
- ✅ **Vue tableau avancée** - Colonnes configurables avec statistiques
- ✅ **Modal multi-onglets** - Détails, Membres, RDV, Documents, Sessions
- ✅ **Recherche de membres** - Association participants <> sponsors
- ✅ **Analytics intégrées** - Nombre de membres, sessions, documents
- ✅ **Export Excel** - Rapports complets en format professionnel

#### Vue participant
- ✅ **API publique sécurisée** - Accès filtré aux sponsors visibles
- ✅ **Profils des membres** - Visualisation des équipes sponsors
- ✅ **Actions de contact** - Boutons "Contacter" et "Prendre RDV"
- ✅ **Interface cohérente** - Design uniforme avec vue admin

### 📱 Check-in mobile optimisé

#### Scanner QR intelligent
- ✅ **Détection automatique** - Caméra arrière sur mobile, frontale sur desktop
- ✅ **Basculement de caméra** - Bouton de switch pour mobile uniquement
- ✅ **Configuration adaptative** - Résolution optimisée par appareil
- ✅ **Interface personnalisée** - Couleurs brand et UX fluide

#### Processus de validation
- ✅ **Vérification multi-étapes** - Scan → Conditions → Confirmation → Succès
- ✅ **Gestion des erreurs** - Messages d'aide et suggestions de résolution
- ✅ **Impression de badges** - Génération PDF instantanée
- ✅ **Recherche manuelle** - Alternative au scan pour dépannage

### 🎨 Système de badges

#### Templates personnalisables
- ✅ **Éditeur visuel** - Interface pour création de badges
- ✅ **Éléments dynamiques** - Nom, photo, QR code, entreprise
- ✅ **Formats multiples** - A4, A5, badge standard, personnalisé
- ✅ **Aperçu temps réel** - Preview avant impression
- ✅ **Bibliothèque de templates** - Modèles prêts à utiliser

#### Génération et impression
- ✅ **Export PDF** - Qualité impression professionnelle
- ✅ **Impression en lot** - Génération massive de badges
- ✅ **QR codes uniques** - Codes courts alphanumériques (9 caractères)
- ✅ **Gestion des archives** - Historique des impressions

### 📧 Communication avancée

#### Système d'emails
- ✅ **Templates personnalisables** - Éditeur riche avec variables dynamiques
- ✅ **Campagnes ciblées** - Segmentation par type de participant
- ✅ **Automatisation** - Emails de confirmation, rappels, relances
- ✅ **Analytics** - Taux d'ouverture, clics, réponses
- ✅ **Intégration Resend** - Service email professionnel

### 📊 Analytics et reporting

#### Dashboard analytique
- ✅ **Métriques en temps réel** - Inscriptions, check-ins, participation
- ✅ **Graphiques interactifs** - Chart.js et Recharts
- ✅ **Comparaisons périodes** - Évolution dans le temps
- ✅ **Segmentation avancée** - Par type, entreprise, session
- ✅ **Exports configurables** - PDF, Excel, CSV

## 🔐 Authentification et sécurité

### Système d'authentification multi-provider
- ✅ **Credentials Provider** - Email/mot de passe classique
- ✅ **Magic Link Email** - Connexion sans mot de passe
- ✅ **Participant Links** - Liens magiques pour participants
- ✅ **Auto-login système** - Authentification transparente
- ✅ **OTP vérification** - Code à usage unique par email

### Gestion des rôles et permissions
- 🔴 **ADMIN** - Accès complet à la plateforme
- 🟡 **ORGANIZER** - Gestion d'événements assignés
- 🔵 **USER** - Participant standard
- 🟣 **SPEAKER** - Intervenant avec privilèges session

### Sécurité avancée
- ✅ **Tokens JWT sécurisés** - Chiffrement et expiration automatique
- ✅ **Validation côté serveur** - Vérification complète des données
- ✅ **Protection CSRF** - Tokens de session sécurisés
- ✅ **Rate limiting** - Protection contre les attaques
- ✅ **Audit trail** - Logs de toutes les actions importantes

## 🗃️ Modèle de données principales

### Entités principales
- 🎪 **Event** - Événements avec métadonnées complètes
- 👤 **User** - Utilisateurs multi-rôles avec permissions
- 🎟️ **Registration** - Inscriptions avec informations détaillées
- 📅 **EventSessions** - Sessions avec planning et intervenants
- 🏢 **Sponsor** - Partenaires avec profils enrichis
- 📋 **Appointment** - Rendez-vous entre participants
- 🎮 **Game** - Actions de gamification scorées
- 🏆 **UserEventScore** - Scores totaux par participant/événement
- 🎯 **UserMatchProfile** - Profils de matchmaking
- 💡 **MatchSuggestion** - Suggestions de networking
- 🎫 **Badge** - Badges personnalisés
- 📧 **EmailTemplate** - Templates d'emails
- 📊 **EmailCampaign** - Campagnes d'emailing

## 🚀 Installation et développement

### Prérequis
```bash
Node.js ≥ 18.0.0
PostgreSQL ≥ 14
npm ou yarn
Git
```

### Installation
```bash
# Cloner le repository
git clone https://github.com/sunutechdkr/evenzi.git
cd evenzi

# Installer les dépendances
npm install --legacy-peer-deps

# Configuration environnement
cp env.example .env
# Éditer .env avec vos variables
```

### Configuration base de données
```bash
# Générer le client Prisma
npx prisma generate

# Appliquer les migrations
npx prisma migrate dev

# (Optionnel) Seeder la base
npx prisma db seed
```

### Développement
```bash
# Lancer le serveur de développement
npm run dev

# Accéder à l'application
open http://localhost:3000

# Accéder à Prisma Studio
npx prisma studio
```

## 🌍 Variables d'environnement

### Variables obligatoires
```env
# Base de données PostgreSQL
DATABASE_URL="postgresql://user:password@localhost:5432/evenzi"

# NextAuth configuration
NEXTAUTH_SECRET="your-super-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

### Variables optionnelles
```env
# Email service (Resend)
RESEND_API_KEY="re_your_api_key_here"

# Stockage fichiers (Vercel Blob)
BLOB_READ_WRITE_TOKEN="vercel_blob_token"

# Configuration SMTP alternative
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
```

## 📦 Scripts disponibles

```bash
npm run dev         # Développement avec hot reload
npm run build       # Build production
npm run start       # Démarrer en production
npm run lint        # Linting avec ESLint
```

## 🚀 Déploiement en production

### Vercel (Recommandé)
```bash
# Installation CLI Vercel
npm i -g vercel

# Déploiement initial
vercel

# Déploiement production
vercel --prod
```

## 📚 Documentation complète

- 📖 **Système Game** : [docs/GAME_SYSTEM_SUMMARY.md](docs/GAME_SYSTEM_SUMMARY.md)
- 🚀 **Déploiement** : [DEPLOYMENT_SUCCESS.md](DEPLOYMENT_SUCCESS.md)
- 🏢 **Gestion sponsors** : [SPONSORS_ENHANCED_FEATURES.md](SPONSORS_ENHANCED_FEATURES.md)

## 📈 Roadmap et évolutions

### Version actuelle (v0.2.0)
- ✅ Système complet de gestion d'événements
- ✅ Gamification avec scoring automatique
- ✅ Networking et matchmaking avancé
- ✅ Check-in mobile optimisé
- ✅ Gestion sponsors enrichie

### Prochaines versions
- 🔄 **v0.3.0** - Système de tickets payants
- 🔄 **v0.4.0** - Application mobile native
- 🔄 **v0.5.0** - Intégrations tiers (Zoom, Teams, etc.)
- 🔄 **v1.0.0** - Version entreprise avec multi-tenancy

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 👥 Équipe

- **Développement** : [SunuTech](https://github.com/sunutechdkr)
- **Design UX/UI** : Interface moderne avec Shadcn/ui
- **Backend Architecture** : Next.js Full-Stack avec Prisma ORM

---

## 🎯 Support et contact

- 📧 **Email** : support@evenzi.io
- 🐛 **Issues** : [GitHub Issues](https://github.com/sunutechdkr/evenzi/issues)
- 📖 **Documentation** : [Wiki GitHub](https://github.com/sunutechdkr/evenzi/wiki)

---

<div align="center">

**🎉 Evenzi - Révolutionnez vos événements avec la technologie moderne**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fsunutechdkr%2Fevenzi)

</div>
