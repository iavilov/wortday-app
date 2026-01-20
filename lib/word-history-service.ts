/**
 * Word History Service for Vocade
 * Manages user_words_history table for view tracking and favorites
 */

import { supabase } from '@/lib/supabase-client';
import type {
  MarkWordViewedResult,
  ToggleFavoriteResult,
  GetFavoriteIdsResult,
  GetUserHistoryResult,
  UserWordHistory,
} from '@/types/word-history';

/**
 * Mark a word as viewed by the current user
 * Creates new record or increments times_reviewed if exists
 */
export async function markWordAsViewed(wordId: string): Promise<MarkWordViewedResult> {
  try {
    // Check authentication - use getSession() instead of getUser() to avoid race conditions
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session?.user) {
      console.error('[WordHistory] Not authenticated:', authError);
      return { success: false, error: 'Not authenticated' };
    }

    const userId = session.user.id;
    const now = new Date().toISOString();

    // Check if record exists
    const { data: existing, error: fetchError } = await supabase
      .from('user_words_history')
      .select('*')
      .eq('user_id', userId)
      .eq('word_id', wordId)
      .maybeSingle();

    if (fetchError) {
      console.error('[WordHistory] Error fetching existing record:', fetchError);
      return { success: false, error: fetchError.message };
    }

    if (existing) {
      // Update existing record - increment times_reviewed
      const { error: updateError } = await supabase
        .from('user_words_history')
        .update({
          learned_at: now,
          times_reviewed: (existing.times_reviewed || 0) + 1,
        })
        .eq('user_id', userId)
        .eq('word_id', wordId);

      if (updateError) {
        console.error('[WordHistory] Error updating record:', updateError);
        return { success: false, error: updateError.message };
      }

      console.log(`[WordHistory] Updated view count for word ${wordId}: ${existing.times_reviewed + 1}`);
    } else {
      // Insert new record
      const { error: insertError } = await supabase
        .from('user_words_history')
        .insert({
          user_id: userId,
          word_id: wordId,
          learned_at: now,
          is_favorite: false,
          times_reviewed: 1,
          next_review_date: null,
          ease_factor: 2.5, // Default for future SRS
        });

      if (insertError) {
        console.error('[WordHistory] Error inserting record:', insertError);
        return { success: false, error: insertError.message };
      }

      console.log(`[WordHistory] Created new view record for word ${wordId}`);
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('[WordHistory] Unexpected error in markWordAsViewed:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Toggle favorite status for a word
 * Creates record if doesn't exist
 */
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
      .eq('word_id', wordId)
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
        .eq('word_id', wordId)
        .select();

      console.log('[WordHistory] Update result - count:', count, 'error:', updateError);

      if (updateError) {
        console.error('[WordHistory] Error updating favorite status:', updateError);
        return { success: false, is_favorite: false, error: updateError.message };
      }

      // Check if any rows were actually updated (RLS might block silently)
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

      // Get user_id from auth store (already loaded, no async call needed)
      const authStore = (await import('@/store/auth-store')).useAuthStore.getState();
      const userId = authStore.user?.id;

      if (!userId) {
        console.error('[WordHistory] No user ID available for INSERT');
        return { success: false, is_favorite: false, error: 'Not authenticated' };
      }

      const { error: insertError } = await supabase
        .from('user_words_history')
        .insert({
          user_id: userId,
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

/**
 * Get IDs of all favorite words for current user
 */
export async function getFavoriteIds(): Promise<GetFavoriteIdsResult> {
  try {
    // Check authentication - use getSession() instead of getUser() to avoid race conditions
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session?.user) {
      console.error('[WordHistory] Not authenticated:', authError);
      return { favoriteIds: [], error: 'Not authenticated' };
    }

    const userId = session.user.id;

    const { data, error } = await supabase
      .from('user_words_history')
      .select('word_id')
      .eq('user_id', userId)
      .eq('is_favorite', true);

    if (error) {
      console.error('[WordHistory] Error fetching favorites:', error);
      return { favoriteIds: [], error: error.message };
    }

    const favoriteIds = data.map((record) => record.word_id);
    console.log(`[WordHistory] Loaded ${favoriteIds.length} favorites from database`);

    return { favoriteIds, error: null };
  } catch (error) {
    console.error('[WordHistory] Unexpected error in getFavoriteIds:', error);
    return { favoriteIds: [], error: String(error) };
  }
}

/**
 * Get complete history for current user
 */
export async function getUserHistory(): Promise<GetUserHistoryResult> {
  try {
    // Check authentication - use getSession() instead of getUser() to avoid race conditions
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session?.user) {
      console.error('[WordHistory] Not authenticated:', authError);
      return { history: [], error: 'Not authenticated' };
    }

    const userId = session.user.id;

    const { data, error } = await supabase
      .from('user_words_history')
      .select('*')
      .eq('user_id', userId)
      .order('learned_at', { ascending: false });

    if (error) {
      console.error('[WordHistory] Error fetching history:', error);
      return { history: [], error: error.message };
    }

    console.log(`[WordHistory] Loaded ${data.length} history records`);
    return { history: data as UserWordHistory[], error: null };
  } catch (error) {
    console.error('[WordHistory] Unexpected error in getUserHistory:', error);
    return { history: [], error: String(error) };
  }
}

/**
 * Migrate favorites from AsyncStorage to database
 * Used for one-time migration from old system
 */
export async function migrateFavoritesToDatabase(favoriteIds: string[]): Promise<{ success: boolean; error: string | null }> {
  try {
    // Check authentication - use getSession() instead of getUser() to avoid race conditions
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session?.user) {
      console.error('[WordHistory] Not authenticated:', authError);
      return { success: false, error: 'Not authenticated' };
    }

    if (favoriteIds.length === 0) {
      console.log('[WordHistory] No favorites to migrate');
      return { success: true, error: null };
    }

    const userId = session.user.id;
    const now = new Date().toISOString();

    // Get existing records to avoid duplicates
    const { data: existingRecords, error: fetchError } = await supabase
      .from('user_words_history')
      .select('word_id')
      .eq('user_id', userId)
      .in('word_id', favoriteIds);

    if (fetchError) {
      console.error('[WordHistory] Error fetching existing records:', fetchError);
      return { success: false, error: fetchError.message };
    }

    const existingWordIds = new Set(existingRecords?.map((r) => r.word_id) || []);

    // Prepare records to insert (only new ones)
    const recordsToInsert = favoriteIds
      .filter((wordId) => !existingWordIds.has(wordId))
      .map((wordId) => ({
        user_id: userId,
        word_id: wordId,
        learned_at: now,
        is_favorite: true,
        times_reviewed: 0,
        next_review_date: null,
        ease_factor: 2.5,
      }));

    // Update existing records to mark as favorite
    if (existingWordIds.size > 0) {
      const { error: updateError } = await supabase
        .from('user_words_history')
        .update({ is_favorite: true })
        .eq('user_id', userId)
        .in('word_id', Array.from(existingWordIds));

      if (updateError) {
        console.error('[WordHistory] Error updating existing favorites:', updateError);
        return { success: false, error: updateError.message };
      }

      console.log(`[WordHistory] Updated ${existingWordIds.size} existing records as favorites`);
    }

    // Insert new records
    if (recordsToInsert.length > 0) {
      const { error: insertError } = await supabase
        .from('user_words_history')
        .insert(recordsToInsert);

      if (insertError) {
        console.error('[WordHistory] Error inserting favorites:', insertError);
        return { success: false, error: insertError.message };
      }

      console.log(`[WordHistory] Inserted ${recordsToInsert.length} new favorite records`);
    }

    console.log(`[WordHistory] Migration complete: ${favoriteIds.length} favorites processed`);
    return { success: true, error: null };
  } catch (error) {
    console.error('[WordHistory] Unexpected error in migrateFavoritesToDatabase:', error);
    return { success: false, error: String(error) };
  }
}
