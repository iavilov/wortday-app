import { BrutalButton } from '@/components/ui/brutal-button';
import { ScreenHeader } from '@/components/ui/screen-header';
import { ScreenLayout } from '@/components/ui/screen-layout';
import { Colors } from '@/constants/design-tokens';
import { t } from '@/constants/translations';
import { useAuthStore } from '@/store/auth-store';
import { useSettingsStore } from '@/store/settings-store';
import {
    canChangePassword,
    canEditEmail,
    getDisplayEmail,
    getDisplayName,
} from '@/types/auth';
import { useRouter } from 'expo-router';
import { Apple, Chrome, LogOut, Mail, Shield, Trash2, User } from 'lucide-react-native';
import React from 'react';
import { Alert, Platform, Text, View } from 'react-native';

// Auth provider badge component
function AuthProviderBadge({ provider, isPrivateEmail }: { provider: string; isPrivateEmail?: boolean }) {
    const badgeConfig: Record<string, { Icon: any; bg: string; text: string }> = {
        email: { Icon: Mail, bg: Colors.accentBlue, text: 'Email' },
        apple: { Icon: Apple, bg: '#000000', text: 'Apple ID' },
        google: { Icon: Chrome, bg: Colors.accentPink, text: 'Google' },
    };

    const config = badgeConfig[provider] || badgeConfig.email;

    return (
        <View
            className="flex-row items-center gap-2 px-3 py-1.5 rounded-brutal border-2"
            style={{ backgroundColor: config.bg, borderColor: Colors.border }}
        >
            <config.Icon size={14} color={provider === 'apple' ? '#FFFFFF' : Colors.border} />
            <Text
                className="font-w-semibold text-xs"
                style={{ color: provider === 'apple' ? '#FFFFFF' : Colors.border }}
            >
                {config.text}
            </Text>
            {isPrivateEmail && (
                <Shield size={12} color={provider === 'apple' ? '#FFFFFF' : Colors.gray600} />
            )}
        </View>
    );
}

// Section header component
function SectionHeader({ title }: { title: string }) {
    return (
        <Text className="text-sm font-w-semibold uppercase tracking-wide mb-3" style={{ color: Colors.gray600 }}>
            {title}
        </Text>
    );
}

// Info row component
function InfoRow({ label, value, badge }: { label: string; value: string; badge?: React.ReactNode }) {
    return (
        <View className="flex-row items-center justify-between py-3 border-b" style={{ borderColor: Colors.gray200 }}>
            <Text className="text-base font-w-medium" style={{ color: Colors.textMuted }}>
                {label}
            </Text>
            <View className="flex-row items-center gap-2">
                {badge}
                <Text className="text-base font-w-semibold" style={{ color: Colors.textMain }}>
                    {value}
                </Text>
            </View>
        </View>
    );
}

