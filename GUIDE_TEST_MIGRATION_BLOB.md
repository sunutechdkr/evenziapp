# 🧪 Guide de Test et Migration Vercel Blob

## 🎯 Phase 1 : Test des Avatars (EN COURS)

### ✅ Configuration actuelle
- **Statut** : Blob ACTIF
- **Types migrés** : `avatar`
- **Serveur local** : http://localhost:3000

### 🧪 Tests à effectuer

#### 1. Test Upload Avatar
```bash
# 1. Ouvrir l'application
open http://localhost:3000/dashboard/profile

# 2. Se connecter et aller sur le profil
# 3. Tester l'upload d'avatar
# 4. Vérifier dans les outils de développement (Console) :
#    - Rechercher des logs mentionnant "Blob"
#    - L'URL de l'image devrait contenir "vercel-storage.com"
```

#### 2. Vérification technique
```bash
# Vérifier le statut
node scripts/test-blob-status.js

# Surveiller les logs en temps réel
tail -f .next/server.log  # Si disponible
```

#### 3. Test de rollback (sécurité)
```bash
# Désactiver temporairement Blob
node scripts/toggle-blob.js off

# Tester l'upload (devrait utiliser le stockage local)
# Réactiver Blob
node scripts/toggle-blob.js on
```

---

## 🚀 Phase 2 : Migration des Sponsors

### Préparation
```bash
# 1. Vérifier que les avatars fonctionnent bien
node scripts/test-blob-status.js

# 2. Migrer les sponsors
node scripts/toggle-blob.js sponsors
```

### 🧪 Tests Sponsors
```bash
# 1. Aller sur la gestion des sponsors
open http://localhost:3000/dashboard/events/[ID_EVENT]/sponsors

# 2. Tests à effectuer :
# - Ajouter un nouveau sponsor avec logo
# - Modifier un sponsor existant
# - Vérifier l'affichage public du sponsor
```

### 🔍 Points de vérification
- [ ] Upload de logo sponsor fonctionne
- [ ] Affichage correct sur la page événement
- [ ] URLs utilisent Vercel Blob (vercel-storage.com)
- [ ] Pas d'erreurs dans la console

---

## 🚀 Phase 3 : Migration des Images Générales

### Préparation
```bash
# 1. Vérifier avatars + sponsors OK
node scripts/test-blob-status.js

# 2. Migration complète
node scripts/toggle-blob.js images
# OU migration de tous les types
node scripts/toggle-blob.js all
```

### 🧪 Tests Images
```bash
# Tests dans différentes sections :
# 1. Images d'événements
open http://localhost:3000/dashboard/events/[ID_EVENT]/edit

# 2. Autres uploads d'images
# - Bannières d'événements
# - Images dans les communications
# - Toute autre section avec upload d'image
```

---

## 📊 Monitoring et Vérification

### 🔧 Commandes utiles
```bash
# Statut complet
node scripts/test-blob-status.js

# Changer la configuration
node scripts/toggle-blob.js status          # Voir le statut
node scripts/toggle-blob.js on              # Activer complètement
node scripts/toggle-blob.js off             # Désactiver complètement
node scripts/toggle-blob.js avatar          # Avatars seulement
node scripts/toggle-blob.js sponsors        # + Sponsors
node scripts/toggle-blob.js images          # + Images générales
node scripts/toggle-blob.js all             # Tout migrer
```

### 🏷️ Variables d'environnement
```bash
# Configuration actuelle dans .env.local
NEXT_PUBLIC_USE_BLOB_STORAGE="true"         # Active/Désactive Blob
BLOB_MIGRATION_TYPES="avatar"               # Types migrés
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..."  # Token d'accès
```

---

## 🚨 Plan de Rollback d'Urgence

### En cas de problème
```bash
# 1. Rollback immédiat
node scripts/toggle-blob.js off

# 2. Vérifier que l'application fonctionne
curl -s http://localhost:3000/api/user/profile

# 3. Redémarrer le serveur si nécessaire
npm run dev
```

### Rollback sélectif par type
```bash
# Revenir aux avatars seulement
node scripts/toggle-blob.js avatar

# Revenir au stockage local complet
node scripts/toggle-blob.js off
```

---

## 📈 Métriques de Succès

### ✅ Critères de validation
- [ ] **Performance** : Upload plus rapide qu'avant
- [ ] **Fiabilité** : Aucune erreur d'upload
- [ ] **Affichage** : Images se chargent correctement
- [ ] **URLs** : Contiennent "vercel-storage.com"
- [ ] **Rollback** : Fonctionne sans problème

### 📊 Monitoring production
```bash
# Vérifier les métriques Vercel
# 1. Aller sur dashboard.vercel.com
# 2. Projet "evenzi"
# 3. Onglet "Storage" > "Blob"
# 4. Surveiller l'utilisation et les coûts
```

---

## 🎯 Planning de Migration Recommandé

### Jour 1 : Phase 1 (Avatars)
- ✅ Tests locaux avatars
- ✅ Vérification production
- ✅ Monitoring 24h

### Jour 2 : Phase 2 (+ Sponsors)
- 🔄 Migration sponsors
- 🔄 Tests complets
- 🔄 Validation utilisateurs

### Jour 3 : Phase 3 (+ Images)
- 🔄 Migration complète
- 🔄 Tests de charge
- 🔄 Optimisation

### Jour 4-7 : Monitoring
- 🔄 Surveillance métriques
- 🔄 Feedback utilisateurs
- 🔄 Ajustements si nécessaire

---

## 🛠️ Dépannage

### Problèmes courants
```bash
# Upload échoue
1. Vérifier le token Blob
2. Contrôler les permissions
3. Tester le rollback

# Images ne s'affichent pas
1. Vérifier les URLs générées
2. Contrôler les CORS
3. Tester en navigation privée

# Performance dégradée
1. Surveiller les métriques Vercel
2. Vérifier la taille des fichiers
3. Optimiser si nécessaire
```

### Support
- 📚 [Documentation Vercel Blob](https://vercel.com/docs/storage/vercel-blob)
- 🔧 Logs : `.next/server.log`
- 🐛 Debug : Variables d'environnement dans la console 