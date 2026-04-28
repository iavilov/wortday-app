/**
 * Word Service for Wortday
 * Handles fetching words from Supabase database
 */

import { supabase } from '@/lib/supabase-client';
import { LanguageLevel } from '@/types/settings';
import { TodayWordResponse, Word } from '@/types/word';

/**
 * Get words by sequence number range for a specific level
 * Used for the history "conveyor" (words from day 1 to current_day)
 */
export async function getWordsBySequenceRange(
    level: LanguageLevel,
    fromSequence: number,
    toSequence: number
): Promise<{ words: Word[]; error: string | null }> {
    try {
        const { data, error } = await supabase
            .from('words')
            .select('*')
            .eq('level', level)
            .gte('sequence_number', fromSequence)
            .lte('sequence_number', toSequence)
            .order('sequence_number', { ascending: true });

        if (error) {
            console.error('[WordService] Error fetching words by range:', error);
            return { words: [], error: error.message };
        }

        return { words: data || [], error: null };
    } catch (err) {
        console.error('[WordService] Unexpected error:', err);
        return { words: [], error: 'Failed to fetch words' };
    }
}

/**
 * Get today's word via server-side RPC.
 *
 * Day number is computed server-side from `users.level_started_at`,
 * so client never needs to handle dates or timezones.
 * When user has consumed all available words for the level,
 * `exhausted: true` is returned with `word: null`.
 */
export async function getTodayWord(
    userId: string
): Promise<{ data: TodayWordResponse | null; error: string | null }> {
    try {
        const { data, error } = await supabase.rpc('get_today_word', { p_user_id: userId });

        if (error) {
            console.error('[WordService] Error calling get_today_word:', error);
            return { data: null, error: error.message };
        }

        if (!data) {
            return { data: null, error: 'Empty RPC response' };
        }

        const response: TodayWordResponse = {
            word: data.word ?? null,
            day_number: data.day_number ?? 0,
            total_words: data.total_words ?? 0,
            exhausted: data.exhausted ?? false,
        };

        console.log(
            `[WordService] get_today_word: day=${response.day_number}/${response.total_words}, exhausted=${response.exhausted}`,
        );

        return { data: response, error: null };
    } catch (err) {
        console.error('[WordService] Unexpected error:', err);
        return { data: null, error: 'Failed to fetch word' };
    }
}

/**
 * Get word by ID
 */
export async function getWordById(id: string): Promise<{ word: Word | null; error: string | null }> {
    try {
        const { data, error } = await supabase
            .from('words')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('[WordService] Error fetching word by ID:', error);
            return { word: null, error: error.message };
        }

        return { word: data, error: null };
    } catch (err) {
        console.error('[WordService] Unexpected error:', err);
        return { word: null, error: 'Failed to fetch word' };
    }
}
