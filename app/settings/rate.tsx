import { ScreenHeader } from '@/components/ui/screen-header';
import { ScreenLayout } from '@/components/ui/screen-layout';
import { Colors } from '@/constants/design-tokens';
import { t } from '@/constants/translations';
import { useSettingsStore } from '@/store/settings-store';
import React from 'react';
import { Text, View } from 'react-native';

export default function RateScreen() {
    const translationLanguage = useSettingsStore(s => s.translationLanguage);

    return (
        <ScreenLayout>
            <ScreenHeader
                title={t('settings.rate', translationLanguage)}
                badgeText={t('settings.support', translationLanguage)}
                badgeColor={Colors.accentPink}
                showBackButton
            />

            <View className="bg-white border-3 border-ink rounded-brutal p-5 shadow-brutal w-full" style={{ borderColor: Colors.border }}>
                <Text className="text-gray-500 font-medium text-center">Rating interface coming soon...</Text>
            </View>
        </ScreenLayout>
    );
}
