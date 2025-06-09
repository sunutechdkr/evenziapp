# Guide de Configuration - Système d'Envoi d'Emails

## 🚀 Fonctionnalités Implémentées

### ✅ **Modal d'Envoi d'Emails**
- **Envoi immédiat** : Les emails sont envoyés directement
- **Envoi programmé** : Planification d'envoi pour une date/heure spécifique
- **Sélection des destinataires** : Tous participants, participants, speakers, exposants, sponsors
- **Personnalisation** : Sujet modifiable et note interne
- **Validation** : Vérification du nombre de destinataires avant envoi

### ✅ **Base de Données**
- **EmailCampaign** : Gestion des campagnes avec statuts (DRAFT, SCHEDULED, SENDING, SENT, FAILED)
- **EmailLog** : Traçabilité de chaque email (PENDING, SENT, DELIVERED, FAILED, OPENED, CLICKED)
- **Statistiques** : Comptage des envois, succès, échecs par campagne

### ✅ **APIs Développées**
- `/api/events/[id]/recipients-count` - Comptage des destinataires par type
- `/api/events/[id]/campaigns/send` - Envoi immédiat et programmation
- `/api/events/[id]/campaigns/stats` - Statistiques détaillées
- `/api/cron/send-scheduled-emails` - Traitement des emails programmés

## 📧 Configuration des Emails

### Variables d'Environnement Requises
```env
# API Resend pour l'envoi d'emails
RESEND_API_KEY=your_resend_api_key

# Clé de sécurité pour les tâches cron
CRON_SECRET=your_secure_cron_secret
```

### Variables de Template Disponibles
- `{{eventName}}` - Nom de l'événement
- `{{participantName}}` - Nom du participant
- `{{eventDate}}` - Date de l'événement
- `{{eventTime}}` - Heure de l'événement
- `{{eventLocation}}` - Lieu de l'événement
- `{{organizerName}}` - Nom de l'organisateur
- `{{supportEmail}}` - Email de support
- `{{eventBanner}}` - Logo InEvent (SVG base64)

## ⏰ Configuration des Tâches Cron

### Option 1: Vercel Cron Jobs
Ajouter dans `vercel.json` :
```json
{
  "crons": [
    {
      "path": "/api/cron/send-scheduled-emails",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

### Option 2: Cron Externe
Configurer un service externe pour appeler :
```bash
curl -X POST https://your-domain.com/api/cron/send-scheduled-emails \
  -H "Authorization: Bearer ${CRON_SECRET}"
```

### Option 3: GitHub Actions
Créer `.github/workflows/cron-emails.yml` :
```yaml
name: Send Scheduled Emails
on:
  schedule:
    - cron: '*/5 * * * *'
jobs:
  send-emails:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Email Sending
        run: |
          curl -X POST ${{ secrets.APP_URL }}/api/cron/send-scheduled-emails \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

## 🎯 Utilisation

### Envoi Immédiat
1. Aller dans **Communication > Templates**
2. Cliquer sur **Envoyer** pour un template actif
3. Sélectionner **Envoi immédiat**
4. Choisir les destinataires
5. Personnaliser le sujet si nécessaire
6. Cliquer sur **Envoyer maintenant**

### Envoi Programmé
1. Suivre les mêmes étapes
2. Sélectionner **Envoi programmé**
3. Définir la date et l'heure d'envoi
4. Cliquer sur **Programmer l'envoi**
5. Les emails seront envoyés automatiquement par la tâche cron

## 📊 Statistiques et Suivi

### Tableau de Bord Communication
- **Campagnes actives** : Nombre de campagnes programmées
- **Templates actifs** : Templates disponibles pour envoi
- **Emails envoyés** : Total des emails envoyés avec succès
- **Taux de livraison** : Pourcentage de succès d'envoi

### Logs Détaillés
- Statut de chaque email individuel
- Messages d'erreur en cas d'échec
- Horodatage des envois
- Suivi des ouvertures et clics (si configuré)

## 🔒 Sécurité

### Authentification
- Seuls les ORGANIZERS et ADMINS peuvent envoyer des emails
- Vérification de session pour toutes les APIs

### Protection Cron
- Clé secrète requise pour les tâches automatiques
- Limitation aux domaines autorisés

### Limitation des Envois
- Validation du nombre de destinataires
- Prévention des envois en masse abusifs
- Logs de toutes les activités

## 🛠️ Dépannage

### Emails Non Reçus
1. Vérifier les logs de la campagne
2. Contrôler la validité des adresses email
3. Vérifier la configuration Resend
4. Consulter les filtres anti-spam

### Emails Programmés Non Envoyés
1. Vérifier que la tâche cron fonctionne
2. Contrôler les logs du serveur
3. Valider la clé CRON_SECRET
4. Vérifier l'état de la campagne (SCHEDULED → SENDING → SENT)

### Erreurs Courantes
- `Aucun destinataire trouvé` : Vérifier les inscriptions à l'événement
- `Non autorisé` : Vérifier les permissions utilisateur
- `Erreur Resend` : Contrôler la clé API et les quotas

## 📈 Améliorations Futures

### Fonctionnalités Prévues
- Templates d'email visuels avancés
- Segmentation avancée des destinataires
- A/B testing des sujets
- Tracking détaillé (ouvertures, clics)
- Templates conditionnels selon le type de participant
- Intégration avec des services d'email marketing

### Base de Données
- Tables dédiées pour speakers et exhibitors
- Système de tags pour la segmentation
- Historique des interactions email
- Préférences de communication par participant

## 🎉 Conclusion

Le système d'envoi d'emails est maintenant opérationnel avec :
- ✅ Interface utilisateur intuitive
- ✅ Envoi immédiat et programmé
- ✅ Gestion des destinataires
- ✅ Statistiques complètes
- ✅ Logging détaillé
- ✅ Sécurité renforcée

Le système est prêt pour un usage en production avec une configuration appropriée des tâches cron. 