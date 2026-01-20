# Testing Guide

**Last Updated:** 2026-01-20
**Status:** ✅ Active

---

## Overview

This guide covers the unit testing setup for Vocade, focusing on critical business logic and database interactions. The test suite ensures that the RLS-First pattern (documented in `supabase-race-conditions.md`) works correctly without race conditions.

---

## Test Infrastructure

### Technology Stack

- **Test Framework:** Jest 29.7.0
- **Preset:** `jest-expo` (Expo SDK 54)
- **Environment:** Node.js (no React Native runtime)
- **Mocking:** Jest manual mocks

### Configuration Files

```
vocade/
├── jest.config.js           # Jest configuration for Expo
├── __tests__/
│   ├── setup.ts            # Global mocks (AsyncStorage, Platform)
│   ├── mocks/
│   │   ├── supabase.ts     # Supabase mock helpers
│   │   └── auth-store.ts   # Auth store mock helpers
│   ├── lib/
│   │   └── word-history-service.test.ts  # Service layer tests (12 tests)
│   └── store/
│       └── word-store.test.ts            # Zustand store tests (24 tests)
```

---

## Running Tests

### Basic Commands

```bash
# Run all tests once
npm test

# Run tests in watch mode (TDD)
npm run test:watch

# Generate coverage report
npm run test:coverage

# Run specific test file
npm test -- word-history-service

# Run tests matching pattern
npm test -- --testNamePattern="toggleFavorite"
```

### Expected Output

```
Test Suites: 2 passed, 2 total
Tests:       36 passed, 36 total
Snapshots:   0 total
Time:        2.702 s
```

---

## Test Coverage

### word-history-service.ts (12 tests)

**File:** `__tests__/lib/word-history-service.test.ts`

#### Critical Tests

1. **toggleFavorite - RLS-First Pattern**
   - ✅ Toggle favorite from false to true
   - ✅ Toggle favorite from true to false
   - ✅ Verify `getSession()` is NOT called (RLS-First)
   - ✅ Performance test (< 50ms with mocks)

2. **markWordAsViewed**
   - ✅ Update existing record (increment times_reviewed)
   - ✅ Fail when not authenticated
   - ✅ Fail on auth error

3. **getFavoriteIds**
   - ✅ Return empty array when not authenticated

4. **getUserHistory**
   - ✅ Return empty array when not authenticated

5. **migrateFavoritesToDatabase**
   - ✅ Skip migration when favoriteIds is empty
   - ✅ Fail when not authenticated

#### What's NOT Tested (Limitations)

- INSERT path in `toggleFavorite` (requires `--experimental-vm-modules` for dynamic imports)
- RLS block detection (count = 0)
- Database error scenarios
- Complex migration logic

**Reason:** The service uses `await import('@/store/auth-store')` which Jest doesn't handle well without experimental flags.

**Recommendation:** Use integration tests with real Supabase for full coverage.

---

### word-store.ts (24 tests)

**File:** `__tests__/store/word-store.test.ts`

#### Test Categories

1. **Initial State (5 tests)**
   - Empty favoriteIds
   - No todayWord
   - Not loading
   - No error
   - Empty historyWords

2. **isFavorite (4 tests)**
   - Return false for unknown word
   - Return true for favorited word
   - Return false after removal
   - Handle multiple favorites

3. **setState (4 tests)**
   - Update favoriteIds
   - Update todayWord
   - Update isLoading
   - Update error

4. **reset (7 tests)**
   - Clear favoriteIds
   - Clear todayWord
   - Clear isLoading
   - Clear error
   - Clear historyWords
   - Reset hydration flags
   - Reset playback state

5. **Playback State (2 tests)**
   - Set isPlaying
   - Set playbackSpeed

6. **Edge Cases (3 tests)**
   - Handle empty Set operations
   - Handle multiple resets
   - Handle special characters in word IDs

#### What's NOT Tested (Limitations)

- `toggleFavorite()` method (uses dynamic imports and real service)
- `syncFavoritesFromDB()` (complex async flow)
- `hydrate()` (complex migration logic)
- `loadTodayWord()` (integration with word-service)

**Reason:** These methods involve complex async flows and external dependencies.

**Recommendation:** Use integration tests or E2E tests for these scenarios.

---

## Writing New Tests

### Basic Test Structure

```typescript
// 1. Define mocks BEFORE jest.mock()
const mockGetSession = jest.fn();
const mockFrom = jest.fn();

// 2. Mock modules
jest.mock('@/lib/supabase-client', () => ({
  get supabase() {
    return {
      auth: { getSession: mockGetSession },
      from: mockFrom,
    };
  },
}));

// 3. Import module under test
import { toggleFavorite } from '@/lib/word-history-service';

// 4. Write tests
describe('feature', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Setup default mock behavior
  });

  it('should do something', async () => {
    // Arrange
    mockFrom.mockReturnValue(/* ... */);

    // Act
    const result = await toggleFavorite('word-1');

    // Assert
    expect(result.success).toBe(true);
  });
});
```

