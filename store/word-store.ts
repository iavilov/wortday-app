import { getAllWords, getTodayWord } from '@/lib/mock-data';
import { Word } from '@/types/word';
import { create } from 'zustand';

interface WordStore {
  todayWord: Word | null;
  allWords: Word[];
  favoriteIds: Set<string>;
  lastVisitDate: string | null;
  isLoading: boolean;
  error: string | null;

  loadTodayWord: () => Promise<void>;
  loadAllWords: () => Promise<void>;
  toggleFavorite: (wordId: string) => void;
  isFavorite: (wordId: string) => boolean;
  getFavoriteWords: () => Word[];

  isPlaying: boolean;
  playbackSpeed: number;
  setIsPlaying: (playing: boolean) => void;
  setPlaybackSpeed: (speed: number) => void;
}

export const useWordStore = create<WordStore>((set, get) => ({
  todayWord: null,
  allWords: [],
  favoriteIds: new Set<string>(),
  lastVisitDate: null,
  isLoading: false,
  error: null,
  isPlaying: false,
  playbackSpeed: 1.0,

  loadTodayWord: async () => {
    set({ isLoading: true, error: null });

    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      // Get the current level and registration date from settings
      const { languageLevel, registrationDate } = (await import('@/store/settings-store')).useSettingsStore.getState();

      const word = getTodayWord(languageLevel, registrationDate);
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
      const words = getAllWords();
      set({ allWords: words });
    } catch (error) {
      console.error('Failed to load all words:', error);
    }
  },

  toggleFavorite: (wordId: string) => {
    set((state) => {
      const newFavorites = new Set(state.favoriteIds);

      if (newFavorites.has(wordId)) {
        newFavorites.delete(wordId);
      } else {
        newFavorites.add(wordId);
      }

      return { favoriteIds: newFavorites };
    });
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
