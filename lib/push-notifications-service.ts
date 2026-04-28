/**
 * Push Notifications Service for Wortday
 *
 * Server-driven daily push delivery:
 * - Client registers an Expo push token + IANA timezone with Supabase
 * - Edge Function `daily-word-push` fires hourly via pg_cron and sends pushes
 *   to users whose local time matches their notification_time (±7 min)
 *
 * Local scheduled notifications are not used anymore — they can't know which
 * word is "today" and don't update when the user changes level / runs out
 * of content.
 */

import { supabase } from '@/lib/supabase-client';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure foreground display behavior. iOS otherwise silently drops pushes
// when the app is open.
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export type PermissionStatus = 'granted' | 'denied' | 'undetermined';

export async function getPermissionStatus(): Promise<PermissionStatus> {
    if (Platform.OS === 'web') return 'denied';
    const { status } = await Notifications.getPermissionsAsync();
    return status as PermissionStatus;
}

export async function requestPermissions(): Promise<PermissionStatus> {
    if (Platform.OS === 'web') return 'denied';
    const { status } = await Notifications.requestPermissionsAsync();
    return status as PermissionStatus;
}

function getDeviceTimezone(): string {
    try {
        return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    } catch {
        return 'UTC';
    }
}

/**
 * Register the device for push: fetch Expo token, persist to `user_push_tokens`,
 * sync IANA timezone to `users.notification_timezone`.
 *
 * Idempotent — safe to call on every app launch when notifications are enabled.
 */
export async function registerPushToken(): Promise<{ success: boolean; error: string | null }> {
    if (Platform.OS === 'web') {
        return { success: false, error: 'Push notifications are not supported on web' };
    }

    if (!Device.isDevice) {
        return { success: false, error: 'Push notifications require a physical device' };
    }

    try {
        const status = await getPermissionStatus();
        if (status !== 'granted') {
            return { success: false, error: 'Notification permission not granted' };
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
            return { success: false, error: 'Not authenticated' };
        }

        const projectId = process.env.EXPO_PUBLIC_EAS_PROJECT_ID;
        const tokenResponse = await Notifications.getExpoPushTokenAsync(
            projectId ? { projectId } : undefined,
        );
        const expoToken = tokenResponse.data;

        const platform: 'ios' | 'android' = Platform.OS === 'ios' ? 'ios' : 'android';
        const timezone = getDeviceTimezone();

        // Upsert token row (PK is user_id + expo_token)
        const { error: tokenError } = await supabase
            .from('user_push_tokens')
            .upsert({
                user_id: session.user.id,
                expo_token: expoToken,
                platform,
                last_seen_at: new Date().toISOString(),
            });

        if (tokenError) {
            console.error('[Push] Failed to save token:', tokenError);
            return { success: false, error: tokenError.message };
        }

        const { error: tzError } = await supabase
            .from('users')
            .update({ notification_timezone: timezone })
            .eq('id', session.user.id);

        if (tzError) {
            console.warn('[Push] Failed to update timezone:', tzError);
        }

        console.log(`[Push] Registered token (${platform}, tz=${timezone})`);
        return { success: true, error: null };
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to register push token';
        console.error('[Push] Unexpected error:', err);
        return { success: false, error: message };
    }
}

/**
 * Remove push tokens from the server.
 *
 * `userId` is taken as an argument because logout flow calls this *before*
 * `supabase.auth.signOut()` — once the session is cleared, RLS would block
 * the delete and getSession() would return null.
 *
 * We don't track per-device identity, so we wipe every token belonging to
 * the user. Other devices re-register on next launch when notifications
 * are enabled.
 */
export async function unregisterPushToken(userId: string): Promise<void> {
    if (Platform.OS === 'web') return;
    if (!userId) return;

    try {
        const { error } = await supabase
            .from('user_push_tokens')
            .delete()
            .eq('user_id', userId);

        if (error) {
            console.error('[Push] Failed to unregister token:', error);
        }
    } catch (err) {
        console.error('[Push] Unregister error:', err);
    }
}

/**
 * Update the user's preferred notification time.
 * Server cron uses this + notification_timezone to decide when to send.
 */
export async function updateNotificationTime(time: string): Promise<{ success: boolean; error: string | null }> {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
            return { success: false, error: 'Not authenticated' };
        }

        const { error } = await supabase
            .from('users')
            .update({ notification_time: time })
            .eq('id', session.user.id);

        if (error) {
            console.error('[Push] Failed to update notification time:', error);
            return { success: false, error: error.message };
        }

        return { success: true, error: null };
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update time';
        return { success: false, error: message };
    }
}

/**
 * Toggle notifications_enabled on the server profile.
 */
export async function setNotificationsEnabled(enabled: boolean): Promise<{ success: boolean; error: string | null }> {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
            return { success: false, error: 'Not authenticated' };
        }

        const { error } = await supabase
            .from('users')
            .update({ notifications_enabled: enabled })
            .eq('id', session.user.id);

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true, error: null };
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to toggle notifications';
        return { success: false, error: message };
    }
}
