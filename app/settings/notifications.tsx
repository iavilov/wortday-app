import { BrutalButton } from '@/components/ui/brutal-button';
import { BrutalSwitch } from '@/components/ui/brutal-switch';
import { ContentContainer } from '@/components/ui/content-container';
import { ScreenHeader } from '@/components/ui/screen-header';
import { ScreenLayout } from '@/components/ui/screen-layout';
import { Border, Colors, borderRadius } from '@/constants/design-tokens';
import { t } from '@/constants/translations';
import {
  getNotificationSettings,
  requestNotificationPermissions,
  saveNotificationSettings,
} from '@/lib/notifications';
import { useSettingsStore } from '@/store/settings-store';
import { createBrutalShadow } from '@/utils/platform-styles';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Bell, ChevronDown, Clock, Lightbulb } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Alert, Platform, ScrollView, Text, View } from 'react-native';
import Animated, { Easing, FadeInDown, FadeOutUp } from 'react-native-reanimated';

export default function NotificationsScreen() {
  const { translationLanguage } = useSettingsStore();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationTime, setNotificationTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await getNotificationSettings();
      setNotificationsEnabled(settings.enabled);

      // Parse time string to Date object
      const [hours, minutes] = settings.time.split(':');
      const date = new Date();
      date.setHours(parseInt(hours, 10));
      date.setMinutes(parseInt(minutes, 10));
      setNotificationTime(date);

      // Check permission status
      const permission = await requestNotificationPermissions();
      setHasPermission(permission);
    } catch (error) {
      console.error('Failed to load notification settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleNotifications = async (value: boolean) => {
    if (value && !hasPermission) {
      // Request permission
      const granted = await requestNotificationPermissions();
      if (!granted) {
        Alert.alert(
          t('notifications.permissionDenied', translationLanguage),
          t('notifications.permissionMessage', translationLanguage)
        );
        return;
      }
      setHasPermission(true);
    }

    setNotificationsEnabled(value);
    const timeString = formatTime(notificationTime);
    await saveNotificationSettings(value, timeString);
  };

  const handleTimeChange = (event: any, selectedDate?: Date) => {
    // On Android, picker closes after selection
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }

    if (selectedDate) {
      setNotificationTime(selectedDate);
      const timeString = formatTime(selectedDate);
      if (notificationsEnabled) {
        saveNotificationSettings(true, timeString);
      }
    }
  };

  const formatTime = (date: Date): string => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const openTimePicker = () => {
    setShowTimePicker(true);
  };

  // Early return for web platform
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
              <Text className="text-text-muted text-sm font-w-medium">
                {t('notifications.notAvailableWebDescription', translationLanguage)}
              </Text>
            </View>
          </ContentContainer>
        </ScrollView>
      </ScreenLayout>
    );
  }

  if (isLoading) {
    return (
      <ScreenLayout>
        <View className="flex-1 items-center justify-center">
          <Text className="text-text-muted text-base font-w-medium">
            {t('common.loading', translationLanguage)}
          </Text>
        </View>
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
            <Text className="text-text-muted text-sm font-w-medium">
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

            {/* Time Picker Button */}
            <BrutalButton
              onPress={openTimePicker}
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

            {/* Timezone Caption */}
            <Text className="text-text-muted text-xs font-w-medium mt-2">
              {t('notifications.timezone', translationLanguage).replace('{zone}', 'CET')}
            </Text>

            {/* Native Time Picker */}
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
                      <Text className="text-border text-sm font-w-bold uppercase">
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

        {/* Info Card */}
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
            <Text className="text-border text-sm font-w-bold flex-1">
              {t('notifications.info', translationLanguage)}
            </Text>
          </View>
        </ContentContainer>
      </ScrollView>
    </ScreenLayout>
  );
}
