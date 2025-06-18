# Index des Sauvegardes - Projet InEvent

## Sauvegardes Disponibles

### 📦 **backup_20250615_172003** - 15 janvier 2025, 17:20:03
**Taille** : Calculée après compression  
**État** : ✅ Modal de création de templates perfectionné avec design brand  

#### Contenu de cette sauvegarde :
- **Nouvelles fonctionnalités** :
  - Modal de création de templates aux couleurs brand (#81B441)
  - Formulaire sans bordures avec champs "Cible" (Participants, Exposants, Speakers, Autres)
  - Tous les boutons "Créer un email" et "Nouvelle campagne" connectés au modal
  - Interface de communication avec 4 sections organisées et templates cliquables
  - API POST complète pour création de templates avec redirection automatique

- **Améliorations UX/UI** :
  - Suppression de toutes les bordures des formulaires
  - Focus vert brand sur les champs
  - Suppression des icônes d'œil pour interface épurée
  - Indicateurs visuels colorés pour le statut des templates
  - Design responsive et moderne

- **Corrections techniques** :
  - Nettoyage complet du code (imports, variables non utilisées)
  - Correction de toutes les erreurs de linting
  - Optimisation des composants React
  - Mapping intelligent des cibles vers catégories techniques

### 📦 **backup_20250610_234932** - 10 janvier 2025, 23:49:32
**Taille** : 15 MB (compressé)  
**État** : ✅ Système de communication email complet  

#### Contenu de cette sauvegarde :
- **Fonctionnalités principales** :
  - Système de communication email avancé avec catégories
  - Interface d'édition de templates avec aperçu temps réel  
  - Gestion des campagnes et programmation d'envois
  - Système d'activation/désactivation des templates
  - Interface utilisateur entièrement francisée

- **Corrections récentes** :
  - Suppression des icônes d'œil non utilisées
  - Correction de tous les erreurs de linting
  - Blocs de templates entièrement cliquables
  - Optimisations techniques et nettoyage du code

- **Fichiers inclus** :
  - `src/` - Code source complet
  - `prisma/` - Schémas de base de données
  - `public/` - Assets statiques
  - Fichiers de configuration (package.json, tsconfig.json, etc.)

#### Technologies et versions :
- Next.js 15.3.0
- TypeScript
- Prisma ORM
- PostgreSQL
- Tailwind CSS
- shadcn/ui
- Resend (service email)

#### Instructions de restauration :
```bash
# Extraire la sauvegarde
tar -xzf backup_20250610_234932.tar.gz

# Installer les dépendances
cd backup_20250610_234932
npm install

# Configurer l'environnement
cp .env.local.example .env.local
# Éditer .env.local avec vos variables

# Migrer la base de données
npx prisma migrate dev

# Lancer l'application
npm run dev
```

---

## Instructions Générales

### Structure des sauvegardes
Chaque sauvegarde contient :
- **Dossier décompressé** : `backup_YYYYMMDD_HHMMSS/`
- **Archive compressée** : `backup_YYYYMMDD_HHMMSS.tar.gz`
- **Documentation** : `BACKUP_INFO.md` dans chaque sauvegarde

### Nomenclature
- Format : `backup_YYYYMMDD_HHMMSS`
- Exemple : `backup_20250610_234932` = 10 janvier 2025, 23h49m32s

### Commandes utiles
```bash
# Lister toutes les sauvegardes
ls -la backups/

# Voir la taille des archives
du -sh backups/*.tar.gz

# Extraire une sauvegarde spécifique
tar -xzf backups/backup_YYYYMMDD_HHMMSS.tar.gz

# Créer une nouvelle sauvegarde manuelle
./create_backup.sh
```

### Notes importantes
- ⚠️ **Toujours vérifier les variables d'environnement** avant de restaurer
- ⚠️ **Sauvegarder séparément la base de données** avec `pg_dump`
- ✅ **Chaque sauvegarde est autonome** et contient tout le code nécessaire
- ✅ **Documentation détaillée** incluse dans chaque sauvegarde

---

*Index mis à jour automatiquement le 10 janvier 2025 à 23:50* 

---

**Dernière mise à jour** : 15 janvier 2025, 17:20:03 