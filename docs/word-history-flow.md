# Поток истории слов

Этот документ описывает механику «Слово дня» и систему истории в Wortday.

## Основные концепции

### 1. Слово дня (циклическая ротация)

Приложение показывает одно слово в день на основе даты регистрации пользователя и выбранного уровня.

**Ключевые особенности:**
- Линейная прогрессия: День 1, День 2, День 3, ..., ∞
- Циклическая ротация при достижении конца доступных слов
- Последовательности, специфичные для уровня (каждый уровень имеет свой пул слов)

**Формула циклической ротации:**
```javascript
sequence_number = ((day_number - 1) % total_words_in_level) + 1
```

**Примеры:**

| День пользователя | Всего слов | Рассчитанная последовательность | Результат |
|-------------------|------------|--------------------------------|-----------|
| 1                 | 365        | ((1-1) % 365) + 1              | 1         |
| 10                | 365        | ((10-1) % 365) + 1             | 10        |
| 365               | 365        | ((365-1) % 365) + 1            | 365       |
| 366               | 365        | ((366-1) % 365) + 1            | 1         |
| 400               | 365        | ((400-1) % 365) + 1            | 35        |

### 2. Конвейер истории

Экран истории показывает «конвейер» слов — все слова от дня 1 до текущего дня.

**Важно:** Конвейер **НЕ** основан на том, какие слова пользователь просмотрел, а на дате его регистрации.

**Формула:**
```javascript
history_words = words with sequence_number from 1 to min(current_day, total_words_in_level)
```

**Примеры:**

- **День 10**: История показывает 10 слов (последовательность 1-10)
- **День 25**: История показывает 25 слов (последовательность 1-25)
- **День 400** (при 365 словах всего): История показывает 365 слов (последовательность 1-365)

### 3. Автоматическое отслеживание просмотров

Когда пользователь открывает главный экран (`app/(tabs)/index.tsx`), слово автоматически отмечается как просмотренное в базе данных.

**Реализация:**
- React effect срабатывает при загрузке `todayWord`
- Вызывает `markWordAsViewed(wordId)` из word-store
- Сервисный слой выполняет upsert записи в таблице `user_words_history`
- Инкрементирует `times_reviewed`, если запись существует

**Поведение базы данных:**
- Первый просмотр: Создаёт запись с `times_reviewed = 1`
- Последующие просмотры: Инкрементирует `times_reviewed`
- Обновляет метку времени `learned_at` при каждом просмотре

### 4. Система избранного

Избранное синхронизируется между AsyncStorage (офлайн) и базой данных Supabase (онлайн).

**Поток миграции:**
1. При первом запуске приложения: Загрузка избранного из AsyncStorage
2. Проверка наличия флага миграции `wortday-favorites-migrated`
3. Если не мигрировано: Вызов `migrateFavoritesToDatabase(favoriteIds)`
4. Синхронизация избранного из базы данных в локальное состояние
5. Установка флага миграции для предотвращения повторного запуска

**Постоянная синхронизация:**
- Переключение избранного → Оптимистичное локальное обновление
- Сохранение в AsyncStorage (офлайн-поддержка)
- Синхронизация с базой данных через `toggleFavorite(wordId)`
- При ошибке: Откат оптимистичного обновления

## Детали реализации

### Сервисный слой (`lib/word-service.ts`)

**Новые функции:**

```typescript
// Get count of words for a level (used in cyclic calculation)
getWordCountForLevel(level: LanguageLevel): Promise<{count: number, error: string | null}>

// Get words by sequence range (for history conveyor)
getWordsBySequenceRange(
  level: LanguageLevel,
  fromSequence: number,
  toSequence: number
): Promise<{words: Word[], error: string | null}>

// Calculate cyclic sequence number
calculateCyclicSequence(dayNumber: number, totalWordsInLevel: number): number
```

**Изменённая функция:**

