import { ImageStyle, Platform, TextStyle, ViewStyle } from 'react-native';

type Style = ViewStyle | TextStyle | ImageStyle;

/**
 * Creates a style object with platform-specific overrides
 * 
 * @example
 * const buttonStyle = createPlatformStyle(
 *   { padding: 10, backgroundColor: 'blue' },
 *   { web: { cursor: 'pointer' }, ios: { padding: 12 } }
 * );
 */
export const createPlatformStyle = <T extends Style>(
    base: T,
    overrides?: {
        web?: Partial<T>;
        ios?: Partial<T>;
        android?: Partial<T>;
    }
): T => {
    const platformOverride = overrides?.[Platform.OS as keyof typeof overrides];
    return { ...base, ...platformOverride } as T;
};

/**
 * Creates a Neobrutalism offset shadow that works correctly on all platforms
 * On web: uses CSS box-shadow for crisp edges
 * On native: uses React Native shadow properties
 * 
 * @param offset - Shadow offset in pixels (default: 4)
 * @param color - Shadow color (default: '#121212')
 */
export const createBrutalShadow = (
    offset: number = 4,
    color: string = '#121212'
): ViewStyle => {
    if (Platform.OS === 'web') {
        return {
            // @ts-ignore - boxShadow is valid for web
            boxShadow: `${offset}px ${offset}px 0px 0px ${color}`,
        } as ViewStyle;
    }

    // Native platforms (iOS/Android)
    return {
        shadowColor: color,
        shadowOffset: { width: offset, height: offset },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 0,
    };
};

/**
 * Creates platform-specific overflow style
 * Web: uses overflow hidden (works with box-shadow)
 * Native: no overflow (prevents shadow clipping)
 */
export const createOverflowStyle = (): ViewStyle => {
    if (Platform.OS === 'web') {
        return { overflow: 'hidden' };
    }
    return {};
};

export const isWeb = Platform.OS === 'web';
export const isNative = Platform.OS === 'ios' || Platform.OS === 'android';
