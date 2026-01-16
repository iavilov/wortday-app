/**
 * Push Notifications (Local) - iOS/Android only
 * Uses expo-notifications for daily word reminders
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { storage } from './storage';

const NOTIFICATION_ENABLED_KEY = 'vocade-notifications-enabled';
const NOTIFICATION_TIME_KEY = 'vocade-notification-time';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Request permissions for notifications (iOS/Android)
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') {
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === 'granted';
}

/**
 * Schedule daily notification at specific time
 */
export async function scheduleDailyNotification(time: string): Promise<void> {
  if (Platform.OS === 'web') {
    console.log('[Notifications] Web platform - notifications not supported');
    return;
  }

  try {
    // Cancel all existing notifications
    await Notifications.cancelAllScheduledNotificationsAsync();

    // Parse time (HH:MM format)
    const [hours, minutes] = time.split(':').map(Number);

    if (isNaN(hours) || isNaN(minutes)) {
      console.error('[Notifications] Invalid time format:', time);
      return;
    }

    // Schedule daily repeating notification
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '📚 Vocade',
        body: 'Новое слово дня доступно!',
        data: { type: 'word-of-the-day' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
        hour: hours,
        minute: minutes,
        repeats: true, // Daily repeat
      },
    });

    console.log(`[Notifications] Scheduled daily notification at ${time}`);
  } catch (error) {
    console.error('[Notifications] Failed to schedule notification:', error);
  }
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications(): Promise<void> {
  if (Platform.OS === 'web') {
    return;
  }

  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('[Notifications] All notifications cancelled');
  } catch (error) {
    console.error('[Notifications] Failed to cancel notifications:', error);
  }
}

/**
 * Get notification settings from storage
 */
export async function getNotificationSettings(): Promise<{
  enabled: boolean;
  time: string;
}> {
  const enabled = (await storage.getItem(NOTIFICATION_ENABLED_KEY)) === 'true';
  const time = (await storage.getItem(NOTIFICATION_TIME_KEY)) || '15:00';

  return { enabled, time };
}

/**
 * Save notification settings to storage
 */
export async function saveNotificationSettings(
  enabled: boolean,
  time: string
): Promise<void> {
  await storage.setItem(NOTIFICATION_ENABLED_KEY, String(enabled));
  await storage.setItem(NOTIFICATION_TIME_KEY, time);

  if (enabled) {
    await scheduleDailyNotification(time);
  } else {
    await cancelAllNotifications();
  }
}

/**
 * Initialize notifications on app start
 */
export async function initializeNotifications(): Promise<void> {
  if (Platform.OS === 'web') {
    return;
  }

  const { enabled, time } = await getNotificationSettings();

  if (enabled) {
    const hasPermission = await requestNotificationPermissions();
    if (hasPermission) {
      await scheduleDailyNotification(time);
    }
  }
}