```typescript
// getTodayWord() now uses cyclic rotation
getTodayWord(level: LanguageLevel, registrationDate: string | null)
// 1. Get word count for level
// 2. Calculate cyclic sequence number
// 3. Fetch word by cyclic sequence
```

### Сервис истории слов (`lib/word-history-service.ts`)

Новый сервисный слой для взаимодействия с таблицей `user_words_history`.

**Функции:**

```typescript
// Mark word as viewed (upsert)
markWordAsViewed(wordId: string): Promise<MarkWordViewedResult>

// Toggle favorite status (upsert)
toggleFavorite(wordId: string): Promise<ToggleFavoriteResult>

// Get IDs of favorite words
getFavoriteIds(): Promise<GetFavoriteIdsResult>

// Get complete user history
getUserHistory(): Promise<GetUserHistoryResult>

// One-time migration from AsyncStorage
migrateFavoritesToDatabase(favoriteIds: string[]): Promise<{success: boolean, error: string | null}>
```

**Безопасность:**
- Все функции проверяют `supabase.auth.getUser()` перед выполнением
- Возвращают ошибку, если пользователь не авторизован
- Полагаются на политики RLS для безопасности на уровне базы данных

### Управление состоянием (`store/word-store.ts`)

**Новое состояние:**

```typescript
interface WordStore {
  historyWords: Word[];           // Conveyor words (day 1 to current_day)
  _hasMigratedFavorites: boolean; // Migration flag

  loadHistoryWords: () => Promise<void>;
  markWordAsViewed: (wordId: string) => Promise<void>;
  syncFavoritesFromDB: () => Promise<void>;
}
```

**Изменённое поведение:**

- `hydrate()`: Мигрирует избранное из AsyncStorage при первом запуске
- `loadHistoryWords()`: Загружает диапазон конвейера (заменяет `loadAllWords`)
- `toggleFavorite()`: Синхронизирует с базой данных + оптимистичные обновления
- `getFavoriteWords()`: Теперь фильтрует из `historyWords` вместо `allWords`

## Граничные случаи

### 1. Смена уровня в процессе обучения

**Сценарий:** Пользователь на 15-м дне меняет уровень с Beginner на Intermediate

**Текущее поведение (MVP):**
- История показывает только слова текущего уровня
- Упрощённый подход: Один уровень за раз в истории
- База данных сохраняет все записи истории для будущих функций

**Будущее улучшение:**
- Смешанная история по уровням
- Визуальные индикаторы переключения уровней

### 2. Пустой словарь для уровня

**Обработка:**
- `getWordCountForLevel()` возвращает `count: 0`
- `getTodayWord()` возвращает `{word: null, error: 'No words available'}`
- UI показывает сообщение «Нет доступных слов»

### 3. Офлайн-режим

**Избранное:**
- Работает через AsyncStorage (полная офлайн-поддержка)
- Синхронизация с базой данных при восстановлении соединения

**Отслеживание просмотров:**
- `markWordAsViewed()` завершается молча с ошибкой
- Не блокирует UI и не показывает ошибок
- Синхронизируется при следующем онлайн-просмотре

### 4. Прерывание миграции

**Сценарий:** Приложение крашится во время миграции избранного

**Обработка:**
- Флаг миграции устанавливается ПОСЛЕ успешного завершения
- Следующий запуск приложения повторит миграцию
- Операции `upsert` идемпотентны (безопасно повторять)

### 5. RLS блокирует запись

**Обработка:**
- Все сервисные функции проверяют `getUser()` перед выполнением
- Возвращают `{success: false, error: 'Not authenticated'}`
- UI обрабатывает корректно (логирует ошибку, без всплывающих окон)

### 6. Пользователь просматривает одно слово несколько раз

**Поведение:**
- Каждый просмотр инкрементирует `times_reviewed`
- Обновляет `learned_at` до последней метки времени
- Полезно для будущей аналитики

## Схема базы данных

### Таблица `user_words_history`

