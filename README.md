# Inevent - Système de Gestion d'Événements

Inevent est une application moderne de gestion d'événements construite avec Next.js, permettant aux organisateurs de créer, gérer et suivre leurs événements, ainsi que de faciliter l'enregistrement et le check-in des participants via QR code.

## Fonctionnalités principales

- 🗓️ **Gestion d'événements** : Création, modification et suppression d'événements
- 👥 **Gestion des participants** : Inscription, envoi d'e-mails et gestion des présences
- 📱 **Check-in par QR code** : Système de check-in rapide via scan de QR code
- 📊 **Tableau de bord** : Visualisation des statistiques et métriques clés
- 🖨️ **Badges et certificats** : Génération de badges et certificats personnalisés
- 🔒 **Authentification** : Système d'authentification sécurisé avec NextAuth

## Structure du projet

```
inevent/
├── prisma/                 # Schéma et migrations de base de données
├── public/                 # Fichiers statiques
├── src/
│   ├── app/                # Routes de l'application (Next.js App Router)
│   │   ├── api/            # Routes API
│   │   ├── auth/           # Pages d'authentification
│   │   ├── dashboard/      # Pages du tableau de bord
│   │   │   └── eventslist/ # Page de check-in des participants
│   ├── components/         # Composants réutilisables
│   │   ├── dashboard/      # Composants du tableau de bord
│   │   ├── auth/           # Composants d'authentification
│   │   └── ...            
│   ├── lib/                # Utilitaires et bibliothèques
│   │   └── supabase.ts     # Configuration de Supabase
│   └── types/              # Types et interfaces TypeScript
├── .env                    # Variables d'environnement
├── package.json            # Dépendances et scripts
└── README.md               # Documentation du projet
```

## Technologies utilisées

- **Framework** : Next.js 15
- **Langage** : TypeScript
- **Base de données** : PostgreSQL (via Prisma)
- **Stockage** : Supabase
- **Authentification** : NextAuth.js
- **Style** : CSS Modules et Tailwind CSS
- **Icônes** : Heroicons

## Installation et démarrage

1. Clonez le dépôt :
   ```bash
   git clone https://github.com/votre-utilisateur/inevent.git
   cd inevent
   ```

2. Installez les dépendances :
   ```bash
   npm install
   ```

3. Configurez votre fichier `.env` avec vos propres variables d'environnement.

4. Générez le client Prisma :
   ```bash
   npx prisma generate
   ```

5. Créez et migrez la base de données :
   ```bash
   npx prisma migrate dev --name init
   ```

6. Lancez le serveur de développement :
   ```bash
   npm run dev
   ```

7. Accédez à l'application à l'adresse [http://localhost:3000](http://localhost:3000)

## Configuration de la base de données

Le projet utilise Prisma avec PostgreSQL. Pour configurer votre base de données :

1. Installez PostgreSQL localement ou utilisez un service cloud
2. Mettez à jour l'URL de connexion dans le fichier `.env`
3. Exécutez les migrations avec `npx prisma migrate dev`

## Scripts de sauvegarde et restauration

Le projet dispose de scripts pour faciliter la gestion des versions et le dépannage :

### Sauvegarde

Pour sauvegarder l'état actuel du projet :

```bash
# Avec un nom personnalisé
./scripts/save.sh nom_de_version

# Sans nom (utilisera automatiquement la date actuelle)
./scripts/save.sh
```

### Restauration

Pour restaurer le projet à une version précédente :

```bash
./scripts/restore.sh nom_de_version
```

Cela créera également une branche de sauvegarde avant la restauration, au cas où vous souhaiteriez revenir à l'état précédent.

### Nettoyage

Pour nettoyer l'application en cas de problèmes :

```bash
./scripts/clean.sh
```

Ce script arrête les processus Node.js en cours, supprime les fichiers temporaires et les caches, réinstalle les dépendances et reconstruit l'application.

## Contribuer au projet

1. Forker le projet
2. Créer une branche pour votre fonctionnalité (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Committer vos changements (`git commit -m 'Ajout d'une nouvelle fonctionnalité'`)
4. Pusher sur la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Ouvrir une Pull Request

## Bonnes pratiques de développement

- **Nommage** : Utilisez des noms explicites pour les composants et fonctions
- **Organisation** : Maintenez une séparation claire entre les composants, pages et utilitaires
- **Commentaires** : Ajoutez des commentaires pour expliquer les parties complexes du code
- **TypeScript** : Utilisez correctement les types pour améliorer la maintenabilité
- **Tests** : Écrivez des tests pour les fonctionnalités importantes

## Ressources supplémentaires

- [Documentation Next.js](https://nextjs.org/docs)
- [Documentation Prisma](https://www.prisma.io/docs)
- [Documentation Supabase](https://supabase.io/docs)
- [Documentation NextAuth.js](https://next-auth.js.org/)
