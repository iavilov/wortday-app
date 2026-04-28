/**
 * Auth Types for Wortday
 * Supports Email, Apple, and Google authentication
 */

import { Session, User as SupabaseUser } from '@supabase/supabase-js';

// Auth providers
export type AuthProvider = 'email' | 'apple' | 'google';

// User profile from public.users table
export interface UserProfile {
  id: string;
  email: string | null;
  display_name: string | null;
  auth_provider: AuthProvider;
  is_private_email: boolean;
  translation_language: 'ru' | 'uk' | 'en' | 'de';
  language_level: 'beginner' | 'intermediate' | 'advanced';
  registration_date: string;
  has_completed_onboarding: boolean;
  notifications_enabled: boolean;
  notification_time: string;
  created_at: string;
  updated_at: string;
}

// Combined user data (Supabase Auth + Profile)
export interface User {
  id: string;
  email: string | null;
  displayName: string | null;
  authProvider: AuthProvider;
  isPrivateEmail: boolean;
}

// Auth state
export interface AuthState {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
}

// Auth events from Supabase
export type AuthEvent =
  | 'SIGNED_IN'
  | 'SIGNED_OUT'
  | 'TOKEN_REFRESHED'
  | 'USER_UPDATED'
  | 'USER_DELETED'
  | 'PASSWORD_RECOVERY'
  | 'INITIAL_SESSION';

// Sign up data
export interface SignUpData {
  email: string;
  password: string;
  displayName?: string;
}

// Sign in data
export interface SignInData {
  email: string;
  password: string;
}

// Apple Sign In credential (from expo-apple-authentication)
export interface AppleCredential {
  identityToken: string | null;
  fullName?: {
    givenName?: string | null;
    familyName?: string | null;
  } | null;
  email?: string | null;
}

// Helper to get display email
export function getDisplayEmail(user: User | null, profile: UserProfile | null): string {
  const email = profile?.email || user?.email;
  if (!email) return 'Hidden by Apple';
  return email;
}

// Map Supabase user to our User type
export function mapSupabaseUser(supabaseUser: SupabaseUser | null): User | null {
  if (!supabaseUser) return null;

  const provider = (supabaseUser.app_metadata?.provider as AuthProvider) || 'email';
  const fullName = supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name;

  return {
    id: supabaseUser.id,
    email: supabaseUser.email || null,
    displayName: fullName || null,
    authProvider: provider,
    isPrivateEmail: supabaseUser.email?.includes('@privaterelay.appleid.com') || false,
  };
}

// Shape of a row from public.users as returned by Supabase REST.
// `has_completed_onboarding` may be absent on legacy rows — keep it optional.
type DbUserRow = Omit<UserProfile, 'has_completed_onboarding'> & {
  has_completed_onboarding: boolean | null;
};

// Map DB profile to UserProfile
export function mapDbProfile(dbProfile: DbUserRow | null): UserProfile | null {
  if (!dbProfile) return null;

  return {
    id: dbProfile.id,
    email: dbProfile.email,
    display_name: dbProfile.display_name,
    auth_provider: dbProfile.auth_provider,
    is_private_email: dbProfile.is_private_email,
    translation_language: dbProfile.translation_language,
    language_level: dbProfile.language_level,
    registration_date: dbProfile.registration_date,
    has_completed_onboarding: dbProfile.has_completed_onboarding ?? false,
    notifications_enabled: dbProfile.notifications_enabled,
    notification_time: dbProfile.notification_time,
    created_at: dbProfile.created_at,
    updated_at: dbProfile.updated_at,
  };
}
