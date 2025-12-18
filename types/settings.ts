/**
 * User Settings Types
 * Language preferences and user information
 */

export type TranslationLanguage = 'ru' | 'uk' | 'en';

export interface LanguageOption {
  code: TranslationLanguage;
  name: string;
  nativeName: string;
}

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська' },
  { code: 'en', name: 'English', nativeName: 'English' },
];

export interface UserSettings {
  translationLanguage: TranslationLanguage;
  userEmail: string | null;
}
