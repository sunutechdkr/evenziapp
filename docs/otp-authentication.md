# Système d'Authentification OTP pour Participants

## Vue d'ensemble

Le système d'authentification par code à usage unique (OTP) a été implémenté pour renforcer la sécurité de la connexion des participants aux événements. Ce système remplace le Magic Link par un code à 6 chiffres envoyé par email.

## Fonctionnement

### 1. Demande de Code OTP
- Le participant saisit son email dans l'interface de connexion
- Le système vérifie si l'email correspond à une inscription dans la base de données
- Un code OTP à 6 chiffres est généré et envoyé par email
- Le code expire après 10 minutes

### 2. Vérification du Code
- Le participant saisit le code reçu par email
- Le système vérifie la validité du code (non expiré, non utilisé)
- Si valide, un compte USER est créé/mis à jour automatiquement
- L'utilisateur est redirigé vers son espace participant

### 3. Sécurité
- Les codes sont uniques et à usage unique
- Expiration automatique après 10 minutes
- Suppression automatique des anciens codes
- Limitation aux participants inscrits uniquement

## Structure de la Base de Données

### Table `otp_codes`
```sql
CREATE TABLE otp_codes (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  event_id TEXT,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now()
);
```

## API Endpoints

### POST `/api/auth/participant-magic-link`
Génère et envoie un code OTP par email.

**Body:**
```json
{
  "email": "participant@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Code envoyé avec succès",
  "eventName": "Nom de l'événement"
}
```

### POST `/api/auth/participant-verify-otp`
Vérifie un code OTP et créé la session utilisateur.

**Body:**
```json
{
  "email": "participant@example.com",
  "code": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "redirectUrl": "http://localhost:3000/auth/auto-login?token=...",
  "user": {
    "id": "user_id",
    "name": "Nom Participant",
    "email": "participant@example.com"
  }
}
```

### POST `/api/admin/cleanup-otp` (Admin uniquement)
Nettoie les codes OTP expirés.

**Response:**
```json
{
  "success": true,
  "message": "5 codes OTP supprimés",
  "deletedCount": 5
}
```

## Interface Utilisateur

### Étape 1: Saisie Email
- Champ email avec validation
- Bouton "Envoyer le code de connexion"
- Messages d'erreur en cas de participant non trouvé

### Étape 2: Saisie Code OTP
- Champ numérique pour code à 6 chiffres
- Affichage de l'email de destination
- Boutons "Renvoyer le code" et "Modifier l'adresse email"
- Validation automatique dès 6 chiffres saisis

## Fonctionnalités Avancées

### Nettoyage Automatique
```typescript
import { cleanupExpiredOtpCodes } from '@/lib/cleanup';

// Supprime les codes expirés et utilisés depuis plus de 24h
await cleanupExpiredOtpCodes();
```

### Email Personnalisé
L'email envoyé contient :
- Code OTP en gros caractères
- Nom de l'événement
- Nom du participant
- Code court de l'événement
- Avertissement de sécurité
- Design moderne et responsive

## Fallback pour Utilisateurs Non-Participants

Si l'email n'est pas trouvé dans les inscriptions, le système utilise automatiquement le système NextAuth EmailProvider pour les administrateurs et organisateurs.

## Sécurité et Bonnes Pratiques

1. **Codes à Usage Unique**: Chaque code ne peut être utilisé qu'une seule fois
2. **Expiration Courte**: 10 minutes maximum
3. **Nettoyage Régulier**: Suppression automatique des anciens codes
4. **Validation Stricte**: Vérification de l'email ET du code
5. **Limitation d'Accès**: Réservé aux participants inscrits

## Monitoring et Maintenance

- Logs détaillés pour chaque étape du processus
- API de nettoyage pour la maintenance
- Métriques d'utilisation disponibles
- Gestion d'erreurs complète

## Migration depuis Magic Link

Le système est rétrocompatible :
- Les utilisateurs existants continuent de fonctionner
- Pas de changement pour les administrateurs
- Amélioration transparente de la sécurité 