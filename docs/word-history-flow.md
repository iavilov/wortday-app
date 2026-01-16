# Word History Flow

This document describes the "Word of the Day" mechanics and history system in Vocade.

## Core Concepts

### 1. Word of the Day (Cyclic Rotation)

The app shows one word per day based on the user's registration date and selected level.

**Key Features:**
- Linear progression: Day 1, Day 2, Day 3, ..., ∞
- Cyclic rotation when reaching the end of available words
- Level-specific sequences (each level has its own word pool)

**Cyclic Formula:**
```javascript
sequence_number = ((day_number - 1) % total_words_in_level) + 1
```

**Examples:**

| User Day | Total Words | Calculated Sequence | Result |
|----------|-------------|---------------------|--------|
| 1        | 365         | ((1-1) % 365) + 1   | 1      |
| 10       | 365         | ((10-1) % 365) + 1  | 10     |
| 365      | 365         | ((365-1) % 365) + 1 | 365    |
| 366      | 365         | ((366-1) % 365) + 1 | 1      |
| 400      | 365         | ((400-1) % 365) + 1 | 35     |

### 2. History Conveyor

The history screen shows a "conveyor" of words - all words from day 1 to the current day.

**Important:** The conveyor is **NOT** based on which words the user has viewed, but on their registration date.

**Formula:**
```javascript
history_words = words with sequence_number from 1 to min(current_day, total_words_in_level)
```

**Examples:**

- **Day 10**: History shows 10 words (sequence 1-10)
- **Day 25**: History shows 25 words (sequence 1-25)
- **Day 400** (with 365 total words): History shows 365 words (sequence 1-365)

### 3. Automatic View Tracking

When the user opens the main screen (`app/(tabs)/index.tsx`), the word is automatically marked as viewed in the database.

**Implementation:**
- React effect triggers when `todayWord` is loaded
- Calls `markWordAsViewed(wordId)` from word-store
- Service layer upserts record in `user_words_history` table
- Increments `times_reviewed` if record exists

**Database Behavior:**
- First view: Creates record with `times_reviewed = 1`
- Subsequent views: Increments `times_reviewed`
- Updates `learned_at` timestamp on each view

### 4. Favorites System

Favorites are synced between AsyncStorage (offline) and Supabase database (online).

**Migration Flow:**
1. On first app launch: Load favorites from AsyncStorage
2. Check if migration flag `vocade-favorites-migrated` exists
3. If not migrated: Call `migrateFavoritesToDatabase(favoriteIds)`
4. Sync favorites from database to local state
5. Set migration flag to prevent re-running

**Ongoing Sync:**
- Toggle favorite → Optimistic local update
- Save to AsyncStorage (offline support)
- Sync to database via `toggleFavorite(wordId)`
- On error: Rollback optimistic update

## Implementation Details

### Service Layer (`lib/word-service.ts`)

**New Functions:**

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

**Modified Function:**

```typescript
// getTodayWord() now uses cyclic rotation
getTodayWord(level: LanguageLevel, registrationDate: string | null)
// 1. Get word count for level
// 2. Calculate cyclic sequence number
// 3. Fetch word by cyclic sequence
```

### Word History Service (`lib/word-history-service.ts`)

New service layer for interacting with `user_words_history` table.

**Functions:**

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

**Security:**
- All functions check `supabase.auth.getUser()` before executing
- Returns error if user is not authenticated
- Relies on RLS policies for database-level security

### State Management (`store/word-store.ts`)

**New State:**

```typescript
interface WordStore {
  historyWords: Word[];           // Conveyor words (day 1 to current_day)
  _hasMigratedFavorites: boolean; // Migration flag

  loadHistoryWords: () => Promise<void>;
  markWordAsViewed: (wordId: string) => Promise<void>;
  syncFavoritesFromDB: () => Promise<void>;
}
```

**Modified Behavior:**

- `hydrate()`: Migrates favorites from AsyncStorage on first launch
- `loadHistoryWords()`: Loads conveyor range (replaces `loadAllWords`)
- `toggleFavorite()`: Syncs with database + optimistic updates
- `getFavoriteWords()`: Now filters from `historyWords` instead of `allWords`

