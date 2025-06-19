# 🔐 Configuration GitHub pour InEvent

## 📋 Étapes de déploiement

### 1. Créer un Personal Access Token GitHub

1. **Connectez-vous sur GitHub** avec le compte `sunutechdkr`
2. **Allez dans Settings** : https://github.com/settings/tokens
3. **Cliquez sur "Generate new token"** → "Generate new token (classic)"
4. **Configurez le token** :
   - **Note** : `InEvent Deployment Token`
   - **Expiration** : `No expiration` (ou 1 an)
   - **Scopes** : Cochez `repo` (Full control of private repositories)
5. **Générez le token** et **COPIEZ-LE** (vous ne pourrez plus le voir après)

### 2. Déployer vers GitHub

Utilisez une de ces méthodes :

#### Option A: Script automatique
```bash
./deploy-to-github.sh
```

#### Option B: Commandes manuelles
```bash
git add -A
git commit -m "🚀 Deploy InEvent to GitHub"
git push origin main
```

**Lors du push, entrez :**
- **Username** : `sunutechdkr`
- **Password** : `[Votre Personal Access Token]` (PAS votre mot de passe)

### 3. Vérification

Une fois le push réussi, votre code sera disponible sur :
🔗 https://github.com/sunutechdkr/ineventapp

## 🚀 Prochaines étapes

1. **Déploiement Vercel** : https://vercel.com/new
2. **Base de données Neon** : Configurer la connexion
3. **Variables d'environnement** : Copier depuis `.env.local`
4. **Domaine personnalisé** : Configurer si nécessaire

## ❓ Dépannage

### Erreur "Permission denied"
- Vérifiez que vous utilisez le bon username : `sunutechdkr`
- Utilisez un Personal Access Token, pas votre mot de passe
- Vérifiez que le token a les permissions `repo`

### Erreur "Invalid username or password"
- Le token a peut-être expiré, créez-en un nouveau
- Vérifiez que vous avez bien copié le token complet

### Cache d'authentification
```bash
# Nettoyer le cache sur macOS
security delete-internet-password -s github.com
```

---
**💡 Astuce** : Sauvegardez votre token dans un endroit sûr pour les futurs déploiements ! 