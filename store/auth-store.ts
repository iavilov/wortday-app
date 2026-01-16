/**
 * Auth Store for Vocade
 * Manages authentication state with Supabase
 */

import { supabase } from '@/lib/supabase-client';
import {
  AuthProvider,
  mapDbProfile,
  mapSupabaseUser,
  User,
  UserProfile,
} from '@/types/auth';
import { Session } from '@supabase/supabase-js';
import { create } from 'zustand';

interface AuthStore {
  // State
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
  initialize: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<{ success: boolean; error?: string }>;
  signInWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUpWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  // Initial state
  user: null,
  session: null,
  profile: null,
  isAuthenticated: false,
  isLoading: true,
  isInitialized: false,

  // Set user
  setUser: (user) => {
    set({
      user,
      isAuthenticated: !!user,
    });
  },

  // Set session
  setSession: (session) => {
    const user = mapSupabaseUser(session?.user ?? null);
    set({
      session,
      user,
      isAuthenticated: !!session,
    });
  },

  // Set profile
  setProfile: (profile) => {
    set({ profile });
  },

  // Set loading
  setLoading: (loading) => {
    set({ isLoading: loading });
  },

  // Initialize auth state
  initialize: async () => {
    try {
      set({ isLoading: true });

      // Get current session
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error('[Auth] Session error:', error);
        set({ isLoading: false, isInitialized: true });
        return;
      }

      if (session) {
        const user = mapSupabaseUser(session.user);
        set({
          session,
          user,
          isAuthenticated: true,
        });

        // Fetch profile data
        await get().fetchProfile();
      }

      set({ isLoading: false, isInitialized: true });
    } catch (error) {
      console.error('[Auth] Initialize error:', error);
      set({ isLoading: false, isInitialized: true });
    }
  },

  // Fetch user profile from database
  fetchProfile: async () => {
    const { session } = get();
    if (!session?.user?.id) return;

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error) {
        // Profile might not exist yet (new user)
        if (error.code === 'PGRST116') {
          console.log('[Auth] Profile not found, will be created by trigger');
          return;
        }
        console.error('[Auth] Fetch profile error:', error);
        return;
      }

      const profile = mapDbProfile(data);
      set({ profile });
    } catch (error) {
      console.error('[Auth] Fetch profile error:', error);
    }
  },

  // Update user profile
  updateProfile: async (updates) => {
    const { session, profile } = get();
    if (!session?.user?.id) return;

    try {
      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', session.user.id);

      if (error) {
        console.error('[Auth] Update profile error:', error);
        return;
      }

      // Update local state
      if (profile) {
        set({
          profile: { ...profile, ...updates } as UserProfile,
        });
      }
    } catch (error) {
      console.error('[Auth] Update profile error:', error);
    }
  },

  // Sign out
  signOut: async () => {
    try {
      set({ isLoading: true });
      await supabase.auth.signOut();
      set({
        user: null,
        session: null,
        profile: null,
        isAuthenticated: false,
        isLoading: false,
      });
    } catch (error) {
      console.error('[Auth] Sign out error:', error);
      set({ isLoading: false });
    }
  },

  // Delete account (Apple requirement)
  deleteAccount: async () => {
    const { session } = get();
    if (!session?.user?.id) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      set({ isLoading: true });

      // Call the RPC function to delete account
      const { error } = await supabase.rpc('delete_user_account');

      if (error) {
        console.error('[Auth] Delete account error:', error);
        set({ isLoading: false });
        return { success: false, error: error.message };
      }

      // Clear local state
      set({
        user: null,
        session: null,
        profile: null,
        isAuthenticated: false,
        isLoading: false,
      });

      return { success: true };
    } catch (error) {
      console.error('[Auth] Delete account error:', error);
      set({ isLoading: false });
      return { success: false, error: 'Failed to delete account' };
    }
  },

  // Sign in with email
  signInWithEmail: async (email, password) => {
    try {
      set({ isLoading: true });
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return { success: true };
    } catch (error: unknown) {
      console.error('[Auth] Sign in error:', error);
      set({ isLoading: false });
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: errorMessage };
    }
  },

  // Sign up with email
  signUpWithEmail: async (email, password) => {
    try {
      set({ isLoading: true });
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;
      return { success: true };
    } catch (error: unknown) {
      console.error('[Auth] Sign up error:', error);
      set({ isLoading: false });
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: errorMessage };
    }
  },
}));

// Auth state listener hook (call in root layout)
export function setupAuthListener() {
  const { setSession, setProfile, fetchProfile } = useAuthStore.getState();

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(async (event, session) => {
    console.log('[Auth Event]:', event);

    switch (event) {
      case 'SIGNED_IN':
        setSession(session);
        // Small delay to ensure profile is created by trigger
        setTimeout(() => fetchProfile(), 500);
        break;

      case 'SIGNED_OUT':
        setSession(null);
        setProfile(null);
        break;

      case 'TOKEN_REFRESHED':
        setSession(session);
        break;

      case 'USER_UPDATED':
        setSession(session);
        await fetchProfile();
        break;

      case 'INITIAL_SESSION':
        if (session) {
          setSession(session);
          await fetchProfile();
        }
        break;
    }
  });

  return subscription;
}

// Selector for auth provider
export const selectAuthProvider = (): AuthProvider | null => {
  const { profile, user } = useAuthStore.getState();
  return profile?.auth_provider || user?.authProvider || null;
};
