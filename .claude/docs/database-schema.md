# Схема базы данных Supabase

**Версия:** 1.0.0 (Интеграция системы истории слов)
**Последнее обновление:** 16.01.2026

---

## Обзор

Структура базы данных Wortday с поддержкой:
- **Аутентификация** (Email/Password, Sign in with Apple, Google)
- Мультиязычный контент (JSONB)
- Система уровней сложности (Beginner/Intermediate/Advanced)
- Постоянное хранение избранного
- История изученных слов
- Удаление аккаунта (требование Apple App Store)

---

## Таблицы

### 1. `words`
**Описание:** Основная таблица слов (бесконечно масштабируемая)

| Поле | Тип | Описание |
| :--- | :--- | :--- |
| `id` | `TEXT` | PK, например: 'beg-seq-1', 'int-seq-100' |
| `level` | `TEXT` | Уровень сложности (beginner/intermediate/advanced) |
| `sequence_number` | `INTEGER` | Порядковый номер внутри уровня |
| `word_de` | `TEXT` | Немецкое слово |
| `article` | `TEXT` | Артикль (der/die/das) |
| `transcription_de` | `TEXT` | Транскрипция (IPA) |
| `part_of_speech` | `TEXT` | Часть речи |
| `translations` | `JSONB` | Переводы на разные языки |
| `content` | `JSONB` | Примеры, этимология, синонимы |
| `media` | `JSONB` | Ссылки на аудиофайлы |

