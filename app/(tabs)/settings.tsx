import { BrutalButton } from '@/components/ui/brutal-button';
import { ContentContainer } from '@/components/ui/content-container';
import { ScreenHeader } from '@/components/ui/screen-header';
import { ScreenLayout } from '@/components/ui/screen-layout';
import { Border, Colors } from '@/constants/design-tokens';
import { t } from '@/constants/translations';
import { useSettingsStore } from '@/store/settings-store';
import { LANGUAGE_OPTIONS, LEVEL_OPTIONS } from '@/types/settings';
import { createBrutalShadow } from '@/utils/platform-styles';
import { useRouter } from 'expo-router';
import { Bell, ChevronRight, Gavel, Languages, LogOut, MessageSquare, ShieldCheck, Star, TrendingUp, User } from 'lucide-react-native';
import React from 'react';
import {
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View
} from 'react-native';

// Settings section item component
interface SettingItemProps {
  icon: React.ReactNode;
  iconBgColor: string;
  title: string;
  subtitle?: string;
  onPress: () => void;
  showDivider?: boolean;
}

function SettingItem({ icon, iconBgColor, title, subtitle, onPress, showDivider = true }: SettingItemProps) {
  return (
    <>
      <Pressable
        onPress={onPress}
        className="flex-row items-center justify-between py-4 px-4"
        style={({ pressed }) => ({
          opacity: pressed ? 0.7 : 1,
        })}
      >
        <View className="flex-row items-center flex-1">
          <View
            className="w-10 h-10 items-center justify-center mr-3"
            style={{
              backgroundColor: iconBgColor,
              borderWidth: Border.secondary,
              borderColor: Colors.border,
              borderRadius: 8,
            }}
          >
            {icon}
          </View>
          <View className="flex-1">
            <Text className="text-border font-w-extrabold text-sm uppercase">
              {title}
            </Text>
            {subtitle && (
              <Text className="text-text-muted text-xs font-w-medium mt-0.5">
                {subtitle}
              </Text>
            )}
          </View>
        </View>
        <ChevronRight size={20} color={Colors.border} strokeWidth={2.5} />
      </Pressable>
      {showDivider && (
        <View
          style={{
            height: 2,
            borderStyle: 'dashed',
            borderWidth: 1,
            borderColor: Colors.border,
            marginHorizontal: 16,
          }}
        />
      )}
    </>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const { userEmail, translationLanguage, languageLevel } = useSettingsStore();

  const currentLanguageName = LANGUAGE_OPTIONS.find(opt => opt.code === translationLanguage)?.nativeName || 'Russian';
  const currentLevelName = LEVEL_OPTIONS.find(opt => opt.code === languageLevel)?.name[translationLanguage] || 'Beginner';

  const handleLogout = () => {
    // Implement logout logic here
    console.log('Logging out...');
  };

  return (
    <ScreenLayout>
      <ScrollView
        className="flex-1 w-full"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 160, alignItems: 'center' }}
      >
        <ScreenHeader
          title={t('settings.title', translationLanguage)}
          badgeText={t('settings.account', translationLanguage)}
          badgeColor={Colors.primary}
        />

        {/* ACCOUNT Section */}
        <ContentContainer className="mb-6">
          <View
            style={{
              backgroundColor: Colors.surface,
              borderWidth: Border.primary,
              borderColor: Colors.border,
              borderRadius: 12,
              overflow: 'hidden',
              ...createBrutalShadow(4, Colors.border),
            }}
          >
            <SettingItem
              icon={<User size={20} color={Colors.border} strokeWidth={2.5} />}
              iconBgColor="#86EFAC"
              title={t('settings.account', translationLanguage)}
              subtitle={userEmail}
              onPress={() => router.push('/settings/account')}
            />
            <SettingItem
              icon={<Languages size={20} color={Colors.border} strokeWidth={2.5} />}
              iconBgColor={Colors.accentYellow}
              title="App Language"
              subtitle={currentLanguageName}
              onPress={() => router.push('/settings/language')}
            />
            <SettingItem
              icon={<TrendingUp size={20} color={Colors.border} strokeWidth={2.5} />}
              iconBgColor={Colors.accentPink}
              title="Learning Level"
              subtitle={currentLevelName}
              onPress={() => router.push('/settings/level')}
              showDivider={Platform.OS !== 'web'}
            />
            {Platform.OS !== 'web' && (
              <SettingItem
                icon={<Bell size={20} color={Colors.border} strokeWidth={2.5} />}
                iconBgColor={Colors.accentBlue}
                title={t('settings.notifications', translationLanguage)}
                subtitle="Word of the day reminders"
                onPress={() => router.push('/settings/notifications')}
                showDivider={false}
              />
            )}
            {Platform.OS === 'web' && (
              <View style={{ height: 0 }} />
            )}
          </View>
        </ContentContainer>

        {/* SUPPORT & LEGAL Section */}
        <ContentContainer className="mb-6">
          <View
            style={{
              backgroundColor: Colors.surface,
              borderWidth: Border.primary,
              borderColor: Colors.border,
              borderRadius: 12,
              overflow: 'hidden',
              ...createBrutalShadow(4, Colors.border),
            }}
          >
            <SettingItem
              icon={<Star size={20} color={Colors.border} strokeWidth={2.5} />}
              iconBgColor={Colors.accentPink}
              title="Rate the App"
              subtitle="Love Vocade? Let us know!"
              onPress={() => router.push('/settings/rate')}
            />
            <SettingItem
              icon={<MessageSquare size={20} color={Colors.border} strokeWidth={2.5} />}
              iconBgColor="#93C5FD"
              title="Feedback"
              subtitle="Report a bug or suggest features"
              onPress={() => router.push('/settings/feedback')}
            />
            <SettingItem
              icon={<Gavel size={20} color={Colors.border} strokeWidth={2.5} />}
              iconBgColor="#FDE68A"
              title="Terms"
              subtitle={t('settings.termsDescription', translationLanguage)}
              onPress={() => Linking.openURL('https://vocade.app/terms')}
            />
            <SettingItem
              icon={<ShieldCheck size={20} color={Colors.border} strokeWidth={2.5} />}
              iconBgColor="#86EFAC"
              title="Privacy"
              subtitle={t('settings.privacyDescription', translationLanguage)}
              onPress={() => Linking.openURL('https://vocade.app/privacy')}
              showDivider={false}
            />
          </View>
        </ContentContainer>

        {/* LOG OUT Button */}
        <ContentContainer className="mb-8">
          <BrutalButton
            onPress={handleLogout}
            shadowOffset={0}
            borderWidth={Border.primary}
            borderColor={Colors.border}
            backgroundColor="transparent"
            style={{ width: '100%' }}
            contentContainerStyle={{}}
            pressableStyle={{ padding: 14, width: '100%' }}
          >
            <View className="flex-row items-center justify-center">
              <LogOut size={20} color={Colors.border} strokeWidth={2.5} style={{ marginRight: 8 }} />
              <Text className="text-border font-w-extrabold text-sm uppercase tracking-wide">
                {t('settings.logout', translationLanguage)}
              </Text>
            </View>
          </BrutalButton>
        </ContentContainer>

        {/* Version */}
        <ContentContainer className="mt-4 mb-4 items-center">
          <Text style={{ fontSize: 10, fontWeight: '600', color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 1 }}>
            {t('settings.version', translationLanguage)} 1.0.4 (Build 42)
          </Text>
        </ContentContainer>
      </ScrollView>
    </ScreenLayout>
  );
}
