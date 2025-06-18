// Types des modèles de données de l'application

// Énumération des rôles utilisateur
export enum UserRole {
  USER = 'USER',
  STAFF = 'STAFF',
  ORGANIZER = 'ORGANIZER',
  ADMIN = 'ADMIN'
}

// Type d'utilisateur
export type User = {
  id: string;
  name?: string | null;
  email?: string | null;
  email_verified?: Date | null;
  image?: string | null;
  password?: string | null;
  created_at: Date;
  updated_at: Date;
  role: UserRole;
  permissions?: string[]; // Stockage des permissions spécifiques
};

// Type d'événement
export type Event = {
  id: string;
  name: string;
  description?: string | null;
  location: string;
  slug: string;
  banner?: string | null;
  startDate: Date;
  endDate: Date;
  startTime?: string | null;
  endTime?: string | null;
  sector?: string | null;
  type?: string | null;
  format?: string | null;
  timezone?: string | null;
  videoUrl?: string | null;
  supportEmail?: string | null;
  created_at?: Date;
  updated_at?: Date;
  user_id: string;
};

// Type d'inscription
export type Registration = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  type: 'PARTICIPANT' | 'EXHIBITOR' | 'SPEAKER';
  event_id: string;
  qr_code: string;
  created_at: Date;
  updated_at: Date;
  checked_in: boolean;
  check_in_time?: Date | null;
};

// Type de compte (pour l'authentification)
export type Account = {
  id: string;
  user_id: string;
  type: string;
  provider: string;
  provider_account_id: string;
  refresh_token?: string | null;
  access_token?: string | null;
  expires_at?: number | null;
  token_type?: string | null;
  scope?: string | null;
  id_token?: string | null;
  session_state?: string | null;
};

// Type de session
export type Session = {
  id: string;
  session_token: string;
  user_id: string;
  expires: Date;
};

// Type de token de vérification
export type VerificationToken = {
  identifier: string;
  token: string;
  expires: Date;
};

// Énumération des permissions
export enum Permission {
  // Permissions générales
  CREATE_EVENT = 'create:event',
  READ_EVENT = 'read:event',
  UPDATE_EVENT = 'update:event',
  DELETE_EVENT = 'delete:event',
  
  // Permissions spécifiques aux événements
  MANAGE_PARTICIPANTS = 'manage:participants',
  MANAGE_SESSIONS = 'manage:sessions',
  MANAGE_SPEAKERS = 'manage:speakers',
  EXPORT_DATA = 'export:data',
  SEND_EMAILS = 'send:emails',
  
  // Permissions administratives
  MANAGE_USERS = 'manage:users',
  MANAGE_ROLES = 'manage:roles',
  VIEW_ANALYTICS = 'view:analytics',
}

// Map des permissions par rôle
export const DEFAULT_ROLE_PERMISSIONS = {
  [UserRole.USER]: [
    Permission.READ_EVENT
  ],
  [UserRole.STAFF]: [
    Permission.READ_EVENT,
    Permission.MANAGE_PARTICIPANTS,
    Permission.EXPORT_DATA
  ],
  [UserRole.ORGANIZER]: [
    Permission.CREATE_EVENT,
    Permission.READ_EVENT,
    Permission.UPDATE_EVENT,
    Permission.DELETE_EVENT,
    Permission.MANAGE_PARTICIPANTS,
    Permission.MANAGE_SESSIONS,
    Permission.MANAGE_SPEAKERS,
    Permission.EXPORT_DATA,
    Permission.SEND_EMAILS,
    Permission.VIEW_ANALYTICS
  ],
  [UserRole.ADMIN]: Object.values(Permission)
}; 