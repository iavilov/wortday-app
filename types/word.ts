/**
 * TypeScript interfaces for Word data structure
 * Based on Supabase schema from CONTEXT.md
 */

export type Article = 'der' | 'die' | 'das' | 'none';

export type PartOfSpeech = 'noun' | 'verb' | 'adjective' | 'adverb' | 'other';

export type Level = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export interface Translation {
  main: string;
  alternatives?: string[];
}

export interface Translations {
  ru: Translation;
}

export interface ExampleSentence {
  de: string;
  ru: string;
}

export interface Etymology {
  text_ru: string;
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

/**
 * Article color mapping for UI
 * Der = Blue, Die = Red, Das = Green
 * Using hex colors for React Native inline styles
 */
export const ARTICLE_COLORS = {
  der: {
    bg: '#DBEAFE',      // blue-100
    text: '#1D4ED8',    // blue-700
    border: '#93C5FD',  // blue-300
    accent: '#3B82F6'
  },
  die: {
    bg: '#FEE2E2',      // red-100
    text: '#B91C1C',    // red-700
    border: '#FCA5A5',  // red-300
    accent: '#EF4444'
  },
  das: {
    bg: '#D1FAE5',      // green-100
    text: '#047857',    // green-700
    border: '#6EE7B7',  // green-300
    accent: '#10B981'
  },
  none: {
    bg: '#F3F4F6',      // gray-100
    text: '#374151',    // gray-700
    border: '#D1D5DB',  // gray-300
    accent: '#6B7280'
  }
} as const;
