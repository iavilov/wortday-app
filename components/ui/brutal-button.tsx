import { Border, Colors } from '@/constants/design-tokens';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { Platform, Pressable, View, ViewStyle } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';

interface BrutalButtonProps {
    children: React.ReactNode;
    onPress?: () => void;
    isActive?: boolean;
    shadowOffset?: number;
    backgroundColor?: string;
    activeBackgroundColor?: string;
    borderColor?: string;
    borderWidth?: number;
    borderRadius?: number;
    style?: ViewStyle;
    contentContainerStyle?: ViewStyle;
    pressableStyle?: ViewStyle;
    className?: string;
}

export const BrutalButton = ({
    children,
    onPress,
    isActive = false,
    shadowOffset = 2,
    backgroundColor = Colors.surface,
    activeBackgroundColor = Colors.accentYellow,
    borderColor = Colors.border,
    borderWidth = Border.primary,
    borderRadius = 6,
    style,
    contentContainerStyle,
    pressableStyle,
    className,
}: BrutalButtonProps) => {
    const isPressedInternal = useSharedValue(0);
    const animationValue = useSharedValue(isActive ? 1 : 0);

    React.useEffect(() => {
        animationValue.value = withSpring(isActive ? 1 : 0, {
            damping: 100,
            stiffness: 500,
        });
    }, [isActive]);

    const animatedStyle = useAnimatedStyle(() => {
        const pressValue = Math.max(animationValue.value, isPressedInternal.value);

        if (shadowOffset === 0) {
            return {
                transform: [
                    { scale: withSpring(pressValue ? 0.96 : 1, { damping: 100, stiffness: 500 }) }
                ],
                opacity: withSpring(pressValue ? 0.7 : 1),
            };
        }

        const offset = pressValue * shadowOffset;
        return {
            transform: [
                { translateX: offset },
                { translateY: offset },
            ],
        };
    });

    const handlePressIn = () => {
        isPressedInternal.value = withSpring(1, { damping: 100, stiffness: 500 });
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    const handlePressOut = () => {
        isPressedInternal.value = withSpring(0, { damping: 100, stiffness: 500 });
    };

    return (
        <View
            style={[
                style,
                {
                    position: 'relative',
                    paddingRight: shadowOffset > 0 ? shadowOffset : 0,
                    paddingBottom: shadowOffset > 0 ? shadowOffset : 0,
                }
            ]}
            className={className}
        >
            {/* Shadow Layer - only if offset > 0 */}
            {shadowOffset > 0 && (
                <View
                    style={{
                        position: 'absolute',
                        top: shadowOffset,
                        left: shadowOffset,
                        right: 0,
                        bottom: 0,
                        backgroundColor: borderColor,
                        borderRadius: borderRadius,
                    }}
                />
            )}
            {/* Content Layer */}
            <Animated.View
                style={[
                    animatedStyle,
                    {
                        backgroundColor: isActive ? activeBackgroundColor : backgroundColor,
                        borderWidth: borderWidth,
                        borderColor: borderColor,
                        borderRadius: borderRadius,
                        justifyContent: 'center',
                        alignItems: 'center',
                        overflow: 'hidden', // Ensure side strip doesn't overflow rounded corners
                    },
                    contentContainerStyle,
                ]}
            >
                <Pressable
                    onPress={onPress}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    style={[
                        {
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: Platform.OS === 'web' ? 'pointer' : 'auto',
                        },
                        pressableStyle
                    ]}
                >
                    {children}
                </Pressable>
            </Animated.View>
        </View>
    );
};
