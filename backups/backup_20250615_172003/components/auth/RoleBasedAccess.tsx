import { ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { Permission, UserRole, User } from '@/types/models';
import { hasAnyPermission, hasAllPermissions } from '@/lib/permissions';

interface RoleBasedAccessProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
  requiredPermissions?: Permission[];
  requireAllPermissions?: boolean;
  fallback?: ReactNode;
}

/**
 * Composant qui affiche ses enfants uniquement si l'utilisateur a les rôles 
 * ou permissions nécessaires.
 */
export default function RoleBasedAccess({
  children,
  allowedRoles,
  requiredPermissions,
  requireAllPermissions = false,
  fallback = null
}: RoleBasedAccessProps) {
  const { data: session } = useSession();
  const user = session?.user;
  
  // Pas de session, pas d'accès
  if (!user) {
    return <>{fallback}</>;
  }
  
  // Vérification des rôles si spécifiés
  if (allowedRoles && allowedRoles.length > 0) {
    const hasRole = allowedRoles.includes(user.role as UserRole);
    if (!hasRole) {
      return <>{fallback}</>;
    }
  }
  
  // Vérification des permissions si spécifiées
  if (requiredPermissions && requiredPermissions.length > 0) {
    const checkMethod = requireAllPermissions ? hasAllPermissions : hasAnyPermission;
    const hasRequiredPermissions = checkMethod(user as unknown as User, requiredPermissions);
    
    if (!hasRequiredPermissions) {
      return <>{fallback}</>;
    }
  }
  
  // Si toutes les vérifications sont passées, afficher les enfants
  return <>{children}</>;
} 