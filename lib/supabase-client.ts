/**
 * Supabase Client for Wortday
 *
 * Storage strategy:
 *  - Web: localStorage (only option in browser)
 *  - Native (iOS/Android): expo-secure-store (Keychain / Keystore — encrypted at rest)
 *  - SecureStore has a ~2KB per-value limit; if the JWT bundle ever exceeds it
 *    we fall back to AsyncStorage and log a warning so the issue is visible
 *    rather than silently dropping the session.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// SecureStore on iOS rejects values larger than 2048 bytes.
const SECURE_STORE_MAX_BYTES = 2048;

const SecureStorageAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      if (Platform.OS === 'web') {
        return localStorage.getItem(key);
      }
      const fromSecure = await SecureStore.getItemAsync(key);
      if (fromSecure !== null) return fromSecure;
      // Migration / oversized-value fallback.
      return await AsyncStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      if (Platform.OS === 'web') {
        localStorage.setItem(key, value);
        return;
      }
      if (value.length > SECURE_STORE_MAX_BYTES) {
        console.warn(
          `[Supabase] Session value (${value.length} bytes) exceeds SecureStore limit; ` +
          'falling back to AsyncStorage. Token is no longer encrypted at rest.',
        );
        await AsyncStorage.setItem(key, value);
        // Drop any stale SecureStore copy so getItem doesn't see two versions.
        await SecureStore.deleteItemAsync(key).catch(() => {});
        return;
      }
      await SecureStore.setItemAsync(key, value);
      // If a previous oversized version landed in AsyncStorage, clean it up.
      await AsyncStorage.removeItem(key).catch(() => {});
    } catch (err) {
      console.error('[Supabase] Storage setItem failed:', err);
    }
  },
  removeItem: async (key: string): Promise<void> => {
    try {
      if (Platform.OS === 'web') {
        localStorage.removeItem(key);
        return;
      }
      await Promise.all([
        SecureStore.deleteItemAsync(key).catch(() => {}),
        AsyncStorage.removeItem(key).catch(() => {}),
      ]);
    } catch {
      // Ignore errors
    }
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: SecureStorageAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web',
  },
});

// Export types for convenience
export type { Session, User } from '@supabase/supabase-js';
