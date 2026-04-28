import { BrutalButton } from '@/components/ui/brutal-button';
import { ScreenHeader } from '@/components/ui/screen-header';
import { ScreenLayout } from '@/components/ui/screen-layout';
import { Border, Colors, borderRadius } from '@/constants/design-tokens';
import { t } from '@/constants/translations';
import { showAlert, showConfirm } from '@/lib/alert';
import { useAuthStore } from '@/store/auth-store';
import { useSettingsStore } from '@/store/settings-store';
import { getDisplayEmail } from '@/types/auth';
import { createBrutalShadow } from '@/utils/platform-styles';
import { useRouter } from 'expo-router';
import { LogOut, Trash2, User } from 'lucide-react-native';
import React from 'react';
import { Text, View } from 'react-native';

export default function AccountScreen() {
    const translationLanguage = useSettingsStore(s => s.translationLanguage);
    const user = useAuthStore(s => s.user);
    const profile = useAuthStore(s => s.profile);
    const isAuthenticated = useAuthStore(s => s.isAuthenticated);
    const signOut = useAuthStore(s => s.signOut);
    const deleteAccount = useAuthStore(s => s.deleteAccount);
    const isLoading = useAuthStore(s => s.isLoading);
    const router = useRouter();

    const authProvider = profile?.auth_provider || user?.authProvider || 'email';
    const displayEmail = getDisplayEmail(user, profile);

    const handleSignOut = async () => {
        const confirmed = await showConfirm({
            title: t('account.signOut', translationLanguage),
            message: t('account.signOutConfirm', translationLanguage),
            confirmText: t('account.signOut', translationLanguage),
            cancelText: t('account.cancel', translationLanguage),
        });
        if (!confirmed) return;
        await signOut();
        router.replace('/auth/login');
    };

    const handleDeleteAccount = async () => {
        const confirmed = await showConfirm({
            title: t('account.deleteAccountConfirm', translationLanguage),
            message: t('account.deleteAccountWarning', translationLanguage),
            confirmText: t('account.delete', translationLanguage),
            cancelText: t('account.cancel', translationLanguage),
            destructive: true,
        });
        if (!confirmed) return;
        const result = await deleteAccount();
        if (result.success) {
            router.replace('/auth/login');
        } else {
            showAlert(
                t('common.error', translationLanguage),
                result.error || t('auth.deleteAccountFailed', translationLanguage),
            );
        }
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
                        onPress={() => router.push('/auth/login')}
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

            {/* 1. EMAIL CARD */}
            <View
                style={{
                    backgroundColor: Colors.surface,
                    borderWidth: Border.primary,
                    borderColor: Colors.border,
                    borderRadius: borderRadius.LARGE,
                    padding: 20,
                    marginBottom: 24,
                    width: '100%',
                    ...createBrutalShadow(4, Colors.border),
                }}
            >
                <Text
                    className="text-xs font-w-semibold uppercase mb-2"
                    style={{ color: Colors.gray600 }}
                >
                    {t('account.email', translationLanguage)}
                </Text>

                <Text
                    className="text-lg font-w-semibold"
                    style={{ color: Colors.textMain }}
                >
                    {displayEmail}
                </Text>

                {authProvider !== 'email' && (
                    <Text
                        className="text-xs font-w-medium mt-2"
                        style={{ color: Colors.textMuted }}
                    >
                        {authProvider === 'apple'
                            ? t('account.managedByApple', translationLanguage)
                            : t('account.managedByGoogle', translationLanguage)
                        }
                    </Text>
                )}
            </View>

            {/* 2. LOGOUT BUTTON */}
            <BrutalButton
                onPress={handleSignOut}
                backgroundColor={Colors.accentYellow}
                borderColor={Colors.border}
                borderWidth={Border.primary}
                borderRadius={borderRadius.LARGE}
                shadowOffset={4}
                disabled={isLoading}
                style={{ width: '100%', marginBottom: 16 }}
                pressableStyle={{
                    paddingVertical: 16,
                    paddingHorizontal: 20,
                    width: '100%',
                }}
            >
                <View className="flex-row items-center justify-center gap-2">
                    <LogOut size={20} color={Colors.border} strokeWidth={2.5} />
                    <Text
                        className="font-w-bold text-base uppercase"
                        style={{ color: Colors.textMain }}
                    >
                        {t('account.signOut', translationLanguage)}
                    </Text>
                </View>
            </BrutalButton>

            {/* 3. DELETE ACCOUNT BUTTON */}
            <BrutalButton
                onPress={handleDeleteAccount}
                backgroundColor="transparent"
                borderColor={Colors.destructive}
                borderWidth={Border.secondary}
                borderRadius={borderRadius.SMALL}
                shadowOffset={0}
                disabled={isLoading}
                style={{ width: '100%', marginBottom: 24 }}
                pressableStyle={{
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    width: '100%',
                }}
            >
                <View className="flex-row items-center justify-center gap-2">
                    <Trash2 size={16} color={Colors.destructive} strokeWidth={2} />
                    <Text
                        className="font-w-medium text-sm"
                        style={{ color: Colors.destructive }}
                    >
                        {t('account.deleteAccount', translationLanguage)}
                    </Text>
                </View>
            </BrutalButton>

            {/* Version */}
            <Text
                className="text-center"
                style={{ color: Colors.gray500, fontSize: 12 }}
            >
                {t('settings.version', translationLanguage)} 0.8.0
            </Text>
        </ScreenLayout>
    );
}
