import { storage } from '@/lib/storage';
import * as wordService from '@/lib/word-service';
import * as wordHistoryService from '@/lib/word-history-service';
import { Word } from '@/types/word';
import { create } from 'zustand';

interface WordStore {
  todayWord: Word | null;
  allWords: Word[]; // Deprecated - use historyWords instead
  historyWords: Word[]; // Conveyor: words from day 1 to current_day
  favoriteIds: Set<string>;
  lastVisitDate: string | null;
  isLoading: boolean;
  error: string | null;
  _hasHydrated: boolean;
  _hasMigratedFavorites: boolean;

  loadTodayWord: () => Promise<void>;
  loadAllWords: () => Promise<void>; // Deprecated - use loadHistoryWords instead
  loadHistoryWords: () => Promise<void>;
  markWordAsViewed: (wordId: string) => Promise<void>;
  syncFavoritesFromDB: () => Promise<void>;
  toggleFavorite: (wordId: string) => Promise<void>;
  isFavorite: (wordId: string) => boolean;
  getFavoriteWords: () => Word[];
  hydrate: () => Promise<void>;

  isPlaying: boolean;
  playbackSpeed: number;
  setIsPlaying: (playing: boolean) => void;
  setPlaybackSpeed: (speed: number) => void;
}

const FAVORITES_KEY = 'vocade-favorites';
const FAVORITES_MIGRATED_KEY = 'vocade-favorites-migrated';

