# Configuration de la base de données pour les Billets

## Instructions pour configurer la table `tickets` en production

### 1. Mettre à jour les variables d'environnement sur Vercel

Assurez-vous que `DATABASE_URL` est correctement configurée dans Vercel avec les bonnes credentials Neon :

```bash
DATABASE_URL="postgresql://username:password@ep-xxx.neon.tech/database?sslmode=require"
```

### 2. Appliquer le schema Prisma

Une fois les credentials correctes configurées, exécutez :

```bash
# Pousser le schema directement (recommandé pour Neon)
npx prisma db push

# OU créer une migration (optionnel)
npx prisma migrate deploy
```

### 3. Vérifier la table créée

La table `tickets` sera créée avec la structure suivante :

```sql
CREATE TABLE tickets (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL DEFAULT 0,
  quantity INTEGER, -- null = illimité
  sold INTEGER DEFAULT 0,
  status TEXT DEFAULT 'ACTIVE', -- ACTIVE, TERMINATED, DRAFT
  visibility TEXT DEFAULT 'VISIBLE', -- VISIBLE, HIDDEN
  valid_from TIMESTAMP NOT NULL,
  valid_until TIMESTAMP NOT NULL,
  "group" TEXT DEFAULT 'Attendees',
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 4. Test des APIs

Les endpoints suivants sont disponibles :

- `GET /api/events/[id]/tickets` - Liste des billets
- `POST /api/events/[id]/tickets` - Créer un billet
- `GET /api/events/[id]/tickets/[ticketId]` - Détails d'un billet
- `PUT /api/events/[id]/tickets/[ticketId]` - Modifier un billet
- `DELETE /api/events/[id]/tickets/[ticketId]` - Supprimer un billet

### 5. Fonctionnalités implémentées

✅ **CRUD complet** - Créer, lire, modifier, supprimer
✅ **Interface utilisateur** - Table avec statistiques et actions
✅ **Formulaires** - Création et modification avec validation
✅ **Click-to-edit** - Clic sur une ligne pour éditer
✅ **Statistiques** - Intégration dans la page analytique
✅ **Notifications** - Toast de succès/erreur
✅ **Responsive** - Design mobile et desktop
✅ **Brand colors** - Cohérence avec #81B441
✅ **Fallback demo** - Données de test si DB non disponible

### 6. Mode démo

En cas de problème avec la base de données, l'application fonctionne en mode démo avec des données simulées et affiche "(Mode démo)" dans les notifications de succès.

### 7. Structure des données

```typescript
type Ticket = {
  id: string;
  name: string;
  status: 'ACTIVE' | 'TERMINATED' | 'DRAFT';
  price: number;
  usage: string; // Format: "vendu/limite" ou "vendu/Illimité"
  validFrom: Date;
  validUntil: Date;
  group: string;
  visibility: 'VISIBLE' | 'HIDDEN';
  description?: string;
  quantity?: string;
  sold?: number;
};
``` 