import { createClient } from '@supabase/supabase-js';
import { User, Event, Registration, Account, Session, VerificationToken } from '@/types/models';

// Get Supabase URL and anonymous key from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Check if the environment variables are set
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please check your .env file.');
}

// Create the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Helper functions for database operations
export async function fetchEvents() {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching events:', error);
    return [];
  }
  
  return data as Event[];
}

export async function fetchEventById(id: string) {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error(`Error fetching event with id ${id}:`, error);
    return null;
  }
  
  return data as Event;
}

export async function fetchEventBySlug(slug: string) {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('slug', slug)
    .single();
  
  if (error) {
    console.error(`Error fetching event with slug ${slug}:`, error);
    return null;
  }
  
  return data as Event;
}

export async function fetchRegistrations(eventId: string) {
  const { data, error } = await supabase
    .from('registrations')
    .select('*')
    .eq('event_id', eventId);
  
  if (error) {
    console.error(`Error fetching registrations for event ${eventId}:`, error);
    return [];
  }
  
  return data as Registration[];
}

export default supabase;

// Types for the tables Supabase (to be completed according to your schema)
export type Tables = {
  events: {
    id: string;
    name: string;
    slug: string;
    date: string;
    location: string;
    description: string;
    created_at: string;
    banner_url?: string;
    start_date?: string;
    end_date?: string;
    sector?: string;
    type?: string;
    format?: string;
    timezone?: string;
    start_time?: string;
    end_time?: string;
    video_url?: string;
    support_email?: string;
  };
  registrations: {
    id: string;
    event_id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    type: string;
    created_at: string;
    checked_in: boolean;
    check_in_time?: string;
  };
};

// Helper for obtaining a typed client
export const getTypedClient = () => supabase;

// Export types for easier access
export type { User, Event, Registration, Account, Session, VerificationToken }; 