export const useWordStore = create<WordStore>((set, get) => ({
  todayWord: null,
  allWords: [],
  historyWords: [],
  favoriteIds: new Set<string>(),
  lastVisitDate: null,
  isLoading: false,
  error: null,
  _hasHydrated: false,
  _hasMigratedFavorites: false,
  isPlaying: false,
  playbackSpeed: 1.0,

  // Hydrate favorites from storage and migrate to database
  hydrate: async () => {
    try {
      // Load favorites from AsyncStorage
      const stored = await storage.getItem(FAVORITES_KEY);
      const localFavorites = stored ? JSON.parse(stored) : [];

      // Check if migration already happened
      const migrated = await storage.getItem(FAVORITES_MIGRATED_KEY);

      if (!migrated && localFavorites.length > 0) {
        console.log('[WordStore] Migrating favorites to database...');
        const { success, error } = await wordHistoryService.migrateFavoritesToDatabase(localFavorites);

        if (success) {
          await storage.setItem(FAVORITES_MIGRATED_KEY, 'true');
          set({ _hasMigratedFavorites: true });
          console.log('[WordStore] Favorites migration completed');
        } else {
          console.error('[WordStore] Favorites migration failed:', error);
        }
      } else {
        set({ _hasMigratedFavorites: true });
      }

      // Sync favorites from database
      await get().syncFavoritesFromDB();

      set({ _hasHydrated: true });
    } catch (e) {
      console.error('[WordStore] Failed to hydrate favorites:', e);
      set({ _hasHydrated: true, _hasMigratedFavorites: true });
    }
  },

  loadTodayWord: async () => {
    set({ isLoading: true, error: null });

    try {
      // Get the current level and registration date from settings
      const { languageLevel, registrationDate } = (await import('@/store/settings-store')).useSettingsStore.getState();

      const { word, error } = await wordService.getTodayWord(languageLevel, registrationDate);

      if (error) {
        set({
          error,
          isLoading: false,
          todayWord: null
        });
        return;
      }

      set({ todayWord: word, isLoading: false });

    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load word',
        isLoading: false
      });
    }
  },

  // Deprecated: Use loadHistoryWords instead
  loadAllWords: async () => {
    console.warn('[WordStore] loadAllWords is deprecated, use loadHistoryWords instead');
    await get().loadHistoryWords();
  },

  // Load history conveyor: words from day 1 to current_day
  loadHistoryWords: async () => {
    try {
      const { languageLevel, registrationDate } = (await import('@/store/settings-store')).useSettingsStore.getState();

      console.log(`[WordStore] loadHistoryWords: registrationDate="${registrationDate}", level="${languageLevel}"`);

      // Calculate current day number
      const currentDay = wordService.getUserDayNumber(registrationDate);

      // Get word count to determine range limit
      const { count: totalWords, error: countError } = await wordService.getWordCountForLevel(languageLevel);

      if (countError) {
        console.error('[WordStore] Failed to get word count:', countError);
        return;
      }

      // Conveyor shows words from 1 to min(currentDay, totalWords)
      const toSequence = Math.min(currentDay, totalWords);

      console.log(`[WordStore] Loading history conveyor: level=${languageLevel}, day=${currentDay}, totalWords=${totalWords}, range=1-${toSequence}`);

      const { words, error } = await wordService.getWordsBySequenceRange(languageLevel, 1, toSequence);

      if (error) {
        console.error('[WordStore] Failed to load history words:', error);
        return;
      }

      set({ historyWords: words, allWords: words });
      console.log(`[WordStore] Loaded ${words.length} words for history conveyor`);
    } catch (error) {
      console.error('[WordStore] Failed to load history words:', error);
    }
  },

  // Mark word as viewed in database
  markWordAsViewed: async (wordId: string) => {
    try {
      const { success, error } = await wordHistoryService.markWordAsViewed(wordId);

      if (!success) {
        console.error('[WordStore] Failed to mark word as viewed:', error);
      }
    } catch (error) {
      console.error('[WordStore] Failed to mark word as viewed:', error);
    }
  },

  // Sync favorites from database
  syncFavoritesFromDB: async () => {
    try {
      const { favoriteIds, error } = await wordHistoryService.getFavoriteIds();

      if (error) {
        console.error('[WordStore] Failed to sync favorites from DB:', error);
        return;
      }

      const favoriteSet = new Set(favoriteIds);
      set({ favoriteIds: favoriteSet });

      // Update AsyncStorage for offline mode
      await storage.setItem(FAVORITES_KEY, JSON.stringify(favoriteIds));

      console.log(`[WordStore] Synced ${favoriteIds.length} favorites from database`);
    } catch (error) {
      console.error('[WordStore] Failed to sync favorites from DB:', error);
    }
  },

  toggleFavorite: async (wordId: string) => {
    const currentFavorites = get().favoriteIds;
    const wasFavorite = currentFavorites.has(wordId);

    // Optimistic update
    const newFavorites = new Set(currentFavorites);
    if (wasFavorite) {
      newFavorites.delete(wordId);
    } else {
      newFavorites.add(wordId);
    }

    set({ favoriteIds: newFavorites });

    // Persist to AsyncStorage for offline mode
    try {
      await storage.setItem(FAVORITES_KEY, JSON.stringify([...newFavorites]));
    } catch (e) {
      console.error('[WordStore] Failed to save favorites to storage:', e);
    }

    // Sync with database
    try {
      const { success, is_favorite, error } = await wordHistoryService.toggleFavorite(wordId);

      if (!success) {
        console.error('[WordStore] Failed to sync favorite to DB:', error);
        // Rollback optimistic update
        set({ favoriteIds: currentFavorites });
        await storage.setItem(FAVORITES_KEY, JSON.stringify([...currentFavorites]));
      } else {
        console.log(`[WordStore] Synced favorite to DB: ${wordId} = ${is_favorite}`);
      }
    } catch (error) {
      console.error('[WordStore] Failed to sync favorite to DB:', error);
      // Rollback optimistic update
      set({ favoriteIds: currentFavorites });
      await storage.setItem(FAVORITES_KEY, JSON.stringify([...currentFavorites]));
    }
  },

  isFavorite: (wordId: string) => {
    return get().favoriteIds.has(wordId);
  },

  getFavoriteWords: () => {
    const { historyWords, favoriteIds } = get();
    return historyWords.filter(word => favoriteIds.has(word.id));
  },

  setIsPlaying: (playing: boolean) => {
    set({ isPlaying: playing });
  },

  setPlaybackSpeed: (speed: number) => {
    set({ playbackSpeed: speed });
  }
}));
