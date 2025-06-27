# Configuration des variables d'environnement Vercel

## Variables à configurer sur Vercel

Allez dans **Vercel Dashboard > Settings > Environment Variables** et ajoutez :

### 1. Base de données (REQUIS)
```
DATABASE_URL=postgresql://evenzidb_owner:npg_VJcy5KEhL7dH@ep-super-recipe-abg04byi-pooler.eu-west-2.aws.neon.tech/evenzidb?sslmode=require&channel_binding=require
```

### 2. Authentification (REQUIS)
```
NEXTAUTH_SECRET=0hO1VulyL8DndvDbIJxSrLkTKPteb86ngkYJVIZhYrQ=
NEXTAUTH_URL=https://evenzi-1yzgfg8vb-sunutech.vercel.app
```

### 3. Email (REQUIS)
```
RESEND_API_KEY=re_2Jrgrb7b_KqwFXYiZ6YjBphipxRAFpntG
EMAIL_FROM=noreply@inevent.app
```

### 4. Environnement
```
NODE_ENV=production
```

## Vérification après déploiement

1. **Tester la connexion à la base de données** : Aller sur `/dashboard/events/[id]/billets`
2. **Créer un billet de test** : Utiliser le formulaire de création
3. **Vérifier les APIs** : Tester CRUD complet
4. **Consulter les logs** : Vérifier qu'il n'y a pas d'erreurs

## Commandes utiles

```bash
# Vérifier la connexion à la base de données
npx prisma db pull

# Appliquer le schema en production (si nécessaire)
npx prisma db push

# Voir les logs Vercel
vercel logs
```

## Fonctionnalités activées

✅ **Table tickets** créée dans PostgreSQL Neon
✅ **APIs CRUD** pour les billets
✅ **Interface utilisateur** complète
✅ **Statistiques** intégrées
✅ **Notifications** en temps réel
✅ **Click-to-edit** fonctionnel
✅ **Validation** côté client et serveur 