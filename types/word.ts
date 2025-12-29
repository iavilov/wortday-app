import { articleColors, partOfSpeechColors } from '@/constants/design-tokens';

export type Article = 'der' | 'die' | 'das' | 'none' | null;

export type PartOfSpeech = 'noun' | 'verb' | 'adjective';

export type Level = 'beginner' | 'intermediate' | 'advanced';

export interface Translation {
  main: string;
  alternatives?: string[];
}

export interface Translations {
  ru: Translation;
  uk: Translation;
  en: Translation;
  de: Translation;
}

export interface ExampleSentence {
  de: string;
  ru: string;
  uk: string;
  en: string;
}

export interface Etymology {
  text_ru: string;
  text_uk: string;
  text_en: string;
  text_de: string;
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
  level: Level; // beginner | intermediate | advanced
  day_number: number; // 1-365, порядковый день для данного уровня
  transcription_de: string;
  word_de: string;
  article: Article;
  part_of_speech: PartOfSpeech;
  translations: Translations;
  content: WordContent;
  media: WordMedia;
}

export const ARTICLE_COLORS = articleColors;
export const PART_OF_SPEECH_COLORS = partOfSpeechColors;
