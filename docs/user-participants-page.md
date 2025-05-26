# Page Participants - Vue Utilisateur

## Aperçu

Nouvelle page permettant aux utilisateurs (USER) de consulter la liste des participants d'un événement auquel ils sont inscrits. Cette page est basée sur la version organisateur mais adaptée pour la consultation seulement, sans les fonctionnalités d'administration.

## Emplacement

- **URL** : `/dashboard/user/events/[id]/participants`
- **Fichier** : `src/app/dashboard/user/events/[id]/participants/page.tsx`

## Fonctionnalités

### 🔍 **Consultation des Participants**
- Liste complète des participants inscrits à l'événement
- Informations affichées :
  - Nom et prénom
  - Email et téléphone
  - Entreprise et fonction
  - Type (Participant, Intervenant, Exposant)
  - Statut d'arrivée (Arrivé/En attente)
  - Date d'inscription

### 🔎 **Filtres et Recherche**
- **Recherche textuelle** : Par nom, email ou entreprise
- **Filtre par type** : Tous, Participants, Intervenants, Exposants
- **Filtre par statut** : Tous, Arrivés, Non arrivés

### 📊 **Statistiques Rapides**
- Nombre total de participants
- Nombre de participants arrivés
- Affichage en temps réel

### 📱 **Interface Responsive**
- Tableau adaptatif pour mobile et desktop
- Sidebar collapsible
- Navigation intuitive

## Interface Utilisateur

### 📋 **Tableau Principal**
```
┌─────────────────────────────────────────────────────────────┐
│ Participants (XX) - Statistiques Rapides                   │
├─────────────────────────────────────────────────────────────┤
│ 🔍 Recherche + Filtres (Type, Statut)                      │
├─────────────────────────────────────────────────────────────┤
│ Avatar | Nom | Contact | Entreprise | Type | Statut | Date  │
│   BD   | ... |   ...   |    ...     | ... |  ...   | ...   │
│   BT   | ... |   ...   |    ...     | ... |  ...   | ...   │
└─────────────────────────────────────────────────────────────┘
```

### 🔍 **Sidebar de Détail**
Quand un utilisateur clique sur un participant :

```
┌─────────────────────────────┐
│ Détails du participant      │
├─────────────────────────────┤
│      Avatar + Nom           │
│                             │
│ 📧 Informations             │
│ ├─ Email                    │
│ ├─ Téléphone                │
│ ├─ Fonction                 │
│ └─ Entreprise               │
│                             │
│ 📅 Inscription              │
│ ├─ Date d'inscription       │
│ └─ Statut d'arrivée         │
│                             │
│ ┌─────────────────────────┐ │
│ │ 💬 Discuter             │ │
│ └─────────────────────────┘ │
│ ┌─────────────────────────┐ │
│ │ 📅 Prendre RV           │ │
│ └─────────────────────────┘ │
└─────────────────────────────┘
```

## Actions Disponibles

### 👥 **Actions sur les Participants**
- **Voir détails** : Ouvre la sidebar avec les informations complètes
- **Discuter** : Fonction de chat/messagerie (à implémenter)
- **Prendre RV** : Planification de rendez-vous (à implémenter)

### 🚫 **Actions NON Disponibles (vs Organisateur)**
- ❌ Ajouter/Supprimer des participants
- ❌ Modifier les informations
- ❌ Enregistrer l'arrivée (check-in)
- ❌ Exporter les données
- ❌ Voir les badges
- ❌ Actions bulk (sélection multiple)

## Architecture Technique

### 🏗️ **Structure du Composant**
```typescript
UserEventParticipantsPage({
  params: { id: string }
}) : ReactComponent
```

### 🔗 **API Utilisée**
- **Endpoint** : `GET /api/events/[id]/registrations`
- **Authentification** : Session requise
- **Permissions** : Accès pour les utilisateurs inscrits

### 🎨 **Composants UI**
- `UserEventSidebar` : Navigation latérale
- `Table`, `TableHeader`, `TableBody` : Tableau de données
- `Avatar`, `Badge` : Éléments visuels
- `Input`, `Select` : Filtres et recherche
- `Button` : Actions et navigation
- `Card` : Sections d'informations

### 📱 **Responsive Design**
- **Desktop** : Tableau complet avec sidebar
- **Mobile** : Interface adaptée, sidebar overlay
- **Transitions** : Animations fluides

## Navigation

### 🔄 **Intégration dans le Sidebar**
Le lien "Participants" est déjà présent dans `UserEventSidebar` :
```typescript
{
  name: "Participants", 
  href: `${baseUrl}/participants`, 
  icon: UserGroupIcon,
}
```

### 🔗 **Liens de Navigation**
- **Retour à l'événement** : `/dashboard/user/events/[id]`
- **Sidebar active** : Onglet "Participants" surligné

## Différences avec la Version Organisateur

| Fonctionnalité | Organisateur | Utilisateur |
|----------------|--------------|-------------|
| **Consultation** | ✅ | ✅ |
| **Filtres/Recherche** | ✅ | ✅ |
| **Détails participant** | ✅ | ✅ |
| **Ajout/Suppression** | ✅ | ❌ |
| **Modification** | ✅ | ❌ |
| **Check-in/Check-out** | ✅ | ❌ |
| **Export données** | ✅ | ❌ |
| **Gestion badges** | ✅ | ❌ |
| **Actions bulk** | ✅ | ❌ |
| **Actions sociales** | ❌ | ✅ |

## Sécurité

### 🔐 **Contrôle d'Accès**
- Authentification obligatoire via NextAuth
- Vérification de l'inscription à l'événement
- API sécurisée avec sessions

### 🛡️ **Permissions**
- Consultation uniquement (lecture seule)
- Pas d'accès aux fonctions d'administration
- Protection des données sensibles

## Installation et Configuration

### 📁 **Fichiers Créés**
```
src/app/dashboard/user/events/[id]/participants/
└── page.tsx (nouvelle page)
```

### 🔧 **Modifications Existantes**
- `UserEventSidebar.tsx` : Lien "Participants" déjà présent
- API existante : `/api/events/[id]/registrations`

### ✅ **Prêt à l'Utilisation**
La page est fonctionnelle et accessible via :
`http://localhost:3000/dashboard/user/events/[id]/participants`

## Fonctionnalités Futures

### 🚀 **Améliorations Prévues**
- **Messagerie** : Implémentation du chat en temps réel
- **Calendrier** : Système de prise de rendez-vous
- **Profils** : Pages de profil détaillées
- **Networking** : Suggestions de contacts
- **Notifications** : Alertes pour nouveaux participants

### 📊 **Analytics**
- Tracking des interactions utilisateur
- Statistiques de networking
- Rapports de participation

## Tests

### 🧪 **Tests d'Accès**
1. Connectez-vous avec un compte utilisateur
2. Allez sur un événement : `/dashboard/user/events/[id]`
3. Cliquez sur "Participants" dans le sidebar
4. Vérifiez l'affichage du tableau et des filtres
5. Cliquez sur un participant pour voir le détail
6. Testez les actions "Discuter" et "Prendre RV"

### ✅ **Validation**
- ✅ Page accessible aux utilisateurs connectés
- ✅ Tableau des participants affiché
- ✅ Filtres fonctionnels
- ✅ Sidebar de détail opérationnelle
- ✅ Actions utilisateur disponibles
- ✅ Interface responsive 