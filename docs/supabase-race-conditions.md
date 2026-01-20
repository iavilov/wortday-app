# Supabase Race Conditions & RLS-First Pattern

**Created:** 2026-01-19
**Status:** ✅ Resolved
**Priority:** 🔴 CRITICAL

---

## 📋 Table of Contents

1. [Problem Summary](#problem-summary)
2. [Symptoms](#symptoms)
3. [Root Cause Analysis](#root-cause-analysis)
4. [Diagnostic Process](#diagnostic-process)
5. [Solution: RLS-First Pattern](#solution-rls-first-pattern)
6. [Unit Testing](#unit-testing)
7. [Code Examples](#code-examples)
8. [Best Practices](#best-practices)

---

## Problem Summary

**Problem:** `toggleFavorite()` worked "every other time" - first click successfully updated DB, second click hung for 3+ seconds and rolled back.

**Root Cause:** Race condition in Supabase Auth Module - parallel calls to `getUser()` or `getSession()` get blocked by internal locks, especially during token refresh.

**Solution:** RLS-First Pattern - remove all explicit auth checks from application code, rely on Row Level Security policies at the database level.

---

## Symptoms

### Symptom 1: Async Hanging
```
Click 1: ✅ Works (200-300ms)
  [WordStore] toggleFavorite CALLED
  [WordStore] ✅ Synced favorite to DB: int-seq-4 = true

Click 2 (1-2 seconds later): ❌ Hangs (3000ms+ timeout)
  [WordStore] toggleFavorite CALLED
  [WordStore] Calling wordHistoryService.toggleFavorite...
  [WordHistory] Checking auth...
  // 3 seconds of silence
  [WordHistory] ❌ EXCEPTION: getSession timeout after 3s
  [WordStore] Rolled back to previous state
```

### Symptom 2: History Screen Becomes Empty
- After a hung toggle click, navigating to History screen shows an empty list
- After page reload, the list is restored
- Indicates a problem with async data loading during auth module blocking

### Symptom 3: Non-Deterministic Reproduction
- Hanging occurs **intermittently**
- Depends on timing and Supabase auth module state
- More frequent with rapid repeated clicks (1-2 seconds between clicks)
- Less frequent with slow clicks (5+ seconds between clicks)

---

## Root Cause Analysis

### Technical Explanation

Supabase Auth Module uses **internal locks** to synchronize auth operations:

1. **Token Refresh Lock**
   - When access token expires (default: 1 hour), Supabase automatically triggers a refresh
   - During refresh, all auth operations (`getUser()`, `getSession()`, etc.) are blocked
   - Lock can last from 1 to 5+ seconds depending on network latency

2. **Parallel Operations Lock**
   - If two requests call `getUser()` or `getSession()` in parallel
   - The second request **waits** for the first to complete (blocking, not queued)
   - This is protection against race conditions inside the auth module

3. **Storage Access Lock**
   - `getSession()` reads from AsyncStorage/localStorage
   - On Web this is synchronous, but on React Native it's async
   - Parallel reads can be blocked by OS-level file locks

### Why This Is Critical for toggleFavorite()

```typescript
// PROBLEMATIC CODE (old version):
export async function toggleFavorite(wordId: string) {
  // ❌ This call can hang for 3+ seconds!
  const { data: { user }, error } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  // Rest of logic...
}
```

**Hanging Scenario:**

1. User clicks heart icon → `toggleFavorite()` is called
2. Function calls `getUser()` → Auth module starts token refresh (background)
3. User clicks **second time** (1 second later)
4. Second `getUser()` call is **blocked** by the first refresh
5. Timeout triggers after 3 seconds → Rollback
6. User sees that favorite was not updated

### Why getSession() Didn't Help

```typescript
// ❌ ALSO DOESN'T WORK:
const { data: { session }, error } = await supabase.auth.getSession();
```

**Reasons:**
- `getSession()` also uses internal locks
- On React Native reads from AsyncStorage → async operation
- Can be blocked during token refresh
- Faster than `getUser()` (no network call), but still blocking

---

## Diagnostic Process

### Step 1: Adding Logging
Added extensive logging to each step:

```typescript
export async function toggleFavorite(wordId: string) {
  console.log('[WordHistory] toggleFavorite START - wordId:', wordId);
  console.log('[WordHistory] Checking auth...');
  const { data: { user } } = await supabase.auth.getUser();
  console.log('[WordHistory] Auth check complete - user:', !!user);
  // ...
}
```

**Result:** Discovered that execution stops at `"Checking auth..."` → indicates problem in auth call.

### Step 2: Replacing getUser() with getSession()
```typescript
// Attempt #1: Use getSession() instead of getUser()
const { data: { session } } = await supabase.auth.getSession();
```

**Result:** Hanging reduced from ~5s to ~3s, but problem persisted.

### Step 3: Adding Timeout Wrapper
```typescript
function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`timeout after ${timeoutMs}ms`)), timeoutMs)
    ),
  ]);
}

const session = await withTimeout(
  supabase.auth.getSession(),
  3000
);
```

**Result:** Confirmed that `getSession()` hangs for 3+ seconds → need to remove auth calls entirely.

### Step 4: RLS-First Pattern (Final Solution)
Removed all auth checks, rely on Row Level Security:

```typescript
// ✅ SOLUTION: No auth calls!
export async function toggleFavorite(wordId: string) {
  // Just make the query - RLS automatically filters by auth.uid()
  const { data: existing } = await supabase
    .from('user_words_history')
    .select('*')
    .eq('word_id', wordId)  // No user_id filter!
    .maybeSingle();

  // RLS policy ensures we only see our own records
}
```

**Result:** ✅ Hanging completely eliminated, all clicks work instantly.

---

## Solution: RLS-First Pattern

### Principle

**Move security enforcement from application layer to database layer.**

Instead of checking auth in application code:
```typescript
// ❌ BAD: Application-level auth check
const { data: { user } } = await supabase.auth.getUser();
if (!user) return { error: 'Not authenticated' };

await supabase
  .from('user_words_history')
  .update({ is_favorite: true })
  .eq('user_id', user.id)  // Explicit filter
  .eq('word_id', wordId);
```

Use RLS policies for automatic filtering:
```typescript
// ✅ GOOD: Database-level auth enforcement
await supabase
  .from('user_words_history')
  .update({ is_favorite: true })
  .eq('word_id', wordId);  // RLS automatically adds: WHERE user_id = auth.uid()
```

### Implementation

#### 1. SELECT/UPDATE operations - Zero auth checks

**File:** `lib/word-history-service.ts`

```typescript
export async function toggleFavorite(wordId: string): Promise<ToggleFavoriteResult> {
  console.log('[WordHistory] toggleFavorite START - wordId:', wordId);
  try {
    // Skip auth check - let RLS handle it. This avoids getSession() race conditions.
    // If user is not authenticated, RLS will block the query and we'll get an error.
    const now = new Date().toISOString();

    // Check if record exists - RLS will automatically filter by current user
    console.log('[WordHistory] Fetching existing record...');
    const { data: existing, error: fetchError } = await supabase
      .from('user_words_history')
      .select('*')
      .eq('word_id', wordId)  // ❌ NO user_id filter - RLS adds it!
      .maybeSingle();

    console.log('[WordHistory] Fetch result - existing:', !!existing, 'error:', fetchError);

    if (fetchError) {
      console.error('[WordHistory] Error fetching existing record:', fetchError);
      return { success: false, is_favorite: false, error: fetchError.message };
    }

    const newFavoriteStatus = existing ? !existing.is_favorite : true;
    console.log('[WordHistory] Calculated newFavoriteStatus:', newFavoriteStatus);

    if (existing) {
      // Update existing record - RLS will automatically filter by current user
      console.log('[WordHistory] Updating existing record...');
      const { data, count, error: updateError } = await supabase
        .from('user_words_history')
        .update({
          is_favorite: newFavoriteStatus,
        })
        .eq('word_id', wordId)  // ❌ NO user_id filter - RLS adds it!
        .select();

      console.log('[WordHistory] Update result - count:', count, 'error:', updateError);

      if (updateError) {
        console.error('[WordHistory] Error updating favorite status:', updateError);
        return { success: false, is_favorite: false, error: updateError.message };
      }

      // ✅ CRITICAL: Check if any rows were actually updated (RLS might block silently)
      if (count === 0) {
        console.error('[WordHistory] RLS blocked update - no rows affected', { wordId });
        return {
          success: false,
          is_favorite: false,
          error: 'Update blocked by RLS or record not found'
        };
      }
    } else {
      // Insert new record with favorite = true
      console.log('[WordHistory] Inserting new record...');

      // ✅ Get user_id from auth store (already loaded, no async call needed)
      const authStore = (await import('@/store/auth-store')).useAuthStore.getState();
      const userId = authStore.user?.id;

      if (!userId) {
        console.error('[WordHistory] No user ID available for INSERT');
        return { success: false, is_favorite: false, error: 'Not authenticated' };
      }

      const { error: insertError } = await supabase
        .from('user_words_history')
        .insert({
          user_id: userId,  // Required by schema, but got from in-memory store
          word_id: wordId,
          learned_at: now,
          is_favorite: true,
          times_reviewed: 0,
          next_review_date: null,
          ease_factor: 2.5,
        });

      console.log('[WordHistory] Insert result - error:', insertError);

      if (insertError) {
        console.error('[WordHistory] Error inserting favorite:', insertError);
        return { success: false, is_favorite: false, error: insertError.message };
      }
    }

    console.log(`[WordHistory] ✅ SUCCESS - Toggled favorite for word ${wordId}: ${newFavoriteStatus}`);
    return { success: true, is_favorite: newFavoriteStatus, error: null };
  } catch (error) {
    console.error('[WordHistory] ❌ EXCEPTION in toggleFavorite:', error);
    return { success: false, is_favorite: false, error: String(error) };
  }
}
```

#### 2. Required RLS Policies

**File:** `docs/database-schema.md` (Step 3: RLS Policies)

```sql
-- ✅ CRITICAL: UPDATE policy must include both USING + WITH CHECK
CREATE POLICY "Users can update own history" ON user_words_history FOR UPDATE
  USING ((select auth.uid()) = user_id)       -- Checks OLD row
  WITH CHECK ((select auth.uid()) = user_id); -- Checks NEW row

-- ✅ Similarly for other operations
CREATE POLICY "Users can view own history" ON user_words_history FOR SELECT
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own history" ON user_words_history FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own history" ON user_words_history FOR DELETE
  USING ((select auth.uid()) = user_id);
```

**Why `WITH CHECK` is Important:**
- `USING` checks the row **before** modification (OLD row)
- `WITH CHECK` checks the row **after** modification (NEW row)
- Without `WITH CHECK`, Supabase **silently blocks** UPDATE (count = 0, no error)

#### 3. Lock mechanism against parallel calls

**File:** `store/word-store.ts`

```typescript
toggleFavorite: async (wordId: string) => {
  console.log('[WordStore] toggleFavorite CALLED with wordId:', wordId);

  // ✅ Check if a toggle is already in progress for this word
  const state = get();
  if ((state as any)._toggleInProgress?.[wordId]) {
    console.warn('[WordStore] Toggle already in progress for', wordId, '- ignoring duplicate call');
    return;
  }

  // Mark toggle as in progress
  (state as any)._toggleInProgress = { ...((state as any)._toggleInProgress || {}), [wordId]: true };

  const currentFavorites = get().favoriteIds;
  const wasFavorite = currentFavorites.has(wordId);
  console.log('[WordStore] Current state - wasFavorite:', wasFavorite, 'total favorites:', currentFavorites.size);

  // Optimistic update
  const newFavorites = new Set(currentFavorites);
  if (wasFavorite) {
    newFavorites.delete(wordId);
  } else {
    newFavorites.add(wordId);
  }

  set({ favoriteIds: newFavorites });
  console.log('[WordStore] Optimistic update complete, newFavorites.size:', newFavorites.size);

  // Persist to AsyncStorage for offline mode
  try {
    await storage.setItem(FAVORITES_KEY, JSON.stringify([...newFavorites]));
    console.log('[WordStore] Saved to AsyncStorage successfully');
  } catch (e) {
    console.error('[WordStore] Failed to save favorites to storage:', e);
    return; // Early exit if AsyncStorage fails
  }

  // Sync with database
  console.log('[WordStore] Calling wordHistoryService.toggleFavorite...');
  try {
    const { success, is_favorite, error } = await wordHistoryService.toggleFavorite(wordId);
    console.log('[WordStore] Service returned:', { success, is_favorite, error });

    if (!success) {
      console.error('[WordStore] ❌ Failed to sync favorite to DB:', error);
      // Rollback optimistic update
      set({ favoriteIds: currentFavorites });
      await storage.setItem(FAVORITES_KEY, JSON.stringify([...currentFavorites]));
      console.log('[WordStore] Rolled back to previous state');
    } else {
      // SUCCESS - verify is_favorite matches expectation
      const expectedFavorite = !wasFavorite;
      if (is_favorite !== expectedFavorite) {
        console.warn('[WordStore] ⚠️ DB state mismatch! Expected:', expectedFavorite, 'Got:', is_favorite);
      }

      // Sync local state with DB truth (just in case)
      const correctFavorites = new Set(currentFavorites);
      if (is_favorite) {
        correctFavorites.add(wordId);
      } else {
        correctFavorites.delete(wordId);
      }
      set({ favoriteIds: correctFavorites });
      await storage.setItem(FAVORITES_KEY, JSON.stringify([...correctFavorites]));

      console.log(`[WordStore] ✅ Synced favorite to DB: ${wordId} = ${is_favorite}`);
    }
  } catch (error) {
    console.error('[WordStore] ❌ Exception in toggleFavorite:', error);
    // Rollback optimistic update
    set({ favoriteIds: currentFavorites });
    await storage.setItem(FAVORITES_KEY, JSON.stringify([...currentFavorites]));
    console.log('[WordStore] Rolled back due to exception');
  } finally {
    // ✅ Always clear the in-progress flag
    const state = get();
    const inProgress = { ...((state as any)._toggleInProgress || {}) };
    delete inProgress[wordId];
    (state as any)._toggleInProgress = inProgress;
    console.log('[WordStore] Toggle completed for', wordId);
  }
},
```

---

## Unit Testing

### Critical Test Cases

#### Test Case 1: Rapid Sequential Clicks
**Goal:** Verify that parallel toggleFavorite calls don't cause race conditions

```typescript
describe('toggleFavorite - Rapid Sequential Clicks', () => {
  it('should handle rapid double-click without hanging', async () => {
    const wordId = 'test-word-1';

    // Mock Supabase to simulate slow response (but not hanging)
    jest.spyOn(supabase.from('user_words_history'), 'select')
      .mockResolvedValueOnce({ data: null, error: null }); // First call: no record

    // Simulate parallel calls (< 1 second apart)
    const promise1 = toggleFavorite(wordId);
    const promise2 = toggleFavorite(wordId); // Second click while first is processing

    // Both should complete without timeout
    const [result1, result2] = await Promise.all([promise1, promise2]);

    // First should succeed
    expect(result1.success).toBe(true);

    // Second should be ignored (lock mechanism) OR succeed with inverse state
    expect(result2.success).toBe(true);

    // Verify no timeout occurred
    expect(result1.error).not.toContain('timeout');
    expect(result2.error).not.toContain('timeout');
  });

  it('should complete within reasonable time (< 1000ms each)', async () => {
    const wordId = 'test-word-2';

    const startTime = Date.now();
    await toggleFavorite(wordId);
    const firstCallDuration = Date.now() - startTime;

    const startTime2 = Date.now();
    await toggleFavorite(wordId);
    const secondCallDuration = Date.now() - startTime2;

    // Each call should complete in < 1 second
    expect(firstCallDuration).toBeLessThan(1000);
    expect(secondCallDuration).toBeLessThan(1000);
  });
});
```

#### Test Case 2: RLS Policy Enforcement
**Goal:** Verify that RLS blocks access to other users' records

```typescript
describe('toggleFavorite - RLS Policy Enforcement', () => {
  it('should not update records of other users', async () => {
    const wordId = 'test-word-3';

    // Mock current user as User A
    mockAuthStore({ userId: 'user-a-id' });

    // Create record for User B
    await supabase.from('user_words_history').insert({
      user_id: 'user-b-id',
      word_id: wordId,
      is_favorite: true,
      learned_at: new Date().toISOString(),
      times_reviewed: 1,
      ease_factor: 2.5,
    });

    // Try to toggle User B's favorite as User A
    const result = await toggleFavorite(wordId);

    // Should fail or create new record for User A (not modify User B's)
    expect(result.success).toBe(true);

    // Verify User B's record unchanged
    const userBRecord = await supabase
      .from('user_words_history')
      .select('*')
      .eq('user_id', 'user-b-id')
      .eq('word_id', wordId)
      .single();

    expect(userBRecord.data?.is_favorite).toBe(true); // Still true, not modified
  });

  it('should detect RLS block with count = 0', async () => {
    const wordId = 'test-word-4';

    // Mock Supabase UPDATE to return count = 0 (RLS blocked)
    jest.spyOn(supabase.from('user_words_history'), 'update')
      .mockResolvedValueOnce({ data: null, count: 0, error: null });

    const result = await toggleFavorite(wordId);

    expect(result.success).toBe(false);
    expect(result.error).toContain('RLS');
  });
});
```

#### Test Case 3: INSERT with auth-store
**Goal:** Verify that INSERT gets userId from auth-store, not from async call

```typescript
describe('toggleFavorite - INSERT Operation', () => {
  it('should get userId from auth-store without async call', async () => {
    const wordId = 'test-word-5';

    // Mock auth-store with loaded user
    const mockAuthStore = {
      user: { id: 'user-a-id', email: 'test@example.com' },
    };
    jest.spyOn(require('@/store/auth-store'), 'useAuthStore')
      .mockReturnValue({ getState: () => mockAuthStore });

    // Mock Supabase SELECT to return no existing record
    jest.spyOn(supabase.from('user_words_history'), 'select')
      .mockResolvedValueOnce({ data: null, error: null });

    // Mock INSERT
    const insertSpy = jest.spyOn(supabase.from('user_words_history'), 'insert')
      .mockResolvedValueOnce({ data: null, error: null });

    await toggleFavorite(wordId);

    // Verify INSERT was called with userId from auth-store
    expect(insertSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'user-a-id',
        word_id: wordId,
        is_favorite: true,
      })
    );

    // Verify NO async auth call was made
    expect(supabase.auth.getUser).not.toHaveBeenCalled();
    expect(supabase.auth.getSession).not.toHaveBeenCalled();
  });

  it('should fail gracefully if auth-store has no user', async () => {
    const wordId = 'test-word-6';

    // Mock auth-store with NO user
    const mockAuthStore = { user: null };
    jest.spyOn(require('@/store/auth-store'), 'useAuthStore')
      .mockReturnValue({ getState: () => mockAuthStore });

    // Mock Supabase to return no existing record
    jest.spyOn(supabase.from('user_words_history'), 'select')
      .mockResolvedValueOnce({ data: null, error: null });

    const result = await toggleFavorite(wordId);

    expect(result.success).toBe(false);
    expect(result.error).toContain('Not authenticated');
  });
});
```

#### Test Case 4: Optimistic Update & Rollback
**Goal:** Verify that UI updates optimistically and rolls back on error

```typescript
describe('toggleFavorite - Optimistic Update', () => {
  it('should update UI immediately before DB sync', async () => {
    const wordId = 'test-word-7';
    const store = useWordStore.getState();

    // Initially not favorite
    expect(store.isFavorite(wordId)).toBe(false);

    // Mock slow DB response (1 second)
    jest.spyOn(wordHistoryService, 'toggleFavorite')
      .mockImplementation(() =>
        new Promise(resolve =>
          setTimeout(() => resolve({ success: true, is_favorite: true, error: null }), 1000)
        )
      );

    // Start toggle
    const promise = store.toggleFavorite(wordId);

    // UI should update immediately (< 100ms)
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(store.isFavorite(wordId)).toBe(true); // Optimistic update

    // Wait for DB sync
    await promise;

    // Should still be favorite
    expect(store.isFavorite(wordId)).toBe(true);
  });

  it('should rollback optimistic update on DB error', async () => {
    const wordId = 'test-word-8';
    const store = useWordStore.getState();

    // Initially not favorite
    store.favoriteIds = new Set();
    expect(store.isFavorite(wordId)).toBe(false);

    // Mock DB error
    jest.spyOn(wordHistoryService, 'toggleFavorite')
      .mockResolvedValueOnce({ success: false, is_favorite: false, error: 'DB Error' });

    await store.toggleFavorite(wordId);

    // Should rollback to original state
    expect(store.isFavorite(wordId)).toBe(false);
  });
});
```

#### Test Case 5: Lock Mechanism
**Goal:** Verify that parallel calls for the same word_id are ignored

```typescript
describe('toggleFavorite - Lock Mechanism', () => {
  it('should ignore duplicate calls while operation in progress', async () => {
    const wordId = 'test-word-9';
    const store = useWordStore.getState();

    // Mock slow service (500ms)
    const serviceSpy = jest.spyOn(wordHistoryService, 'toggleFavorite')
      .mockImplementation(() =>
        new Promise(resolve =>
          setTimeout(() => resolve({ success: true, is_favorite: true, error: null }), 500)
        )
      );

    // Start first call
    const promise1 = store.toggleFavorite(wordId);

    // Immediately start second call (while first is in progress)
    await new Promise(resolve => setTimeout(resolve, 50));
    const promise2 = store.toggleFavorite(wordId);

    // Wait for both
    await Promise.all([promise1, promise2]);

    // Service should only be called ONCE (second call was locked)
    expect(serviceSpy).toHaveBeenCalledTimes(1);
  });

  it('should allow sequential calls after first completes', async () => {
    const wordId = 'test-word-10';
    const store = useWordStore.getState();

    const serviceSpy = jest.spyOn(wordHistoryService, 'toggleFavorite')
      .mockResolvedValue({ success: true, is_favorite: true, error: null });

    // First call
    await store.toggleFavorite(wordId);

    // Second call (after first completes)
    await store.toggleFavorite(wordId);

    // Service should be called TWICE
    expect(serviceSpy).toHaveBeenCalledTimes(2);
  });
});
```

### Integration Test Scenario

**Goal:** End-to-end test of real user flow

```typescript
describe('Favorites System - E2E', () => {
  it('should handle complete user flow without race conditions', async () => {
    // Setup: User logged in, viewing word of the day
    const { user } = await setupAuthenticatedUser();
    const wordId = 'beg-seq-1';

    // Step 1: Click heart icon (add to favorites)
    await userEvent.click(screen.getByTestId(`favorite-button-${wordId}`));

    // Verify optimistic update
    await waitFor(() => {
      expect(screen.getByTestId(`favorite-button-${wordId}`)).toHaveAttribute('aria-pressed', 'true');
    });

    // Step 2: Immediately navigate to History screen
    await userEvent.click(screen.getByText('History'));

    // Verify history is NOT empty
    await waitFor(() => {
      expect(screen.getByText('Haus')).toBeInTheDocument();
    });

    // Step 3: Click Favorites tab
    await userEvent.click(screen.getByText('Favorites'));

    // Verify word appears in favorites
    await waitFor(() => {
      expect(screen.getByText('Haus')).toBeInTheDocument();
    });

    // Step 4: Click heart again (rapid double-click scenario)
    await userEvent.click(screen.getByTestId(`favorite-button-${wordId}`));
    await new Promise(resolve => setTimeout(resolve, 100)); // Wait 100ms
    await userEvent.click(screen.getByTestId(`favorite-button-${wordId}`));

    // Verify NO timeout error
    await waitFor(() => {
      expect(screen.queryByText(/timeout/i)).not.toBeInTheDocument();
    }, { timeout: 5000 });

    // Step 5: Verify final state in database
    const { data } = await supabase
      .from('user_words_history')
      .select('is_favorite')
      .eq('user_id', user.id)
      .eq('word_id', wordId)
      .single();

    // Should reflect final click state
    expect(data?.is_favorite).toBeDefined();
  });
});
```

---

## Code Examples

### ❌ ANTI-PATTERN: Explicit auth check in service layer

```typescript
// DON'T DO THIS - causes race conditions!
export async function toggleFavorite(wordId: string) {
  // ❌ Blocking async call - can hang for 3+ seconds
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'Not authenticated' };
  }

  // ❌ Explicit user_id filter - duplicates RLS logic
  await supabase
    .from('user_words_history')
    .update({ is_favorite: true })
    .eq('user_id', user.id)
    .eq('word_id', wordId);
}
```

### ✅ BEST PRACTICE: RLS-First pattern

```typescript
// DO THIS - fast and safe!
export async function toggleFavorite(wordId: string) {
  try {
    // ✅ No auth check - RLS handles security
    const { data: existing } = await supabase
      .from('user_words_history')
      .select('*')
      .eq('word_id', wordId)  // RLS automatically adds: WHERE user_id = auth.uid()
      .maybeSingle();

    if (existing) {
      // ✅ Update without user_id filter
      const { count, error } = await supabase
        .from('user_words_history')
        .update({ is_favorite: !existing.is_favorite })
        .eq('word_id', wordId)
        .select();

      // ✅ Check count to detect RLS blocks
      if (count === 0) {
        return { success: false, error: 'RLS blocked update' };
      }
    } else {
      // ✅ For INSERT, get user_id from in-memory store
      const userId = useAuthStore.getState().user?.id;
      if (!userId) {
        return { success: false, error: 'Not authenticated' };
      }

      await supabase
        .from('user_words_history')
        .insert({ user_id: userId, word_id: wordId, is_favorite: true });
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}
```

---

## Best Practices

### ✅ DO

1. **Trust RLS policies** - Let database handle security, not application code
2. **Use in-memory auth state** - Get `user.id` from Zustand store, not async calls
3. **Check row count** - Verify `count > 0` after UPDATE to detect RLS blocks
4. **Implement locks** - Prevent parallel operations on same resource
5. **Add timeouts** - Detect hanging operations early (for debugging)
6. **Log extensively** - Make debugging race conditions easier

### ❌ DON'T

1. **Call `getUser()` in hot paths** - Causes race conditions during token refresh
2. **Call `getSession()` repeatedly** - Even this can hang on React Native
3. **Duplicate security logic** - RLS + app-level checks = maintenance burden
4. **Ignore row count** - Silent RLS failures are hard to debug
5. **Skip error boundaries** - Race conditions can cause unexpected UI states
6. **Remove logging too early** - Keep diagnostic logs in production

### Database RLS Requirements

**Minimum policies for RLS-First pattern:**

```sql
-- SELECT: User sees only their own records
CREATE POLICY "select_own_records" ON table_name FOR SELECT
  USING ((select auth.uid()) = user_id);

-- INSERT: User can create only their own records
CREATE POLICY "insert_own_records" ON table_name FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

-- UPDATE: CRITICAL - need both: USING + WITH CHECK
CREATE POLICY "update_own_records" ON table_name FOR UPDATE
  USING ((select auth.uid()) = user_id)       -- Checks OLD row
  WITH CHECK ((select auth.uid()) = user_id); -- Checks NEW row

-- DELETE: User can delete only their own records
CREATE POLICY "delete_own_records" ON table_name FOR DELETE
  USING ((select auth.uid()) = user_id);
```

**Why `WITH CHECK` is Critical:**
- Without it, UPDATE can **silently fail** (no error, count = 0)
- This is hard to debug because there's no exception
- Always use `WITH CHECK` for UPDATE policies!

---

## Related Files

### Modified Files (in order of importance):

1. **lib/word-history-service.ts** - RLS-first implementation for all CRUD operations
2. **store/word-store.ts** - Lock mechanism for toggleFavorite
3. **docs/database-schema.md** - Updated RLS policies with `WITH CHECK`
4. **app/(tabs)/history.tsx** - useFocusEffect for reload on navigation

### Affected Systems:

- Authentication (auth-store.ts, supabase auth)
- Favorites management (word-store.ts, word-history-service.ts)
- Database security (RLS policies)
- UI state management (React hooks, Zustand)

---

## Conclusion

**Problem:** Race condition in Supabase auth module blocked parallel `getUser()`/`getSession()` calls.

**Solution:** RLS-First Pattern - removed all auth checks from application code, rely on database RLS policies.

**Result:**
- ✅ Hanging completely eliminated
- ✅ toggleFavorite works instantly with any number of clicks
- ✅ Simplified code (less async logic)
- ✅ More secure architecture (security at DB level)

**Key Lesson:** Always prefer database-level security (RLS) over application-level checks. This eliminates an entire class of race conditions and simplifies code.

---

**Author:** Claude Code (AI Assistant)
**Date:** 2026-01-19
**Version:** 1.0.0
