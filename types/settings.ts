/**
 * User Settings Types
 * Language preferences and user information
 */

export type TranslationLanguage = 'ru' | 'uk' | 'en' | 'de';

export type LanguageLevel = 'beginner' | 'intermediate' | 'advanced';

export interface LanguageOption {
  code: TranslationLanguage;
  name: string;
  nativeName: string;
}

export interface LevelOption {
  id: LanguageLevel;
  label: {
    ru: string;
    uk: string;
    en: string;
    de: string;
  };
}

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська' },
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
];

export const LEVEL_OPTIONS: LevelOption[] = [
  {
    id: 'beginner',
    label: {
      ru: 'Начальный (A1-A2)',
      uk: 'Початковий (A1-A2)',
      en: 'Beginner (A1-A2)',
      de: 'Anfänger (A1-A2)',
    }
  },
  {
    id: 'intermediate',
    label: {
      ru: 'Средний (B1-B2)',
      uk: 'Середній (B1-B2)',
      en: 'Intermediate (B1-B2)',
      de: 'Mittelstufe (B1-B2)',
    }
  },
  {
    id: 'advanced',
    label: {
      ru: 'Продвинутый (C1-C2)',
      uk: 'Просунутий (C1-C2)',
      en: 'Advanced (C1-C2)',
      de: 'Fortgeschritten (C1-C2)',
    }
  },
];

export interface UserSettings {
  translationLanguage: TranslationLanguage;
  languageLevel: LanguageLevel;
  userEmail: string | null;
}
