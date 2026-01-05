import { LanguageLevel } from '@/types/settings';
import { Word } from '@/types/word';

export const MOCK_WORDS: Word[] = [
  // ===== BEGINNER LEVEL (seq 1, 2, 3) =====
  {
    id: 'beg-seq-1',
    level: 'beginner',
    sequence_number: 1,
    word_de: 'Haus',
    article: 'das',
    transcription_de: '/haʊ̯s/',
    part_of_speech: 'noun',
    translations: {
      ru: { main: 'Дом', alternatives: ['Здание', 'Жилище'] },
      uk: { main: 'Будинок', alternatives: ['Будова', 'Житло'] },
      en: { main: 'House', alternatives: ['Building', 'Home'] },
      de: { main: 'Haus', alternatives: ['Gebäude', 'Wohnhaus'] }
    },
    content: {
      example_sentence: {
        de: 'Ich wohne in einem großen **Haus**',
        ru: 'Я живу в большом доме.',
        uk: 'Я живу у великому будинку.',
        en: 'I live in a big house.'
      },
      etymology: {
        text_ru: 'От прагерманского *hūsą (укрытие, жилище).',
        text_uk: 'Від прагерманського *hūsą (укриття, житло).',
        text_en: 'From Proto-Germanic *hūsą (shelter, dwelling).',
        text_de: 'Vom urgermanischen *hūsą (Schutz, Wohnung).',
        root_word: '*hūsą'
      },
      synonyms: ['Gebäude', 'Wohnung'],
      notes: 'Средний род, артикль "das".'
    },
    media: {
      audio_path: ''
    }
  },
  {
    id: 'beg-seq-2',
    level: 'beginner',
    sequence_number: 2,
    word_de: 'lernen',
    article: null,
    transcription_de: '/ˈlɛʁnən/',
    part_of_speech: 'verb',
    translations: {
      ru: { main: 'Учить', alternatives: ['Изучать', 'Обучаться'] },
      uk: { main: 'Вчити', alternatives: ['Вивчати', 'Навчатися'] },
      en: { main: 'To learn', alternatives: ['To study'] },
      de: { main: 'Lernen', alternatives: ['Studieren', 'Pauken'] }
    },
    content: {
      example_sentence: {
        de: 'Ich **lerne** Deutsch.',
        ru: 'Я учу немецкий.',
        uk: 'Я вчу німецьку.',
        en: 'I am learning German.'
      },
      etymology: {
        text_ru: 'От староверхненемецкого "lernēn" (учиться следовать по следу).',
        text_uk: 'Від давньоверхньонімецького "lernēn" (вчитися йти по сліду).',
        text_en: 'From Old High German "lernēn" (to learn to follow a track).',
        text_de: 'Vom althochdeutschen "lernēn" (einer Spur folgen lernen).',
        root_word: 'lernēn'
      },
      notes: 'Регулярный глагол, требует Akkusativ.'
    },
    media: {
      audio_path: ''
    }
  },
  {
    id: 'beg-seq-3',
    level: 'beginner',
    sequence_number: 3,
    word_de: 'groß',
    article: null,
    transcription_de: '/ɡʁoːs/',
    part_of_speech: 'adjective',
    translations: {
      ru: { main: 'Большой', alternatives: ['Великий', 'Крупный'] },
      uk: { main: 'Великий', alternatives: ['Більший', 'Великан'] },
      en: { main: 'Big', alternatives: ['Large', 'Great'] },
      de: { main: 'Groß', alternatives: ['Riesig', 'Gewaltig'] }
    },
    content: {
      example_sentence: {
        de: 'Das ist ein **großes** Auto.',
        ru: 'Это большая машина.',
        uk: 'Це велика машина.',
        en: 'This is a big car.'
      },
      etymology: {
        text_ru: 'От прагерманского *grautaz (большой, грубый).',
        text_uk: 'Від прагерманського *grautaz (великий, грубий).',
        text_en: 'From Proto-Germanic *grautaz (big, coarse).',
        text_de: 'Vom urgermanischen *grautaz (groß, grobkörnig).',
        root_word: '*grautaz'
      },
      notes: 'Склоняется по падежам и родам.'
    },
    media: {
      audio_path: ''
    }
  },

  // ===== INTERMEDIATE LEVEL (seq 1, 2, 3) =====
  {
    id: 'int-seq-1',
    level: 'intermediate',
    sequence_number: 1,
    word_de: 'Verantwortung',
    article: 'die',
    transcription_de: '/fɛɐ̯ˈantvɔʁtʊŋ/',
    part_of_speech: 'noun',
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
        text_de: 'Vom Verb "verantworten", Wurzel "Antwort" (Antwort geben müssen).',
        root_word: 'Antwort'
      },
      notes: 'Часто используется с глаголами "tragen" или "übernehmen".'
    },
    media: {
      audio_path: ''
    }
  },
  {
    id: 'int-seq-2',
    level: 'intermediate',
    sequence_number: 2,
    word_de: 'entwickeln',
    article: null,
    transcription_de: '/ɛntˈvɪkl̩n/',
    part_of_speech: 'verb',
    translations: {
      ru: { main: 'Развивать', alternatives: ['Разрабатывать', 'Создавать'] },
      uk: { main: 'Розвивати', alternatives: ['Розробляти', 'Створювати'] },
      en: { main: 'To develop', alternatives: ['To evolve', 'To create'] },
      de: { main: 'Entwickeln', alternatives: ['Ausarbeiten', 'Entfalten'] }
    },
    content: {
      example_sentence: {
        de: 'Wir **entwickeln** neue Technologien.',
        ru: 'Мы разрабатываем новые технологии.',
        uk: 'Ми розробляємо нові технології.',
        en: 'We are developing new technologies.'
      },
      etymology: {
        text_ru: 'От "wickeln" (обматывать) + приставка "ent-" (раз-). Буквально: разматывать.',
        text_uk: 'Від "wickeln" (обертати) + префікс "ent-" (роз-). Буквально: розмотувати.',
        text_en: 'From "wickeln" (to wrap) + prefix "ent-" (un-). Literally: to unwrap.',
        text_de: 'Von "wickeln" (einwickeln) + Vorsilbe "ent-". Wörtlich: auswickeln, entfalten.',
        root_word: 'wickeln'
      },
      notes: 'Отделяемая приставка ent- остается с глаголом.'
    },
    media: {
      audio_path: ''
    }
  },
  {
    id: 'int-seq-3',
    level: 'intermediate',
    sequence_number: 3,
    word_de: 'nachhaltig',
    article: null,
    transcription_de: '/ˈnaːxˌhaltɪç/',
    part_of_speech: 'adjective',
    translations: {
      ru: { main: 'Устойчивый', alternatives: ['Долгосрочный', 'Экологичный'] },
      uk: { main: 'Сталий', alternatives: ['Довгостроковий', 'Екологічний'] },
      en: { main: 'Sustainable', alternatives: ['Long-lasting', 'Eco-friendly'] },
      de: { main: 'Nachhaltig', alternatives: ['Dauerhaft', 'Beständig'] }
    },
    content: {
      example_sentence: {
        de: 'Wir brauchen eine **nachhaltige** Lösung.',
        ru: 'Нам нужно устойчивое решение.',
        uk: 'Нам потрібно стале рішення.',
        en: 'We need a sustainable solution.'
      },
      etymology: {
        text_ru: 'От "nachhalten" (продолжать держать). Изначально термин из лесоводства XVIII века.',
        text_uk: 'Від "nachhalten" (продовжувати тримати). Спочатку термін з лісівництва XVIII сторіччя.',
        text_en: 'From "nachhalten" (to continue holding). Originally a forestry term from the 18th century.',
        text_de: 'Von "nachhalten" (weiterhin halten). Forstwirtschaftlicher Begriff aus dem 18. Jahrhundert.',
        root_word: 'halten'
      },
      notes: 'Модное слово в контексте экологии и бизнеса.'
    },
    media: {
      audio_path: ''
    }
  },

  // ===== ADVANCED LEVEL (seq 1, 2, 3) =====
  {
    id: 'adv-seq-1',
    level: 'advanced',
    sequence_number: 1,
    word_de: 'Weltanschauung',
    article: 'die',
    transcription_de: '/ˈvɛltʔanˌʃaʊ̯ʊŋ/',
    part_of_speech: 'noun',
    translations: {
      ru: { main: 'Мировоззрение', alternatives: ['Философия жизни'] },
      uk: { main: 'Світогляд', alternatives: ['Філософія життя'] },
      en: { main: 'Worldview', alternatives: ['Philosophy of life'] },
      de: { main: 'Weltanschauung', alternatives: ['Weltbild', 'Lebensphilosophie'] }
    },
    content: {
      example_sentence: {
        de: 'Seine **Weltanschauung** wurde durch Reisen geprägt.',
        ru: 'Его мировоззрение сформировалось благодаря путешествиям.',
        uk: 'Його світогляд сформувався завдяки подорожам.',
        en: 'His worldview was shaped by travel.'
      },
      etymology: {
        text_ru: 'Сложное слово: "Welt" (мир) + "Anschauung" (взгляд, созерцание). Популяризировано Кантом.',
        text_uk: 'Складне слово: "Welt" (світ) + "Anschauung" (погляд, споглядання). Популяризоване Кантом.',
        text_en: 'Compound: "Welt" (world) + "Anschauung" (view, contemplation). Popularized by Kant.',
        text_de: 'Kompositum aus "Welt" + "Anschauung". Philosophischer Begriff, von Kant geprägt.',
        root_word: 'schauen'
      },
      notes: 'Философский термин, вошел в международный лексикон.'
    },
    media: {
      audio_path: ''
    }
  },
  {
    id: 'adv-seq-2',
    level: 'advanced',
    sequence_number: 2,
    word_de: 'voraussetzen',
    article: null,
    transcription_de: '/foˈʁaʊ̯sˌzɛt͡sn/',
    part_of_speech: 'verb',
    translations: {
      ru: { main: 'Предполагать', alternatives: ['Подразумевать', 'Требовать'] },
      uk: { main: 'Передбачати', alternatives: ['Припускати', 'Вимагати'] },
      en: { main: 'To presuppose', alternatives: ['To assume', 'To require'] },
      de: { main: 'Voraussetzen', alternatives: ['Annehmen', 'Verlangen'] }
    },
    content: {
      example_sentence: {
        de: 'Der Job **setzt** Programmierkenntnisse **voraus**.',
        ru: 'Эта работа требует знания программирования.',
        uk: 'Ця робота вимагає знання програмування.',
        en: 'The job requires programming knowledge.'
      },
      etymology: {
        text_ru: 'От "voraus" (вперед, заранее) + "setzen" (ставить). Буквально: заранее ставить.',
        text_uk: 'Від "voraus" (наперед, заздалегідь) + "setzen" (ставити). Буквально: заздалегідь ставити.',
        text_en: 'From "voraus" (ahead) + "setzen" (to set). Literally: to set in advance.',
        text_de: 'Von "voraus" (im Voraus) + "setzen". Bedeutet: als Bedingung annehmen.',
        root_word: 'setzen'
      },
      notes: 'Отделяемый глагол: в Präsens отделяется.'
    },
    media: {
      audio_path: ''
    }
  },
  {
    id: 'adv-seq-3',
    level: 'advanced',
    sequence_number: 3,
    word_de: 'unumgänglich',
    article: null,
    transcription_de: '/ˈʊnʔʊmˌɡɛŋlɪç/',
    part_of_speech: 'adjective',
    translations: {
      ru: { main: 'Неизбежный', alternatives: ['Неотвратимый', 'Обязательный'] },
      uk: { main: 'Неминучий', alternatives: ['Неминуемий', 'Обов\'язковий'] },
      en: { main: 'Inevitable', alternatives: ['Unavoidable', 'Indispensable'] },
      de: { main: 'Unumgänglich', alternatives: ['Unvermeidlich', 'Zwingend'] }
    },
    content: {
      example_sentence: {
        de: 'Diese Maßnahme ist **unumgänglich**.',
        ru: 'Эта мера неизбежна.',
        uk: 'Цей захід неминучий.',
        en: 'This measure is inevitable.'
      },
      etymology: {
        text_ru: 'От "umgehen" (обходить) с приставками "un-" (не-) и "-lich" (прилаг.). Буквально: то, что нельзя обойти.',
        text_uk: 'Від "umgehen" (обходити) з префіксами "un-" (не-) і "-lich" (прикм.). Буквально: те, що не можна обійти.',
        text_en: 'From "umgehen" (to bypass) with prefixes "un-" + "-lich". Literally: that which cannot be bypassed.',
        text_de: 'Von "umgehen" (vermeiden) mit Präfixen "un-" + "-lich". Wörtlich: nicht zu umgehen.',
        root_word: 'gehen'
      },
      notes: 'Формальный стиль, часто в деловом контексте.'
    },
    media: {
      audio_path: ''
    }
  },
];

