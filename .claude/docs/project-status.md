# 📱 Wortday — «Wort des Tages» (Слово дня)

**Концепция:** Эстетичный тренажёр немецкого языка с фокусом на микрообучение и визуальную привлекательность.
**Целевая аудитория:** Русскоязычные экспаты и студенты (A1-C1), которые ценят дизайн.
**Платформы:** iOS, Android, Web (PWA) — универсальное приложение на React Native + Expo.

---

## 🚀 Текущий статус: v1.0.2 (Настройка модульного тестирования)
**Последнее обновление:** 20.01.2026

### Ключевые достижения v1.0.0:

#### Интеграция слов с Supabase (НОВОЕ)
✅ **Реальная интеграция с базой данных:**
- Полная миграция с mock-данных на таблицу `words` в Supabase
- Word Service (`lib/word-service.ts`) для взаимодействия с базой данных
- Асинхронная загрузка слов с обработкой ошибок
- Состояния загрузки для всех экранов

✅ **Обновлённые компоненты:**
- `store/word-store.ts` — использует `word-service` вместо mock-данных
- `app/history/[id].tsx` — асинхронная загрузка с состоянием загрузки
- Откат к первому слову уровня, если для текущего дня слово не найдено

✅ **Готовность к продакшену:**
- Неограниченное количество слов (sequence_number: 1, 2, 3, ..., ∞)
- Корректная обработка ошибок и логирование
- TypeScript-типизация для всех запросов

**📄 Подробная документация:** См. `docs/supabase-words-integration.md`

---

### Ключевые достижения v1.0.1:

#### Стабильность и улучшения интерфейса
✅ **Без мерцания данных:**
- Реализованы методы `reset()` для всех хранилищ
- Корректная очистка при выходе предотвращает отображение данных предыдущего пользователя

✅ **Более плавный поток авторизации:**
- Улучшен `AuthGuard` в `_layout.tsx` для ожидания загрузки профиля
- Добавлены корректные индикаторы загрузки при инициализации авторизации

✅ **Оптимистичный UI:**
- Мгновенная обратная связь при переключении избранного
- Проверено через прямую подписку на хранилище в компонентах

---

### Ключевые достижения v1.0.2:

#### Инфраструктура модульного тестирования (НОВОЕ)
✅ **Конфигурация Jest:**
- Настроен Jest с пресетом `jest-expo` для React Native
- Создана тестовая инфраструктура с моками и хелперами
- 36 модульных тестов проходят (12 сервисного слоя + 24 тестов хранилищ)

✅ **Тесты сервисного слоя:**
- `toggleFavorite` — валидация паттерна RLS-First
- Подтверждено отсутствие race condition (`getSession()` не вызывается)
- Обработка ошибок авторизации
- Тесты производительности (< 50 мс с моками)

✅ **Тесты хранилищ:**
- Управление состоянием (`isFavorite`, `favoriteIds`)
- Функциональность сброса (все поля)
- Граничные случаи (специальные символы, пустые множества)
- Управление состоянием воспроизведения

✅ **Документация:**
- Создан `docs/testing-guide.md` с лучшими практиками
- Добавлены тестовые скрипты в `package.json`
- Задокументированы ограничения и рекомендации по интеграционным тестам

**📄 Подробная документация:** См. `docs/testing-guide.md`

**Новые файлы:**
```
jest.config.js                           # Jest configuration
__tests__/setup.ts                       # Global test setup
__tests__/mocks/supabase.ts             # Supabase mock helpers
__tests__/mocks/auth-store.ts           # Auth store mock helpers
__tests__/lib/word-history-service.test.ts  # 12 service tests
__tests__/store/word-store.test.ts          # 24 store tests
docs/testing-guide.md                   # Testing documentation
```

**Команды для тестирования:**
```bash
npm test                 # Run all tests
npm run test:watch       # Watch mode for TDD
npm run test:coverage    # Coverage report
```

---

### Ключевые достижения v0.9.0:

#### Экраны авторизации и защищённые маршруты (НОВОЕ)
✅ **Экраны Login/Register/Reset:**
- Экран входа с Email/Password, Apple, Google
- Экран регистрации с валидацией пароля
- Поток сброса пароля через magic link по email
- Дизайн в стиле Neobrutalism (полностью на основе токенов)

✅ **Auth Guard (защищённые маршруты):**
- Автоматическая блокировка неавторизованных пользователей
- Редирект на `/auth/login` для всех защищённых маршрутов
- Логика приоритетов: Auth → Onboarding → Основное приложение
- Sign Out → экран входа