### Helper: Chainable Query Builder

```typescript
function createQueryBuilder(result: { data?: any; error?: any; count?: number }) {
  const builder: any = {
    select: jest.fn(() => builder),
    insert: jest.fn(() => Promise.resolve(result)),
    update: jest.fn(() => builder),
    eq: jest.fn(() => builder),
    maybeSingle: jest.fn(() => Promise.resolve(result)),
  };
  return builder;
}

// Usage
const fetchBuilder = createQueryBuilder({
  data: { word_id: 'test', is_favorite: false },
  error: null,
});
mockFrom.mockReturnValueOnce(fetchBuilder);
```

---

## Testing Best Practices

### ✅ DO

1. **Test Business Logic, Not Implementation**
   - Focus on public API behavior
   - Don't test internal methods

2. **Use Descriptive Test Names**
   ```typescript
   it('should toggle favorite from false to true')
   it('should fail when not authenticated')
   ```

3. **Follow AAA Pattern**
   - **Arrange**: Setup mocks and data
   - **Act**: Call the function
   - **Assert**: Check results

4. **Mock at Module Boundaries**
   - Mock external services (Supabase, AsyncStorage)
   - Don't mock internal functions

5. **Test Error Scenarios**
   - Network failures
   - Authentication errors
   - Invalid input

6. **Verify RLS-First Pattern**
   ```typescript
   expect(mockGetSession).not.toHaveBeenCalled();
   ```

### ❌ DON'T

1. **Don't Test Implementation Details**
   - Don't test private methods
   - Don't test internal state

2. **Don't Duplicate Production Code**
   - Keep tests simple
   - Use helper functions for complex setups

3. **Don't Ignore Async/Await**
   ```typescript
   // ❌ BAD
   it('should work', () => {
     toggleFavorite('word-1');
   });

   // ✅ GOOD
   it('should work', async () => {
     await toggleFavorite('word-1');
   });
   ```

4. **Don't Mock Everything**
   - Only mock external dependencies
   - Let pure functions run

5. **Don't Write Flaky Tests**
   - Avoid timing dependencies
   - Use deterministic mocks

---

## Troubleshooting

### Common Issues

#### 1. "Cannot find module '@/lib/...'"

**Solution:** Check `jest.config.js` has correct `moduleNameMapper`:

```javascript
moduleNameMapper: {
  '^@/(.*)$': '<rootDir>/$1',
},
```

#### 2. "TypeError: supabase.from is not a function"

**Solution:** Use getter pattern in mock:

```typescript
jest.mock('@/lib/supabase-client', () => ({
  get supabase() {
    return {
      auth: { getSession: mockGetSession },
      from: mockFrom,
    };
  },
}));
```

#### 3. "Dynamic import callback error"

**Solution:** This is expected for code using `await import()`. Either:
- Skip the test
- Refactor code to inject dependencies
- Use `--experimental-vm-modules` (Node 16+)

#### 4. "Tests hang/timeout"

**Solution:**
- Ensure all mocks return Promises
- Check for missing `async/await`
- Verify no infinite loops

---

## Integration Testing (Future)

### Recommended Tools

- **E2E:** Detox or Maestro
- **Integration:** Testing Library with real Supabase
- **Visual Regression:** Chromatic or Percy

### Test Scenarios

1. **Complete Favorite Flow**
   - Toggle favorite → Navigate to history → Verify in favorites tab
   - Rapid double-click → No race conditions

2. **Auth Flow**
   - Login → Load today's word → Mark as viewed
   - Logout → Reset stores → Login as different user

3. **RLS Policy Enforcement**
   - User A cannot see User B's favorites
   - User A cannot update User B's history

---

## Coverage Goals

### Current Coverage

```
Statements   : 60% (service layer)
Branches     : 50% (auth checks)
Functions    : 70% (public methods)
Lines        : 65% (excluding types)
```

### Target Coverage

```
Statements   : 80%
Branches     : 75%
Functions    : 85%
Lines        : 80%
```

### Critical Files (100% Coverage Required)

- `lib/word-history-service.ts`
- `store/word-store.ts` (state management)
- `lib/auth-service.ts`

---

## References

- [Jest Documentation](https://jestjs.io/)
- [jest-expo](https://docs.expo.dev/guides/testing-with-jest/)
- [Testing Library](https://testing-library.com/docs/react-native-testing-library/intro/)
- [Supabase Testing Guide](https://supabase.com/docs/guides/getting-started/testing)

---

## Changelog

### 2026-01-20 - Initial Setup

- ✅ Configured Jest with `jest-expo` preset
- ✅ Created 36 unit tests (12 service + 24 store)
- ✅ Documented RLS-First pattern validation
- ✅ Added test scripts to `package.json`
- ✅ Created mock infrastructure for Supabase

---

**Next Steps:**
1. Add integration tests with real Supabase (local instance)
2. Increase coverage for edge cases
3. Add E2E tests with Detox
4. Set up CI/CD with GitHub Actions
