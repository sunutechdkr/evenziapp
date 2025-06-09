# Guide : Affichage des Images dans les Emails

## Problèmes courants d'affichage des images dans les emails

### 1. **Images bloquées par défaut** ⚠️
**Problème :** La plupart des clients email (Gmail, Outlook, Apple Mail) bloquent les images par défaut pour des raisons de sécurité et de confidentialité.

**Solutions :**
- Utiliser du texte alternatif (`alt`) descriptif
- Concevoir des emails qui restent lisibles sans images
- Éduquer les utilisateurs sur le déblocage des images

### 2. **Images base64 trop volumineuses** 📁
**Problème :** Les images encodées en base64 peuvent être refusées par certains clients si elles sont trop grandes.

**Solutions :**
- Limiter la taille à 100KB maximum pour les images base64
- Optimiser les images (compression, dimensions réduites)
- Utiliser des URLs d'images hébergées plutôt que base64 pour les grandes images

### 3. **URLs d'images inaccessibles** 🌐
**Problème :** Images hébergées sur des serveurs locaux, privés ou inaccessibles publiquement.

**Solutions :**
- Héberger les images sur des CDN publics
- Utiliser des services comme Cloudinary, AWS S3, ou Google Cloud Storage
- S'assurer que les URLs sont accessibles via HTTPS

### 4. **Formats d'images non supportés** 🖼️
**Problème :** Certains clients email ne supportent que JPG et PNG.

**Solutions :**
- Convertir les images WebP, SVG en JPG/PNG pour les emails
- Tester sur différents clients email
- Fournir des fallbacks

### 5. **Filtres anti-spam** 🚫
**Problème :** Trop d'images ou des images suspectes peuvent déclencher les filtres anti-spam.

**Solutions :**
- Équilibrer texte et images (ratio 60/40)
- Éviter les images avec du texte intégré
- Utiliser des images pertinentes au contenu

## Solutions implémentées dans InEvent

### Image par défaut optimisée
```typescript
// Image SVG compacte convertie en base64 (400x100px)
const logoBase64 = `data:image/svg+xml;base64,${Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="100" viewBox="0 0 400 100">
    <rect width="400" height="100" fill="#81B441"/>
    <text x="200" y="60" font-family="Arial" font-size="24" font-weight="bold" text-anchor="middle" fill="white">
      InEvent App
    </text>
  </svg>`
).toString('base64')}`;
```

### Upload d'images optimisé
```typescript
// Optimisation automatique des images uploadées
- Redimensionnement max : 800x600px
- Compression : 85%
- Formats acceptés : JPG, PNG, WebP
- Taille max : 5MB
```

### Variables d'email sécurisées
```typescript
// Remplacement automatique des variables
{{eventBanner}}     → Logo par défaut ou image événement
{{eventName}}       → Nom de l'événement
{{participantName}} → Nom du participant
{{eventDate}}       → Date formatée
{{eventLocation}}   → Lieu de l'événement
```

## Bonnes pratiques recommandées

### Design
- ✅ Utiliser des images de haute qualité mais optimisées
- ✅ Prévoir un design fonctionnel sans images
- ✅ Utiliser du texte alternatif descriptif
- ✅ Équilibrer contenu textuel et visuel

### Technique
- ✅ Héberger les images sur des CDN publics
- ✅ Utiliser HTTPS pour toutes les ressources
- ✅ Tester sur Gmail, Outlook, Apple Mail
- ✅ Optimiser pour mobile (responsive)

### Contenu
- ✅ Images pertinentes au message
- ✅ Éviter trop de texte dans les images
- ✅ Utiliser des boutons HTML plutôt que des images
- ✅ Prévoir des versions texte alternatives

## Test et débogage

### Outils de test
- [Litmus](https://litmus.com) - Test multi-clients
- [Email on Acid](https://emailonacid.com) - Test de rendu
- Gmail, Outlook.com - Tests manuels gratuits

### Vérifications
1. L'email est-il lisible sans images ?
2. Les images s'affichent-elles correctement ?
3. Le temps de chargement est-il acceptable ?
4. L'email passe-t-il les filtres anti-spam ?

---

*Guide créé pour le projet InEvent - Décembre 2024* 