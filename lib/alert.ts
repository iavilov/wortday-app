/**
 * Cross-platform alert helpers.
 * `Alert.alert` is a no-op on Web — these wrappers fall back to
 * `window.alert`/`window.confirm` so messages don't silently disappear.
 */

import { Alert, AlertButton, Platform } from 'react-native';

export function showAlert(title: string, message?: string): void {
    if (Platform.OS === 'web') {
        if (typeof window !== 'undefined') {
            window.alert(message ? `${title}\n\n${message}` : title);
        }
        return;
    }
    Alert.alert(title, message);
}

export interface ConfirmOptions {
    title: string;
    message?: string;
    confirmText: string;
    cancelText: string;
    destructive?: boolean;
}

/**
 * Returns true if the user confirmed, false if cancelled.
 * On Web: shows browser confirm. On native: Alert.alert with two buttons.
 */
export function showConfirm(options: ConfirmOptions): Promise<boolean> {
    const { title, message, confirmText, cancelText, destructive } = options;

    if (Platform.OS === 'web') {
        if (typeof window === 'undefined') return Promise.resolve(false);
        return Promise.resolve(window.confirm(message ? `${title}\n\n${message}` : title));
    }

    return new Promise(resolve => {
        const buttons: AlertButton[] = [
            { text: cancelText, style: 'cancel', onPress: () => resolve(false) },
            {
                text: confirmText,
                style: destructive ? 'destructive' : 'default',
                onPress: () => resolve(true),
            },
        ];
        Alert.alert(title, message, buttons, { cancelable: true, onDismiss: () => resolve(false) });
    });
}
