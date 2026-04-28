import { BrutalButton } from '@/components/ui/brutal-button';
import { BrutalSwitch } from '@/components/ui/brutal-switch';
import { ContentContainer } from '@/components/ui/content-container';
import { ScreenHeader } from '@/components/ui/screen-header';
import { ScreenLayout } from '@/components/ui/screen-layout';
import { Border, Colors, borderRadius } from '@/constants/design-tokens';
import { t } from '@/constants/translations';
import { showAlert } from '@/lib/alert';
import * as pushService from '@/lib/push-notifications-service';
import { useAuthStore } from '@/store/auth-store';
import { useSettingsStore } from '@/store/settings-store';
import { createBrutalShadow } from '@/utils/platform-styles';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Bell, ChevronDown, Clock, Lightbulb } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Platform, ScrollView, Text, View } from 'react-native';
import Animated, { Easing, FadeInDown, FadeOutUp } from 'react-native-reanimated';

const DEFAULT_TIME = '09:00';

function parseTime(timeString: string): Date {
  const [hours, minutes] = timeString.split(':').map(Number);
  const date = new Date();
  date.setHours(Number.isFinite(hours) ? hours : 9, Number.isFinite(minutes) ? minutes : 0, 0, 0);
  return date;
}

function formatTime(date: Date): string {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

export default function NotificationsScreen() {
  const translationLanguage = useSettingsStore(s => s.translationLanguage);
  const profile = useAuthStore(s => s.profile);
  const fetchProfile = useAuthStore(s => s.fetchProfile);

  const [notificationsEnabled, setNotificationsEnabled] = useState(profile?.notifications_enabled ?? false);
  const [notificationTime, setNotificationTime] = useState(parseTime(profile?.notification_time ?? DEFAULT_TIME));
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isBusy, setIsBusy] = useState(false);

  // Sync local UI when the DB profile changes (e.g. after fetchProfile)
  useEffect(() => {
    if (profile) {
      setNotificationsEnabled(profile.notifications_enabled);
      setNotificationTime(parseTime(profile.notification_time ?? DEFAULT_TIME));
    }
  }, [profile?.notifications_enabled, profile?.notification_time]);

  const handleToggleNotifications = async (value: boolean) => {
    if (isBusy) return;

    // Optimistic UI: flip the switch immediately so the spring animation runs.
    // Network/permission work is reconciled in the background; on failure we
    // revert the state and surface an alert.
    setNotificationsEnabled(value);
    setIsBusy(true);

    try {
      if (value) {
        const status = await pushService.requestPermissions();
        if (status !== 'granted') {
          setNotificationsEnabled(false);
          showAlert(
            t('notifications.permissionDenied', translationLanguage),
            t('notifications.permissionMessage', translationLanguage),
          );
          return;
        }

        const tokenResult = await pushService.registerPushToken();
        if (!tokenResult.success) {
          setNotificationsEnabled(false);
          showAlert(t('common.error', translationLanguage), tokenResult.error ?? '');
          return;
        }

        const enableResult = await pushService.setNotificationsEnabled(true);
        if (!enableResult.success) {
          setNotificationsEnabled(false);
          showAlert(t('common.error', translationLanguage), enableResult.error ?? '');
          return;
        }
      } else {
        const enableResult = await pushService.setNotificationsEnabled(false);
        if (!enableResult.success) {
          setNotificationsEnabled(true);
          showAlert(t('common.error', translationLanguage), enableResult.error ?? '');
          return;
        }
        if (profile?.id) {
          await pushService.unregisterPushToken(profile.id);
        }
      }

      await fetchProfile();
    } finally {
      setIsBusy(false);
    }
  };

  const handleTimeChange = async (_event: unknown, selectedDate?: Date) => {
    if (Platform.OS === 'android') setShowTimePicker(false);
    if (!selectedDate) return;

    setNotificationTime(selectedDate);
    if (notificationsEnabled) {
      const result = await pushService.updateNotificationTime(formatTime(selectedDate));
      if (!result.success) {
        showAlert(t('common.error', translationLanguage), result.error ?? '');
        return;
      }
      await fetchProfile();
    }
  };

  if (Platform.OS === 'web') {
    return (
      <ScreenLayout>
        <ScrollView
          className="flex-1 w-full"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 160, alignItems: 'center' }}
        >
          <ScreenHeader
            title={t('settings.notifications', translationLanguage)}
            showBackButton
            badgeText={t('settings.title', translationLanguage)}
            badgeColor={Colors.primary}
          />

          <ContentContainer>
            <View
              className="w-full p-5"
              style={{
                backgroundColor: Colors.surface,
                borderWidth: Border.primary,
                borderColor: Colors.border,
                borderRadius: borderRadius.LARGE,
                ...createBrutalShadow(4, Colors.border),
              }}
            >
              <Text className="text-border text-base font-w-bold mb-2">
                {t('notifications.notAvailableWeb', translationLanguage)}
              </Text>
              <Text className="text-text-muted text-base font-w-medium">
                {t('notifications.notAvailableWebDescription', translationLanguage)}
              </Text>
            </View>
          </ContentContainer>
        </ScrollView>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout>
      <ScrollView
        className="flex-1 w-full"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 160, alignItems: 'center' }}
      >
        <ScreenHeader
          title={t('settings.notifications', translationLanguage)}
          showBackButton
          badgeText={t('settings.title', translationLanguage)}
          badgeColor={Colors.primary}
        />

        {/* Daily Notifications Toggle Card */}
        <ContentContainer className="mb-6">
          <View
            className="w-full p-5"
            style={{
              backgroundColor: Colors.surface,
              borderWidth: Border.primary,
              borderColor: Colors.border,
              borderRadius: borderRadius.LARGE,
              ...createBrutalShadow(4, Colors.border),
            }}
          >
            <View className="flex-row items-start justify-between mb-3">
              <View className="flex-row items-center flex-1">
                <Bell size={22} color={Colors.border} strokeWidth={2.5} />
                <Text className="ml-3 text-border text-base font-w-bold">
                  {t('settings.dailyNotifications', translationLanguage)}
                </Text>
              </View>
              <BrutalSwitch
                value={notificationsEnabled}
                onValueChange={handleToggleNotifications}
              />
            </View>
            <Text className="text-text-muted text-base font-w-medium">
              {t('notifications.description', translationLanguage)}
            </Text>
          </View>
        </ContentContainer>

        {/* Time Selection (only show if enabled) */}
        {notificationsEnabled && (
          <ContentContainer className="mb-6">
            <View className="flex-row items-center mb-3">
              <Clock size={20} color={Colors.border} strokeWidth={2.5} />
              <Text className="ml-2 text-border text-base font-w-bold uppercase">
                {t('settings.time', translationLanguage)}
              </Text>
            </View>

            <BrutalButton
              onPress={() => setShowTimePicker(true)}
              shadowOffset={4}
              borderRadius={borderRadius.MEDIUM}
              style={{ width: '100%' }}
              contentContainerStyle={{ width: '100%', height: 96 }}
            >
              <View className="flex-row items-center justify-between w-full px-6">
                <Text className="text-border text-4xl font-w-bold">
                  {formatTime(notificationTime)}
                </Text>
                <ChevronDown size={28} color={Colors.border} strokeWidth={2.5} />
              </View>
            </BrutalButton>

            <Text className="text-text-muted text-xs font-w-medium mt-2">
              {t('notifications.timezone', translationLanguage).replace(
                '{zone}',
                Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
              )}
            </Text>

            {showTimePicker && (
              <>
                {Platform.OS === 'ios' ? (
                  <Animated.View
                    entering={FadeInDown.duration(600).easing(Easing.out(Easing.exp))}
                    exiting={FadeOutUp.duration(300)}
                    className="mt-4"
                  >
                    <DateTimePicker
                      value={notificationTime}
                      mode="time"
                      display="spinner"
                      onChange={handleTimeChange}
                      style={{ height: 200, width: '100%' }}
                      textColor={Colors.border}
                      themeVariant="light"
                    />
                    <BrutalButton
                      onPress={() => setShowTimePicker(false)}
                      className="mt-4"
                      backgroundColor={Colors.primary}
                      borderRadius={borderRadius.SMALL}
                      shadowOffset={3}
                      style={{ width: '100%' }}
                      contentContainerStyle={{ paddingVertical: 14 }}
                    >
                      <Text className="text-border text-base font-w-bold uppercase">
                        {t('settings.done', translationLanguage)}
                      </Text>
                    </BrutalButton>
                  </Animated.View>
                ) : (
                  <DateTimePicker
                    value={notificationTime}
                    mode="time"
                    display="default"
                    onChange={handleTimeChange}
                  />
                )}
              </>
            )}
          </ContentContainer>
        )}

        <ContentContainer>
          <View
            className="w-full p-5 flex-row"
            style={{
              backgroundColor: Colors.accentBlue,
              borderWidth: Border.primary,
              borderColor: Colors.border,
              borderRadius: borderRadius.LARGE,
              ...createBrutalShadow(4, Colors.border),
            }}
          >
            <Lightbulb size={22} color={Colors.border} strokeWidth={2.5} className="mr-3 flex-shrink-0" />
            <Text className="text-border text-base font-w-bold flex-1 leading-6">
              {t('notifications.info', translationLanguage)}
            </Text>
          </View>
        </ContentContainer>
      </ScrollView>
    </ScreenLayout>
  );
}
