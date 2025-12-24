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
      ru: {
        main: 'Дом',
        alternatives: ['Здание', 'Жилище']
      },
      uk: {
        main: 'Будинок',
        alternatives: ['Будова', 'Житло']
      },
      en: {
        main: 'House',
        alternatives: ['Building', 'Home']
      }
    },
    content: {
      example_sentence: {
        de: 'Ich wohne in einem großen **Haus**.',
        ru: 'Я живу в большом доме.',
        uk: 'Я живу у великому будинку.',
        en: 'I live in a big house.'
      },
      etymology: {
        text_ru: 'Слово "Haus" происходит от прагерманского *hūsą, которое означало "укрытие, жилище". Интересно, что родственные слова есть в английском (house), голландском (huis) и скандинавских языках. Изначально это слово обозначало любое защищенное пространство, где можно укрыться от непогоды.',
        text_uk: 'Слово "Haus" походить від прагерманського *hūsą, що означало "укриття, житло". Цікаво, що споріднені слова є в англійській (house), нідерландській (huis) та скандинавських мовах. Спочатку це слово означало будь-який захищений простір, де можна сховатися від негоди.',
        text_en: 'The word "Haus" comes from Proto-Germanic *hūsą, which meant "shelter, dwelling". Interestingly, related words exist in English (house), Dutch (huis), and Scandinavian languages. Originally, this word denoted any protected space where one could take shelter from the weather.',
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
    transcription_de: '/tɪʃ/',
    part_of_speech: 'noun',
    level: 'beginner',
    translations: {
      ru: {
        main: 'Стол',
        alternatives: ['Столик']
      },
      uk: {
        main: 'Стіл',
        alternatives: ['Столик']
      },
      en: {
        main: 'Table',
        alternatives: ['Desk']
      }
    },
    content: {
      example_sentence: {
        de: 'Das Buch liegt auf dem **Tisch**.',
        ru: 'Книга лежит на столе.',
        uk: 'Книга лежить на столі.',
        en: 'The book is on the table.'
      },
      etymology: {
        text_ru: 'Слово "Tisch" происходит от латинского "discus" (диск, блюдо), которое пришло из древнегреческого δίσκος (diskos). Изначально столы действительно были круглыми, как большие блюда. Со временем форма изменилась, но название осталось.',
        text_uk: 'Слово "Tisch" походить від латинського "discus" (диск, тарілка), що прийшло з давньогрецького δίσκος (diskos). Спочатку столи справді були круглими, як великі тарілки. З часом форма змінилася, але назва залишилася.',
        text_en: 'The word "Tisch" comes from Latin "discus" (disc, plate), which came from Ancient Greek δίσκος (diskos). Originally, tables were indeed round, like large plates. Over time, the shape changed, but the name remained.',
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
    transcription_de: '/ˈsonə/',
    part_of_speech: 'noun',
    level: 'beginner',
    translations: {
      ru: {
        main: 'Солнце',
        alternatives: []
      },
      uk: {
        main: 'Сонце',
        alternatives: []
      },
      en: {
        main: 'Sun',
        alternatives: []
      }
    },
    content: {
      example_sentence: {
        de: 'Die **Sonne** scheint heute hell.',
        ru: 'Сегодня солнце светит ярко.',
        uk: 'Сьогодні сонце світить яскраво.',
        en: 'The sun is shining brightly today.'
      },
      etymology: {
        text_ru: 'Слово "Sonne" восходит к прагерманскому *sunnōn, что связано с индоевропейским корнем *sóh₂wl̥ (солнце). Это одно из древнейших слов в германских языках. В мифологии германских народов Солнце часто персонифицировалось как богиня.',
        text_uk: 'Слово "Sonne" сходить до прагерманського *sunnōn, що пов\'язане з індоєвропейським коренем *sóh₂wl̥ (сонце). Це одне з найдавніших слів у германських мовах. У міфології германських народів Сонце часто персоніфікувалося як богиня.',
        text_en: 'The word "Sonne" goes back to Proto-Germanic *sunnōn, which is related to the Indo-European root *sóh₂wl̥ (sun). It is one of the oldest words in Germanic languages. In Germanic mythology, the Sun was often personified as a goddess.',
        root_word: '*sunnōn'
      },
      synonyms: ['Sonnenschein (солнечный свет)'],
      notes: 'Женский артикль "die" остается во всех падежах: die Sonne, der Sonne, der Sonne, die Sonne.'
    },
    media: {
      image_path: 'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=800&h=600&fit=crop',
      audio_path: 'https://example.com/audio/sonne.mp3' // Placeholder
    }
  },
  {
    id: '4',
    publish_date: new Date(Date.now() - 259200000).toISOString().split('T')[0], // 3 days ago
    word_de: 'laufen',
    transcription_de: '/ˈlaʊ̯fn̩/',
    article: null,
    part_of_speech: 'verb',
    level: 'beginner',
    translations: {
      ru: { main: 'Бежать', alternatives: ['Идти пешком'] },
      uk: { main: 'Бігти', alternatives: ['Йти пішки'] },
      en: { main: 'Run', alternatives: ['Walk'] }
    },
    content: {
      example_sentence: {
        de: 'Ich **laufe** jeden Morgen im Park.',
        ru: 'Я бегаю каждое утро в парке.',
        uk: 'Я бігаю кожного ранку в парку.',
        en: 'I run every morning in the park.'
      },
      etymology: {
        text_ru: 'От прагерманского *hlaupaną (прыгать, бежать). Родственно английскому "leap" (прыгать).',
        text_uk: 'Від прагерманського *hlaupaną (стрибати, бігти). Споріднене з англійським "leap" (стрибати).',
        text_en: 'From Proto-Germanic *hlaupaną (to jump, run). Cognate with English "leap".',
        root_word: '*hlaupaną'
      },
      notes: 'Неправильный глагол: er läuft.'
    },
    media: {
      image_path: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&h=600&fit=crop',
      audio_path: ''
    }
  },
  {
    id: '5',
    publish_date: new Date(Date.now() - 345600000).toISOString().split('T')[0], // 4 days ago
    word_de: 'schnell',
    transcription_de: '/ʃnɛl/',
    article: null,
    part_of_speech: 'adjective',
    level: 'beginner',
    translations: {
      ru: { main: 'Быстрый', alternatives: ['Скорый'] },
      uk: { main: 'Швидкий', alternatives: [] },
      en: { main: 'Fast', alternatives: ['Quick'] }
    },
    content: {
      example_sentence: {
        de: 'Das Auto ist sehr **schnell**.',
        ru: 'Эта машина очень быстрая.',
        uk: 'Ця машина дуже швидка.',
        en: 'The car is very fast.'
      },
      etymology: {
        text_ru: 'От прагерманского *snellaz (активный, смелый, быстрый).',
        text_uk: 'Від прагерманського *snellaz (активний, сміливий, швидкий).',
        text_en: 'From Proto-Germanic *snellaz (active, bold, quick).',
        root_word: '*snellaz'
      },
      notes: 'Может использоваться как наречие: Er läuft schnell (Он бежит быстро).'
    },
    media: {
      image_path: 'https://images.unsplash.com/photo-1517521733618-97c772c6962f?w=800&h=600&fit=crop',
      audio_path: ''
    }
  }
];

/**
 * Get today's word
 */
export function getTodayWord(): Word | null {
  const today = new Date().toISOString().split('T')[1];
  return MOCK_WORDS.find(word => word.publish_date === today) || MOCK_WORDS[1];
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
