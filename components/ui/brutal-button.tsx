import { Colors } from '@/constants/design-tokens';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { Pressable, View, ViewStyle } from 'react-native';
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
    className?: string;
}

export const BrutalButton = ({
    children,
    onPress,
    isActive = false,
    shadowOffset = 3,
    backgroundColor = Colors.surface,
    activeBackgroundColor = Colors.accentYellow,
    borderColor = Colors.border,
    borderWidth = 3,
    borderRadius = 8,
    style,
    contentContainerStyle,
    className,
}: BrutalButtonProps) => {
    const isPressed = useSharedValue(isActive ? 1 : 0);

    React.useEffect(() => {
        isPressed.value = withSpring(isActive ? 1 : 0, {
            damping: 0,
            stiffness: 0,
        });
    }, [isActive]);

    const animatedStyle = useAnimatedStyle(() => {
        const offset = isPressed.value * shadowOffset;
        return {
            transform: [
                { translateX: offset },
                { translateY: offset },
            ],
        };
    });

    const handlePressIn = () => {
        if (!isActive) {
            isPressed.value = withSpring(1, { damping: 0, stiffness: 0 });
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
    };

    const handlePressOut = () => {
        if (!isActive) {
            isPressed.value = withSpring(0, { damping: 0, stiffness: 0 });
        }
    };

    return (
        <View
            style={[
                style,
                {
                    position: 'relative',
                    paddingRight: shadowOffset,
                    paddingBottom: shadowOffset,
                }
            ]}
            className={className}
        >
            {/* Shadow Layer */}
            <View
                style={{
                    position: 'absolute',
                    top: shadowOffset,
                    left: shadowOffset,
                    right: 0,
                    bottom: 0,
                    backgroundColor: borderColor,
                    borderRadius: borderRadius,
                    zIndex: 0,
                }}
            />
            {/* Content Layer */}
            <Animated.View
                style={[
                    animatedStyle,
                    {
                        backgroundColor: isActive ? activeBackgroundColor : backgroundColor,
                        borderWidth: borderWidth,
                        borderColor: borderColor,
                        borderRadius: borderRadius,
                        width: '100%',
                        zIndex: 1,
                    },
                    contentContainerStyle,
                ]}
            >
                <Pressable
                    onPress={onPress}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    style={{
                        width: '100%',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    {children}
                </Pressable>
            </Animated.View>
        </View>
    );
};
