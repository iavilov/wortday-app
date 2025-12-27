import { BrutalButton } from '@/components/ui/brutal-button';
import { ScreenLayout } from '@/components/ui/screen-layout';
import { Colors } from '@/constants/design-tokens';
import { t } from '@/lib/i18n-helpers';
import { useSettingsStore } from '@/store/settings-store';
import { useWordStore } from '@/store/word-store';
import { LEVEL_OPTIONS } from '@/types/settings';
import { useRouter } from 'expo-router';
import { ArrowLeft, Check } from 'lucide-react-native';
import React from 'react';
import { ScrollView, Text, View } from 'react-native';

export default function LevelScreen() {
    const router = useRouter();
    const { translationLanguage, languageLevel, setLanguageLevel } = useSettingsStore();
    const { loadTodayWord } = useWordStore();

    const handleSelectLevel = async (level: any) => {
        setLanguageLevel(level);
        // Refresh the today's word immediately to match the new level
        await loadTodayWord();
    };

    return (
        <ScreenLayout withBottomPadding={false}>
            {/* Header */}
            <View className="flex-row items-end justify-between pt-8 pb-10 w-full" style={{ maxWidth: 400 }}>
                <BrutalButton
                    onPress={() => router.back()}
                    style={{ width: 48, height: 48, marginRight: 4 }}
                    contentContainerStyle={{ height: '100%' }}
                >
                    <ArrowLeft size={24} color={Colors.border} strokeWidth={3} />
                </BrutalButton>
                <View className="flex-col items-end">
                    <View
                        style={{
                            backgroundColor: Colors.accentBlue,
                            borderWidth: 2,
                            borderColor: Colors.border,
                            paddingHorizontal: 8,
                            paddingVertical: 2,
                            marginBottom: 4,
                            shadowColor: Colors.border,
                            shadowOffset: { width: 2, height: 2 },
                            shadowOpacity: 1,
                            shadowRadius: 0,
                            transform: [{ rotate: '1deg' }],
                        }}
                    >
                        <Text style={{ fontSize: 10, fontWeight: '900', color: Colors.border, textTransform: 'uppercase' }}>
                            {t('settings.account', translationLanguage)}
                        </Text>
                    </View>
                    <Text style={{ fontSize: 24, fontWeight: '900', color: Colors.border, textTransform: 'uppercase' }}>
                        {t('settings.languageLevel', translationLanguage)}
                    </Text>
                </View>
            </View>

            {/* Options List */}
            <ScrollView className="w-full" showsVerticalScrollIndicator={false}>
                <View className="flex-col gap-3 w-full pb-10" style={{ maxWidth: 400 }}>
                    {LEVEL_OPTIONS.map((option) => {
                        const isSelected = languageLevel === option.id;
                        return (
                            <BrutalButton
                                key={option.id}
                                onPress={() => handleSelectLevel(option.id)}
                                style={{ width: '100%' }}
                                pressableStyle={{ padding: 18 }}
                                borderWidth={2}
                                backgroundColor={isSelected ? '#FDF4FF' : 'white'} // Subtle purple for selected
                                shadowOffset={isSelected ? 0 : 2}
                            >
                                <View className="flex-row items-center justify-between w-full">
                                    <View>
                                        <Text style={{ fontSize: 18, fontWeight: '900', color: Colors.border }}>
                                            {option.label[translationLanguage] || option.label['en']}
                                        </Text>
                                    </View>
                                    {isSelected && (
                                        <View
                                            className="w-8 h-8 rounded-full items-center justify-center"
                                            style={{ backgroundColor: Colors.accentPink, borderWidth: 2, borderColor: Colors.border }}
                                        >
                                            <Check size={16} color={Colors.border} strokeWidth={4} />
                                        </View>
                                    )}
                                </View>
                            </BrutalButton>
                        );
                    })}
                </View>
            </ScrollView>
        </ScreenLayout>
    );
}
