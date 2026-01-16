// Types for the word history system

export interface UserWordHistory {
  user_id: string;
  word_id: string;
  learned_at: string; // ISO timestamp
  is_favorite: boolean;
  times_reviewed: number;
  next_review_date: string | null;
  ease_factor: number;
}

export interface MarkWordViewedResult {
  success: boolean;
  error: string | null;
}

export interface ToggleFavoriteResult {
  success: boolean;
  is_favorite: boolean;
  error: string | null;
}

export interface GetUserHistoryResult {
  history: UserWordHistory[];
  error: string | null;
}

export interface GetFavoriteIdsResult {
  favoriteIds: string[];
  error: string | null;
}
