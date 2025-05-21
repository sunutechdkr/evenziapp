import { User, UserRole, Permission, DEFAULT_ROLE_PERMISSIONS } from '@/types/models';

/**
 * Vérifie si un utilisateur a une permission spécifique
 * @param user Utilisateur à vérifier
 * @param permission Permission requise
 * @returns Booléen indiquant si l'utilisateur a la permission
 */
export function hasPermission(user: User | null | undefined, permission: Permission): boolean {
  if (!user) return false;
  
  // Les administrateurs ont toutes les permissions
  if (user.role === UserRole.ADMIN) return true;
  
  // Vérifier dans les permissions spécifiques si elles existent
  if (user.permissions && user.permissions.includes(permission)) {
    return true;
  }
  
  // Vérifier dans les permissions par défaut pour le rôle
  const rolePermissions = DEFAULT_ROLE_PERMISSIONS[user.role];
  return rolePermissions.includes(permission);
}

/**
 * Vérifie si l'utilisateur a l'une des permissions spécifiées
 * @param user Utilisateur à vérifier
 * @param permissions Liste des permissions dont au moins une est requise
 * @returns Booléen indiquant si l'utilisateur a au moins une des permissions
 */
export function hasAnyPermission(user: User | null | undefined, permissions: Permission[]): boolean {
  if (!user) return false;
  if (user.role === UserRole.ADMIN) return true;
  
  return permissions.some(permission => hasPermission(user, permission));
}

/**
 * Vérifie si l'utilisateur a toutes les permissions spécifiées
 * @param user Utilisateur à vérifier
 * @param permissions Liste des permissions requises
 * @returns Booléen indiquant si l'utilisateur a toutes les permissions
 */
export function hasAllPermissions(user: User | null | undefined, permissions: Permission[]): boolean {
  if (!user) return false;
  if (user.role === UserRole.ADMIN) return true;
  
  return permissions.every(permission => hasPermission(user, permission));
}

/**
 * Vérifie si l'utilisateur est propriétaire d'un événement
 * @param user Utilisateur à vérifier
 * @param eventUserId ID du créateur de l'événement
 * @returns Booléen indiquant si l'utilisateur est le propriétaire
 */
export function isEventOwner(user: User | null | undefined, eventUserId: string): boolean {
  if (!user) return false;
  
  // Les administrateurs sont considérés comme propriétaires
  if (user.role === UserRole.ADMIN) return true;
  
  return user.id === eventUserId;
}

/**
 * Obtient l'URL de destination après connexion basée sur le rôle de l'utilisateur
 * @param user Utilisateur connecté
 * @returns URL où rediriger l'utilisateur après connexion
 */
export function getLoginRedirectUrl(user: User | null | undefined): string {
  if (!user) return '/login';
  
  switch(user.role) {
    case UserRole.ADMIN:
      return '/dashboard/admin';
    case UserRole.ORGANIZER:
      return '/dashboard/events';
    case UserRole.STAFF:
      return '/dashboard/events';
    case UserRole.USER:
    default:
      return '/my-events';
  }
} 