/**
 * Вычисляет линейный номер дня с момента регистрации (без циклирования)
 */
export function getUserDayNumber(registrationDate: string | null): number {
  if (!registrationDate) {
    // Для демо без регистрации: день 1
    return 1;
  }

  const regDate = new Date(registrationDate);
  const now = new Date();

  // Сбрасываем время до полуночи для точного расчета дней
  regDate.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);

  const diffTime = now.getTime() - regDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  // Линейная последовательность: день 1, 2, 3, ..., ∞
  return diffDays + 1;
}

/**
 * Получить слово дня по уровню и sequence_number
 */
export function getTodayWord(level: LanguageLevel, registrationDate: string | null = null): Word | null {
  const userDay = getUserDayNumber(registrationDate);

  // Ищем слово по уровню и sequence_number
  const word = MOCK_WORDS.find(w => w.level === level && w.sequence_number === userDay);

  // Если слова нет → пользователь прошел весь доступный контент
  if (!word) {
    console.log(`No word available for day ${userDay}, level ${level}`);
    return MOCK_WORDS.find(w => w.level === level && w.sequence_number === 1) || null;
  }

  return word;
}

/**
 * Получить слово по ID
 */
export function getWordById(id: string): Word | undefined {
  return MOCK_WORDS.find(word => word.id === id);
}

/**
 * Получить все слова (для истории/избранного)
 */
export function getAllWords(): Word[] {
  return MOCK_WORDS;
}

/**
 * Получить все слова определенного уровня
 */
export function getWordsByLevel(level: LanguageLevel): Word[] {
  return MOCK_WORDS.filter(word => word.level === level);
}

/**
 * Демо-избранное для тестирования UI
 * В production будет храниться в user_words_history (is_favorite = true)
 */
export const MOCK_FAVORITE_IDS: string[] = ['beg-seq-1', 'int-seq-1', 'adv-seq-1'];
