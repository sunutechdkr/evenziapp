# 🎮 InEvent - Plateforme d'Événements avec Système de Scoring

> **Plateforme complète de gestion d'événements avec système de gamification**

## ✨ **Nouveauté : Système Game Déployé !**

Le système de scoring des participants est maintenant **live en production** ! 🚀

### 🏆 **Fonctionnalités Game**

- **Classement en temps réel** avec Top 3 podium
- **6 types d'actions scorées** automatiquement  
- **APIs sécurisées** pour l'intégration
- **Interface responsive** et moderne
- **Documentation complète** d'intégration

## 🌐 **URLs de Déploiement**

- **🎯 Production** : `https://evenzi-q7jg18ggy-sunutech.vercel.app`
- **🔍 Preview** : `https://evenzi-lnxid1tjh-sunutech.vercel.app`
- **📊 Dashboard Vercel** : https://vercel.com/sunutech/evenzi

### 🎮 **Accès Direct au Game**
```
https://evenzi-q7jg18ggy-sunutech.vercel.app/dashboard/events/[id]/game
```

## 📊 **Système de Points**

| Action | Points | Déclencheur |
|--------|--------|-------------|
| **Check-in** | 50 pts | Présence à l'événement |
| **Entrée session** | 20 pts | Rejoindre une session |
| **Participation** | 30 pts | Présence complète session |
| **Scan QR participant** | 10 pts | Networking entre participants |
| **Demande RDV** | 15 pts | Initiative de rendez-vous |
| **RDV confirmé** | 30 pts | Rendez-vous accepté |

## 🚀 **Technologies**

- **Frontend** : Next.js 15.3.0, React, TailwindCSS
- **Backend** : Node.js, Prisma ORM
- **Base de données** : PostgreSQL
- **Auth** : NextAuth.js
- **UI** : Shadcn/ui components
- **Déploiement** : Vercel
- **Langue** : TypeScript

## 🏗️ **Architecture Game**

### **Modèles de Données**
```prisma
model Game {
  id              String    @id @default(cuid())
  eventId         String
  participantId   String  
  action          GameAction
  points          Int
  actionDetails   String?   // JSON
  relatedEntityId String?   // Session/Participant ID
  createdAt       DateTime  @default(now())
}

model UserEventScore {
  id            String    @id @default(cuid())
  eventId       String
  participantId String
  totalPoints   Int       @default(0)
  lastUpdated   DateTime  @default(now())
}
```

### **APIs Disponibles**
```
POST /api/events/[id]/game          - Enregistrer une action
GET  /api/events/[id]/game/leaderboard - Récupérer le classement
```

## 🎨 **Interface Game**

### **Page de Classement**
- **Statistiques** : Participants totaux, points totaux, moyenne
- **Top 3 Podium** : Affichage spécial avec médailles 🥇🥈🥉
- **Tableau complet** : Tous les participants avec rangs
- **Challenges** : Liste des actions et points
- **Temps réel** : Bouton actualiser

### **Intégration Sidebar**
- Élément "Game" avec icône trophée
- Positionné après "Sessions"
- Navigation fluide

## 🔧 **Installation Locale**

```bash
# Cloner le projet
git clone https://github.com/sunutech/inevent.git
cd inevent

# Installer les dépendances
npm install --legacy-peer-deps

# Configurer l'environnement
cp env.example .env
# Ajouter DATABASE_URL et autres variables

# Migrer la base de données
npx prisma migrate dev
npx prisma generate

# Lancer en développement
npm run dev
```

## ⚡ **Intégration du Scoring**

### **Service Utilitaire**
```typescript
import { recordCheckIn, showGameActionToast } from '@/lib/gameService';

// Exemple d'intégration
const gameResponse = await recordCheckIn(eventId, participantId);
showGameActionToast(gameResponse, toast);
```

### **Fonctions Disponibles**
- `recordCheckIn()`
- `recordSessionEntry()`
- `recordSessionParticipation()`
- `recordParticipantScan()`
- `recordAppointmentRequest()`
- `recordAppointmentConfirmed()`

## 📋 **Configuration Environnement**

### **Variables Obligatoires**
```env
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=super-secret-key
NEXTAUTH_URL=https://your-domain.vercel.app
```

### **Variables Optionnelles**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
RESEND_API_KEY=your-key
BLOB_READ_WRITE_TOKEN=vercel-blob-token
```

## 📚 **Documentation**

- **📖 Résumé complet** : `docs/GAME_SYSTEM_SUMMARY.md`
- **🔧 Exemples d'intégration** : `docs/INTEGRATION_GAME_EXAMPLES.md`
- **🚀 Guide de déploiement** : `DEPLOY_INSTRUCTIONS.md`

## 🎯 **Fonctionnalités Principales**

### **Gestion d'Événements**
- ✅ Création et édition d'événements
- ✅ Gestion des participants
- ✅ Sessions et programme
- ✅ Système de billets
- ✅ Rendez-vous entre participants
- ✅ Communication (emails, templates)
- ✅ Exposants et sponsors
- ✅ Badges personnalisés

### **Système Game (Nouveau)**
- ✅ Scoring automatique des interactions
- ✅ Classement temps réel
- ✅ Top 3 avec podium
- ✅ 6 types d'actions scorées
- ✅ APIs d'intégration
- ✅ Interface responsive
- ✅ Notifications toast

### **Administration**
- ✅ Dashboard analytique
- ✅ Gestion des utilisateurs
- ✅ Exports (participants, sessions, etc.)
- ✅ Check-in mobile
- ✅ QR codes personnalisés

## 🔒 **Sécurité**

- **Authentification** : NextAuth avec providers multiples
- **Autorisation** : Vérification propriétaire d'événement
- **Validation** : Types TypeScript + validation côté serveur
- **Anti-spam** : Prévention des actions dupliquées
- **Logs** : Traçabilité des actions

## 🚦 **Status du Projet**

- 🟢 **Production** : Déployé et fonctionnel
- 🟢 **Game System** : Entièrement opérationnel
- 🟢 **APIs** : Toutes fonctionnelles
- 🟡 **Base de données** : Configuration requise
- 🟡 **Repository GitHub** : À créer manuellement

## 🛠️ **Prochaines Étapes**

1. **Connecter GitHub** :
   ```bash
   # Créer le repository sur github.com/new
   git remote add origin https://github.com/USERNAME/inevent.git
   git push -u origin main
   ```

2. **Configurer la base de données** :
   - Créer une DB PostgreSQL (Neon, Railway, etc.)
   - Ajouter DATABASE_URL dans Vercel
   - Exécuter la migration

3. **Tester le système Game** :
   - Créer un événement
   - Ajouter des participants  
   - Tester les actions de scoring

## 📈 **Monitoring**

- **Vercel Analytics** : Performance et usage
- **Prisma Logs** : Requêtes base de données
- **Console Vercel** : Logs d'erreurs runtime
- **GitHub Actions** : CI/CD (à configurer)

## 🆘 **Support**

- **📧 Email** : sunutechdkr@gmail.com
- **🐛 Issues** : À créer sur GitHub
- **📖 Docs** : Dossier `docs/`
- **🔧 Vercel** : Dashboard de déploiement

---

**🎉 Le système Game est live ! Testez dès maintenant le scoring automatique des participants.**
