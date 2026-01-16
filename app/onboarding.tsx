import { BrutalButton } from '@/components/ui/brutal-button';
import { ScreenLayout } from '@/components/ui/screen-layout';
import { Colors } from '@/constants/design-tokens';
import { t } from '@/constants/translations';
import { useAuthStore } from '@/store/auth-store';
import { useSettingsStore } from '@/store/settings-store';
import { LanguageLevel, LEVEL_OPTIONS } from '@/types/settings';
import { createBrutalShadow } from '@/utils/platform-styles';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

/**
 * Onboarding screen - shown on first launch
 * Expandable template for future questions
 */
export default function OnboardingScreen() {
  const router = useRouter();
  const { setLanguageLevel, setRegistrationDate, setHasCompletedOnboarding, translationLanguage } = useSettingsStore();
  const { updateProfile } = useAuthStore();
  const [selectedLevel, setSelectedLevel] = useState<LanguageLevel>('beginner');

  const handleComplete = async () => {
    const today = new Date().toISOString().split('T')[0];

    console.log('[Onboarding] Completing onboarding:', {
      selectedLevel,
      registrationDate: today,
    });

    // Update local settings first (optimistic update)
    setLanguageLevel(selectedLevel);
    setRegistrationDate(today);
    setHasCompletedOnboarding(true);

    // CRITICAL: Update profile in database (single source of truth)
    // This ensures users see the same state across all devices
    await updateProfile({
      language_level: selectedLevel,
      registration_date: today,
      has_completed_onboarding: true, // Save onboarding status to DB
    });

    console.log('[Onboarding] Profile updated in database (including onboarding status), redirecting to tabs');
    router.replace('/(tabs)');
  };

  return (
    <View className="flex-1 bg-background">
      <ScreenLayout>
        <ScrollView
          className="flex-1 w-full"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 80 }}
        >
          {/* Header */}
          <View className="pt-12 pb-8 w-full">
            <View
              style={{
                backgroundColor: Colors.primary,
                borderWidth: 3,
                borderColor: Colors.border,
                ...createBrutalShadow(3, Colors.border),
              }}
              className="px-4 py-2 mb-4 self-start"
            >
              <Text className="text-border text-2xl font-w-bold uppercase">
                VOCADE
              </Text>
            </View>
            <Text className="text-border text-4xl font-w-bold tracking-tight uppercase mb-3">
              {t('onboarding.welcome', translationLanguage)}
            </Text>
            <Text className="text-text-muted text-lg font-w-medium">
              {t('onboarding.subtitle', translationLanguage)}
            </Text>
          </View>

          {/* Question 1: Language Level */}
          <View className="w-full mb-8">
            <View
              className="px-3 py-1 mb-4 self-start"
              style={{
                backgroundColor: Colors.accentBlue,
                borderWidth: 2,
                borderColor: Colors.border,
                borderRadius: 4,
              }}
            >
              <Text className="text-border text-xs font-w-bold uppercase tracking-wide">
                {t('onboarding.step', translationLanguage)} 1/1
              </Text>
            </View>

            <Text className="text-border text-2xl font-w-bold mb-2">
              {t('onboarding.levelQuestion', translationLanguage)}
            </Text>
            <Text className="text-text-muted text-base font-w-medium mb-6">
              {t('onboarding.levelDescription', translationLanguage)}
            </Text>

            <View className="space-y-3">
              {LEVEL_OPTIONS.map((option) => {
                const isSelected = selectedLevel === option.code;
                const levelKey = `onboarding.level${option.code.charAt(0).toUpperCase() + option.code.slice(1)}` as any;
                const descKey = `${levelKey}Desc` as any;

                return (
                  <BrutalButton
                    key={option.code}
                    onPress={() => setSelectedLevel(option.code)}
                    isActive={isSelected}
                    backgroundColor={isSelected ? Colors.primary : Colors.surface}
                    borderWidth={3}
                    style={{ marginBottom: 12 }}
                    contentContainerStyle={{
                      paddingVertical: 16,
                      paddingHorizontal: 20,
                      alignItems: 'flex-start',
                    }}
                  >
                    <View className="flex-row items-center justify-between w-full">
                      <View className="flex-1">
                        <Text className="text-border text-xl font-w-bold mb-1">
                          {t(levelKey, translationLanguage)}
                        </Text>
                        <Text className="text-text-muted text-sm font-w-medium">
                          {t(descKey, translationLanguage)}
                        </Text>
                      </View>
                      {isSelected && (
                        <View
                          className="ml-3 w-6 h-6 rounded-full items-center justify-center"
                          style={{
                            backgroundColor: Colors.border,
                            borderWidth: 2,
                            borderColor: Colors.border,
                          }}
                        >
                          <Text className="text-background text-lg font-w-bold">✓</Text>
                        </View>
                      )}
                    </View>
                  </BrutalButton>
                );
              })}
            </View>
          </View>

          {/* Future expansion: Add more questions here */}
          {/* Question 2, 3, etc. */}

          {/* Continue Button */}
          <View className="w-full pt-4">
            <BrutalButton
              onPress={handleComplete}
              backgroundColor={Colors.primary}
              borderWidth={3}
              contentContainerStyle={{
                paddingVertical: 18,
              }}
            >
              <Text className="text-border text-lg font-w-bold uppercase tracking-wide">
                {t('onboarding.continue', translationLanguage)}
              </Text>
            </BrutalButton>
          </View>
        </ScrollView>
      </ScreenLayout>
    </View>
  );
}
