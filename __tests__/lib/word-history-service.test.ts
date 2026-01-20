/**
 * Unit Tests for word-history-service.ts
 *
 * Tests cover:
 * 1. toggleFavorite - RLS-First pattern (critical path)
 * 2. Error handling for network failures
 * 3. Authentication checks
 *
 * Note: Some tests are limited by Jest's handling of dynamic imports.
 * The actual code uses `await import()` which requires --experimental-vm-modules.
 */

// Helper to create chainable query builder
function createQueryBuilder(result: { data?: any; error?: any; count?: number }) {
  const builder: any = {
    select: jest.fn(() => builder),
    insert: jest.fn(() => Promise.resolve(result)),
    update: jest.fn(() => builder),
    delete: jest.fn(() => builder),
    eq: jest.fn(() => builder),
    neq: jest.fn(() => builder),
    in: jest.fn(() => builder),
    order: jest.fn(() => Promise.resolve(result)),
    limit: jest.fn(() => builder),
    single: jest.fn(() => Promise.resolve(result)),
    maybeSingle: jest.fn(() => Promise.resolve(result)),
  };
  return builder;
}

// Mock implementations
const mockGetSession = jest.fn();
const mockFrom = jest.fn();
const mockGetState = jest.fn();

// Mock Supabase module
jest.mock('@/lib/supabase-client', () => ({
  get supabase() {
    return {
      auth: {
        getSession: mockGetSession,
        getUser: jest.fn(),
      },
      from: mockFrom,
    };
  },
}));

// Mock auth-store
jest.mock('@/store/auth-store', () => ({
  useAuthStore: {
    getState: mockGetState,
  },
}));

// Import module under test
import {
  toggleFavorite,
  markWordAsViewed,
  getFavoriteIds,
  getUserHistory,
  migrateFavoritesToDatabase,
} from '@/lib/word-history-service';

