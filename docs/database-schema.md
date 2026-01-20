# Supabase Database Schema

**Version:** 1.0.0 (Word History System Integration)
**Last Updated:** 16.01.2026

---

## 📋 Overview

Database structure for Vocade with support for:
- **Authentication** (Email/Password, Sign in with Apple, Google)
- Multilingual content (JSONB)
- Difficulty level system (Beginner/Intermediate/Advanced)
- Persistent favorites
- Learned words history
- Account deletion (Apple App Store requirement)

---

## 🗂️ Tables

### 1. `words`
**Description:** Main words table (infinitely scalable)

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `TEXT` | PK, e.g., 'beg-seq-1', 'int-seq-100' |
| `level` | `TEXT` | Difficulty level (beginner/intermediate/advanced) |
| `sequence_number` | `INTEGER` | Sequence number within the level |
| `word_de` | `TEXT` | German word |
| `article` | `TEXT` | Article (der/die/das) |
| `transcription_de` | `TEXT` | Transcription (IPA) |
| `part_of_speech` | `TEXT` | Part of speech |
| `translations` | `JSONB` | Translations into different languages |
| `content` | `JSONB` | Examples, etymology, synonyms |
| `media` | `JSONB` | Links to audio files |

*Full SQL query with indexes and RLS is available in the [SQL for Copying](#sql-for-copying-to-supabase-sql-editor) section.*

---

### 2. `users` (Profiles)
**Description:** User profiles linked to Supabase Auth

⚠️ **IMPORTANT:** The table is named `users`, but it is NOT `auth.users`. It is a public profiles table.

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `UUID` | PK, link to `auth.users.id` |
| `email` | `TEXT` | User email |
| `display_name` | `TEXT` | Display name |
| `auth_provider` | `TEXT` | email, apple or google |
| `is_private_email` | `BOOLEAN` | Apple Private Relay flag |
| `translation_language`| `TEXT` | Native language (ru, uk, en, de) |
| `language_level` | `TEXT` | Selected learning level |
| `registration_date` | `DATE` | Registration date |
| `has_completed_onboarding` | `BOOLEAN` | Onboarding completion status |
| `notifications_enabled`| `BOOLEAN` | Notifications enabled flag |
| `notification_time` | `TIME` | Daily notification time |

*All RLS policies (View/Insert/Update/Delete) are configured for owner-only access.*

---

### 3. `user_words_history`
**Description:** History of learned words + favorites

| Field | Type | Description |
| :--- | :--- | :--- |
| `user_id` | `UUID` | FK to `users.id` |
| `word_id` | `TEXT` | FK to `words.id` |
| `learned_at` | `TIMESTAMPTZ` | Date learned |
| `is_favorite` | `BOOLEAN` | In "Favorites" list |
| `times_reviewed` | `INTEGER` | Number of reviews |
| `next_review_date` | `DATE` | Next review date (for SRS) |
| `ease_factor` | `DECIMAL` | Ease factor for algorithm |

#### Word History System Usage

The `user_words_history` table is now actively used for:

1. **View Tracking**: Automatically marks words as viewed when user opens Word of the Day
2. **Favorites System**: Syncs favorites between local storage and database
3. **Review Counting**: Increments `times_reviewed` on each view
4. **Future SRS**: `next_review_date` and `ease_factor` prepared for spaced repetition

**Implementation:**
- Service: `lib/word-history-service.ts`
- Store integration: `store/word-store.ts`
- Auto-tracking: `app/(tabs)/index.tsx`

**Key Functions:**
- `markWordAsViewed(wordId)` - Called on index.tsx mount, upserts record with incremented review count
- `toggleFavorite(wordId)` - Upserts `is_favorite` field with optimistic local updates
- `getFavoriteIds()` - Fetches user favorites for sync with AsyncStorage
- `migrateFavoritesToDatabase(ids)` - One-time migration from AsyncStorage to database

**Data Flow:**
```
User opens home screen
  → useEffect triggers markWordAsViewed(todayWord.id)
    → Service checks auth.getUser()
      → Upsert to user_words_history
        → Increment times_reviewed OR create new record
```

**Favorites Sync:**
```
App launch
  → Load favorites from AsyncStorage
    → Check migration flag (vocade-favorites-migrated)
      → If not migrated: migrateFavoritesToDatabase()
        → Sync from DB to local state
          → Set migration flag

User toggles favorite
  → Optimistic local update
    → Save to AsyncStorage (offline support)
      → Sync to DB via toggleFavorite()
        → On error: rollback optimistic update
```

For detailed documentation, see: `docs/word-history-flow.md`

---

### 4. `user_streaks` (Future v0.9.0)
**Description:** Streak system (consecutive days)

| Field | Type | Description |
| :--- | :--- | :--- |
| `user_id` | `UUID` | PK, link to `users.id` |
| `current_streak` | `INTEGER` | Current streak |
| `longest_streak` | `INTEGER` | Longest streak |
| `total_words_learned`| `INTEGER` | Total words learned |

---

## 🔧 Functions & Triggers

### Auto-create profile on signup

Automatically creates a record in the `public.users` table when a user registers via Supabase Auth. Extracts email, provider, and name from metadata.

### Delete Account (Apple Requirement)

RPC function to delete all user data and their record in `auth.users`. Used to comply with Apple App Store account deletion requirements.

### Update timestamp trigger

Universal trigger to automatically update the `updated_at` column when records in `users` and `words` tables are modified.

---

## 📊 JSONB Structures

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

## 🔐 Auth Configuration (Supabase Dashboard)

### 1. Enable Providers
In Supabase Dashboard → Authentication → Providers:

**Email:**
- ✅ Enable Email provider
- ✅ Confirm email: OFF (for quick testing, enable in production)

**Apple:**
- ✅ Enable Apple provider
- Services ID: `com.vocade.app`
- Callback URL: `https://ghrbimousviadvdwvuhx.supabase.co/auth/v1/callback`

**Google:**
- ✅ Enable Google provider
- Client ID: (from Google Cloud Console)
- Client Secret: (from Google Cloud Console)

### 2. URL Configuration
Authentication → URL Configuration:
- Site URL: `vocade://` (for deep linking)
- Redirect URLs:
  - `vocade://auth/callback`
  - `http://localhost:8081` (dev)
  - `https://vocade.app` (production web)

---

## 📋 SQL for copying to Supabase SQL Editor

**⚠️ Execute in order!**

### Step 1: Tables
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

### Step 2: Indexes
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

### Step 3: RLS Policies
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

### Step 4: Functions & Triggers
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

## 🧪 Test Data

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

## 📱 Client Integration

### Environment Variables
```env
EXPO_PUBLIC_SUPABASE_URL=https://ghrbimousviadvdwvuhx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Dependencies
```bash
npm install @supabase/supabase-js @react-native-async-storage/async-storage
npm install expo-apple-authentication expo-web-browser  # for auth screens
```

---

**Status:** ✅ Ready for production
**Last Updated:** 16.01.2026
