import { BrutalButton } from '@/components/ui/brutal-button';
import { ScreenLayout } from '@/components/ui/screen-layout';
import { Border, Colors, borderRadius } from '@/constants/design-tokens';
import { t } from '@/constants/translations';
import { useAuthStore } from '@/store/auth-store';
import { useSettingsStore } from '@/store/settings-store';
import { createBrutalShadow } from '@/utils/platform-styles';
import { useRouter } from 'expo-router';
import { Eye, EyeOff } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, Text, TextInput, View } from 'react-native';

export default function RegisterScreen() {
    const router = useRouter();
    const { translationLanguage } = useSettingsStore();
    const { signUpWithEmail, isLoading } = useAuthStore();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const validateEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const handleRegister = async () => {
        // Validation
        if (!email || !password || !confirmPassword) {
            Alert.alert(t('auth.registerError', translationLanguage), 'Please fill in all fields');
            return;
        }

        if (!validateEmail(email)) {
            Alert.alert(t('auth.registerError', translationLanguage), t('auth.invalidEmail', translationLanguage));
            return;
        }

        if (password.length < 6) {
            Alert.alert(t('auth.registerError', translationLanguage), t('auth.passwordTooShort', translationLanguage));
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert(t('auth.registerError', translationLanguage), t('auth.passwordsDontMatch', translationLanguage));
            return;
        }

        // Attempt registration
        const result = await signUpWithEmail(email, password);

        if (result.success) {
            Alert.alert(
                t('auth.registerSuccess', translationLanguage),
                'Please check your email to confirm your account',
                [{ text: 'OK', onPress: () => router.replace('/auth/login') }]
            );
        } else {
            Alert.alert(t('auth.registerError', translationLanguage), result.error || 'Unknown error');
        }
    };

    return (
        <ScreenLayout>
            <View className="flex-1 items-center justify-center p-6">

                {/* Header */}
                <View className="w-full mb-8">
                    <Text className="text-4xl font-w-bold text-text-main text-center mb-2">
                        {t('auth.register', translationLanguage)}
                    </Text>
                    <Text className="text-base font-w-medium text-text-muted text-center">
                        Start learning German today!
                    </Text>
                </View>

                {/* Register Card */}
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
                    <View className="mb-4">
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

                    {/* Password Input */}
                    <View className="mb-4">
                        <Text className="text-sm font-w-bold text-text-main uppercase mb-2">
                            {t('auth.password', translationLanguage)}
                        </Text>
                        <View className="relative">
                            <TextInput
                                value={password}
                                onChangeText={setPassword}
                                placeholder="••••••••"
                                secureTextEntry={!showPassword}
                                autoCapitalize="none"
                                autoComplete="password-new"
                                className="text-base font-w-medium text-text-main px-4 py-3 pr-12"
                                style={{
                                    borderWidth: Border.secondary,
                                    borderColor: Colors.border,
                                    borderRadius: borderRadius.SMALL,
                                    backgroundColor: Colors.surface,
                                }}
                            />
                            <BrutalButton
                                onPress={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: 4,
                                    top: 4,
                                    width: 40,
                                    height: 40,
                                }}
                                borderWidth={0}
                                shadowOffset={0}
                                backgroundColor="transparent"
                            >
                                {showPassword ? (
                                    <EyeOff size={20} color={Colors.textMuted} />
                                ) : (
                                    <Eye size={20} color={Colors.textMuted} />
                                )}
                            </BrutalButton>
                        </View>
                    </View>

                    {/* Confirm Password Input */}
                    <View className="mb-6">
                        <Text className="text-sm font-w-bold text-text-main uppercase mb-2">
                            {t('auth.confirmPassword', translationLanguage)}
                        </Text>
                        <View className="relative">
                            <TextInput
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                placeholder="••••••••"
                                secureTextEntry={!showConfirmPassword}
                                autoCapitalize="none"
                                autoComplete="password-new"
                                className="text-base font-w-medium text-text-main px-4 py-3 pr-12"
                                style={{
                                    borderWidth: Border.secondary,
                                    borderColor: Colors.border,
                                    borderRadius: borderRadius.SMALL,
                                    backgroundColor: Colors.surface,
                                }}
                            />
                            <BrutalButton
                                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                style={{
                                    position: 'absolute',
                                    right: 4,
                                    top: 4,
                                    width: 40,
                                    height: 40,
                                }}
                                borderWidth={0}
                                shadowOffset={0}
                                backgroundColor="transparent"
                            >
                                {showConfirmPassword ? (
                                    <EyeOff size={20} color={Colors.textMuted} />
                                ) : (
                                    <Eye size={20} color={Colors.textMuted} />
                                )}
                            </BrutalButton>
                        </View>
                    </View>

                    {/* Register Button */}
                    <BrutalButton
                        onPress={handleRegister}
                        backgroundColor={Colors.primary}
                        borderRadius={borderRadius.SMALL}
                        shadowOffset={3}
                        style={{ width: '100%' }}
                        contentContainerStyle={{ paddingVertical: 14 }}
                        disabled={isLoading}
                    >
                        <Text className="text-border font-w-bold text-base uppercase">
                            {isLoading ? t('common.loading', translationLanguage) : t('auth.register', translationLanguage)}
                        </Text>
                    </BrutalButton>

                </View>

                {/* Back to Login Link */}
                <View className="flex-row items-center mt-6">
                    <Text className="text-base font-w-medium text-text-muted mr-2">
                        {t('auth.alreadyHaveAccount', translationLanguage)}
                    </Text>
                    <BrutalButton
                        onPress={() => router.push('/auth/login')}
                        borderWidth={0}
                        shadowOffset={0}
                        backgroundColor="transparent"
                    >
                        <Text className="text-base font-w-bold text-primary">
                            {t('auth.login', translationLanguage)}
                        </Text>
                    </BrutalButton>
                </View>

            </View>
        </ScreenLayout>
    );
}
