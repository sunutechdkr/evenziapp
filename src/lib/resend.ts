import { Resend } from 'resend';
import type { CreateEmailOptions } from 'resend';

// Initialiser Resend avec la clé API seulement si elle existe
export const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Fonction helper pour vérifier si Resend est disponible
export const isResendAvailable = (): boolean => {
  return resend !== null;
};

// Fonction helper pour envoyer un email avec vérification
export const sendEmail = async (data: CreateEmailOptions) => {
  if (!resend) {
    throw new Error('Service d\'email non configuré - RESEND_API_KEY manquant');
  }
  return await resend.emails.send(data);
}; 