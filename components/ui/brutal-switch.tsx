import { Colors } from '@/constants/design-tokens';
import React, { useEffect } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, {
    interpolateColor,
    useAnimatedStyle,
    useSharedValue,
    withSpring
} from 'react-native-reanimated';

interface BrutalSwitchProps {
    value: boolean;
    onValueChange: (value: boolean) => void;
    activeColor?: string;
}

export const BrutalSwitch = ({
    value,
    onValueChange,
    activeColor = Colors.primary
}: BrutalSwitchProps) => {
    const translateX = useSharedValue(value ? 24 : 0);

    useEffect(() => {
        translateX.value = withSpring(value ? 24 : 0, {
            damping: 100,
            stiffness: 350,
        });
    }, [value]);

    const animatedStyle = useAnimatedStyle(() => {
        const backgroundColor = interpolateColor(
            translateX.value,
            [0, 24],
            [Colors.gray200, activeColor]
        );

        return {
            backgroundColor,
        };
    });

    const knobStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
    }));

    return (
        <Pressable
            onPress={() => onValueChange(!value)}
            style={styles.container}
        >
            <Animated.View style={[styles.track, animatedStyle]}>
                <Animated.View style={[styles.knob, knobStyle]} />
            </Animated.View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        width: 56,
        height: 32,
    },
    track: {
        width: '100%',
        height: '100%',
        borderRadius: 16,
        borderWidth: 2,
        borderColor: Colors.border,
        padding: 2,
        justifyContent: 'center',
        // Shadow
        shadowColor: Colors.border,
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 2,
    },
    knob: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: Colors.surface,
        borderWidth: 2,
        borderColor: Colors.border,
    },
});
