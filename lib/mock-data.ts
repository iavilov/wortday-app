/**
 * Mock data for testing UI (Iterations 1-3)
 * Full Word objects with all fields populated
 */

import { Word } from '@/types/word';

export const MOCK_WORDS: Word[] = [
  {
    id: '1',
    publish_date: new Date().toISOString().split('T')[0], // Today
    word_de: 'Haus',
    article: 'das',
    part_of_speech: 'noun',
    level: 'A1',
    translations: {
      ru: {
        main: 'Дом',
        alternatives: ['Здание', 'Жилище']
      }
    },
    content: {
      example_sentence: {
        de: 'Ich wohne in einem großen **Haus**.',
        ru: 'Я живу в большом доме.'
      },
      etymology: {
        text_ru: 'Слово "Haus" происходит от прагерманского *hūsą, которое означало "укрытие, жилище". Интересно, что родственные слова есть в английском (house), голландском (huis) и скандинавских языках. Изначально это слово обозначало любое защищенное пространство, где можно укрыться от непогоды.',
        root_word: '*hūsą'
      },
      synonyms: ['Gebäude', 'Wohnung'],
      notes: 'В немецком языке "Haus" используется не только для обозначения дома, но и в составных словах: Krankenhaus (больница), Rathaus (ратуша).'
    },
    media: {
      image_path: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&h=600&fit=crop',
      audio_path: 'https://example.com/audio/haus.mp3' // Placeholder
    }
  },
  {
    id: '2',
    publish_date: new Date(Date.now() - 86400000).toISOString().split('T')[0], // Yesterday
    word_de: 'Tisch',
    article: 'der',
    part_of_speech: 'noun',
    level: 'A1',
    translations: {
      ru: {
        main: 'Стол',
        alternatives: ['Столик']
      }
    },
    content: {
      example_sentence: {
        de: 'Das Buch liegt auf dem **Tisch**.',
        ru: 'Книга лежит на столе.'
      },
      etymology: {
        text_ru: 'Слово "Tisch" происходит от латинского "discus" (диск, блюдо), которое пришло из древнегреческого δίσκος (diskos). Изначально столы действительно были круглыми, как большие блюда. Со временем форма изменилась, но название осталось.',
        root_word: 'discus'
      },
      synonyms: ['Tafel'],
      notes: 'Обратите внимание на предлог "auf" (на) с Dativ: auf dem Tisch. Артикль "der" превращается в "dem" в дательном падеже.'
    },
    media: {
      image_path: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=600&fit=crop',
      audio_path: 'https://example.com/audio/tisch.mp3' // Placeholder
    }
  },
  {
    id: '3',
    publish_date: new Date(Date.now() - 172800000).toISOString().split('T')[0], // 2 days ago
    word_de: 'Sonne',
    article: 'die',
    part_of_speech: 'noun',
    level: 'A1',
    translations: {
      ru: {
        main: 'Солнце',
        alternatives: []
      }
    },
    content: {
      example_sentence: {
        de: 'Die **Sonne** scheint heute hell.',
        ru: 'Сегодня солнце светит ярко.'
      },
      etymology: {
        text_ru: 'Слово "Sonne" восходит к прагерманскому *sunnōn, что связано с индоевропейским корнем *sóh₂wl̥ (солнце). Это одно из древнейших слов в германских языках. В мифологии германских народов Солнце часто персонифицировалось как богиня.',
        root_word: '*sunnōn'
      },
      synonyms: ['Sonnenschein (солнечный свет)'],
      notes: 'Женский артикль "die" остается во всех падежах: die Sonne, der Sonne, der Sonne, die Sonne.'
    },
    media: {
      image_path: 'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=800&h=600&fit=crop',
      audio_path: 'https://example.com/audio/sonne.mp3' // Placeholder
    }
  }
];

/**
 * Get today's word
 */
export function getTodayWord(): Word | null {
  const today = new Date().toISOString().split('T')[0];
  return MOCK_WORDS.find(word => word.publish_date === today) || MOCK_WORDS[0];
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