```sql
CREATE TABLE user_words_history (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  word_id UUID REFERENCES words(id) ON DELETE CASCADE,
  learned_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_favorite BOOLEAN DEFAULT FALSE,
  times_reviewed INTEGER DEFAULT 0,
  next_review_date TIMESTAMP WITH TIME ZONE,
  ease_factor DECIMAL DEFAULT 2.5,
  PRIMARY KEY (user_id, word_id)
);
```

**Политики RLS:**
- Пользователи могут получить доступ только к своим записям
- Фильтр `user_id` применяется на уровне базы данных

## Поток UI

### Главный экран (`app/(tabs)/index.tsx`)

```javascript
useEffect(() => {
  loadTodayWord();
}, []);

useEffect(() => {
  if (todayWord && !isLoading) {
    console.log(`[Home] Auto-marking word as viewed: ${todayWord.id}`);
    markWordAsViewed(todayWord.id);
  }
}, [todayWord?.id, isLoading]);
```

### Экран истории (`app/(tabs)/history.tsx`)

```javascript
useEffect(() => {
  loadHistoryWords(); // Loads conveyor (day 1 to current_day)
}, []);

const displayWords = activeTab === 'all' ? historyWords : getFavoriteWords();
```

## Чек-лист тестирования

### Новый пользователь (День 1)
- [ ] Регистрация → Выбор уровня
- [ ] Открыть главную → Показывает слово sequence_number=1
- [ ] Проверить БД: запись `user_words_history` существует с `times_reviewed=1`
- [ ] Открыть историю → Показывает 1 слово

### Существующий пользователь (День 25)
- [ ] Открыть главную → Показывает слово sequence_number=25
- [ ] Открыть историю → Показывает 25 слов (последовательность 1-25)
- [ ] Добавить слово #10 в избранное
- [ ] Вкладка избранного → Показывает 1 слово
- [ ] Проверить БД: `is_favorite=true` для слова #10

### Циклическая ротация (День 400, 365 слов)
- [ ] Расчёт: ((400-1) % 365) + 1 = 35
- [ ] Открыть главную → Показывает слово sequence_number=35
- [ ] История → Показывает 365 слов (максимум для уровня)

### Миграция избранного
- [ ] Убедиться, что AsyncStorage содержит старые избранные (`wortday-favorites`)
- [ ] Запустить приложение → Автоматическая миграция
- [ ] Проверить БД: Записи с `is_favorite=true`
- [ ] Проверить флаг: `wortday-favorites-migrated` существует

### Офлайн-режим
- [ ] Отключить интернет
- [ ] Добавить слово в избранное → Работает локально
- [ ] Включить интернет → Автоматическая синхронизация с базой данных

### Автоматическое отслеживание просмотров
- [ ] Открыть главную → Консоль показывает "[Home] Auto-marking word as viewed"
- [ ] Проверить БД: `times_reviewed=1`
- [ ] Закрыть и открыть заново → `times_reviewed=2`

## Будущие улучшения

### Система интервального повторения (SRS)
- Поле `next_review_date` подготовлено
- Поле `ease_factor` подготовлено
- Алгоритм определится позже (SuperMemo, Leitner, собственный)

### Смешанная история по уровням
- Отслеживание смены уровней во времени
- Визуальные индикаторы в истории
- «Вы перешли на Intermediate на 15-й день»

### Отслеживание серий
- Использование `user_words_history` для подсчёта серий
- Значки «7 дней подряд»
- Push-уведомления для поддержания серий

### Аналитика
- Наиболее повторяемые слова
- Категории избранных слов
- Графики прогресса обучения

---

**Статус:** ✅ Реализовано
**Последнее обновление:** 2026-01-16
**Связанные файлы:**
- `lib/word-service.ts`
- `lib/word-history-service.ts`
- `store/word-store.ts`
- `app/(tabs)/index.tsx`
- `app/(tabs)/history.tsx`
