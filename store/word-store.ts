import { supabase } from '@/lib/supabase-client';
import { storage } from '@/lib/storage';
import * as wordHistoryService from '@/lib/word-history-service';
import * as wordService from '@/lib/word-service';
import { useSettingsStore } from '@/store/settings-store';
import { Word } from '@/types/word';
import { create } from 'zustand';

interface WordStore {
  todayWord: Word | null;
  historyWords: Word[];
  favoriteIds: Set<string>;
  isLoading: boolean;
  error: string | null;
  dayNumber: number;
  totalWords: number;
  exhausted: boolean;
  _hasHydrated: boolean;
  _hasMigratedFavorites: boolean;
  _toggleInProgress: Record<string, boolean>;

  loadTodayWord: () => Promise<void>;
  loadHistoryWords: () => Promise<void>;
  markWordAsViewed: (wordId: string) => Promise<void>;
  syncFavoritesFromDB: () => Promise<void>;
  toggleFavorite: (wordId: string) => Promise<void>;
  isFavorite: (wordId: string) => boolean;
  hydrate: () => Promise<void>;

  isPlaying: boolean;
  playbackSpeed: number;
  setIsPlaying: (playing: boolean) => void;
  setPlaybackSpeed: (speed: number) => void;
  reset: () => void;
}

const FAVORITES_KEY = 'wortday-favorites';
const FAVORITES_MIGRATED_KEY = 'wortday-favorites-migrated';

export const useWordStore = create<WordStore>((set, get) => ({
  todayWord: null,
  historyWords: [],
  favoriteIds: new Set<string>(),
  isLoading: false,
  error: null,
  dayNumber: 0,
  totalWords: 0,
  exhausted: false,
  _hasHydrated: false,
  _hasMigratedFavorites: false,
  _toggleInProgress: {},
  isPlaying: false,
  playbackSpeed: 1.0,

  // Hydrate favorites from storage and migrate to database
  hydrate: async () => {
    try {
      // Load favorites from AsyncStorage
      const stored = await storage.getItem(FAVORITES_KEY);
      const localFavorites = stored ? JSON.parse(stored) : [];

      // Use getSession() instead of getUser() to avoid race conditions
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
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
      } else {
        console.log('[WordStore] Hydrated local only (not authenticated)');
      }

      set({ _hasHydrated: true });
    } catch (e) {
      console.error('[WordStore] Failed to hydrate favorites:', e);
      set({ _hasHydrated: true, _hasMigratedFavorites: true });
    }
  },

  loadTodayWord: async () => {
    set({ isLoading: true, error: null });

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        console.warn('[WordStore] loadTodayWord: not authenticated');
        set({ isLoading: false, todayWord: null, exhausted: false, dayNumber: 0, totalWords: 0 });
        return;
      }

      const { data, error } = await wordService.getTodayWord(session.user.id);

      if (error || !data) {
        set({ error: error || 'Failed to load word', isLoading: false, todayWord: null });
        return;
      }

      set({
        todayWord: data.word,
        dayNumber: data.day_number,
        totalWords: data.total_words,
        exhausted: data.exhausted,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load word',
        isLoading: false,
      });
    }
  },

  // Load history conveyor: words from day 1 to current_day (capped at totalWords)
  loadHistoryWords: async () => {
    try {
      const { languageLevel } = useSettingsStore.getState();

      // Ensure dayNumber/totalWords are populated before computing range
      if (get().dayNumber < 1 || get().totalWords < 1) {
        await get().loadTodayWord();
      }

      const { dayNumber, totalWords } = get();

      if (dayNumber < 1 || totalWords < 1) {
        console.log('[WordStore] loadHistoryWords: still no day info, skipping');
        return;
      }

      const toSequence = Math.min(dayNumber, totalWords);

      const { words, error } = await wordService.getWordsBySequenceRange(languageLevel, 1, toSequence);

      if (error) {
        console.error('[WordStore] Failed to load history words:', error);
        return;
      }

      set({ historyWords: words });
      console.log(`[WordStore] Loaded ${words.length} history words (level=${languageLevel}, range=1-${toSequence})`);
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
      console.log('[WordStore] Syncing favorites from DB...');
      const { favoriteIds, error } = await wordHistoryService.getFavoriteIds();

      if (error) {
        console.error('[WordStore] Failed to sync favorites from DB:', error);
        return;
      }

      const favoriteSet = new Set(favoriteIds);
      set({ favoriteIds: favoriteSet });

      // Persist to AsyncStorage for offline mode
      await storage.setItem(FAVORITES_KEY, JSON.stringify(favoriteIds));

      console.log(`[WordStore] Synced ${favoriteIds.length} favorites from database`);
    } catch (error) {
      console.error('[WordStore] Exception in syncFavoritesFromDB:', error);
    }
  },

  toggleFavorite: async (wordId: string) => {
    console.log('[WordStore] toggleFavorite CALLED with wordId:', wordId);

    // Check if a toggle is already in progress for this word
    if (get()._toggleInProgress[wordId]) {
      console.warn('[WordStore] Toggle already in progress for', wordId, '— ignoring');
      return;
    }

    // Mark toggle as in progress
    set({ _toggleInProgress: { ...get()._toggleInProgress, [wordId]: true } });

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
      return;
    }

    // Sync with database
    try {
      const { success, is_favorite, error } = await wordHistoryService.toggleFavorite(wordId);

      if (!success) {
        console.error('[WordStore] Failed to sync favorite to DB:', error);
        // Rollback optimistic update
        set({ favoriteIds: currentFavorites });
        await storage.setItem(FAVORITES_KEY, JSON.stringify([...currentFavorites]));
        return;
      }

      // Sync local state with DB truth
      const correctFavorites = new Set(currentFavorites);
      if (is_favorite) {
        correctFavorites.add(wordId);
      } else {
        correctFavorites.delete(wordId);
      }
      set({ favoriteIds: correctFavorites });
      await storage.setItem(FAVORITES_KEY, JSON.stringify([...correctFavorites]));

      console.log(`[WordStore] Synced favorite to DB: ${wordId} = ${is_favorite}`);
    } catch (error) {
      console.error('[WordStore] Exception in toggleFavorite:', error);
      // Rollback optimistic update
      set({ favoriteIds: currentFavorites });
      await storage.setItem(FAVORITES_KEY, JSON.stringify([...currentFavorites]));
    } finally {
      // Clear the in-progress flag
      const { [wordId]: _, ...rest } = get()._toggleInProgress;
      set({ _toggleInProgress: rest });
    }
  },

  isFavorite: (wordId: string) => {
    return get().favoriteIds.has(wordId);
  },

  setIsPlaying: (playing: boolean) => {
    set({ isPlaying: playing });
  },

  setPlaybackSpeed: (speed: number) => {
    set({ playbackSpeed: speed });
  },

  reset: () => {
    set({
      todayWord: null,
      historyWords: [],
      favoriteIds: new Set<string>(),
      isLoading: false,
      error: null,
      dayNumber: 0,
      totalWords: 0,
      exhausted: false,
      _hasHydrated: false,
      _hasMigratedFavorites: false,
      _toggleInProgress: {},
      isPlaying: false,
    });
  },
}));
