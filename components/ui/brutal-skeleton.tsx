import { Border, Colors, borderRadius } from '@/constants/design-tokens';
import React, { useEffect } from 'react';
import { DimensionValue, View, ViewStyle } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
} from 'react-native-reanimated';

interface BrutalSkeletonProps {
    width?: DimensionValue;
    height?: DimensionValue;
    radius?: number;
    bordered?: boolean;
    style?: ViewStyle;
}

export const BrutalSkeleton = ({
    width = '100%',
    height = 20,
    radius = borderRadius.MEDIUM,
    bordered = false,
    style,
}: BrutalSkeletonProps) => {
    const opacity = useSharedValue(0.6);

    useEffect(() => {
        opacity.value = withRepeat(
            withTiming(1, { duration: 800 }),
            -1,
            true,
        );
    }, [opacity]);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    return (
        <Animated.View
            style={[
                {
                    width,
                    height,
                    borderRadius: radius,
                    backgroundColor: Colors.gray200,
                    borderWidth: bordered ? Border.primary : 0,
                    borderColor: Colors.border,
                },
                animatedStyle,
                style,
            ]}
        />
    );
};

interface BrutalCardSkeletonProps {
    style?: ViewStyle;
}

export const BrutalCardSkeleton = ({ style }: BrutalCardSkeletonProps) => (
    <View
        style={[
            {
                width: '100%',
                padding: 20,
                borderRadius: borderRadius.LARGE,
                borderWidth: Border.primary,
                borderColor: Colors.border,
                backgroundColor: Colors.surface,
                gap: 16,
            },
            style,
        ]}
    >
        <BrutalSkeleton width={56} height={28} radius={borderRadius.SMALL} />
        <BrutalSkeleton width="80%" height={48} radius={borderRadius.SMALL} />
        <View style={{ flexDirection: 'row', gap: 8 }}>
            <BrutalSkeleton width={64} height={28} radius={borderRadius.SMALL} />
            <BrutalSkeleton width={88} height={28} radius={borderRadius.SMALL} />
        </View>
        <BrutalSkeleton width="60%" height={20} radius={borderRadius.SMALL} />
        <BrutalSkeleton width="100%" height={80} radius={borderRadius.MEDIUM} bordered />
    </View>
);
