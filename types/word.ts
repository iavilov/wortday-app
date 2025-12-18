/**
 * TypeScript interfaces for Word data structure
 * Based on Supabase schema from CONTEXT.md
 */

/**
 * Article color mapping for UI
 * Der = Blue, Die = Red, Das = Green
 * Imported from centralized design tokens
 */
import { articleColors } from '@/constants/colors';

export type Article = 'der' | 'die' | 'das' | 'none';

export type PartOfSpeech = 'noun' | 'verb' | 'adjective' | 'adverb' | 'other';

export type Level = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export interface Translation {
  main: string;
  alternatives?: string[];
}

export interface Translations {
  ru: Translation;
  uk: Translation;  // Ukrainian
  en: Translation;  // English
}

export interface ExampleSentence {
  de: string;  // German sentence (same for all)
  ru: string;  // Russian translation
  uk: string;  // Ukrainian translation
  en: string;  // English translation
}

export interface Etymology {
  text_ru: string;  // Russian etymology
  text_uk: string;  // Ukrainian etymology
  text_en: string;  // English etymology
  root_word?: string;
}

export interface WordContent {
  example_sentence: ExampleSentence;
  etymology: Etymology;
  synonyms?: string[];
  antonyms?: string[];
  notes?: string;
}

export interface WordMedia {
  image_path: string;
  audio_path: string;
}

/**
 * Main Word interface matching Supabase table structure
 */
export interface Word {
  id: string;
  publish_date: string; // ISO date string
  word_de: string;
  article: Article;
  part_of_speech: PartOfSpeech;
  level: Level;
  translations: Translations;
  content: WordContent;
  media: WordMedia;
}

export const ARTICLE_COLORS = articleColors;
