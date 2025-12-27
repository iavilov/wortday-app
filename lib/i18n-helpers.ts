/**
 * Internationalization helpers
 * Functions to get translations based on selected language
 */

import { TranslationLanguage } from '@/types/settings';
import { Word } from '@/types/word';
export { t } from '@/constants/translations';

/**
 * Get word translation for specific language
 */
export function getWordTranslation(word: Word, language: TranslationLanguage) {
  return word.translations[language];
}

/**
 * Get example sentence translation for specific language
 */
export function getExampleTranslation(word: Word, language: TranslationLanguage) {
  return word.content.example_sentence[language];
}

/**
 * Get etymology text for specific language
 */
export function getEtymologyText(word: Word, language: TranslationLanguage) {
  return word.content.etymology[`text_${language}` as keyof typeof word.content.etymology] as string;
}

/**
 * Get all translations for a word in specific language
 * Convenient function to get everything at once
 */
export function getWordContent(word: Word, language: TranslationLanguage) {
  const translation = getWordTranslation(word, language);
  return {
    translation: translation.main,
    alternatives: translation.alternatives,
    exampleSentence: {
      de: word.content.example_sentence.de,
      translation: getExampleTranslation(word, language),
    },
    etymology: {
      text: getEtymologyText(word, language),
      rootWord: word.content.etymology.root_word,
    },
  };
}