*Полный SQL-запрос с индексами и RLS доступен в разделе [SQL для копирования](#sql-для-копирования-в-supabase-sql-editor).*

---

### 2. `users` (Профили)
**Описание:** Профили пользователей, связанные с Supabase Auth

**ВАЖНО:** Таблица называется `users`, но это НЕ `auth.users`. Это публичная таблица профилей.

| Поле | Тип | Описание |
| :--- | :--- | :--- |
| `id` | `UUID` | PK, ссылка на `auth.users.id` |
| `email` | `TEXT` | Email пользователя |
| `display_name` | `TEXT` | Отображаемое имя |
| `auth_provider` | `TEXT` | email, apple или google |
| `is_private_email` | `BOOLEAN` | Флаг Apple Private Relay |
| `translation_language`| `TEXT` | Родной язык (ru, uk, en, de) |
| `language_level` | `TEXT` | Выбранный уровень обучения |
| `registration_date` | `DATE` | Дата регистрации |
| `has_completed_onboarding` | `BOOLEAN` | Статус прохождения онбординга |
| `notifications_enabled`| `BOOLEAN` | Флаг включения уведомлений |
| `notification_time` | `TIME` | Время ежедневного уведомления |

*Все RLS-политики (View/Insert/Update/Delete) настроены на доступ только для владельца.*

---

### 3. `user_words_history`
**Описание:** История изученных слов + избранное

| Поле | Тип | Описание |
| :--- | :--- | :--- |
| `user_id` | `UUID` | FK на `users.id` |
| `word_id` | `TEXT` | FK на `words.id` |
| `learned_at` | `TIMESTAMPTZ` | Дата изучения |
| `is_favorite` | `BOOLEAN` | В списке «Избранное» |
| `times_reviewed` | `INTEGER` | Количество повторений |
| `next_review_date` | `DATE` | Дата следующего повторения (для SRS) |
| `ease_factor` | `DECIMAL` | Коэффициент лёгкости для алгоритма |

#### Использование системы истории слов

Таблица `user_words_history` активно используется для:

1. **Отслеживание просмотров**: Автоматически отмечает слова как просмотренные при открытии «Слова дня»
2. **Система избранного**: Синхронизирует избранное между локальным хранилищем и базой данных
3. **Подсчёт повторений**: Увеличивает `times_reviewed` при каждом просмотре
4. **Будущая SRS**: `next_review_date` и `ease_factor` подготовлены для интервального повторения

**Реализация:**
- Сервис: `lib/word-history-service.ts`
- Интеграция со стором: `store/word-store.ts`
- Автоматическое отслеживание: `app/(tabs)/index.tsx`

**Ключевые функции:**
- `markWordAsViewed(wordId)` — вызывается при монтировании index.tsx, выполняет upsert записи с увеличенным счётчиком повторений
- `toggleFavorite(wordId)` — выполняет upsert поля `is_favorite` с оптимистичным локальным обновлением
- `getFavoriteIds()` — получает избранное пользователя для синхронизации с AsyncStorage
- `migrateFavoritesToDatabase(ids)` — одноразовая миграция из AsyncStorage в базу данных

**Поток данных:**
```
User opens home screen
  → useEffect triggers markWordAsViewed(todayWord.id)
    → Service checks auth.getUser()
      → Upsert to user_words_history
        → Increment times_reviewed OR create new record
```

**Синхронизация избранного:**
```
App launch
  → Load favorites from AsyncStorage
    → Check migration flag (wortday-favorites-migrated)
      → If not migrated: migrateFavoritesToDatabase()
        → Sync from DB to local state
          → Set migration flag

User toggles favorite
  → Optimistic local update
    → Save to AsyncStorage (offline support)
      → Sync to DB via toggleFavorite()
        → On error: rollback optimistic update
```

Подробная документация: `docs/word-history-flow.md`

---

### 4. `user_streaks` (Планируется в v0.9.0)
**Описание:** Система серий (последовательные дни)

| Поле | Тип | Описание |
| :--- | :--- | :--- |
| `user_id` | `UUID` | PK, ссылка на `users.id` |
| `current_streak` | `INTEGER` | Текущая серия |
| `longest_streak` | `INTEGER` | Самая длинная серия |
| `total_words_learned`| `INTEGER` | Всего изученных слов |

---

## Функции и триггеры

### Автоматическое создание профиля при регистрации

Автоматически создаёт запись в таблице `public.users` при регистрации пользователя через Supabase Auth. Извлекает email, провайдер и имя из метаданных.

### Удаление аккаунта (требование Apple)

RPC-функция для удаления всех данных пользователя и его записи в `auth.users`. Используется для соответствия требованиям Apple App Store по удалению аккаунтов.

### Триггер обновления временной метки

Универсальный триггер для автоматического обновления столбца `updated_at` при изменении записей в таблицах `users` и `words`.

---

## Структуры JSONB

### translations
```json
{
  "ru": { "main": "Дом", "alternatives": ["Здание", "Жилище"] },
  "uk": { "main": "Будинок", "alternatives": ["Будова", "Житло"] },
  "en": { "main": "House", "alternatives": ["Building", "Home"] },
  "de": { "main": "Haus", "alternatives": ["Gebäude", "Wohnhaus"] }
}
```

### content
```json
{
  "example_sentence": {
    "de": "Ich wohne in einem großen **Haus**.",
    "ru": "Я живу в большом доме.",
    "uk": "Я живу у великому будинку.",
    "en": "I live in a big house."
  },
  "etymology": {
    "text_ru": "От прагерманского *hūsą...",
    "text_uk": "Від прагерманського *hūsą...",
    "text_en": "From Proto-Germanic *hūsą...",
    "text_de": "Vom urgermanischen *hūsą...",
    "root_word": "*hūsą"
  },
  "synonyms": ["Gebäude", "Wohnung"],
  "antonyms": [],
  "notes": ""
}
```

---

## Конфигурация аутентификации (Supabase Dashboard)

### 1. Включение провайдеров
В Supabase Dashboard → Authentication → Providers:

**Email:**
- Включить Email-провайдер
- Подтверждение email: ВЫКЛ (для быстрого тестирования, включить в продакшене)

**Apple:**
- Включить Apple-провайдер
- Services ID: `com.wortday.app`
- Callback URL: `https://ghrbimousviadvdwvuhx.supabase.co/auth/v1/callback`

**Google:**
- Включить Google-провайдер
- Client ID: (из Google Cloud Console)
- Client Secret: (из Google Cloud Console)

### 2. Конфигурация URL
Authentication → URL Configuration:
- Site URL: `wortday://` (для deep linking)
- Redirect URLs:
  - `wortday://auth/callback`
  - `http://localhost:8081` (разработка)
  - `https://wortday.com` (продакшен веб)

---

## SQL для копирования в Supabase SQL Editor

**Выполняйте по порядку!**

### Шаг 1: Таблицы
```sql
-- 1. WORDS TABLE
CREATE TABLE words (
  id TEXT PRIMARY KEY,
  level TEXT NOT NULL,
  sequence_number INTEGER NOT NULL,
  word_de TEXT NOT NULL,
  article TEXT,
  transcription_de TEXT NOT NULL,
  part_of_speech TEXT NOT NULL,
  translations JSONB NOT NULL,
  content JSONB NOT NULL,
  media JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_level_sequence UNIQUE (level, sequence_number),
  CONSTRAINT valid_level CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  CONSTRAINT valid_sequence_number CHECK (sequence_number > 0),
  CONSTRAINT valid_part_of_speech CHECK (part_of_speech IN ('noun', 'verb', 'adjective', 'adverb', 'preposition', 'conjunction'))
);

-- 2. USERS TABLE (Profiles)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  auth_provider TEXT NOT NULL DEFAULT 'email',
  is_private_email BOOLEAN DEFAULT FALSE,
  translation_language TEXT DEFAULT 'ru',
  language_level TEXT DEFAULT 'beginner',
  registration_date DATE NOT NULL DEFAULT CURRENT_DATE,
  has_completed_onboarding BOOLEAN DEFAULT FALSE,
  notifications_enabled BOOLEAN DEFAULT TRUE,
  notification_time TIME DEFAULT '09:00:00',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_auth_provider CHECK (auth_provider IN ('email', 'apple', 'google')),
  CONSTRAINT valid_translation_language CHECK (translation_language IN ('ru', 'uk', 'en', 'de')),
  CONSTRAINT valid_language_level CHECK (language_level IN ('beginner', 'intermediate', 'advanced'))
);

-- 3. USER_WORDS_HISTORY TABLE
CREATE TABLE user_words_history (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  word_id TEXT NOT NULL REFERENCES words(id) ON DELETE CASCADE,
  learned_at TIMESTAMPTZ DEFAULT NOW(),
  is_favorite BOOLEAN DEFAULT FALSE,
  times_reviewed INTEGER DEFAULT 1,
  next_review_date DATE,
  ease_factor DECIMAL(3,2) DEFAULT 2.5,
  PRIMARY KEY (user_id, word_id)
);

-- 4. USER_STREAKS TABLE
CREATE TABLE user_streaks (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  total_words_learned INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Шаг 2: Индексы
```sql
-- Words indexes
CREATE INDEX idx_words_level ON words(level);
CREATE INDEX idx_words_sequence_number ON words(sequence_number);
CREATE INDEX idx_words_level_sequence ON words(level, sequence_number);

-- User words history indexes
CREATE INDEX idx_user_words_user ON user_words_history(user_id);
CREATE INDEX idx_user_words_favorite ON user_words_history(user_id, is_favorite) WHERE is_favorite = true;
CREATE INDEX idx_user_words_learned ON user_words_history(user_id, learned_at DESC);
```

### Шаг 3: RLS-политики
```sql
-- Enable RLS
ALTER TABLE words ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_words_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;

-- WORDS: Public read
CREATE POLICY "Words are publicly readable" ON words FOR SELECT USING (true);

-- USERS: Own profile only
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING ((select auth.uid()) = id);
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK ((select auth.uid()) = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING ((select auth.uid()) = id);
CREATE POLICY "Users can delete own profile" ON users FOR DELETE USING ((select auth.uid()) = id);

-- USER_WORDS_HISTORY: Own data only
CREATE POLICY "Users can view own history" ON user_words_history FOR SELECT USING ((select auth.uid()) = user_id);
CREATE POLICY "Users can insert own history" ON user_words_history FOR INSERT WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "Users can update own history" ON user_words_history FOR UPDATE
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "Users can delete own history" ON user_words_history FOR DELETE USING ((select auth.uid()) = user_id);

-- USER_STREAKS: Own data only
CREATE POLICY "Users can view own streaks" ON user_streaks FOR SELECT USING ((select auth.uid()) = user_id);
CREATE POLICY "Users can insert own streaks" ON user_streaks FOR INSERT WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "Users can update own streaks" ON user_streaks FOR UPDATE
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "Users can delete own streaks" ON user_streaks FOR DELETE USING ((select auth.uid()) = user_id);
```

### Шаг 4: Функции и триггеры
```sql
-- Auto-create profile trigger
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, auth_provider, display_name, is_private_email)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_app_meta_data->>'provider', 'email'),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    CASE WHEN NEW.email LIKE '%@privaterelay.appleid.com' THEN TRUE ELSE FALSE END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Delete account function
CREATE OR REPLACE FUNCTION delete_user_account()
RETURNS void AS $$
DECLARE
  current_user_id UUID;
