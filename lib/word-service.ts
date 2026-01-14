/**
 * Word Service for Vocade
 * Handles fetching words from Supabase database
 */

import { supabase } from '@/lib/supabase-client';
import { LanguageLevel } from '@/types/settings';
import { Word } from '@/types/word';

/**
 * Calculate the user's current day number based on registration date
 */
export function getUserDayNumber(registrationDate: string | null): number {
    if (!registrationDate) {
        // For demo without registration: day 1
        return 1;
    }

    const regDate = new Date(registrationDate);
    const now = new Date();

    // Reset time to midnight for accurate day calculation
    regDate.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);

    const diffTime = now.getTime() - regDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    // Linear sequence: day 1, 2, 3, ..., ∞
    return diffDays + 1;
}

/**
 * Get today's word based on user level and registration date
 */
export async function getTodayWord(
    level: LanguageLevel,
    registrationDate: string | null = null
): Promise<{ word: Word | null; error: string | null }> {
    try {
        const userDay = getUserDayNumber(registrationDate);

        console.log(`[WordService] Fetching word for level: ${level}, day: ${userDay}`);

        // Fetch word from Supabase
        const { data, error } = await supabase
            .from('words')
            .select('*')
            .eq('level', level)
            .eq('sequence_number', userDay)
            .single();

        if (error) {
            // If no word found for this day, get the first word of the level
            if (error.code === 'PGRST116') {
                console.log(`[WordService] No word for day ${userDay}, fetching first word`);

                const { data: firstWord, error: firstWordError } = await supabase
                    .from('words')
                    .select('*')
                    .eq('level', level)
                    .eq('sequence_number', 1)
                    .single();

                if (firstWordError) {
                    console.error('[WordService] Error fetching first word:', firstWordError);
                    return { word: null, error: firstWordError.message };
                }

                return { word: firstWord, error: null };
            }

            console.error('[WordService] Error fetching word:', error);
            return { word: null, error: error.message };
        }

        return { word: data, error: null };
    } catch (err) {
        console.error('[WordService] Unexpected error:', err);
        return { word: null, error: 'Failed to fetch word' };
    }
}

/**
 * Get all words (for history/favorites)
 */
export async function getAllWords(): Promise<{ words: Word[]; error: string | null }> {
    try {
        const { data, error } = await supabase
            .from('words')
            .select('*')
            .order('level', { ascending: true })
            .order('sequence_number', { ascending: true });

        if (error) {
            console.error('[WordService] Error fetching all words:', error);
            return { words: [], error: error.message };
        }

        return { words: data || [], error: null };
    } catch (err) {
        console.error('[WordService] Unexpected error:', err);
        return { words: [], error: 'Failed to fetch words' };
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

/**
 * Get all words for a specific level
 */
export async function getWordsByLevel(level: LanguageLevel): Promise<{ words: Word[]; error: string | null }> {
    try {
        const { data, error } = await supabase
            .from('words')
            .select('*')
            .eq('level', level)
            .order('sequence_number', { ascending: true });

        if (error) {
            console.error('[WordService] Error fetching words by level:', error);
            return { words: [], error: error.message };
        }

        return { words: data || [], error: null };
    } catch (err) {
        console.error('[WordService] Unexpected error:', err);
        return { words: [], error: 'Failed to fetch words' };
    }
}
