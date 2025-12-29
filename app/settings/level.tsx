import { BrutalButton } from '@/components/ui/brutal-button';
import { ScreenLayout } from '@/components/ui/screen-layout';
import { Colors } from '@/constants/design-tokens';
import { t } from '@/lib/i18n-helpers';
import { useSettingsStore } from '@/store/settings-store';
import { useWordStore } from '@/store/word-store';
import { LEVEL_OPTIONS, LanguageLevel } from '@/types/settings';
import { createBrutalShadow } from '@/utils/platform-styles';
import { useRouter } from 'expo-router';
import { Check } from 'lucide-react-native';
import React from 'react';
import { ScrollView, Text, View } from 'react-native';

export default function LevelScreen() {
    const router = useRouter();
    const { translationLanguage, languageLevel, setLanguageLevel } = useSettingsStore();
    const { loadTodayWord } = useWordStore();

    const handleSelectLevel = async (level: LanguageLevel) => {
        setLanguageLevel(level);
        // Refresh the today's word immediately to match the new level
        await loadTodayWord();

        // Navigate back after a short delay for visual feedback
        setTimeout(() => {
            router.back();
        }, 300);
    };

    return (
        <ScreenLayout>
            <ScrollView
                className="flex-1 w-full"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    paddingBottom: 80,
                }}
            >
                {/* Header */}
                <View className="flex-row items-center justify-between pt-8 pb-6 w-full">
                    <View className="flex-col">
                        <View
                            style={{
                                backgroundColor: Colors.accentPink,
                                borderWidth: 2,
                                borderColor: Colors.border,
                                ...createBrutalShadow(2, Colors.border),
                                transform: [{ rotate: '-1deg' }],
                            }}
                            className="px-2 py-0.5 mb-2 self-start"
                        >
                            <Text className="text-border font-w-bold uppercase tracking-widest text-[10px]">
                                {t('settings.title', translationLanguage)}
                            </Text>
                        </View>
                        <Text className="text-border text-3xl font-w-extrabold tracking-tight uppercase">
                            {t('settings.level', translationLanguage)}
                        </Text>
                    </View>
                </View>

                {/* Level Options */}
                <View className="gap-4 pr-1">
                    {LEVEL_OPTIONS.map((option) => {
                        const isSelected = languageLevel === option.code;

                        return (
                            <BrutalButton
                                key={option.code}
                                onPress={() => handleSelectLevel(option.code)}
                                borderWidth={3}
                                backgroundColor={isSelected ? Colors.accentYellow : Colors.surface}
                                style={{ width: '100%' }}
                                contentContainerStyle={{ width: '100%' }}
                                pressableStyle={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    paddingHorizontal: 20,
                                    paddingVertical: 16,
                                }}
                            >
                                <View className="flex-col">
                                    <Text className="text-border font-w-extrabold text-base uppercase">
                                        {option.name[translationLanguage]}
                                    </Text>
                                </View>

                                {isSelected && (
                                    <View
                                        className="w-8 h-8 rounded-full items-center justify-center"
                                        style={{
                                            backgroundColor: Colors.border,
                                        }}
                                    >
                                        <Check size={18} color={Colors.accentYellow} strokeWidth={3} />
                                    </View>
                                )}
                            </BrutalButton>
                        );
                    })}
                </View>

                {/* Info Note */}
                <View
                    className="mt-6 p-4 mr-1"
                    style={{
                        backgroundColor: Colors.surface,
                        borderWidth: 2,
                        borderColor: Colors.border,
                    }}
                >
                    <Text className="text-text-muted text-sm font-w-medium leading-relaxed">
                        {t('settings.levelDescription', translationLanguage)}
                    </Text>
                </View>
            </ScrollView>
        </ScreenLayout>
    );
}
