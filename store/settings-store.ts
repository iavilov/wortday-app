import { LanguageLevel, TranslationLanguage } from '@/types/settings';
import { create } from 'zustand';

interface SettingsStore {
  // User settings
  translationLanguage: TranslationLanguage;
  languageLevel: LanguageLevel;
  userEmail: string;

  // Actions
  setTranslationLanguage: (language: TranslationLanguage) => void;
  setLanguageLevel: (level: LanguageLevel) => void;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  // Initial state
  translationLanguage: 'ru', // Default to Russian
  languageLevel: 'beginner', // Default to Beginner
  userEmail: 'user@example.com', // Mock email for now (read-only)

  // Set translation language
  setTranslationLanguage: (language: TranslationLanguage) => {
    set({ translationLanguage: language });
  },

  // Set language level
  setLanguageLevel: (level: LanguageLevel) => {
    set({ languageLevel: level });
  },
}));
