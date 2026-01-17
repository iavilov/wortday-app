/**
 * Zustand store for User Settings
 * Handles: Translation language preference, language level, user email
 * Persistence: Universal storage (localStorage on Web, AsyncStorage on Mobile)
 */

import { storage } from '@/lib/storage';
import { LanguageLevel, TranslationLanguage } from '@/types/settings';
import { create } from 'zustand';

interface SettingsStore {
  // User settings
  translationLanguage: TranslationLanguage;
  languageLevel: LanguageLevel;
  userEmail: string;
  registrationDate: string | null;
  hasCompletedOnboarding: boolean;
  _hasHydrated: boolean;

  // Actions
  setTranslationLanguage: (language: TranslationLanguage) => void;
  setLanguageLevel: (level: LanguageLevel) => void;
  setRegistrationDate: (date: string) => void;
  setHasCompletedOnboarding: (completed: boolean) => void;
  hydrate: () => Promise<void>;
  _setHasHydrated: (state: boolean) => void;
  reset: () => void;
}

const STORAGE_KEY = 'vocade-settings';

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  // Initial state (defaults)
  translationLanguage: 'en',
  languageLevel: 'beginner',
  userEmail: 'user@example.com',
  registrationDate: null,
  hasCompletedOnboarding: false,
  _hasHydrated: false,

  // Hydrate from storage
  hydrate: async () => {
    try {
      const stored = await storage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        set({
          translationLanguage: parsed.translationLanguage || 'ru',
          languageLevel: parsed.languageLevel || 'beginner',
          userEmail: parsed.userEmail || 'user@example.com',
          registrationDate: parsed.registrationDate || null,
          hasCompletedOnboarding: parsed.hasCompletedOnboarding || false,
          _hasHydrated: true,
        });
      } else {
        set({ _hasHydrated: true });
      }
    } catch (e) {
      console.error('Failed to hydrate settings:', e);
      set({ _hasHydrated: true });
    }
  },

  // Set translation language
  setTranslationLanguage: (language: TranslationLanguage) => {
    set({ translationLanguage: language });
    saveToStorage(get());
  },

  // Set language level
  setLanguageLevel: (level: LanguageLevel) => {
    set({ languageLevel: level });
    saveToStorage(get());
  },

  // Set registration date
  setRegistrationDate: (date: string) => {
    set({ registrationDate: date });
    saveToStorage(get());
  },

  // Set onboarding completion
  setHasCompletedOnboarding: (completed: boolean) => {
    set({ hasCompletedOnboarding: completed });
    saveToStorage(get());
  },

  _setHasHydrated: (state: boolean) => {
    set({ _hasHydrated: state });
  },

  reset: () => {
    set({
      translationLanguage: 'en',
      languageLevel: 'beginner',
      userEmail: 'user@example.com',
      registrationDate: null,
      hasCompletedOnboarding: false,
      _hasHydrated: false,
    });
  }
}));

// Helper to save to storage
async function saveToStorage(state: SettingsStore) {
  try {
    const { _hasHydrated, ...stateToSave } = state;
    await storage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
}
