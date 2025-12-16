/**
 * Zustand store for Word management
 * Handles: Today's word, favorites, streak, loading states
 */

import { getAllWords, getTodayWord } from '@/lib/mock-data';
import { Word } from '@/types/word';
import { create } from 'zustand';

interface WordStore {
  // Current word of the day
  todayWord: Word | null;
  
  // All available words (for history/favorites)
  allWords: Word[];
  
  // Favorite word IDs
  favoriteIds: Set<string>;
  
  // Streak (consecutive days)
  streak: number;
  lastVisitDate: string | null;
  
  // Loading state
  isLoading: boolean;
  error: string | null;
  
  // Actions
  loadTodayWord: () => Promise<void>;
  loadAllWords: () => Promise<void>;
  toggleFavorite: (wordId: string) => void;
  isFavorite: (wordId: string) => boolean;
  getFavoriteWords: () => Word[];
  updateStreak: () => void;
  
  // Audio playback state (for current word)
  isPlaying: boolean;
  playbackSpeed: number;
  setIsPlaying: (playing: boolean) => void;
  setPlaybackSpeed: (speed: number) => void;
}

export const useWordStore = create<WordStore>((set, get) => ({
  // Initial state
  todayWord: null,
  allWords: [],
  favoriteIds: new Set<string>(),
  streak: 0,
  lastVisitDate: null,
  isLoading: false,
  error: null,
  isPlaying: false,
  playbackSpeed: 1.0,
  
  // Load today's word (mock data for now)
  loadTodayWord: async () => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const word = getTodayWord();
      set({ todayWord: word, isLoading: false });
      
      // Update streak on first load
      get().updateStreak();
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load word',
        isLoading: false 
      });
    }
  },
  
  // Load all words
  loadAllWords: async () => {
    try {
      const words = getAllWords();
      set({ allWords: words });
    } catch (error) {
      console.error('Failed to load all words:', error);
    }
  },
  
  // Toggle favorite
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
  
  // Check if word is favorite
  isFavorite: (wordId: string) => {
    return get().favoriteIds.has(wordId);
  },
  
  // Get all favorite words
  getFavoriteWords: () => {
    const { allWords, favoriteIds } = get();
    return allWords.filter(word => favoriteIds.has(word.id));
  },
  
  // Update streak counter
  updateStreak: () => {
    const today = new Date().toISOString().split('T')[0];
    const { lastVisitDate, streak } = get();
    
    if (!lastVisitDate) {
      // First visit
      set({ streak: 1, lastVisitDate: today });
      return;
    }
    
    if (lastVisitDate === today) {
      // Already visited today
      return;
    }
    
    // Calculate days difference
    const lastDate = new Date(lastVisitDate);
    const currentDate = new Date(today);
    const diffTime = currentDate.getTime() - lastDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      // Consecutive day - increment streak
      set({ streak: streak + 1, lastVisitDate: today });
    } else if (diffDays > 1) {
      // Streak broken - reset
      set({ streak: 1, lastVisitDate: today });
    }
  },
  
  // Audio playback controls
  setIsPlaying: (playing: boolean) => {
    set({ isPlaying: playing });
  },
  
  setPlaybackSpeed: (speed: number) => {
    set({ playbackSpeed: speed });
  }
}));
