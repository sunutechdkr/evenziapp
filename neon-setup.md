# 🗄️ Configuration Neon Database pour Evenzi App

## Base de données: evenzidbapp

### 1. Création de la base de données

1. **Connectez-vous à Neon Console**
   - Allez sur [console.neon.tech](https://console.neon.tech/)
   - Créez un compte ou connectez-vous

2. **Créer un nouveau projet**
   - Cliquez sur "Create Project"
   - Nom du projet: **evenzidbapp**
   - Région: **US East (Virginia)** (recommandé pour Vercel)
   - PostgreSQL version: **16**

3. **Récupérer l'URL de connexion**
   - Copiez l'URL de connexion qui ressemble à :
   ```
   postgresql://username:password@ep-xxxxx.us-east-1.aws.neon.tech/evenzidbapp?sslmode=require
   ```

### 2. Configuration des variables d'environnement

Ajoutez ces variables dans Vercel :

```bash
# Base de données Neon
DATABASE_URL="postgresql://username:password@ep-xxxxx.us-east-1.aws.neon.tech/evenzidbapp?sslmode=require"

# Configuration Prisma
PRISMA_GENERATE_DATAPROXY="true"
```

### 3. Migration de la base de données

Une fois la base créée, exécutez les migrations :

```bash
# Installer les dépendances
npm install --legacy-peer-deps

# Exécuter les migrations
npx prisma migrate deploy

# Générer le client Prisma
npx prisma generate
```

### 4. Vérification de la connexion

Testez la connexion avec :

```bash
npx prisma db pull
```

### 5. Structure de la base de données

La base de données contiendra les tables suivantes :
- `users` - Utilisateurs de l'application
- `events` - Événements créés
- `registrations` - Inscriptions aux événements
- `tickets` - Billets d'entrée
- `sponsors` - Sponsors des événements
- `event_sessions` - Sessions des événements
- `appointments` - Rendez-vous entre participants
- `badges` - Badges des participants
- `games` - Système de gamification
- Et bien d'autres...

### 6. Monitoring et maintenance

- **Dashboard Neon**: Surveillez les performances
- **Logs**: Consultez les logs de requêtes
- **Backups**: Automatiques avec Neon
- **Scaling**: Auto-scaling selon l'usage

### 7. Sécurité

- ✅ SSL/TLS activé par défaut
- ✅ Connexions chiffrées
- ✅ Isolation des données
- ✅ Sauvegardes automatiques
