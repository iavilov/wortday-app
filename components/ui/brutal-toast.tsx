import { Border, Colors, borderRadius } from '@/constants/design-tokens';
import { useToastStore } from '@/store/toast-store';
import { createBrutalShadow } from '@/utils/platform-styles';
import { AlertTriangle, CheckCircle2, Info, type LucideIcon } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const VARIANT_STYLE: Record<
    'success' | 'info' | 'error',
    { bg: string; Icon: LucideIcon }
> = {
    success: { bg: Colors.primary, Icon: CheckCircle2 },
    info: { bg: Colors.accentYellow, Icon: Info },
    error: { bg: Colors.destructiveSoft, Icon: AlertTriangle },
};

export const BrutalToast = () => {
    const insets = useSafeAreaInsets();
    const visible = useToastStore(s => s.visible);
    const message = useToastStore(s => s.message);
    const variant = useToastStore(s => s.variant);
    const hide = useToastStore(s => s.hide);

    const translateY = useSharedValue(-100);
    const opacity = useSharedValue(0);

    useEffect(() => {
        if (visible) {
            translateY.value = withSpring(0, { damping: 18, stiffness: 220 });
            opacity.value = withTiming(1, { duration: 200 });
        } else {
            translateY.value = withTiming(-100, { duration: 200 });
            opacity.value = withTiming(0, { duration: 200 });
        }
    }, [visible, translateY, opacity]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
        opacity: opacity.value,
    }));

    const { bg, Icon } = VARIANT_STYLE[variant];
    const iconColor = variant === 'error' ? Colors.destructive : Colors.border;

    return (
        <Animated.View
            pointerEvents={visible ? 'box-none' : 'none'}
            style={[
                {
                    position: 'absolute',
                    top: insets.top + 12,
                    left: 16,
                    right: 16,
                    alignItems: 'center',
                    zIndex: 50,
                },
                animatedStyle,
            ]}
        >
            <Pressable
                onPress={hide}
                accessibilityRole="alert"
                accessibilityLabel={message}
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: bg,
                    borderWidth: Border.primary,
                    borderColor: variant === 'error' ? Colors.destructive : Colors.border,
                    borderRadius: borderRadius.MEDIUM,
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    gap: 12,
                    maxWidth: 480,
                    width: '100%',
                    ...createBrutalShadow(4, variant === 'error' ? Colors.destructive : Colors.border),
                }}
            >
                <Icon size={22} color={iconColor} strokeWidth={2.5} />
                <Text
                    style={{
                        flex: 1,
                        fontSize: 15,
                        fontWeight: '600',
                        color: variant === 'error' ? Colors.destructive : Colors.textMain,
                        lineHeight: 20,
                    }}
                    numberOfLines={3}
                >
                    {message}
                </Text>
            </Pressable>
        </Animated.View>
    );
};
