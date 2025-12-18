/**
 * Zustand store for User Settings
 * Handles: Translation language preference, user email
 */

import { TranslationLanguage } from '@/types/settings';
import { create } from 'zustand';

interface SettingsStore {
  // User settings
  translationLanguage: TranslationLanguage;
  userEmail: string;
  
  // Actions
  setTranslationLanguage: (language: TranslationLanguage) => void;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  // Initial state
  translationLanguage: 'ru', // Default to Russian
  userEmail: 'user@example.com', // Mock email for now (read-only)
  
  // Set translation language
  setTranslationLanguage: (language: TranslationLanguage) => {
    set({ translationLanguage: language });
  },
}));
