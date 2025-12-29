/**
 * Zustand store for User Settings
 * Handles: Translation language preference, language level, user email
 */

import { LanguageLevel, TranslationLanguage } from '@/types/settings';
import { create } from 'zustand';

interface SettingsStore {
  // User settings
  translationLanguage: TranslationLanguage;
  languageLevel: LanguageLevel;
  userEmail: string;
  registrationDate: string | null;
  _hasHydrated: boolean;

  // Actions
  setTranslationLanguage: (language: TranslationLanguage) => void;
  setLanguageLevel: (level: LanguageLevel) => void;
  setRegistrationDate: (date: string) => void;
  _setHasHydrated: (state: boolean) => void;
}

const STORAGE_KEY = 'vocade-settings';

// Helper to get initial state from localStorage (web only)
const getInitialState = () => {
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load settings from localStorage:', e);
    }
  }
  return null;
};

const initialState = getInitialState();

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  // Initial state
  translationLanguage: initialState?.translationLanguage || 'ru',
  languageLevel: initialState?.languageLevel || 'beginner',
  userEmail: initialState?.userEmail || 'user@example.com',
  registrationDate: initialState?.registrationDate || new Date().toISOString().split('T')[0],
  _hasHydrated: false,

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

  _setHasHydrated: (state: boolean) => {
    set({ _hasHydrated: state });
  },
}));

// Helper to save to localStorage
function saveToStorage(state: SettingsStore) {
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      const { _hasHydrated, ...stateToSave } = state;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (e) {
      console.error('Failed to save settings to localStorage:', e);
    }
  }
}
