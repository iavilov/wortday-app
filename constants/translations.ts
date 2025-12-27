import { TranslationLanguage } from '@/types/settings';

export const UI_TRANSLATIONS = {
    tabs: {
        home: {
            ru: 'Главная',
            uk: 'Головна',
            en: 'Home',
            de: 'Startseite',
        },
        history: {
            ru: 'История',
            uk: 'Історія',
            en: 'History',
            de: 'Verlauf',
        },
        settings: {
            ru: 'Настройки',
            uk: 'Налаштування',
            en: 'Settings',
            de: 'Einstellungen',
        },
    },
    home: {
        today: {
            ru: 'Сегодня',
            uk: 'Сьогодні',
            en: 'Today',
            de: 'Heute',
        },
        wordOfTheDay: {
            ru: 'Слово дня',
            uk: 'Слово дня',
            en: 'Word of the Day',
            de: 'Wort des Tages',
        },
        share: {
            ru: 'Поделиться',
            uk: 'Поділитися',
            en: 'Share',
            de: 'Teilen',
        },
        beispiel: {
            ru: 'Пример',
            uk: 'Приклад',
            en: 'Example',
            de: 'Beispiel',
        },
        etymologie: {
            ru: 'Этимология',
            uk: 'Етимологія',
            en: 'Etymology',
            de: 'Etymologie',
        },
        root: {
            ru: 'Корень',
            uk: 'Корінь',
            en: 'Root',
            de: 'Stamm',
        },
        shareMessage: {
            ru: 'Слово дня: {word} - {translation}. Учи немецкий с Vocade!',
            uk: 'Слово дня: {word} - {translation}. Вивчай німецьку з Vocade!',
            en: 'Word of the day: {word} - {translation}. Learn German with Vocade!',
            de: 'Wort des Tages: {word} - {translation}. Deutsch lernen mit Vocade!',
        },
    },
    history: {
        search: {
            ru: 'Поиск слов...',
            uk: 'Пошук слів...',
            en: 'Search words...',
            de: 'Wörter suchen...',
        },
        all: {
            ru: 'Все',
            uk: 'Всі',
            en: 'All',
            de: 'Alle',
        },
        favorites: {
            ru: 'Избранное',
            uk: 'Обране',
            en: 'Favorites',
            de: 'Favoriten',
        },
        notFound: {
            ru: 'Слова не найдены',
            uk: 'Слова не знайдені',
            en: 'No words found',
            de: 'Keine Wörter gefunden',
        },
        back: {
            ru: 'Назад',
            uk: 'Назад',
            en: 'Back',
            de: 'Zurück',
        },
        datum: {
            ru: 'Дата',
            uk: 'Дата',
            en: 'Date',
            de: 'Datum',
        },
        library: {
            ru: 'Моя библиотека',
            uk: 'Моя бібліотека',
            en: 'My Library',
            de: 'Meine Bibliothek',
        },
        noFavorites: {
            ru: 'Нет избранных слов',
            uk: 'Немає обраних слів',
            en: 'No favorite words',
            de: 'Keine Favoriten',
        },
        noHistory: {
            ru: 'История пуста',
            uk: 'Історія порожня',
            en: 'History is empty',
            de: 'Verlauf ist leer',
        },
        endOfList: {
            ru: 'Конец списка',
            uk: 'Кінець списку',
            en: 'End of list',
            de: 'Ende der Liste',
        },
    },
    settings: {
        title: {
            ru: 'Настройки',
            uk: 'Налаштування',
            en: 'Settings',
            de: 'Einstellungen',
        },
        account: {
            ru: 'Аккаунт',
            uk: 'Аккаунт',
            en: 'Account',
            de: 'Konto',
        },
        language: {
            ru: 'Язык приложения',
            uk: 'Мова додатка',
            en: 'App Language',
            de: 'App-Sprache',
        },
        languageLevel: {
            ru: 'Уровень языка',
            uk: 'Рівень мови',
            en: 'Language Level',
            de: 'Sprachniveau',
        },
        notifications: {
            ru: 'Уведомления',
            uk: 'Сповіщення',
            en: 'Notifications',
            de: 'Benachrichtigungen',
        },
        dailyNotifications: {
            ru: 'Ежедневные уведомления',
            uk: 'Щоденні сповіщення',
            en: 'Daily Notifications',
            de: 'Tägliche Benachrichtigungen',
        },
        reminders: {
            ru: 'Напоминания о новом слове',
            uk: 'Нагадування про нове слово',
            en: 'Word of the day reminders',
            de: 'Wort-des-Tages-Erinnerungen',
        },
        time: {
            ru: 'Время',
            uk: 'Час',
            en: 'Time',
            de: 'Zeit',
        },
        selectTime: {
            ru: 'Выберите время',
            uk: 'Оберіть час',
            en: 'Select Time',
            de: 'Zeit wählen',
        },
        done: {
            ru: 'Готово',
            uk: 'Готово',
            en: 'Done',
            de: 'Fertig',
        },
        support: {
            ru: 'Поддержка и право',
            uk: 'Підтримка та право',
            en: 'Support & Legal',
            de: 'Support & Rechtliches',
        },
        rate: {
            ru: 'Оценить приложение',
            uk: 'Оцінити додаток',
            en: 'Rate the app',
            de: 'App bewerten',
        },
        feedback: {
            ru: 'Обратная связь',
            uk: 'Зворотний зв\'язок',
            en: 'Feedback',
            de: 'Feedback',
        },
        terms: {
            ru: 'Условия',
            uk: 'Умови',
            en: 'Terms',
            de: 'AGB',
        },
        privacy: {
            ru: 'Конфиденциальность',
            uk: 'Конфіденційність',
            en: 'Privacy',
            de: 'Datenschutz',
        },
        logout: {
            ru: 'Выйти',
            uk: 'Вийти',
            en: 'Log Out',
            de: 'Abmelden',
        },
        version: {
            ru: 'Версия',
            uk: 'Версія',
            en: 'Version',
            de: 'Version',
        },
    },
    common: {
        loading: {
            ru: 'Загрузка...',
            uk: 'Завантаження...',
            en: 'Loading...',
            de: 'Laden...',
        },
        notFound: {
            ru: 'Не найдено',
            uk: 'Не знайдено',
            en: 'Not found',
            de: 'Nicht gefunden',
        },
        levels: {
            beginner: {
                ru: 'Начальный (A1-A2)',
                uk: 'Початковий (A1-A2)',
                en: 'Beginner (A1-A2)',
                de: 'Anfänger (A1-A2)',
            },
            intermediate: {
                ru: 'Средний (B1-B2)',
                uk: 'Середній (B1-B2)',
                en: 'Intermediate (B1-B2)',
                de: 'Mittelstufe (B1-B2)',
            },
            advanced: {
                ru: 'Продвинутый (C1-C2)',
                uk: 'Просунутий (C1-C2)',
                en: 'Advanced (C1-C2)',
                de: 'Fortgeschritten (C1-C2)',
            },
        },
    },
} as const;

export type TranslationKey = keyof typeof UI_TRANSLATIONS;

export function t(path: string, lang: TranslationLanguage): string {
    const keys = path.split('.');
    let current: any = UI_TRANSLATIONS;

    for (const key of keys) {
        if (current[key] === undefined) return path;
        current = current[key];
    }

    return current[lang] || current['en'] || path;
}