export default function AccountScreen() {
    const { translationLanguage } = useSettingsStore();
    const { user, profile, isAuthenticated, signOut, deleteAccount, isLoading } = useAuthStore();
    const router = useRouter();

    const authProvider = profile?.auth_provider || user?.authProvider || 'email';
    const isPrivateEmail = profile?.is_private_email || user?.isPrivateEmail || false;
    const displayName = getDisplayName(user, profile);
    const displayEmail = getDisplayEmail(user, profile);

    const handleSignOut = async () => {
        Alert.alert(
            t('account.signOut', translationLanguage),
            t('account.deleteAccountWarning', translationLanguage).replace('удалит', 'выйдет из'),
            [
                { text: t('account.cancel', translationLanguage), style: 'cancel' },
                {
                    text: t('account.signOut', translationLanguage),
                    onPress: async () => {
                        await signOut();
                        router.replace('/onboarding');
                    },
                },
            ]
        );
    };

    const handleDeleteAccount = async () => {
        Alert.alert(
            t('account.deleteAccountConfirm', translationLanguage),
            t('account.deleteAccountWarning', translationLanguage),
            [
                { text: t('account.cancel', translationLanguage), style: 'cancel' },
                {
                    text: t('account.delete', translationLanguage),
                    style: 'destructive',
                    onPress: async () => {
                        const result = await deleteAccount();
                        if (result.success) {
                            router.replace('/onboarding');
                        } else {
                            Alert.alert('Error', result.error || 'Failed to delete account');
                        }
                    },
                },
            ]
        );
    };

    // Not logged in state
    if (!isAuthenticated) {
        return (
            <ScreenLayout>
                <ScreenHeader
                    title={t('settings.account', translationLanguage)}
                    badgeText={t('settings.title', translationLanguage)}
                    showBackButton
                    badgeColor={Colors.primary}
                />

                <View
                    className="bg-white border-3 border-ink rounded-brutal p-6 shadow-brutal w-full items-center"
                    style={{ borderColor: Colors.border }}
                >
                    <User size={48} color={Colors.gray400} />
                    <Text className="text-lg font-w-semibold mt-4" style={{ color: Colors.textMain }}>
                        {t('account.notLoggedIn', translationLanguage)}
                    </Text>
                    <Text className="text-sm text-center mt-2 mb-4" style={{ color: Colors.textMuted }}>
                        {t('account.signIn', translationLanguage)}
                    </Text>
                    <BrutalButton
                        onPress={() => Alert.alert('Coming soon', 'Auth screens will be available soon')}
                        backgroundColor={Colors.primary}
                        pressableStyle={{ paddingVertical: 12, paddingHorizontal: 24 }}
                    >
                        <Text className="font-w-semibold text-base" style={{ color: Colors.textMain }}>
                            {t('account.signIn', translationLanguage)}
                        </Text>
                    </BrutalButton>
                </View>
            </ScreenLayout>
        );
    }

    return (
        <ScreenLayout>
            <ScreenHeader
                title={t('settings.account', translationLanguage)}
                badgeText={t('settings.title', translationLanguage)}
                showBackButton
                badgeColor={Colors.primary}
            />

            {/* Profile Section */}
            <View
                className="bg-white border-3 border-ink rounded-brutal p-5 shadow-brutal w-full mb-4"
                style={{ borderColor: Colors.border }}
            >
                <SectionHeader title={t('account.profile', translationLanguage)} />

                <InfoRow
                    label={t('account.email', translationLanguage)}
                    value={displayEmail}
                    badge={isPrivateEmail ? (
                        <View className="bg-gray-200 px-2 py-0.5 rounded">
                            <Text className="text-xs" style={{ color: Colors.gray600 }}>
                                {t('account.privateEmail', translationLanguage)}
                            </Text>
                        </View>
                    ) : undefined}
                />

                <View className="flex-row items-center justify-between py-3">
                    <Text className="text-base font-w-medium" style={{ color: Colors.textMuted }}>
                        {t('account.loginMethod', translationLanguage)}
                    </Text>
                    <AuthProviderBadge provider={authProvider} isPrivateEmail={isPrivateEmail} />
                </View>
            </View>

            {/* Security Section - Only for email auth on web */}
            {canChangePassword(authProvider) && Platform.OS === 'web' && (
                <View
                    className="bg-white border-3 border-ink rounded-brutal p-5 shadow-brutal w-full mb-4"
                    style={{ borderColor: Colors.border }}
                >
                    <SectionHeader title={t('account.security', translationLanguage)} />

                    <BrutalButton
                        onPress={() => Alert.alert('Coming soon', 'Password change will be available soon')}
                        pressableStyle={{ paddingVertical: 12, paddingHorizontal: 16 }}
                        style={{ marginBottom: 8 }}
                    >
                        <Text className="font-w-medium text-base" style={{ color: Colors.textMain }}>
                            {t('account.changePassword', translationLanguage)}
                        </Text>
                    </BrutalButton>

                    {canEditEmail(authProvider) && (
                        <BrutalButton
                            onPress={() => Alert.alert('Coming soon', 'Email change will be available soon')}
                            pressableStyle={{ paddingVertical: 12, paddingHorizontal: 16 }}
                        >
                            <Text className="font-w-medium text-base" style={{ color: Colors.textMain }}>
                                {t('account.changeEmail', translationLanguage)}
                            </Text>
                        </BrutalButton>
                    )}
                </View>
            )}

            {/* Managed by Apple/Google info */}
            {authProvider !== 'email' && (
                <View
                    className="bg-gray-100 border-2 rounded-brutal p-4 w-full mb-4"
                    style={{ borderColor: Colors.gray300 }}
                >
                    <Text className="text-sm text-center" style={{ color: Colors.gray600 }}>
                        {authProvider === 'apple'
                            ? t('account.managedByApple', translationLanguage)
                            : t('account.managedByGoogle', translationLanguage)}
                    </Text>
                </View>
            )}

            {/* Data Section */}
            <View
                className="bg-white border-3 border-ink rounded-brutal p-5 shadow-brutal w-full mb-4"
                style={{ borderColor: Colors.border }}
            >
                <SectionHeader title={t('account.data', translationLanguage)} />

                <BrutalButton
                    onPress={() => Alert.alert('Coming soon', 'Data export will be available soon')}
                    pressableStyle={{ paddingVertical: 12, paddingHorizontal: 16 }}
                >
                    <Text className="font-w-medium text-base" style={{ color: Colors.textMain }}>
                        {t('account.exportData', translationLanguage)}
                    </Text>
                </BrutalButton>
                <Text className="text-xs mt-2" style={{ color: Colors.gray500 }}>
                    {t('account.exportDataDesc', translationLanguage)}
                </Text>
            </View>

            {/* Account Actions */}
            <View
                className="bg-white border-3 border-ink rounded-brutal p-5 shadow-brutal w-full"
                style={{ borderColor: Colors.border }}
            >
                <SectionHeader title={t('account.accountActions', translationLanguage)} />

                <BrutalButton
                    onPress={handleSignOut}
                    pressableStyle={{ paddingVertical: 12, paddingHorizontal: 16 }}
                    style={{ marginBottom: 12 }}
                    disabled={isLoading}
                >
                    <View className="flex-row items-center gap-2">
                        <LogOut size={18} color={Colors.border} />
                        <Text className="font-w-medium text-base" style={{ color: Colors.textMain }}>
                            {t('account.signOut', translationLanguage)}
                        </Text>
                    </View>
                </BrutalButton>

                <BrutalButton
                    onPress={handleDeleteAccount}
                    borderColor="#EF4444"
                    pressableStyle={{ paddingVertical: 12, paddingHorizontal: 16 }}
                    disabled={isLoading}
                >
                    <View className="flex-row items-center gap-2">
                        <Trash2 size={18} color="#EF4444" />
                        <Text className="font-w-medium text-base" style={{ color: '#EF4444' }}>
                            {t('account.deleteAccount', translationLanguage)}
                        </Text>
                    </View>
                </BrutalButton>
            </View>

            {/* Version */}
            <Text className="text-center mt-6 mb-4" style={{ color: Colors.gray500 }}>
                {t('settings.version', translationLanguage)} 0.8.0
            </Text>
        </ScreenLayout>
    );
}
