/**
 * Utilitaire pour générer des codes courts pour les QR codes des badges
 */

/**
 * Génère un code alphanumérique court pour les QR codes
 * @param length - Longueur du code (standardisée à 9 caractères, peut être modifiée)
 * @returns Code alphanumérique court
 */
export function generateShortCode(length: number = 9): string {
  // On utilise des caractères facilement lisibles (pas de 0/O ou 1/I/l confusion)
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  
  // Générer une chaîne aléatoire de la longueur spécifiée
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }
  
  return result;
}

/**
 * Vérifie si un code court est valide
 * @param code - Le code à vérifier
 * @returns true si le code est valide, false sinon
 */
export function isValidShortCode(code: string): boolean {
  // Vérifie que le code ne contient que des caractères alphanumériques
  // et qu'il a une longueur de 9 caractères (standard)
  return /^[A-Z0-9]{9}$/.test(code);
} 