/**
 * Auth Service for Vocade
 * Handles Email, Apple, and Google authentication
 */

import { storage } from '@/lib/storage';
import { supabase } from '@/lib/supabase-client';
import { AppleCredential, SignInData, SignUpData } from '@/types/auth';
import { Platform } from 'react-native';

// Check if Apple Sign In mock is enabled
export const isAppleMockEnabled = () => {
  return process.env.EXPO_PUBLIC_APPLE_SIGN_IN_MOCK === 'true';
};

// Sign up with email and password
export async function signUpWithEmail({ email, password, displayName }: SignUpData) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: displayName,
      },
    },
  });

  if (error) {
    console.error('[Auth] Sign up error:', error);
    return { user: null, error: error.message };
  }

  return { user: data.user, error: null };
}

// Sign in with email and password
export async function signInWithEmail({ email, password }: SignInData) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('[Auth] Sign in error:', error);
    return { user: null, error: error.message };
  }

  return { user: data.user, error: null };
}

// Sign in with Apple (iOS only)
// ⚠️ IMPORTANT: fullName is only provided on FIRST sign in!
export async function signInWithApple(credential: AppleCredential) {
  // Mock mode for testing without Apple Developer account
  if (isAppleMockEnabled()) {
    console.log('[Auth] Apple Sign In MOCK mode enabled');
    // Simulate Apple Sign In with mock credentials
    const mockEmail = `mock-apple-${Date.now()}@privaterelay.appleid.com`;
    const mockPassword = 'mock-apple-password-' + Date.now();

    // Try to sign in first, if fails then sign up
    const { data: existingUser } = await supabase.auth.signInWithPassword({
      email: mockEmail,
      password: mockPassword,
    });

    if (existingUser.user) {
      return { user: existingUser.user, error: null };
    }

    // Sign up with mock credentials
    const { data, error } = await supabase.auth.signUp({
      email: mockEmail,
      password: mockPassword,
      options: {
        data: {
          full_name: 'Mock Apple User',
        },
      },
    });

    if (error) {
      console.error('[Auth] Mock Apple sign in error:', error);
      return { user: null, error: error.message };
    }

    return { user: data.user, error: null };
  }

  // Real Apple Sign In flow
  if (!credential.identityToken) {
    return { user: null, error: 'No identity token provided' };
  }

  // Build display name from Apple credential (only available on first sign in)
  let displayName: string | null = null;
  if (credential.fullName) {
    const { givenName, familyName } = credential.fullName;
    displayName = [givenName, familyName].filter(Boolean).join(' ').trim() || null;
  }

  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: 'apple',
    token: credential.identityToken,
    options: {
      captchaToken: undefined,
    },
  });

  if (error) {
    console.error('[Auth] Apple sign in error:', error);
    return { user: null, error: error.message };
  }

  // If we got a display name, save it to the profile
  // This is critical because Apple only provides it ONCE!
  if (displayName && data.user) {
    setTimeout(async () => {
      try {
        await supabase
          .from('users')
          .update({ display_name: displayName })
          .eq('id', data.user!.id);
        console.log('[Auth] Saved Apple display name:', displayName);
      } catch (e) {
        console.error('[Auth] Failed to save Apple display name:', e);
      }
    }, 1000); // Delay to ensure profile is created by trigger
  }

  return { user: data.user, error: null };
}

// Sign in with Google (OAuth)
export async function signInWithGoogle() {
  const redirectUrl = Platform.OS === 'web'
    ? window.location.origin
    : 'vocade://auth/callback';

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUrl,
    },
  });

  if (error) {
    console.error('[Auth] Google sign in error:', error);
    return { url: null, error: error.message };
  }

  return { url: data.url, error: null };
}

// Sign out
export async function signOut() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('[Auth] Sign out error:', error);
    return { success: false, error: error.message };
  }

  // Clear local storage
  await storage.removeItem('vocade-settings');
  await storage.removeItem('vocade-favorites');

  return { success: true, error: null };
}

// Send password reset email
export async function sendPasswordResetEmail(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: Platform.OS === 'web'
      ? `${window.location.origin}/auth/reset-password`
      : 'vocade://auth/reset-password',
  });

  if (error) {
    console.error('[Auth] Password reset error:', error);
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
}

// Update password
export async function updatePassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    console.error('[Auth] Update password error:', error);
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
}

// Update email
export async function updateEmail(newEmail: string) {
  const { error } = await supabase.auth.updateUser({
    email: newEmail,
  });

  if (error) {
    console.error('[Auth] Update email error:', error);
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
}

// Delete account
export async function deleteAccount() {
  const { error } = await supabase.rpc('delete_user_account');

  if (error) {
    console.error('[Auth] Delete account error:', error);
    return { success: false, error: error.message };
  }

  // Clear all local data
  await storage.removeItem('vocade-settings');
  await storage.removeItem('vocade-favorites');

  return { success: true, error: null };
}

// Get current session
export async function getCurrentSession() {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    console.error('[Auth] Get session error:', error);
    return { session: null, error: error.message };
  }

  return { session: data.session, error: null };
}

// Get current user
export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    console.error('[Auth] Get user error:', error);
    return { user: null, error: error.message };
  }

  return { user: data.user, error: null };
}
