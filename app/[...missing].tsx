import { BrutalButton } from '@/components/ui/brutal-button';
import { ScreenLayout } from '@/components/ui/screen-layout';
import { Colors, borderRadius } from '@/constants/design-tokens';
import { t } from '@/constants/translations';
import { useSettingsStore } from '@/store/settings-store';
import { createBrutalShadow } from '@/utils/platform-styles';
import { Stack, useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import React from 'react';
import { Image, Text, View } from 'react-native';

export default function NotFoundScreen() {
    const router = useRouter();
    const { translationLanguage } = useSettingsStore();

    return (
        <ScreenLayout>
            <Stack.Screen options={{ headerShown: false }} />
            <View className="flex-1 items-center justify-center p-6 bg-transparent">

                {/* 404 Heading */}
                <Text
                    className="font-w-bold text-[80px] text-text-main text-center mb-8"
                    style={{
                        includeFontPadding: false,
                        lineHeight: 80
                    }}
                >
                    404
                </Text>

                {/* Central Image Card */}
                <View
                    className="aspect-square w-full max-w-[300px] bg-white items-center justify-center p-6 mb-10"
                    style={{
                        borderWidth: 4,
                        borderColor: Colors.border,
                        borderRadius: borderRadius.MEDIUM,
                        ...createBrutalShadow(6, Colors.border),
                    }}
                >
                    <Image
                        source={require('@/assets/images/not-found.png')}
                        style={{ width: '100%', height: '100%' }}
                        resizeMode="contain"
                    />
                </View>

                {/* Text Content */}
                <View className="items-center mb-10 text-center">
                    <Text className="text-2xl font-w-bold text-text-main text-center uppercase mb-3">
                        {t('error.lostInTranslation', translationLanguage)}
                    </Text>
                    <Text className="text-base font-w-medium text-text-muted text-center px-4 leading-6">
                        {t('error.pageNotFoundDesc', translationLanguage)}
                    </Text>
                </View>

                {/* Back Home Button */}
                <BrutalButton
                    onPress={() => router.replace('/(tabs)')}
                    backgroundColor={Colors.accentYellow}
                    shadowOffset={4}
                    borderRadius={borderRadius.MEDIUM}
                    style={{ width: '100%', maxWidth: 300 }}
                    contentContainerStyle={{ paddingVertical: 16 }}
                >
                    <View className="flex-row items-center justify-center">
                        <ArrowLeft size={20} color={Colors.border} strokeWidth={3} style={{ marginRight: 8 }} />
                        <Text className="text-border font-w-bold text-base uppercase tracking-wider">
                            {t('error.goBack', translationLanguage)}
                        </Text>
                    </View>
                </BrutalButton>

            </View>
        </ScreenLayout>
    );
}
