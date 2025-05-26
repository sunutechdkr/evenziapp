# Actions en Masse sur les Événements

## Vue d'ensemble

Le système d'actions en masse permet aux utilisateurs autorisés (ADMIN et ORGANIZER) d'effectuer des opérations groupées sur plusieurs événements simultanément.

## Fonctionnalités

### Actions Disponibles

1. **Archivage** (`archive`)
   - Archive les événements sélectionnés
   - Les événements archivés ne sont plus visibles par défaut
   - Définit `archived = true` et `archivedAt = timestamp`

2. **Désarchivage** (`unarchive`) 
   - Désarchive les événements sélectionnés
   - Les événements redeviennent visibles et actifs
   - Définit `archived = false` et `archivedAt = null`

3. **Suppression** (`delete`)
   - Supprime définitivement les événements sélectionnés
   - **Protection** : Impossible de supprimer des événements avec des inscriptions actives
   - Action irréversible

### Permissions

- **ADMIN** : Peut effectuer toutes les actions sur tous les événements
- **ORGANIZER** : Peut effectuer toutes les actions sur ses propres événements uniquement
- **Autres rôles** : Aucun accès aux actions en masse

## API

### `POST /api/events/bulk-actions`

**Paramètres :**
```json
{
  "action": "archive|unarchive|delete",
  "eventIds": ["id1", "id2", "id3"]
}
```

**Réponse de succès :**
```json
{
  "success": true,
  "action": "archive",
  "affectedCount": 3,
  "message": "3 événement(s) archivé(s) avec succès"
}
```

**Erreurs possibles :**
- `401` : Non authentifié
- `403` : Permissions insuffisantes
- `400` : Action invalide ou événements avec inscriptions actives
- `404` : Événements non trouvés

### `GET /api/events`

**Nouveaux paramètres de requête :**
- `includeArchived=true` : Inclut les événements archivés
- `onlyArchived=true` : Affiche uniquement les événements archivés

**Par défaut** : Seuls les événements actifs (non archivés) sont retournés.

## Interface Utilisateur

### Sélection Multiple
- Cases à cocher pour sélectionner individuellement les événements
- Case "Tout sélectionner" dans l'en-tête du tableau
- Compteur des éléments sélectionnés

### Barre d'Actions
- Apparaît automatiquement quand des événements sont sélectionnés
- Boutons dynamiques selon le type d'événements sélectionnés :
  - **Archiver** : Disponible si des événements actifs sont sélectionnés
  - **Désarchiver** : Disponible si des événements archivés sont sélectionnés
  - **Supprimer** : Toujours disponible (avec vérifications côté serveur)

### Modales de Confirmation
- Confirmation obligatoire avant chaque action
- Aperçu des événements concernés
- Messages d'avertissement spécifiques selon l'action
- Indicateur de chargement pendant l'opération

### Filtrage par Statut d'Archivage
- Bouton pour basculer entre événements actifs et archivés
- Compteur des événements archivés
- Indicateurs visuels pour les événements archivés

## Sécurité

### Vérifications d'Autorisation
1. Authentification requise (session NextAuth)
2. Vérification du rôle utilisateur (ADMIN/ORGANIZER)
3. Vérification de propriété des événements (sauf ADMIN)
4. Validation de l'existence des événements

### Protection des Données
- Vérification des inscriptions avant suppression
- Journalisation des actions effectuées
- Transactions atomiques pour les opérations en masse

## Schema de Base de Données

### Nouveaux Champs Event
```prisma
model Event {
  // ... champs existants
  archived     Boolean   @default(false) @map("archived")
  archivedAt   DateTime? @map("archived_at")
}
```

### Migration
```sql
-- Migration: 20250525140621_add_archived_fields_to_events
ALTER TABLE "events" ADD COLUMN "archived" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "events" ADD COLUMN "archived_at" TIMESTAMP(3);
```

## Utilisation

1. **Naviguer** vers la page des événements (`/dashboard/events`)
2. **Sélectionner** un ou plusieurs événements via les cases à cocher
3. **Choisir** une action dans la barre d'actions qui apparaît
4. **Confirmer** l'action dans la modale de confirmation
5. **Attendre** la confirmation de succès

## Tests

Le système a été testé avec :
- ✅ Archivage et désarchivage d'événements
- ✅ Vérification des permissions utilisateur
- ✅ Protection contre la suppression d'événements avec inscriptions
- ✅ Filtrage par statut d'archivage
- ✅ Interface utilisateur responsive avec modales

## Support

Pour toute question ou problème, consultez les logs serveur ou contactez l'équipe de développement. 