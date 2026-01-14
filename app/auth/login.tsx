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
import { Alert, Platform, Text, TextInput, View } from 'react-native';

export default function LoginScreen() {
    const router = useRouter();
    const { translationLanguage } = useSettingsStore();
    const { signInWithEmail, isLoading } = useAuthStore();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const validateEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const handleLogin = async () => {
        // Validation
        if (!email || !password) {
            Alert.alert(t('auth.loginError', translationLanguage), 'Please fill in all fields');
            return;
        }

        if (!validateEmail(email)) {
            Alert.alert(t('auth.loginError', translationLanguage), t('auth.invalidEmail', translationLanguage));
            return;
        }

        // Attempt login
        const result = await signInWithEmail(email, password);

        if (result.success) {
            // Auth guard will redirect to /(tabs)
        } else {
            Alert.alert(t('auth.loginError', translationLanguage), result.error || 'Unknown error');
        }
    };

    const handleAppleSignIn = async () => {
        const { isAppleMockEnabled, signInWithApple } = await import('@/lib/auth-service');

        if (isAppleMockEnabled()) {
            // Mock mode - no need for real Apple credential
            const result = await signInWithApple({} as any);
            if (!result.error) {
                // Auth guard will redirect to /(tabs)
            } else {
                Alert.alert(t('auth.loginError', translationLanguage), result.error);
            }
            return;
        }

        // Real Apple Sign In (requires Apple Developer account)
        try {
            const AppleAuthentication = await import('expo-apple-authentication');
            const credential = await AppleAuthentication.signInAsync({
                requestedScopes: [
                    AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                    AppleAuthentication.AppleAuthenticationScope.EMAIL,
                ],
            });

            const result = await signInWithApple({
                identityToken: credential.identityToken!,
                fullName: credential.fullName || undefined,
                email: credential.email || undefined,
            });

            if (!result.error) {
                // Auth guard will redirect to /(tabs)
            } else {
                Alert.alert(t('auth.loginError', translationLanguage), result.error);
            }
        } catch (error: any) {
            if (error.code === 'ERR_REQUEST_CANCELED') {
                // User canceled, do nothing
                return;
            }
            console.error('[Login] Apple Sign In error:', error);
            Alert.alert('Error', 'Apple Sign In failed');
        }
    };

    const handleGoogleSignIn = async () => {
        const { signInWithGoogle } = await import('@/lib/auth-service');
        const WebBrowser = await import('expo-web-browser');

        const result = await signInWithGoogle();

        if (result.url) {
            // Open OAuth URL in browser
            if (Platform.OS === 'web') {
                window.location.href = result.url;
            } else {
                await WebBrowser.openAuthSessionAsync(result.url, 'vocade://auth/callback');
            }
        } else {
            Alert.alert(t('auth.loginError', translationLanguage), result.error || 'Unknown error');
        }
    };

    return (
        <ScreenLayout>
            <View className="flex-1 items-center justify-center p-6">

                {/* Header */}
                <View className="w-full mb-8">
                    <Text className="text-4xl font-w-bold text-text-main text-center mb-2">
                        {t('auth.login', translationLanguage)}
                    </Text>
                    <Text className="text-base font-w-medium text-text-muted text-center">
                        Welcome back to Vocade!
                    </Text>
                </View>

                {/* Login Card */}
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
                    <View className="mb-2">
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
                                autoComplete="password"
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

                    {/* Forgot Password Link */}
                    <BrutalButton
                        onPress={() => router.push('/auth/reset-password')}
                        borderWidth={0}
                        shadowOffset={0}
                        backgroundColor="transparent"
                        style={{ alignSelf: 'flex-start', marginBottom: 20 }}
                    >
                        <Text className="text-sm font-w-bold text-text-muted">
                            {t('auth.forgotPassword', translationLanguage)}
                        </Text>
                    </BrutalButton>

                    {/* Login Button */}
                    <BrutalButton
                        onPress={handleLogin}
                        backgroundColor={Colors.primary}
                        borderRadius={borderRadius.SMALL}
                        shadowOffset={3}
                        style={{ width: '100%', marginBottom: 16 }}
                        contentContainerStyle={{ paddingVertical: 14 }}
                        disabled={isLoading}
                    >
                        <Text className="text-border font-w-bold text-base uppercase">
                            {isLoading ? t('common.loading', translationLanguage) : t('auth.login', translationLanguage)}
                        </Text>
                    </BrutalButton>

                    {/* Divider */}
                    <View className="flex-row items-center my-4">
                        <View className="flex-1 h-0.5 bg-border" />
                        <Text className="mx-4 text-xs font-w-bold text-text-muted uppercase">OR</Text>
                        <View className="flex-1 h-0.5 bg-border" />
                    </View>

                    {/* Social Auth Buttons */}
                    {Platform.OS === 'ios' && (
                        <BrutalButton
                            onPress={handleAppleSignIn}
                            backgroundColor="#000000"
                            borderRadius={borderRadius.SMALL}
                            shadowOffset={3}
                            style={{ width: '100%', marginBottom: 12 }}
                            contentContainerStyle={{ paddingVertical: 14 }}
                        >
                            <Text className="text-white font-w-bold text-base uppercase">
                                {t('auth.continueWithApple', translationLanguage)}
                            </Text>
                        </BrutalButton>
                    )}

                    <BrutalButton
                        onPress={handleGoogleSignIn}
                        backgroundColor={Colors.surface}
                        borderRadius={borderRadius.SMALL}
                        shadowOffset={3}
                        style={{ width: '100%' }}
                        contentContainerStyle={{ paddingVertical: 14 }}
                    >
                        <Text className="text-border font-w-bold text-base uppercase">
                            {t('auth.continueWithGoogle', translationLanguage)}
                        </Text>
                    </BrutalButton>

                </View>

                {/* Create Account Link */}
                <View className="flex-row items-center mt-6">
                    <Text className="text-base font-w-medium text-text-muted mr-2">
                        {t('auth.dontHaveAccount', translationLanguage)}
                    </Text>
                    <BrutalButton
                        onPress={() => router.push('/auth/register')}
                        borderWidth={0}
                        shadowOffset={0}
                        backgroundColor="transparent"
                    >
                        <Text className="text-base font-w-bold text-primary">
                            {t('auth.createAccount', translationLanguage)}
                        </Text>
                    </BrutalButton>
                </View>

            </View>
        </ScreenLayout>
    );
}
