/**
 * Unit Tests for word-store.ts
 *
 * Tests cover:
 * 1. State management - isFavorite, favoriteIds
 * 2. reset() function
 *
 * Note: Tests for toggleFavorite are limited because the store uses
 * dynamic imports and the actual word-history-service module.
 * Integration tests would be more appropriate for full toggleFavorite testing.
 */

// Mock all dependencies
jest.mock('@/lib/storage', () => ({
  storage: {
    getItem: jest.fn(() => Promise.resolve(null)),
    setItem: jest.fn(() => Promise.resolve()),
    removeItem: jest.fn(() => Promise.resolve()),
  },
}));

jest.mock('@/lib/word-history-service', () => ({
  toggleFavorite: jest.fn(() => Promise.resolve({ success: true, is_favorite: true, error: null })),
  getFavoriteIds: jest.fn(() => Promise.resolve({ favoriteIds: [], error: null })),
  markWordAsViewed: jest.fn(() => Promise.resolve({ success: true, error: null })),
  migrateFavoritesToDatabase: jest.fn(() => Promise.resolve({ success: true, error: null })),
}));

jest.mock('@/lib/word-service', () => ({
  getTodayWord: jest.fn(() => Promise.resolve({ word: null, error: null })),
  getWordCountForLevel: jest.fn(() => Promise.resolve({ count: 10, error: null })),
  getWordsBySequenceRange: jest.fn(() => Promise.resolve({ words: [], error: null })),
  getUserDayNumber: jest.fn(() => 1),
}));

jest.mock('@/store/settings-store', () => ({
  useSettingsStore: {
    getState: () => ({
      languageLevel: 'beginner',
      registrationDate: '2026-01-01',
    }),
  },
}));

jest.mock('@/lib/supabase-client', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(() => Promise.resolve({ data: { user: { id: 'test-user' } } })),
    },
  },
}));

// Import store after mocks
import { useWordStore } from '@/store/word-store';

