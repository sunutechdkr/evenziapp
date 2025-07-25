/**
 * Service de gestion du système de jeu et de scoring
 * Fournit des fonctions utilitaires pour enregistrer les actions des participants
 */

export type GameAction = 
  | 'CHECK_IN'
  | 'SESSION_ENTRY'
  | 'SESSION_PARTICIPATION'
  | 'PARTICIPANT_SCAN'
  | 'APPOINTMENT_REQUEST'
  | 'APPOINTMENT_CONFIRMED';

export interface GameActionData {
  eventId: string;
  participantId: string;
  action: GameAction;
  actionDetails?: Record<string, unknown>;
  relatedEntityId?: string;
}

export interface GameActionResponse {
  success: boolean;
  gameAction?: {
    id: string;
    eventId: string;
    participantId: string;
    action: string;
    points: number;
    createdAt: string;
  };
  points?: number;
  message?: string;
  error?: string;
}

/**
 * Enregistre une action de jeu pour un participant
 */
export async function recordGameAction(data: GameActionData): Promise<GameActionResponse> {
  try {
    const response = await fetch(`/api/events/${data.eventId}/game`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        participantId: data.participantId,
        action: data.action,
        actionDetails: data.actionDetails,
        relatedEntityId: data.relatedEntityId,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || 'Erreur lors de l\'enregistrement de l\'action',
      };
    }

    return {
      success: true,
      gameAction: result.gameAction,
      points: result.points,
      message: result.message,
    };
  } catch (error) {
    console.error('Erreur lors de l\'appel API game:', error);
    return {
      success: false,
      error: 'Erreur réseau lors de l\'enregistrement de l\'action',
    };
  }
}

/**
 * Enregistre un check-in pour un participant
 */
export async function recordCheckIn(eventId: string, participantId: string) {
  return recordGameAction({
    eventId,
    participantId,
    action: 'CHECK_IN',
    actionDetails: {
      timestamp: new Date().toISOString(),
    },
  });
}

/**
 * Enregistre l'entrée d'un participant dans une session
 */
export async function recordSessionEntry(
  eventId: string, 
  participantId: string, 
  sessionId: string
) {
  return recordGameAction({
    eventId,
    participantId,
    action: 'SESSION_ENTRY',
    relatedEntityId: sessionId,
    actionDetails: {
      sessionId,
      timestamp: new Date().toISOString(),
    },
  });
}

/**
 * Enregistre la participation complète d'un participant à une session
 */
export async function recordSessionParticipation(
  eventId: string, 
  participantId: string, 
  sessionId: string,
  attendanceTime?: string
) {
  return recordGameAction({
    eventId,
    participantId,
    action: 'SESSION_PARTICIPATION',
    relatedEntityId: sessionId,
    actionDetails: {
      sessionId,
      attendanceTime,
      timestamp: new Date().toISOString(),
    },
  });
}

/**
 * Enregistre le scan d'un participant par un autre participant
 */
export async function recordParticipantScan(
  eventId: string, 
  scannerId: string, 
  scannedParticipantId: string
) {
  return recordGameAction({
    eventId,
    participantId: scannerId,
    action: 'PARTICIPANT_SCAN',
    relatedEntityId: scannedParticipantId,
    actionDetails: {
      scannedParticipantId,
      timestamp: new Date().toISOString(),
    },
  });
}

/**
 * Enregistre une demande de rendez-vous
 */
export async function recordAppointmentRequest(
  eventId: string, 
  requesterId: string, 
  appointmentId: string
) {
  return recordGameAction({
    eventId,
    participantId: requesterId,
    action: 'APPOINTMENT_REQUEST',
    relatedEntityId: appointmentId,
    actionDetails: {
      appointmentId,
      timestamp: new Date().toISOString(),
    },
  });
}

/**
 * Enregistre la confirmation d'un rendez-vous
 */
export async function recordAppointmentConfirmed(
  eventId: string, 
  participantId: string, 
  appointmentId: string
) {
  return recordGameAction({
    eventId,
    participantId,
    action: 'APPOINTMENT_CONFIRMED',
    relatedEntityId: appointmentId,
    actionDetails: {
      appointmentId,
      timestamp: new Date().toISOString(),
    },
  });
}

/**
 * Affiche une notification toast pour une action de jeu
 */
export function showGameActionToast(
  response: GameActionResponse, 
  toast: { success: (message: string, options?: object) => void; error: (message: string) => void }
) {
  if (response.success && response.points) {
    toast.success(`🎉 +${response.points} points ! ${response.message || ''}`, {
      duration: 4000,
      style: {
        background: '#81B441',
        color: '#fff',
      },
    });
  } else if (!response.success && response.error !== 'Action déjà enregistrée') {
    // Ne pas afficher d'erreur pour les actions déjà enregistrées
    toast.error(response.error || 'Erreur lors du scoring');
  }
}

/**
 * Récupère le classement d'un événement
 */
export async function getLeaderboard(eventId: string) {
  try {
    const response = await fetch(`/api/events/${eventId}/game/leaderboard`);
    
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération du classement');
    }

    return await response.json();
  } catch (error) {
    console.error('Erreur lors de la récupération du classement:', error);
    throw error;
  }
}

/**
 * Configuration des points par action
 */
export const GAME_POINTS = {
  CHECK_IN: 50,
  SESSION_ENTRY: 20,
  SESSION_PARTICIPATION: 30,
  PARTICIPANT_SCAN: 10,
  APPOINTMENT_REQUEST: 15,
  APPOINTMENT_CONFIRMED: 30,
} as const; 