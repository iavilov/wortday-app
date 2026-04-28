import { BrutalButton } from '@/components/ui/brutal-button';
import { BrutalText } from '@/components/ui/brutal-text';
import { ScreenHeader } from '@/components/ui/screen-header';
import { ScreenLayout } from '@/components/ui/screen-layout';
import { Colors, borderRadius } from '@/constants/design-tokens';
import { t } from '@/constants/translations';
import * as userProfileService from '@/lib/user-profile-service';
import { useSettingsStore } from '@/store/settings-store';
import { useWordStore } from '@/store/word-store';
import { LEVEL_OPTIONS, LanguageLevel } from '@/types/settings';
import { Check, Mountain, Rocket, Sprout } from 'lucide-react-native';
import React from 'react';
import { ScrollView, Text, View } from 'react-native';

export default function LevelScreen() {
    const translationLanguage = useSettingsStore(s => s.translationLanguage);
    const languageLevel = useSettingsStore(s => s.languageLevel);
    const setLanguageLevel = useSettingsStore(s => s.setLanguageLevel);
    const loadTodayWord = useWordStore(s => s.loadTodayWord);


    const handleSelectLevel = async (level: LanguageLevel) => {
        if (level === languageLevel) return;

        setLanguageLevel(level);
        // Reset day counter on the server: language_level + level_started_at = today
        await userProfileService.updateLanguageLevel(level);
        // Refresh today's word for the new level (RPC reads fresh level_started_at)
        await loadTodayWord();
    };

    const getLevelBadgeColor = (code: LanguageLevel) => {
        return Colors.levelColors[code] ?? Colors.surface;
    };

    const getLevelIcon = (code: LanguageLevel) => {
        const size = 24;
        const color = Colors.border;
        const strokeWidth = 2.5;

        switch (code) {
            case 'beginner': return <Sprout size={size} color={color} strokeWidth={strokeWidth} />;
            case 'intermediate': return <Mountain size={size} color={color} strokeWidth={strokeWidth} />;
            case 'advanced': return <Rocket size={size} color={color} strokeWidth={strokeWidth} />;
            default: return null;
        }
    };

    return (
        <ScreenLayout withBottomPadding={false}>
            <ScrollView
                className="flex-1 w-full"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    paddingBottom: 80,
                }}
            >
                <ScreenHeader
                    title={t('settings.level', translationLanguage)}
                    badgeText={t('settings.title', translationLanguage)}
                    badgeColor={Colors.primary}
                    showBackButton
                />

                {/* Level Options */}
                <View className="flex-col gap-4 w-full pr-1">
                    {LEVEL_OPTIONS.map((option) => {
                        const isSelected = languageLevel === option.code;
                        const badgeColor = getLevelBadgeColor(option.code);

                        return (
                            <BrutalButton
                                key={option.code}
                                onPress={() => handleSelectLevel(option.code)}
                                style={{ width: '100%' }}
                                pressableStyle={{
                                    width: '100%',
                                    paddingHorizontal: 16,
                                    paddingVertical: 14,
                                    flexDirection: 'row',
                                    alignItems: 'center'
                                }}
                                borderWidth={3}
                                borderRadius={borderRadius.LARGE}
                                backgroundColor={isSelected ? badgeColor : 'white'}
                            >
                                <View
                                    className="w-12 h-12 items-center justify-center border-2 mr-4"
                                    style={{
                                        backgroundColor: isSelected ? 'white' : badgeColor,
                                        borderColor: Colors.border,
                                        borderRadius: borderRadius.SMALL,
                                    }}
                                >
                                    {getLevelIcon(option.code)}
                                </View>

                                <View className="flex-1">
                                    <Text className="text-border font-w-bold text-xl uppercase">
                                        {option.name.en}
                                    </Text>
                                    <Text className="text-text-muted font-w-bold text-xs uppercase" style={{ opacity: 0.7 }}>
                                        {option.name[translationLanguage]}
                                    </Text>
                                </View>

                                <View
                                    className="w-8 h-8 items-center justify-center"
                                    style={{
                                        borderWidth: 2,
                                        borderRadius: borderRadius.ROUND,
                                        borderColor: isSelected ? Colors.border : Colors.borderMuted,
                                        backgroundColor: isSelected ? Colors.surface : 'transparent',
                                    }}
                                >
                                    {isSelected && <Check size={18} color={Colors.border} strokeWidth={4} />}
                                </View>
                            </BrutalButton>
                        );
                    })}
                </View>

                {/* Info Note with Dashed Border */}
                <View
                    className="mt-10 p-6 mx-1 items-center justify-center"
                    style={{
                        borderWidth: 2,
                        borderColor: Colors.border,
                        borderStyle: 'dashed',
                        borderRadius: borderRadius.MEDIUM,
                    }}
                >
                    <BrutalText className="text-text-muted text-sm font-w-medium text-center leading-relaxed">
                        {t('settings.levelDescription', translationLanguage)}
                    </BrutalText>
                </View>
            </ScrollView>
        </ScreenLayout>
    );
}
