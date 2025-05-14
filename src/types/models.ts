// Types des modèles de données de l'application

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
  role: 'USER' | 'ADMIN';
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