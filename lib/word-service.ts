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
        console.log('[WordService] getUserDayNumber: registrationDate is null, returning day 1');
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
    const dayNumber = diffDays + 1;
    console.log(`[WordService] getUserDayNumber: registrationDate="${registrationDate}", today="${now.toISOString().split('T')[0]}", dayNumber=${dayNumber}`);
    return dayNumber;
}

/**
 * Calculate cyclic sequence number for word rotation
 * Example: day 400 with 365 words -> sequence 35
 */
export function calculateCyclicSequence(dayNumber: number, totalWordsInLevel: number): number {
    if (totalWordsInLevel === 0) {
        return 1;
    }
    return ((dayNumber - 1) % totalWordsInLevel) + 1;
}

/**
 * Get count of words for a specific level
 * Used for cyclic word rotation
 */
export async function getWordCountForLevel(level: LanguageLevel): Promise<{ count: number; error: string | null }> {
    try {
        const { count, error } = await supabase
            .from('words')
            .select('*', { count: 'exact', head: true })
            .eq('level', level);

        if (error) {
            console.error('[WordService] Error counting words:', error);
            return { count: 0, error: error.message };
        }

        console.log(`[WordService] Word count for level ${level}: ${count}`);
        return { count: count || 0, error: null };
    } catch (err) {
        console.error('[WordService] Unexpected error:', err);
        return { count: 0, error: 'Failed to count words' };
    }
}

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

        console.log(`[WordService] Fetched ${data?.length || 0} words for level ${level}, range ${fromSequence}-${toSequence}`);
        return { words: data || [], error: null };
    } catch (err) {
        console.error('[WordService] Unexpected error:', err);
        return { words: [], error: 'Failed to fetch words' };
    }
}

/**
 * Get today's word based on user level and registration date
 * Implements cyclic word rotation when user exceeds available words
 */
export async function getTodayWord(
    level: LanguageLevel,
    registrationDate: string | null = null
): Promise<{ word: Word | null; error: string | null }> {
    try {
        const userDay = getUserDayNumber(registrationDate);

        // Get word count for cyclic calculation
        const { count: totalWords, error: countError } = await getWordCountForLevel(level);

        if (countError) {
            console.error('[WordService] Error getting word count:', countError);
            return { word: null, error: countError };
        }

        if (totalWords === 0) {
            console.log('[WordService] No words available for level:', level);
            return { word: null, error: 'No words available for this level' };
        }

        // Calculate cyclic sequence number
        const sequenceNumber = calculateCyclicSequence(userDay, totalWords);

        console.log(`[WordService] Fetching word for level: ${level}, day: ${userDay}, sequence: ${sequenceNumber} (total: ${totalWords})`);

        // Fetch word from Supabase
        const { data, error } = await supabase
            .from('words')
            .select('*')
            .eq('level', level)
            .eq('sequence_number', sequenceNumber)
            .single();

        if (error) {
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