✅ **Мок-режим Apple Sign In:**
- Переменная окружения `EXPO_PUBLIC_APPLE_SIGN_IN_MOCK=true`
- Тестирование без аккаунта Apple Developer
- Автогенерация мок-пользователей
- Простая миграция на продакшен

✅ **Google OAuth:**
- Интеграция WebBrowser для мобильных
- OAuth-поток для Web
- Deep linking callbacks (готовы к настройке)

**📄 Подробная документация:** См. `docs/auth-flow.md`

**Новые файлы:**
```
app/auth/login.tsx         - Login UI (Email/Apple/Google)
app/auth/register.tsx      - Registration form
app/auth/reset-password.tsx - Password reset flow
.env.example               - Environment variables template
```

---

### Ключевые достижения v0.8.0:

#### Система авторизации (Auth System)
✅ **Мультипровайдерная аутентификация:**
- Email/Password — стандартная аутентификация
- Sign in with Apple — iOS (требование Apple)
- Google Sign-In — OAuth-поток

✅ **Интеграция с Supabase:**
- Supabase Client с AsyncStorage для кроссплатформенных сессий
- Автоматическое обновление токенов
- Синхронизация Auth State через `onAuthStateChange`

✅ **UI управления аккаунтом:**
- Кроссплатформенный экран Settings → Account
- Auth Provider Badge (визуальная индикация Email/Apple/Google)
- Платформо-специфичный UI (раздел Security только для Email на Web)
- Функция удаления аккаунта (требование Apple App Store)
- Экспорт данных (соответствие GDPR)

✅ **Схема базы данных:**
- Таблица `public.users` с профилями пользователей
- Триггер автосоздания профиля при регистрации
- RLS-политики для безопасности данных
- RPC-функция `delete_user_account()` с SECURITY DEFINER

**📄 Подробная документация:** См. `docs/auth-flow.md`

**Файлы:**
```
types/auth.ts              - TypeScript types and helpers
lib/supabase-client.ts     - Singleton Supabase client
lib/auth-service.ts        - Auth functions (signIn, signUp, signOut, etc.)
store/auth-store.ts        - Zustand store + onAuthStateChange
app/settings/account.tsx   - Account screen UI
```

---

### Ключевые достижения v0.7.0:

#### 1. Слова на основе последовательности (линейная система слов)
- `sequence_number` (1, 2, 3, ..., ∞) вместо циклического `day_number`
- Масштабируемость: неограниченное количество слов

#### 2. Push-уведомления (iOS/Android)
- `expo-notifications` с локальными ежедневными повторяющимися триггерами
- Настройка времени уведомлений
- Сохранение настроек

---

### Архитектура проекта (текущая)

```
wortday/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx            # Word of the Day (Home)
│   │   ├── history.tsx          # History/Word Library
│   │   ├── settings.tsx         # Main Settings
│   │   └── _layout.tsx          # Tab Bar configuration
│   ├── settings/
│   │   ├── account.tsx          # Account (NEW v0.8.0)
│   │   ├── language.tsx         # Interface Language Selection
│   │   ├── level.tsx            # Difficulty Level Selection
│   │   ├── notifications.tsx    # Notification Settings
│   │   └── _layout.tsx          # Transition Animations
│   ├── onboarding.tsx           # Initial Setup
│   └── _layout.tsx              # Root Stack + AuthStateListener
├── components/ui/
│   ├── brutal-button.tsx        # Buttons with Neobrutalism style
│   ├── screen-header.tsx        # Screen Header
│   ├── screen-layout.tsx        # Screen Wrapper
│   └── ...
├── constants/
│   ├── design-tokens.ts         # Colors, shadows, radii
│   └── translations.ts          # UI Translations + account section
├── lib/
│   ├── supabase-client.ts       # Supabase client
│   ├── auth-service.ts          # Auth functions
│   ├── word-service.ts          # Word functions for DB (NEW v1.0.0)
│   ├── storage.ts               # Universal storage wrapper
│   ├── notifications.ts         # Push notifications
│   └── ...
├── store/
│   ├── auth-store.ts            # Auth state
│   ├── settings-store.ts        # User settings
│   └── word-store.ts            # Words + Favorites (UPDATED v1.0.0)
├── types/
│   ├── auth.ts                  # Auth types
│   ├── word.ts                  # Word interface
│   └── settings.ts              # Settings types
├── docs/
│   ├── project-status.md        # Project Documentation (UPDATED v1.0.0)
│   ├── auth-flow.md             # Auth Documentation
│   ├── supabase-words-integration.md # Words integration guide (NEW v1.0.0)
│   ├── database-schema.md       # Supabase DB Schema
│   ├── tech-stack.md            # Technology stack (NEW v1.0.0)
│   └── coding-conventions.md    # React Native coding standards (NEW v1.0.0)
└── .env                         # Environment variables
```

