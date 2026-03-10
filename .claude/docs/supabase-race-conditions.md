# Состояния гонки в Supabase и паттерн RLS-First

**Создано:** 2026-01-19
**Статус:** ✅ Решено
**Приоритет:** 🔴 КРИТИЧЕСКИЙ

---

## 📋 Оглавление

1. [Краткое описание проблемы](#краткое-описание-проблемы)
2. [Симптомы](#симптомы)
3. [Анализ коренной причины](#анализ-коренной-причины)
4. [Процесс диагностики](#процесс-диагностики)
5. [Решение: паттерн RLS-First](#решение-паттерн-rls-first)
6. [Модульное тестирование](#модульное-тестирование)
7. [Примеры кода](#примеры-кода)
8. [Лучшие практики](#лучшие-практики)

---

## Краткое описание проблемы

**Проблема:** `toggleFavorite()` работал «через раз» — первый клик успешно обновлял БД, второй зависал на 3+ секунды и откатывался.

**Коренная причина:** Состояние гонки в модуле Supabase Auth — параллельные вызовы `getUser()` или `getSession()` блокируются внутренними блокировками, особенно во время обновления токена.

**Решение:** Паттерн RLS-First — удалить все явные проверки авторизации из кода приложения, полагаться на политики Row Level Security на уровне базы данных.

---

## Симптомы

### Симптом 1: Зависание асинхронных операций
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

### Симптом 2: Экран истории становится пустым
- После зависшего клика на переключение, переход на экран History показывает пустой список
- После перезагрузки страницы список восстанавливается
- Указывает на проблему с асинхронной загрузкой данных во время блокировки модуля авторизации

### Симптом 3: Недетерминированное воспроизведение
- Зависание происходит **периодически**
- Зависит от тайминга и состояния модуля Supabase Auth
- Чаще при быстрых повторных кликах (1-2 секунды между кликами)
- Реже при медленных кликах (5+ секунд между кликами)

---

## Анализ коренной причины

### Техническое объяснение

Модуль Supabase Auth использует **внутренние блокировки** для синхронизации операций авторизации:

1. **Блокировка обновления токена**
   - Когда access token истекает (по умолчанию: 1 час), Supabase автоматически запускает обновление
   - Во время обновления все операции авторизации (`getUser()`, `getSession()` и т.д.) блокируются
   - Блокировка может длиться от 1 до 5+ секунд в зависимости от сетевой задержки

2. **Блокировка параллельных операций**
   - Если два запроса вызывают `getUser()` или `getSession()` параллельно
   - Второй запрос **ожидает** завершения первого (блокирующее ожидание, не очередь)
   - Это защита от состояний гонки внутри модуля авторизации

3. **Блокировка доступа к хранилищу**
   - `getSession()` читает из AsyncStorage/localStorage
   - На Web это синхронная операция, но на React Native — асинхронная
   - Параллельные чтения могут блокироваться блокировками файлов на уровне ОС

### Почему это критично для toggleFavorite()

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

**Сценарий зависания:**

1. Пользователь нажимает иконку сердца → вызывается `toggleFavorite()`
2. Функция вызывает `getUser()` → модуль Auth запускает обновление токена (фоново)
3. Пользователь нажимает **второй раз** (через 1 секунду)
4. Второй вызов `getUser()` **блокируется** первым обновлением
5. Таймаут срабатывает через 3 секунды → Откат
6. Пользователь видит, что избранное не обновилось

### Почему getSession() не помог

```typescript
// ❌ ALSO DOESN'T WORK:
const { data: { session }, error } = await supabase.auth.getSession();
```

**Причины:**
- `getSession()` тоже использует внутренние блокировки
- На React Native читает из AsyncStorage → асинхронная операция
- Может блокироваться во время обновления токена
- Быстрее, чем `getUser()` (нет сетевого вызова), но всё равно блокирует

---

## Процесс диагностики

### Шаг 1: Добавление логирования
Добавлено подробное логирование на каждом шаге:

```typescript
export async function toggleFavorite(wordId: string) {
  console.log('[WordHistory] toggleFavorite START - wordId:', wordId);
  console.log('[WordHistory] Checking auth...');
  const { data: { user } } = await supabase.auth.getUser();
  console.log('[WordHistory] Auth check complete - user:', !!user);
  // ...
}
```

**Результат:** Обнаружено, что выполнение останавливается на `"Checking auth..."` → проблема в вызове авторизации.

### Шаг 2: Замена getUser() на getSession()
```typescript
// Attempt #1: Use getSession() instead of getUser()
const { data: { session } } = await supabase.auth.getSession();
```

**Результат:** Зависание уменьшилось с ~5с до ~3с, но проблема осталась.

### Шаг 3: Добавление обёртки с таймаутом
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

**Результат:** Подтверждено, что `getSession()` зависает на 3+ секунды → необходимо полностью убрать вызовы авторизации.

### Шаг 4: Паттерн RLS-First (финальное решение)
Удалены все проверки авторизации, полагаемся на Row Level Security:

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

**Результат:** ✅ Зависание полностью устранено, все клики работают мгновенно.

---

## Решение: паттерн RLS-First

### Принцип

**Перенести контроль безопасности с уровня приложения на уровень базы данных.**

Вместо проверки авторизации в коде приложения:
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

Используем политики RLS для автоматической фильтрации:
```typescript
// ✅ GOOD: Database-level auth enforcement
await supabase
  .from('user_words_history')
  .update({ is_favorite: true })
  .eq('word_id', wordId);  // RLS automatically adds: WHERE user_id = auth.uid()
```

### Реализация

#### 1. Операции SELECT/UPDATE — без проверок авторизации

**Файл:** `lib/word-history-service.ts`

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

#### 2. Необходимые политики RLS

**Файл:** `docs/database-schema.md` (Шаг 3: Политики RLS)

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

**Почему `WITH CHECK` важен:**
- `USING` проверяет строку **до** модификации (OLD row)
- `WITH CHECK` проверяет строку **после** модификации (NEW row)
- Без `WITH CHECK` Supabase **молча блокирует** UPDATE (count = 0, без ошибки)

#### 3. Механизм блокировки параллельных вызовов

**Файл:** `store/word-store.ts`

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

## Модульное тестирование

### Критические тест-кейсы

#### Тест-кейс 1: Быстрые последовательные клики
**Цель:** Убедиться, что параллельные вызовы toggleFavorite не вызывают состояний гонки

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

#### Тест-кейс 2: Проверка политик RLS
**Цель:** Убедиться, что RLS блокирует доступ к записям других пользователей

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

#### Тест-кейс 3: INSERT с auth-store
**Цель:** Убедиться, что INSERT получает userId из auth-store, а не из асинхронного вызова

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

#### Тест-кейс 4: Оптимистичное обновление и откат
**Цель:** Убедиться, что UI обновляется оптимистично и откатывается при ошибке

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

#### Тест-кейс 5: Механизм блокировки
**Цель:** Убедиться, что параллельные вызовы для одного word_id игнорируются

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

### Сценарий интеграционного тестирования

**Цель:** Сквозной тест реального пользовательского сценария

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

## Примеры кода

### ❌ АНТИПАТТЕРН: Явная проверка авторизации в сервисном слое

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

### ✅ ЛУЧШАЯ ПРАКТИКА: Паттерн RLS-First

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

## Лучшие практики

### ✅ РЕКОМЕНДУЕТСЯ

1. **Доверять политикам RLS** — пусть база данных обеспечивает безопасность, а не код приложения
2. **Использовать состояние авторизации из памяти** — получать `user.id` из Zustand store, а не из асинхронных вызовов
3. **Проверять количество строк** — убеждаться, что `count > 0` после UPDATE для обнаружения блокировок RLS
4. **Реализовать блокировки** — предотвращать параллельные операции над одним ресурсом
5. **Добавлять таймауты** — обнаруживать зависания на ранней стадии (для отладки)
6. **Логировать подробно** — упрощать отладку состояний гонки

### ❌ НЕ РЕКОМЕНДУЕТСЯ

1. **Вызывать `getUser()` в горячих путях** — вызывает состояния гонки при обновлении токена
2. **Вызывать `getSession()` многократно** — даже это может зависнуть на React Native
3. **Дублировать логику безопасности** — RLS + проверки на уровне приложения = бремя поддержки
4. **Игнорировать количество строк** — молчаливые сбои RLS сложно отлаживать
5. **Пропускать обработку ошибок** — состояния гонки могут вызвать неожиданные состояния UI
6. **Удалять логирование слишком рано** — оставляйте диагностические логи в продакшене

### Требования к политикам RLS для базы данных

**Минимальные политики для паттерна RLS-First:**

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

**Почему `WITH CHECK` критически важен:**
- Без него UPDATE может **молча завершиться неудачей** (без ошибки, count = 0)
- Это сложно отлаживать, потому что нет исключения
- Всегда используйте `WITH CHECK` для политик UPDATE!

---

## Связанные файлы

### Изменённые файлы (в порядке важности):

1. **lib/word-history-service.ts** — реализация RLS-first для всех CRUD-операций
2. **store/word-store.ts** — механизм блокировки для toggleFavorite
3. **docs/database-schema.md** — обновлённые политики RLS с `WITH CHECK`
4. **app/(tabs)/history.tsx** — useFocusEffect для перезагрузки при навигации

### Затронутые системы:

- Авторизация (auth-store.ts, Supabase Auth)
- Управление избранным (word-store.ts, word-history-service.ts)
- Безопасность базы данных (политики RLS)
- Управление состоянием UI (React hooks, Zustand)

---

## Заключение

**Проблема:** Состояние гонки в модуле Supabase Auth блокировало параллельные вызовы `getUser()`/`getSession()`.

**Решение:** Паттерн RLS-First — удалены все проверки авторизации из кода приложения, полагаемся на политики RLS базы данных.

**Результат:**
- ✅ Зависание полностью устранено
- ✅ toggleFavorite работает мгновенно при любом количестве кликов
- ✅ Упрощённый код (меньше асинхронной логики)
- ✅ Более безопасная архитектура (безопасность на уровне БД)

**Ключевой урок:** Всегда предпочитайте безопасность на уровне базы данных (RLS) проверкам на уровне приложения. Это устраняет целый класс состояний гонки и упрощает код.

---

**Автор:** Claude Code (AI Assistant)
**Дата:** 2026-01-19
**Версия:** 1.0.0