## Edge Cases

### 1. Level Change Mid-Journey

**Scenario:** User is on day 15, changes level from Beginner to Intermediate

**Current Behavior (MVP):**
- History shows only the current level's words
- Simplified approach: One level at a time in history
- Database preserves all history records for future features

**Future Enhancement:**
- Mixed history across levels
- Visual indicators for level switches

### 2. Empty Dictionary for Level

**Handling:**
- `getWordCountForLevel()` returns `count: 0`
- `getTodayWord()` returns `{word: null, error: 'No words available'}`
- UI shows "No words available" message

### 3. Offline Mode

**Favorites:**
- Work via AsyncStorage (full offline support)
- Sync to database when connection restored

**View Tracking:**
- `markWordAsViewed()` fails silently
- Doesn't block UI or show errors
- Will sync on next online view

### 4. Migration Interruption

**Scenario:** App crashes during favorites migration

**Handling:**
- Migration flag set AFTER successful completion
- Next app launch will retry migration
- `upsert` operations are idempotent (safe to retry)

### 5. RLS Policy Blocks Write

**Handling:**
- All service functions check `getUser()` first
- Return `{success: false, error: 'Not authenticated'}`
- UI handles gracefully (logs error, no alert)

### 6. User Views Same Word Multiple Times

**Behavior:**
- Each view increments `times_reviewed`
- Updates `learned_at` to latest timestamp
- Useful for future analytics

## Database Schema

### `user_words_history` Table

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

**RLS Policies:**
- Users can only access their own records
- `user_id` filter enforced at database level

## UI Flow

### Main Screen (`app/(tabs)/index.tsx`)

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

### History Screen (`app/(tabs)/history.tsx`)

```javascript
useEffect(() => {
  loadHistoryWords(); // Loads conveyor (day 1 to current_day)
}, []);

const displayWords = activeTab === 'all' ? historyWords : getFavoriteWords();
```

## Testing Checklist

### New User (Day 1)
- [ ] Register → Select level
- [ ] Open home → Shows word sequence_number=1
- [ ] Check DB: `user_words_history` record exists with `times_reviewed=1`
- [ ] Open history → Shows 1 word

### Existing User (Day 25)
- [ ] Open home → Shows word sequence_number=25
- [ ] Open history → Shows 25 words (sequence 1-25)
- [ ] Add word #10 to favorites
- [ ] Favorites tab → Shows 1 word
- [ ] Check DB: `is_favorite=true` for word #10

### Cyclic Rotation (Day 400, 365 words)
- [ ] Calculate: ((400-1) % 365) + 1 = 35
- [ ] Open home → Shows word sequence_number=35
- [ ] History → Shows 365 words (max for level)

### Favorites Migration
- [ ] Ensure AsyncStorage has old favorites (`vocade-favorites`)
- [ ] Launch app → Automatic migration
- [ ] Check DB: Records with `is_favorite=true`
- [ ] Check flag: `vocade-favorites-migrated` exists

### Offline Mode
- [ ] Disable internet
- [ ] Add word to favorites → Works locally
- [ ] Enable internet → Syncs to database automatically

### Automatic View Tracking
- [ ] Open home → Console shows "[Home] Auto-marking word as viewed"
- [ ] Check DB: `times_reviewed=1`
- [ ] Close and reopen → `times_reviewed=2`

## Future Enhancements

### Spaced Repetition System (SRS)
- `next_review_date` field prepared
- `ease_factor` field prepared
- Algorithm TBD (SuperMemo, Leitner, custom)

### Mixed Level History
- Track level changes over time
- Show visual indicators in history
- "You switched to Intermediate on Day 15"

### Streak Tracking
- Use `user_words_history` to calculate streaks
- "7 days in a row" badges
- Push notifications for streak maintenance

### Analytics
- Most reviewed words
- Favorite word categories
- Learning progress charts

---

**Status:** ✅ Implemented
**Last Updated:** 2026-01-16
**Related Files:**
- `lib/word-service.ts`
- `lib/word-history-service.ts`
- `store/word-store.ts`
- `app/(tabs)/index.tsx`
- `app/(tabs)/history.tsx`