---

## 🛠️ Что работает (v1.0.0)

### Функциональность:
✅ **Supabase Words** — реальные данные из БД (НОВОЕ v1.0.0)
✅ **Word Service** — асинхронная загрузка слов (НОВОЕ v1.0.0)
✅ **Безлимитный контент** — неограниченное количество слов (НОВОЕ v1.0.0)
✅ **Supabase Auth** — Email, Apple, Google
✅ **Управление аккаунтом** — профиль, выход, удаление аккаунта
✅ **Синхронизация Auth State** — автоматическое обновление состояния
✅ **Onboarding Flow** — первоначальная настройка
✅ **Система уровней** — выбор сложности слов (начинающий/средний/продвинутый)
✅ **Мультиязычность** — полная локализация на RU, UK, EN, DE
✅ **Push-уведомления** — ежедневные напоминания iOS/Android
✅ **Избранное** — добавление/удаление слов

### UI/UX:
✅ **Auth Provider Badge** — визуальная индикация для Email/Apple/Google (НОВОЕ v0.8.0)
✅ **Платформо-специфичный UI** — различные элементы для Web/iOS (НОВОЕ v0.8.0)
✅ **Дизайн Neobrutalism** — единый стиль
✅ **Анимации** — плавные переходы
✅ **Haptic Feedback** — тактильная обратная связь на iOS

### Техническое:
✅ **Word Service** — сервисный слой для взаимодействия с БД (НОВОЕ v1.0.0)
✅ **Асинхронная загрузка данных** — состояния загрузки для всех экранов (НОВОЕ v1.0.0)
✅ **Supabase Client** — с AsyncStorage для сессий
✅ **Auth Store** — Zustand с onAuthStateChange
✅ **Word Store** — Zustand с синхронизацией базы данных в реальном времени (ОБНОВЛЕНО v1.0.0)
✅ **Модульные тесты** — 36 тестов с Jest (НОВОЕ v1.0.2)
✅ **Паттерн RLS-First** — провалидирован тестами (НОВОЕ v1.0.2)
✅ **TypeScript** — полная типизация
✅ **Expo Router** — файловая навигация
✅ **NativeWind v4** — Tailwind CSS для RN

---

## 🐛 Известные проблемы

### Текущие ограничения:
✅ ~~Mock-данные~~ — **РЕШЕНО в v1.0.0**: Интеграция с Supabase
⚠️ **Apple Sign In** — мок-режим (требуется аккаунт Apple Developer для продакшена)
⚠️ **Google OAuth** — требуется настройка в Google Cloud Console
⚠️ **Подтверждение Email** — отключено в Supabase для быстрого тестирования
⚠️ **Нет аудио** — произношение слов не реализовано
⚠️ **Нет офлайн-кеша** — для загрузки слов требуется интернет

---

## 🎯 Дорожная карта

### v0.8.0 — Auth System + управление аккаунтом ✅ ЗАВЕРШЕНО
- [x] Supabase Client с AsyncStorage
- [x] Auth Store с листенером onAuthStateChange
- [x] Auth Service (signIn, signUp, signOut, deleteAccount)
- [x] Типы для авторизации (User, UserProfile, AuthProvider)
- [x] Экран Account с платформо-специфичным UI
- [x] Удаление аккаунта (требование Apple)
- [x] Компонент Auth Provider Badge
- [x] Переводы для раздела аккаунта
- [x] Обновлённая схема БД (docs/database-schema.md)

---

### v0.9.0 — Экраны авторизации ✅ ЗАВЕРШЕНО
- [x] Экран входа (Email/Password, Apple, Google)
- [x] Экран регистрации с валидацией
- [x] Поток сброса пароля
- [x] Защищённые маршруты (auth guard в `_layout.tsx`)
- [x] Мок-режим Apple Sign In
- [x] Интеграция Google OAuth
- [x] Sign Out/Delete Account → `/auth/login`
- [x] Переводы для раздела авторизации (RU/UK/EN/DE)
- [x] Платформо-специфичный UI (Web: window.confirm, Mobile: Alert)
- [x] Структура deep linking для OAuth callbacks

---

### v1.0.0 — Интеграция слов с Supabase ✅ ЗАВЕРШЕНО
- [x] Word Service для взаимодействия с БД
- [x] Миграция mock-data → Supabase
- [x] Асинхронная загрузка с обработкой ошибок
- [x] Состояния загрузки для всех экранов
- [x] TypeScript-типизация для всех запросов
- [x] Логика отката (первое слово уровня)
- [x] Обновлённая документация

