# Intégration du Système de Game/Scoring

Ce document présente comment intégrer le système de scoring dans les fonctionnalités existantes.

## Configuration requise

1. **Migration de la base de données** : Exécuter la migration pour créer les tables `games` et `user_event_scores`
2. **Import du service** : Importer les fonctions depuis `@/lib/gameService`

## Exemples d'intégration

### 1. Check-in des participants

```typescript
// Dans src/app/api/checkin/route.ts ou composant de check-in
import { recordCheckIn, showGameActionToast } from '@/lib/gameService';
import { toast } from 'react-hot-toast';

// Après un check-in réussi
const handleCheckIn = async (eventId: string, participantId: string) => {
  try {
    // Logique de check-in existante...
    
    // Enregistrer l'action de scoring
    const gameResponse = await recordCheckIn(eventId, participantId);
    
    // Afficher la notification de points
    showGameActionToast(gameResponse, toast);
    
  } catch (error) {
    console.error('Erreur lors du check-in:', error);
  }
};
```

### 2. Participation aux sessions

```typescript
// Dans src/app/api/events/[id]/sessions/[sessionId]/participants/route.ts
import { recordSessionEntry, recordSessionParticipation } from '@/lib/gameService';

// Quand un participant rejoint une session
const addParticipantToSession = async (eventId: string, sessionId: string, participantId: string) => {
  try {
    // Logique d'ajout à la session existante...
    
    // Enregistrer l'entrée dans la session
    await recordSessionEntry(eventId, participantId, sessionId);
    
  } catch (error) {
    console.error('Erreur:', error);
  }
};

// Quand un participant marque sa présence effective
const markAttendance = async (eventId: string, sessionId: string, participantId: string) => {
  try {
    // Logique de marquage de présence existante...
    
    // Enregistrer la participation active
    await recordSessionParticipation(eventId, participantId, sessionId);
    
  } catch (error) {
    console.error('Erreur:', error);
  }
};
```

### 3. Scan de participants (QR Code)

```typescript
// Dans un composant de scan QR
import { recordParticipantScan, showGameActionToast } from '@/lib/gameService';

const handleQRScan = async (scannedData: string) => {
  try {
    // Parser les données du QR code pour obtenir l'ID du participant
    const scannedParticipantId = parseQRCode(scannedData);
    
    // Logique de scan existante...
    
    // Enregistrer l'action de scan
    const gameResponse = await recordParticipantScan(
      eventId, 
      currentParticipantId, 
      scannedParticipantId
    );
    
    showGameActionToast(gameResponse, toast);
    
  } catch (error) {
    console.error('Erreur lors du scan:', error);
  }
};
```

### 4. Rendez-vous

```typescript
// Dans src/app/api/events/[id]/appointments/route.ts
import { recordAppointmentRequest, recordAppointmentConfirmed } from '@/lib/gameService';

// Lors de la création d'une demande de rendez-vous
const createAppointment = async (appointmentData: any) => {
  try {
    // Créer le rendez-vous dans la base de données
    const appointment = await prisma.appointment.create({
      data: appointmentData
    });
    
    // Enregistrer l'action de demande
    await recordAppointmentRequest(
      appointmentData.eventId,
      appointmentData.requesterId,
      appointment.id
    );
    
    return appointment;
  } catch (error) {
    console.error('Erreur:', error);
  }
};

// Lors de la confirmation d'un rendez-vous
const confirmAppointment = async (appointmentId: string) => {
  try {
    // Mettre à jour le statut du rendez-vous
    const appointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: 'ACCEPTED' }
    });
    
    // Enregistrer les points pour les deux participants
    await recordAppointmentConfirmed(
      appointment.eventId,
      appointment.requesterId,
      appointmentId
    );
    
    await recordAppointmentConfirmed(
      appointment.eventId,
      appointment.recipientId,
      appointmentId
    );
    
    return appointment;
  } catch (error) {
    console.error('Erreur:', error);
  }
};
```

### 5. Intégration dans un composant React

```typescript
// Exemple d'utilisation dans un composant
import { useState, useEffect } from 'react';
import { getLeaderboard } from '@/lib/gameService';

const EventDashboard = ({ eventId }: { eventId: string }) => {
  const [leaderboard, setLeaderboard] = useState(null);
  
  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        const data = await getLeaderboard(eventId);
        setLeaderboard(data);
      } catch (error) {
        console.error('Erreur lors du chargement du classement:', error);
      }
    };
    
    loadLeaderboard();
  }, [eventId]);
  
  return (
    <div>
      {/* Contenu du dashboard */}
      {leaderboard && (
        <div className="mt-4 p-4 bg-green-50 rounded-lg">
          <h3 className="font-semibold text-green-800">
            🏆 Top scorer: {leaderboard.stats.topScorer?.firstName} 
            ({leaderboard.stats.topScorer?.totalPoints} points)
          </h3>
        </div>
      )}
    </div>
  );
};
```

## Configuration des points

Les points sont configurés dans `src/lib/gameService.ts` :

```typescript
export const GAME_POINTS = {
  CHECK_IN: 50,                // Check-in à l'événement
  SESSION_ENTRY: 20,           // Entrée dans une session
  SESSION_PARTICIPATION: 30,   // Participation active à une session
  PARTICIPANT_SCAN: 10,        // Scan d'un autre participant
  APPOINTMENT_REQUEST: 15,     // Demande de rendez-vous
  APPOINTMENT_CONFIRMED: 30,   // Rendez-vous confirmé
} as const;
```

## Gestion des erreurs

Le système gère automatiquement :
- **Actions dupliquées** : Évite les doublons (ex: un seul check-in par participant)
- **Validation des données** : Vérifie que le participant et l'événement existent
- **Sécurité** : Vérifie les autorisations via NextAuth

## Migration vers la production

1. **Tester d'abord** : Utiliser l'API avec des données de test
2. **Migrer la base** : Exécuter `npx prisma migrate deploy`
3. **Activer progressivement** : Commencer par une fonctionnalité (ex: check-in)
4. **Monitorer** : Vérifier les logs d'erreurs et les performances

## Notes importantes

- Les actions sont **idempotentes** : répéter la même action ne donne pas de points supplémentaires
- Le système est **asynchrone** : les erreurs de scoring n'affectent pas les fonctionnalités principales
- **Performance** : Les calculs de score sont optimisés avec des agrégations
- **Évolutif** : Facile d'ajouter de nouveaux types d'actions et de points 