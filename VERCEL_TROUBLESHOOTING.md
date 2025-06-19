# 🚨 Guide de Dépannage Vercel - InEvent

## ✅ Problème résolu : Conflit de dépendances

### 🔍 Problème identifié
```
npm error ERESOLVE could not resolve
npm error While resolving: react-day-picker@8.10.1
npm error Found: date-fns@4.1.0
npm error Could not resolve dependency:
npm error peer date-fns@"^2.28.0 || ^3.0.0" from react-day-picker@8.10.1
```

### ✅ Solution appliquée
1. **Downgrade date-fns** de `^4.1.0` vers `^3.6.0`
2. **Ajout d'overrides** dans `package.json`
3. **Création de `.npmrc`** avec `legacy-peer-deps=true`

### 📋 Fichiers modifiés
- ✅ `package.json` - date-fns downgraded + overrides
- ✅ `.npmrc` - configuration pour les peer dependencies

---

## 🔧 Autres problèmes courants sur Vercel

### 1. Build timeout
**Symptôme** : Build qui dépasse 45 minutes
**Solution** :
```json
// vercel.json
{
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/node",
      "config": { "maxLambdaSize": "50mb" }
    }
  ]
}
```

### 2. Variables d'environnement manquantes
**Symptôme** : Erreurs de connexion DB ou API
**Solution** :
1. Vercel Dashboard > Settings > Environment Variables
2. Ajouter toutes les variables de `env.vercel.example`

### 3. Base de données non accessible
**Symptôme** : `Can't reach database server`
**Solution** :
- Vérifier DATABASE_URL dans les variables Vercel
- S'assurer que Neon autorise les connexions externes

### 4. NextAuth errors
**Symptôme** : Erreurs d'authentification
**Solution** :
- Vérifier NEXTAUTH_SECRET
- Mettre à jour NEXTAUTH_URL avec l'URL Vercel

### 5. Image upload fails
**Symptôme** : Upload d'images échoue
**Solution** :
- Configurer Cloudinary ou autre service
- Ajouter les clés API dans Vercel

---

## 📊 Monitoring du déploiement

### Vérifier le statut
1. **Vercel Dashboard** : https://vercel.com/dashboard
2. **Build logs** : Cliquer sur le déploiement pour voir les logs
3. **Function logs** : Runtime errors pendant l'exécution

### Commandes utiles
```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer manuellement
vercel --prod

# Voir les logs en temps réel
vercel logs --follow

# Lister les déploiements
vercel ls
```

---

## ✅ Checklist post-déploiement

- [ ] ✅ Build réussi sans erreurs
- [ ] 🗄️ Base de données connectée (test de connexion)
- [ ] 🔐 Authentification fonctionne
- [ ] 📧 Envoi d'emails fonctionne
- [ ] 📱 Interface responsive
- [ ] 🖼️ Upload d'images fonctionne
- [ ] 🎯 Création d'événements fonctionne

---

## 🔗 Liens utiles

- **Vercel Docs** : https://vercel.com/docs
- **Next.js Deployment** : https://nextjs.org/docs/deployment
- **Prisma + Vercel** : https://www.prisma.io/docs/guides/deployment/deploying-to-vercel
- **NextAuth + Vercel** : https://next-auth.js.org/deployment/vercel

---

## 🎉 Statut actuel

**✅ PROBLÈME RÉSOLU** : Conflit de dépendances corrigé
**🚀 PRÊT** : Nouveau déploiement en cours sur Vercel

Le déploiement devrait maintenant fonctionner correctement ! 