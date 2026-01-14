import { storage } from '@/lib/storage';
import * as wordService from '@/lib/word-service';
import { Word } from '@/types/word';
import { create } from 'zustand';

interface WordStore {
  todayWord: Word | null;
  allWords: Word[];
  favoriteIds: Set<string>;
  lastVisitDate: string | null;
  isLoading: boolean;
  error: string | null;
  _hasHydrated: boolean;

  loadTodayWord: () => Promise<void>;
  loadAllWords: () => Promise<void>;
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

export const useWordStore = create<WordStore>((set, get) => ({
  todayWord: null,
  allWords: [],
  favoriteIds: new Set<string>(),
  lastVisitDate: null,
  isLoading: false,
  error: null,
  _hasHydrated: false,
  isPlaying: false,
  playbackSpeed: 1.0,

  // Hydrate favorites from storage
  hydrate: async () => {
    try {
      const stored = await storage.getItem(FAVORITES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        set({ favoriteIds: new Set(parsed), _hasHydrated: true });
      } else {
        set({ _hasHydrated: true });
      }
    } catch (e) {
      console.error('Failed to hydrate favorites:', e);
      set({ _hasHydrated: true });
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

  loadAllWords: async () => {
    try {
      const { words, error } = await wordService.getAllWords();

      if (error) {
        console.error('Failed to load all words:', error);
        return;
      }

      set({ allWords: words });
    } catch (error) {
      console.error('Failed to load all words:', error);
    }
  },

  toggleFavorite: async (wordId: string) => {
    const newFavorites = new Set(get().favoriteIds);

    if (newFavorites.has(wordId)) {
      newFavorites.delete(wordId);
    } else {
      newFavorites.add(wordId);
    }

    set({ favoriteIds: newFavorites });

    // Persist to storage
    try {
      await storage.setItem(FAVORITES_KEY, JSON.stringify([...newFavorites]));
    } catch (e) {
      console.error('Failed to save favorites:', e);
    }
  },

  isFavorite: (wordId: string) => {
    return get().favoriteIds.has(wordId);
  },

  getFavoriteWords: () => {
    const { allWords, favoriteIds } = get();
    return allWords.filter(word => favoriteIds.has(word.id));
  },

  setIsPlaying: (playing: boolean) => {
    set({ isPlaying: playing });
  },

  setPlaybackSpeed: (speed: number) => {
    set({ playbackSpeed: speed });
  }
}));
