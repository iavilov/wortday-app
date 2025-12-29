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

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська' },
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
];

export interface LevelOption {
  code: LanguageLevel;
  name: {
    ru: string;
    uk: string;
    en: string;
    de: string;
  };
}

export const LEVEL_OPTIONS: LevelOption[] = [
  {
    code: 'beginner',
    name: {
      ru: 'Начальный',
      uk: 'Початковий',
      en: 'Beginner',
      de: 'Anfänger'
    }
  },
  {
    code: 'intermediate',
    name: {
      ru: 'Средний',
      uk: 'Середній',
      en: 'Intermediate',
      de: 'Mittelstufe'
    }
  },
  {
    code: 'advanced',
    name: {
      ru: 'Продвинутый',
      uk: 'Просунутий',
      en: 'Advanced',
      de: 'Fortgeschritten'
    }
  },
];

export interface UserSettings {
  translationLanguage: TranslationLanguage;
  languageLevel: LanguageLevel;
  userEmail: string | null;
  registrationDate: string | null; // ISO date string для расчета day_offset
}