describe('word-store', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useWordStore.getState().reset();
  });

  // ============================================
  // Initial State Tests
  // ============================================
  describe('initial state', () => {
    it('should have empty favoriteIds by default', () => {
      const state = useWordStore.getState();
      expect(state.favoriteIds.size).toBe(0);
    });

    it('should have no todayWord by default', () => {
      const state = useWordStore.getState();
      expect(state.todayWord).toBeNull();
    });

    it('should not be loading by default', () => {
      const state = useWordStore.getState();
      expect(state.isLoading).toBe(false);
    });

    it('should have no error by default', () => {
      const state = useWordStore.getState();
      expect(state.error).toBeNull();
    });

    it('should have empty historyWords by default', () => {
      const state = useWordStore.getState();
      expect(state.historyWords).toEqual([]);
    });
  });

  // ============================================
  // isFavorite Tests
  // ============================================
  describe('isFavorite', () => {
    it('should return false for unknown word', () => {
      expect(useWordStore.getState().isFavorite('unknown-word')).toBe(false);
    });

    it('should return true for favorited word', () => {
      useWordStore.setState({
        favoriteIds: new Set(['favorite-word']),
      });

      expect(useWordStore.getState().isFavorite('favorite-word')).toBe(true);
    });

    it('should return false after word is removed from favorites', () => {
      useWordStore.setState({
        favoriteIds: new Set(['word-1', 'word-2']),
      });

      const newFavorites = new Set(useWordStore.getState().favoriteIds);
      newFavorites.delete('word-1');
      useWordStore.setState({ favoriteIds: newFavorites });

      expect(useWordStore.getState().isFavorite('word-1')).toBe(false);
      expect(useWordStore.getState().isFavorite('word-2')).toBe(true);
    });

    it('should handle multiple favorites correctly', () => {
      useWordStore.setState({
        favoriteIds: new Set(['word-a', 'word-b', 'word-c']),
      });

      expect(useWordStore.getState().isFavorite('word-a')).toBe(true);
      expect(useWordStore.getState().isFavorite('word-b')).toBe(true);
      expect(useWordStore.getState().isFavorite('word-c')).toBe(true);
      expect(useWordStore.getState().isFavorite('word-d')).toBe(false);
    });
  });

  // ============================================
  // setState Tests (direct state manipulation)
  // ============================================
  describe('setState', () => {
    it('should update favoriteIds', () => {
      useWordStore.setState({
        favoriteIds: new Set(['test-word']),
      });

      expect(useWordStore.getState().favoriteIds.has('test-word')).toBe(true);
    });

    it('should update todayWord', () => {
      const mockWord = { id: 'test-id', german: 'Hallo' } as any;
      useWordStore.setState({ todayWord: mockWord });

      expect(useWordStore.getState().todayWord).toEqual(mockWord);
    });

    it('should update isLoading', () => {
      useWordStore.setState({ isLoading: true });
      expect(useWordStore.getState().isLoading).toBe(true);

      useWordStore.setState({ isLoading: false });
      expect(useWordStore.getState().isLoading).toBe(false);
    });

    it('should update error', () => {
      useWordStore.setState({ error: 'Test error' });
      expect(useWordStore.getState().error).toBe('Test error');
    });
  });

  // ============================================
  // reset Tests
  // ============================================
  describe('reset', () => {
    it('should clear favoriteIds', () => {
      useWordStore.setState({
        favoriteIds: new Set(['word-1', 'word-2', 'word-3']),
      });

      useWordStore.getState().reset();

      expect(useWordStore.getState().favoriteIds.size).toBe(0);
    });

    it('should clear todayWord', () => {
      useWordStore.setState({
        todayWord: { id: 'test' } as any,
      });

      useWordStore.getState().reset();

      expect(useWordStore.getState().todayWord).toBeNull();
    });

    it('should clear isLoading', () => {
      useWordStore.setState({ isLoading: true });

      useWordStore.getState().reset();

      expect(useWordStore.getState().isLoading).toBe(false);
    });

    it('should clear error', () => {
      useWordStore.setState({ error: 'Some error' });

      useWordStore.getState().reset();

      expect(useWordStore.getState().error).toBeNull();
    });

    it('should clear historyWords', () => {
      useWordStore.setState({
        historyWords: [{ id: 'word-1' } as any, { id: 'word-2' } as any],
      });

      useWordStore.getState().reset();

      expect(useWordStore.getState().historyWords).toEqual([]);
    });

    it('should reset hydration flags', () => {
      useWordStore.setState({
        _hasHydrated: true,
        _hasMigratedFavorites: true,
      });

      useWordStore.getState().reset();

      expect(useWordStore.getState()._hasHydrated).toBe(false);
      expect(useWordStore.getState()._hasMigratedFavorites).toBe(false);
    });

    it('should reset playback state', () => {
      useWordStore.setState({
        isPlaying: true,
        playbackSpeed: 1.5,
      });

      useWordStore.getState().reset();

      expect(useWordStore.getState().isPlaying).toBe(false);
      // Note: playbackSpeed is not reset in the current implementation
    });
  });

  // ============================================
  // Playback State Tests
  // ============================================
  describe('playback state', () => {
    it('should set isPlaying', () => {
      useWordStore.getState().setIsPlaying(true);
      expect(useWordStore.getState().isPlaying).toBe(true);

      useWordStore.getState().setIsPlaying(false);
      expect(useWordStore.getState().isPlaying).toBe(false);
    });

    it('should set playbackSpeed', () => {
      useWordStore.getState().setPlaybackSpeed(1.5);
      expect(useWordStore.getState().playbackSpeed).toBe(1.5);

      useWordStore.getState().setPlaybackSpeed(0.75);
      expect(useWordStore.getState().playbackSpeed).toBe(0.75);
    });
  });

  // ============================================
  // Edge Cases
  // ============================================
  describe('edge cases', () => {
    it('should handle empty Set operations', () => {
      const emptySet = new Set<string>();
      useWordStore.setState({ favoriteIds: emptySet });

      expect(useWordStore.getState().isFavorite('any-word')).toBe(false);
    });

    it('should handle multiple resets', () => {
      useWordStore.setState({
        favoriteIds: new Set(['word-1']),
        todayWord: { id: 'test' } as any,
      });

      useWordStore.getState().reset();
      useWordStore.getState().reset();
      useWordStore.getState().reset();

      expect(useWordStore.getState().favoriteIds.size).toBe(0);
      expect(useWordStore.getState().todayWord).toBeNull();
    });

    it('should handle special characters in word IDs', () => {
      const specialId = 'word-with-special-chars-äöü-123';
      useWordStore.setState({
        favoriteIds: new Set([specialId]),
      });

      expect(useWordStore.getState().isFavorite(specialId)).toBe(true);
    });
  });
});