BEGIN
  current_user_id := (select auth.uid());
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  DELETE FROM user_words_history WHERE user_id = current_user_id;
  DELETE FROM user_streaks WHERE user_id = current_user_id;
  DELETE FROM users WHERE id = current_user_id;
  DELETE FROM auth.users WHERE id = current_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_words_updated_at
  BEFORE UPDATE ON words
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## Тестовые данные

```sql
-- Test word for verification
INSERT INTO words (id, level, sequence_number, word_de, article, transcription_de, part_of_speech, translations, content, media)
VALUES (
  'beg-seq-1',
  'beginner',
  1,
  'Haus',
  'das',
  '/haʊ̯s/',
  'noun',
  '{"ru": {"main": "Дом", "alternatives": ["Здание"]}, "uk": {"main": "Будинок", "alternatives": []}, "en": {"main": "House", "alternatives": ["Building"]}, "de": {"main": "Haus", "alternatives": ["Gebäude"]}}'::jsonb,
  '{"example_sentence": {"de": "Ich wohne in einem großen Haus.", "ru": "Я живу в большом доме.", "uk": "Я живу у великому будинку.", "en": "I live in a big house."}, "etymology": {"text_ru": "От прагерманского *hūsą", "text_uk": "Від прагерманського *hūsą", "text_en": "From Proto-Germanic *hūsą", "text_de": "Vom urgermanischen *hūsą", "root_word": "*hūsą"}, "synonyms": ["Gebäude"], "antonyms": [], "notes": ""}'::jsonb,
  '{}'::jsonb
);
```

---

## Клиентская интеграция

### Переменные окружения
```env
EXPO_PUBLIC_SUPABASE_URL=https://ghrbimousviadvdwvuhx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Зависимости
```bash
npm install @supabase/supabase-js @react-native-async-storage/async-storage
npm install expo-apple-authentication expo-web-browser  # for auth screens
```

---

**Статус:** Готово к продакшену
**Последнее обновление:** 16.01.2026
