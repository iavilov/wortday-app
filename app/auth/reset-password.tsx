import { BrutalButton } from '@/components/ui/brutal-button';
import { ScreenLayout } from '@/components/ui/screen-layout';
import { Border, Colors, borderRadius } from '@/constants/design-tokens';
import { t } from '@/constants/translations';
import { supabase } from '@/lib/supabase-client';
import { useSettingsStore } from '@/store/settings-store';
import { createBrutalShadow } from '@/utils/platform-styles';
import { useRouter } from 'expo-router';
import { ArrowLeft, Mail } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, Text, TextInput, View } from 'react-native';

export default function ResetPasswordScreen() {
    const router = useRouter();
    const { translationLanguage } = useSettingsStore();

    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    const validateEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const handleResetPassword = async () => {
        if (!email) {
            Alert.alert('Error', 'Please enter your email');
            return;
        }

        if (!validateEmail(email)) {
            Alert.alert('Error', t('auth.invalidEmail', translationLanguage));
            return;
        }

        setIsLoading(true);

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: 'vocade://reset-password',
            });

            if (error) throw error;

            setEmailSent(true);
        } catch (error: any) {
            console.error('[Reset Password] Error:', error);
            Alert.alert('Error', error.message || 'Failed to send reset link');
        } finally {
            setIsLoading(false);
        }
    };

    if (emailSent) {
        return (
            <ScreenLayout>
                <View className="flex-1 items-center justify-center p-6">
                    <View
                        className="w-full max-w-md p-8 bg-white items-center"
                        style={{
                            borderWidth: Border.primary,
                            borderColor: Colors.border,
                            borderRadius: borderRadius.LARGE,
                            ...createBrutalShadow(6, Colors.border),
                        }}
                    >
                        <View
                            className="w-20 h-20 items-center justify-center mb-6"
                            style={{
                                borderWidth: Border.primary,
                                borderColor: Colors.border,
                                borderRadius: borderRadius.ROUND,
                                backgroundColor: Colors.primary,
                            }}
                        >
                            <Mail size={32} color={Colors.border} strokeWidth={2.5} />
                        </View>

                        <Text className="text-2xl font-w-bold text-text-main text-center mb-3">
                            Check Your Email
                        </Text>

                        <Text className="text-base font-w-medium text-text-muted text-center mb-8 leading-6">
                            {t('auth.resetLinkSent', translationLanguage)}
                        </Text>

                        <BrutalButton
                            onPress={() => router.push('/auth/login')}
                            backgroundColor={Colors.primary}
                            borderRadius={borderRadius.SMALL}
                            shadowOffset={3}
                            style={{ width: '100%' }}
                            contentContainerStyle={{ paddingVertical: 14 }}
                        >
                            <Text className="text-border font-w-bold text-base uppercase">
                                {t('auth.backToLogin', translationLanguage)}
                            </Text>
                        </BrutalButton>
                    </View>
                </View>
            </ScreenLayout>
        );
    }

    return (
        <ScreenLayout>
            <View className="flex-1 items-center justify-center p-6">

                {/* Header */}
                <View className="w-full mb-8">
                    <Text className="text-4xl font-w-bold text-text-main text-center mb-2">
                        {t('auth.resetPassword', translationLanguage)}
                    </Text>
                    <Text className="text-base font-w-medium text-text-muted text-center">
                        Enter your email to receive a reset link
                    </Text>
                </View>

                {/* Reset Card */}
                <View
                    className="w-full max-w-md p-6 bg-white"
                    style={{
                        borderWidth: Border.primary,
                        borderColor: Colors.border,
                        borderRadius: borderRadius.LARGE,
                        ...createBrutalShadow(6, Colors.border),
                    }}
                >
                    {/* Email Input */}
                    <View className="mb-6">
                        <Text className="text-sm font-w-bold text-text-main uppercase mb-2">
                            {t('auth.email', translationLanguage)}
                        </Text>
                        <TextInput
                            value={email}
                            onChangeText={setEmail}
                            placeholder="your@email.com"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoComplete="email"
                            className="text-base font-w-medium text-text-main px-4 py-3"
                            style={{
                                borderWidth: Border.secondary,
                                borderColor: Colors.border,
                                borderRadius: borderRadius.SMALL,
                                backgroundColor: Colors.surface,
                            }}
                        />
                    </View>

                    {/* Send Reset Link Button */}
                    <BrutalButton
                        onPress={handleResetPassword}
                        backgroundColor={Colors.primary}
                        borderRadius={borderRadius.SMALL}
                        shadowOffset={3}
                        style={{ width: '100%', marginBottom: 12 }}
                        contentContainerStyle={{ paddingVertical: 14 }}
                        disabled={isLoading}
                    >
                        <Text className="text-border font-w-bold text-base uppercase">
                            {isLoading ? t('common.loading', translationLanguage) : t('auth.sendResetLink', translationLanguage)}
                        </Text>
                    </BrutalButton>

                    {/* Back to Login */}
                    <BrutalButton
                        onPress={() => router.push('/auth/login')}
                        borderWidth={0}
                        shadowOffset={0}
                        backgroundColor="transparent"
                        style={{ width: '100%' }}
                        contentContainerStyle={{ paddingVertical: 8 }}
                    >
                        <View className="flex-row items-center justify-center">
                            <ArrowLeft size={16} color={Colors.textMuted} strokeWidth={2.5} style={{ marginRight: 6 }} />
                            <Text className="text-sm font-w-bold text-text-muted">
                                {t('auth.backToLogin', translationLanguage)}
                            </Text>
                        </View>
                    </BrutalButton>

                </View>

            </View>
        </ScreenLayout>
    );
}
