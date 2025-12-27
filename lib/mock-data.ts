import { LanguageLevel } from '@/types/settings';
import { Word } from '@/types/word';

export const MOCK_WORDS: Word[] = [
  {
    id: '1',
    publish_date: new Date().toISOString().split('T')[0], // Today
    word_de: 'Haus',
    article: 'das',
    transcription_de: '/haʊs/',
    part_of_speech: 'noun',
    level: 'beginner',
    translations: {
      ru: { main: 'Дом', alternatives: ['Здание', 'Жилище'] },
      uk: { main: 'Будинок', alternatives: ['Будова', 'Житло'] },
      en: { main: 'House', alternatives: ['Building', 'Home'] },
      de: { main: 'Haus', alternatives: ['Heim', 'Gebäude'] }
    },
    content: {
      example_sentence: {
        de: 'Ich wohne in einem großen **Haus**.',
        ru: 'Я живу в большом доме.',
        uk: 'Я живу у великому будинку.',
        en: 'I live in a big house.'
      },
      etymology: {
        text_ru: 'Слово "Haus" происходит от прагерманского *hūsą, которое означало "укрытие, жилище".',
        text_uk: 'Слово "Haus" походить від прагерманського *hūsą, що означало "укриття, житло".',
        text_en: 'The word "Haus" comes from Proto-Germanic *hūsą, which meant "shelter, dwelling".',
        text_de: 'Das Wort "Haus" stammt vom urgermanischen *hūsą ab, was "Schutz, Wohnung" bedeutete.',
        root_word: '*hūsą'
      },
      synonyms: ['Gebäude', 'Wohnung'],
      notes: 'В немецком языке "Haus" используется не только для обозначения дома.'
    },
    media: {
      image_path: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&h=600&fit=crop',
      audio_path: ''
    }
  },
  {
    id: 'int-1',
    publish_date: new Date().toISOString().split('T')[0], // Today (Intermediate)
    word_de: 'Verantwortung',
    article: 'die',
    transcription_de: '/fɛɐ̯ˈantvɔʁtʊŋ/',
    part_of_speech: 'noun',
    level: 'intermediate',
    translations: {
      ru: { main: 'Ответственность', alternatives: ['Обязанность'] },
      uk: { main: 'Відповідальність', alternatives: ['Обов\'язок'] },
      en: { main: 'Responsibility', alternatives: ['Accountability'] },
      de: { main: 'Verantwortung', alternatives: ['Haftung', 'Zuständigkeit'] }
    },
    content: {
      example_sentence: {
        de: 'Er übernimmt die volle **Verantwortung** für das Projekt.',
        ru: 'Он берет на себя полную ответственность за проект.',
        uk: 'Він бере на себе повну відповідальність за проєкт.',
        en: 'He takes full responsibility for the project.'
      },
      etymology: {
        text_ru: 'От глагола "verantworten" (отвечать за что-либо), корень "Antwort" (ответ).',
        text_uk: 'Від дієслова "verantworten" (відповідати за що-небудь), корінь "Antwort" (відповідь).',
        text_en: 'From the verb "verantworten" (to be responsible for), root "Antwort" (answer).',
        text_de: 'Vom Verb "verantworten", Wurzel "Antwort". Bezeichnet die Pflicht, für sein Handeln einzustehen.',
        root_word: 'Antwort'
      },
      notes: 'Часто используется с глаголом "tragen" или "übernehmen".'
    },
    media: {
      image_path: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=600&fit=crop',
      audio_path: ''
    }
  },
  {
    id: 'adv-1',
    publish_date: new Date().toISOString().split('T')[0], // Today (Advanced)
    word_de: 'Herausforderung',
    article: 'die',
    transcription_de: '/hɛˈʁaʊ̯sfɔʁdəʁʊŋ/',
    part_of_speech: 'noun',
    level: 'advanced',
    translations: {
      ru: { main: 'Вызов', alternatives: ['Сложная задача'] },
      uk: { main: 'Виклик', alternatives: ['Складне завдання'] },
      en: { main: 'Challenge', alternatives: ['Defiance'] },
      de: { main: 'Herausforderung', alternatives: ['Provokation', 'Prüfung'] }
    },
    content: {
      example_sentence: {
        de: 'Das ist eine große technologische **Herausforderung**.',
        ru: 'Это большой технологический вызов.',
        uk: 'Це великий технологічний виклик.',
        en: 'This is a major technological challenge.'
      },
      etymology: {
        text_ru: 'Буквально "вызов наружу" (heraus + fordern). Изначально использовалось в контексте дуэлей.',
        text_uk: 'Буквально "виклик назовні" (heraus + fordern). Спочатку використовувалося в контексті дуелей.',
        text_en: 'Literally "calling out" (heraus + fordern). Originally used in the context of duels.',
        text_de: 'Zusammensetzung aus "heraus" and "fordern". Ursprünglich der Aufruf zum Kampf oder Duell.',
        root_word: 'fordern'
      },
      notes: 'Слово подчеркивает сложность, требующую усилий.'
    },
    media: {
      image_path: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop',
      audio_path: ''
    }
  },
  {
    id: '2',
    publish_date: new Date(Date.now() - 86400000).toISOString().split('T')[0], // Yesterday
    word_de: 'Tisch',
    article: 'der',
    transcription_de: '/tɪʃ/',
    part_of_speech: 'noun',
    level: 'beginner',
    translations: {
      ru: { main: 'Стол', alternatives: ['Столик'] },
      uk: { main: 'Стіл', alternatives: ['Столик'] },
      en: { main: 'Table', alternatives: ['Desk'] },
      de: { main: 'Tisch', alternatives: ['Tafel'] }
    },
    content: {
      example_sentence: {
        de: 'Das Buch liegt auf dem **Tisch**.',
        ru: 'Книга лежит на столе.',
        uk: 'Книга лежить на столі.',
        en: 'The book is on the table.'
      },
      etymology: {
        text_ru: 'От латинского "discus" (диск, блюдо).',
        text_uk: 'Від латинського "discus" (диск, тарілка).',
        text_en: 'From Latin "discus" (disc, plate).',
        text_de: 'Vom lateinischen "discus" (Scheibe, Schüssel).',
        root_word: 'discus'
      },
      notes: 'С предлогом "auf" (на) требует Dativ: auf dem Tisch.'
    },
    media: {
      image_path: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=600&fit=crop',
      audio_path: ''
    }
  }
];

/**
 * Get today's word by level
 */
export function getTodayWord(level: LanguageLevel = 'beginner'): Word | null {
  const today = new Date().toISOString().split('T')[0];

  // Try to find a word exactly for today and the given level
  const word = MOCK_WORDS.find(w => w.publish_date === today && w.level === level);

  // Fallback: if no word for today/level, return the first word of that level
  if (!word) {
    return MOCK_WORDS.find(w => w.level === level) || MOCK_WORDS[0];
  }

  return word;
}

/**
 * Get word by ID
 */
export function getWordById(id: string): Word | undefined {
  return MOCK_WORDS.find(word => word.id === id);
}

/**
 * Get all words (for favorites/history)
 */
export function getAllWords(): Word[] {
  return MOCK_WORDS;
}