---

### v1.0.1 — Стабильность и исправления ✅ ЗАВЕРШЕНО
- [x] Исправлена ошибка «Auth session missing» на экране входа
- [x] Исправлено мерцание данных пользователя при выходе/входе (сброс хранилища)
- [x] Реализовано корректное состояние загрузки при инициализации авторизации
- [x] Добавлены оптимистичные обновления UI для избранного (мгновенное переключение сердечка)

---

### v1.0.2 — Настройка модульного тестирования ✅ ЗАВЕРШЕНО
- [x] Настроен Jest с пресетом `jest-expo`
- [x] Создана тестовая инфраструктура (моки, хелперы, setup)
- [x] Реализовано 36 модульных тестов (12 сервисных + 24 тестов хранилищ)
- [x] Тесты валидации паттерна RLS-First
- [x] Тесты управления состоянием (isFavorite, reset)
- [x] Документация (`docs/testing-guide.md`)
- [x] Добавлены тестовые скрипты в package.json (test, test:watch, test:coverage)

---

### v1.1.0 — Настройка продакшен-авторизации (Приоритет 1)
- [ ] Аккаунт Apple Developer + настройка
- [ ] OAuth-креденшалы Google Cloud Console
- [ ] Подтверждение Email в Supabase
- [ ] Заполненная база данных: 1095+ слов (365+ x 3 уровня)

---

### v1.2.0 — Расширенные возможности
- [ ] Синхронизация избранного в реальном времени через Supabase Realtime
- [ ] Офлайн-режим с локальным кешем (AsyncStorage)
- [ ] Предзагрузка следующего слова
- [ ] История слов пользователя (таблица user_words_history)

---

### v1.1.0 — Аудио и медиа
- [ ] Интеграция TTS для произношения
- [ ] Кеширование аудиофайлов
- [ ] Supabase Storage для медиа

---

### v1.2.0 — Геймификация
- [ ] Система стриков
- [ ] Достижения (бейджи)
- [ ] Статистика прогресса

---

## 🔧 Разработка

### Переменные окружения:
```env
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...

# Apple Sign In Mock (for testing)
EXPO_PUBLIC_APPLE_SIGN_IN_MOCK=true  # false in production
```

### Запуск проекта:
```bash
npm install
npm run web    # Web
npm run ios    # iOS
npm run android # Android
```

### Создание таблиц в Supabase:
1. Откройте Supabase Dashboard → SQL Editor
2. Выполните SQL из `docs/database-schema.md` в порядке:
   - Шаг 1: Таблицы
   - Шаг 2: Индексы
   - Шаг 3: RLS-политики
   - Шаг 4: Функции и триггеры

---

## 🔗 Технологии

**Основные:**
- React Native 0.81.5
- Expo SDK 54
- TypeScript 5.9.2

**Бэкенд:**
- Supabase (Auth, Database, RLS)
- @supabase/supabase-js 2.x

**Состояние:**
- Zustand 5.0.9 (auth-store, settings-store, word-store)
- @react-native-async-storage/async-storage

**UI:**
- NativeWind v4 (Tailwind CSS)
- react-native-reanimated 4.1.1
- lucide-react-native (иконки)

**Навигация:**
- Expo Router 6.0.19

**Тестирование:**
- Jest 29.7.0
- jest-expo 54.0.16

---

**Последнее обновление:** 20.01.2026
**Версия:** 1.0.2 (Настройка модульного тестирования)
**Статус:** ✅ Готов к продакшену — высокая стабильность с покрытием тестами
**Следующая веха:** v1.1.0 — Продакшен-креденшалы Apple/Google OAuth + наполнение контентом

---

## 📚 Структура документации

Документация проекта организована в следующих файлах:

- **CLAUDE.md** (корень) — Основной маршрутизатор для Claude Code с кратким справочником
- **docs/project-status.md** — Этот файл: история проекта, статус и дорожная карта
- **docs/auth-flow.md** — Полная документация системы аутентификации
- **docs/database-schema.md** — Схема базы данных Supabase и RLS-политики
- **docs/tech-stack.md** — Технологический стек и архитектурные решения
- **docs/coding-conventions.md** — Стандарты кодирования React Native и паттерны
- **docs/supabase-words-integration.md** — Руководство по интеграции сервиса слов
- **docs/supabase-race-conditions.md** — Паттерн RLS-First и решения race condition
- **docs/testing-guide.md** — Настройка модульного тестирования и лучшие практики (НОВОЕ v1.0.2)
- **docs/ai-workflow-guide.md** — Лучшие практики для совместной работы с ИИ