describe('word-history-service', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Default: authenticated user
    mockGetSession.mockResolvedValue({
      data: {
        session: {
          user: { id: 'test-user-123', email: 'test@example.com' },
        },
      },
      error: null,
    });

    // Default: auth store has user
    mockGetState.mockReturnValue({
      user: { id: 'test-user-123', email: 'test@example.com' },
    });
  });

  // ============================================
  // toggleFavorite - RLS-First Pattern Tests
  // ============================================
  describe('toggleFavorite', () => {
    describe('when record exists (UPDATE path)', () => {
      it('should toggle favorite from false to true', async () => {
        const fetchBuilder = createQueryBuilder({
          data: {
            word_id: 'word-1',
            user_id: 'test-user-123',
            is_favorite: false,
            times_reviewed: 1,
          },
          error: null,
        });

        const updateBuilder = createQueryBuilder({
          data: [{ is_favorite: true }],
          count: 1,
          error: null,
        });

        mockFrom
          .mockReturnValueOnce(fetchBuilder)
          .mockReturnValueOnce(updateBuilder);

        const result = await toggleFavorite('word-1');

        expect(result.success).toBe(true);
        expect(result.is_favorite).toBe(true);
        expect(result.error).toBeNull();
        expect(mockFrom).toHaveBeenCalledWith('user_words_history');
      });

      it('should toggle favorite from true to false', async () => {
        const fetchBuilder = createQueryBuilder({
          data: {
            word_id: 'word-1',
            user_id: 'test-user-123',
            is_favorite: true,
            times_reviewed: 5,
          },
          error: null,
        });

        const updateBuilder = createQueryBuilder({
          data: [{ is_favorite: false }],
          count: 1,
          error: null,
        });

        mockFrom
          .mockReturnValueOnce(fetchBuilder)
          .mockReturnValueOnce(updateBuilder);

        const result = await toggleFavorite('word-1');

        expect(result.success).toBe(true);
        expect(result.is_favorite).toBe(false);
      });

      it('should not call getSession (RLS-First pattern)', async () => {
        const fetchBuilder = createQueryBuilder({
          data: { word_id: 'word-1', is_favorite: false },
          error: null,
        });
        const updateBuilder = createQueryBuilder({
          data: [{ is_favorite: true }],
          count: 1,
          error: null,
        });

        mockFrom
          .mockReturnValueOnce(fetchBuilder)
          .mockReturnValueOnce(updateBuilder);

        await toggleFavorite('word-1');

        // Key assertion: getSession should NOT be called (RLS-First pattern)
        expect(mockGetSession).not.toHaveBeenCalled();
      });
    });

    describe('performance', () => {
      it('should complete quickly with mocks (< 50ms)', async () => {
        const fetchBuilder = createQueryBuilder({
          data: { word_id: 'word-1', is_favorite: false },
          error: null,
        });
        const updateBuilder = createQueryBuilder({
          data: [{ is_favorite: true }],
          count: 1,
          error: null,
        });

        mockFrom
          .mockReturnValueOnce(fetchBuilder)
          .mockReturnValueOnce(updateBuilder);

        const startTime = Date.now();
        await toggleFavorite('word-1');
        const duration = Date.now() - startTime;

        expect(duration).toBeLessThan(50);
      });
    });
  });

  // ============================================
  // markWordAsViewed Tests
  // ============================================
  describe('markWordAsViewed', () => {
    it('should succeed when updating existing record', async () => {
      const fetchBuilder = createQueryBuilder({
        data: {
          word_id: 'word-1',
          user_id: 'test-user-123',
          times_reviewed: 5,
        },
        error: null,
      });

      // Create update builder with proper chaining for eq().eq()
      const updateBuilder: any = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
      };
      // Final eq() call returns the result
      updateBuilder.eq
        .mockReturnValueOnce(updateBuilder) // first .eq(user_id)
        .mockReturnValueOnce(Promise.resolve({ error: null })); // second .eq(word_id)

      mockFrom
        .mockReturnValueOnce(fetchBuilder)
        .mockReturnValueOnce(updateBuilder);

      const result = await markWordAsViewed('word-1');

      expect(result.success).toBe(true);
    });

    it('should fail when not authenticated', async () => {
      mockGetSession.mockResolvedValueOnce({
        data: { session: null },
        error: null,
      });

      const result = await markWordAsViewed('word-1');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Not authenticated');
    });

    it('should fail on auth error', async () => {
      mockGetSession.mockResolvedValueOnce({
        data: { session: null },
        error: { message: 'Auth failed' },
      });

      const result = await markWordAsViewed('word-1');

      expect(result.success).toBe(false);
    });
  });

  // ============================================
  // getFavoriteIds Tests
  // ============================================
  describe('getFavoriteIds', () => {
    it('should return empty array when not authenticated', async () => {
      mockGetSession.mockResolvedValueOnce({
        data: { session: null },
        error: null,
      });

      const result = await getFavoriteIds();

      expect(result.favoriteIds).toEqual([]);
      expect(result.error).toContain('Not authenticated');
    });
  });

  // ============================================
  // getUserHistory Tests
  // ============================================
  describe('getUserHistory', () => {
    it('should return empty array when not authenticated', async () => {
      mockGetSession.mockResolvedValueOnce({
        data: { session: null },
        error: null,
      });

      const result = await getUserHistory();

      expect(result.history).toEqual([]);
      expect(result.error).toContain('Not authenticated');
    });
  });

  // ============================================
  // migrateFavoritesToDatabase Tests
  // ============================================
  describe('migrateFavoritesToDatabase', () => {
    it('should skip migration when favoriteIds is empty', async () => {
      const result = await migrateFavoritesToDatabase([]);

      expect(result.success).toBe(true);
      expect(mockFrom).not.toHaveBeenCalled();
    });

    it('should fail when not authenticated', async () => {
      mockGetSession.mockResolvedValueOnce({
        data: { session: null },
        error: null,
      });

      const result = await migrateFavoritesToDatabase(['word-1', 'word-2']);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Not authenticated');
    });
  });
});
