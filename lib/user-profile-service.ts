/**
 * User Profile Service for Wortday
 * Manages mutations on the `users` row (level, notification settings, etc.)
 */

import { supabase } from '@/lib/supabase-client';
import { LanguageLevel } from '@/types/settings';

/**
 * Update language level and reset the day counter.
 *
 * Sets `level_started_at = CURRENT_DATE` so day_number resets to 1
 * for the new level. Without this, the user would jump mid-sequence
 * (e.g. day 47 of beginner -> day 47 of advanced).
 */
export async function updateLanguageLevel(
    level: LanguageLevel,
): Promise<{ success: boolean; error: string | null }> {
    try {
        const { data: { session }, error: authError } = await supabase.auth.getSession();

        if (authError || !session?.user) {
            console.warn('[UserProfileService] Not authenticated, skipping DB update');
            return { success: false, error: 'Not authenticated' };
        }

        const today = new Date().toISOString().split('T')[0];

        const { error } = await supabase
            .from('users')
            .update({
                language_level: level,
                level_started_at: today,
            })
            .eq('id', session.user.id);

        if (error) {
            console.error('[UserProfileService] Failed to update language level:', error);
            return { success: false, error: error.message };
        }

        console.log(`[UserProfileService] Language level updated to ${level}, level_started_at=${today}`);
        return { success: true, error: null };
    } catch (err) {
        console.error('[UserProfileService] Unexpected error:', err);
        return { success: false, error: 'Failed to update language level' };
    }
}
