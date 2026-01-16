import { Border, borderRadius, Colors, FontNames, Layout } from '@/constants/design-tokens';
import { createBrutalShadow } from '@/utils/platform-styles';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { History, Layers, Settings } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { LayoutChangeEvent, Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

export const TabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
    const [containerWidth, setContainerWidth] = useState(Layout.maxContentWidth);

    const BORDER_WIDTH = Border.primary;
    const HORIZONTAL_PADDING = Layout.screenPadding;
    const indicatorSize = 50;
    const indicatorTop = 10;

    // Available width for tabs inside padding AND borders
    const contentWidth = containerWidth - (2 * BORDER_WIDTH) - (2 * HORIZONTAL_PADDING);
    const tabSpace = contentWidth / state.routes.length;

    // Starting X position for the first tab icon
    // (Relative to container's left edge, including border)
    const startX = BORDER_WIDTH + HORIZONTAL_PADDING;

    const translateX = useSharedValue(startX + (tabSpace - indicatorSize) / 2);

    useEffect(() => {
        if (containerWidth > 0) {
            const targetX = startX + (state.index * tabSpace) + (tabSpace - indicatorSize) / 2;
            translateX.value = withSpring(targetX, {
                damping: 100,
                stiffness: 500,
                mass: 0.8,
            });
        }
    }, [state.index, tabSpace, containerWidth]);

    const onLayout = (event: LayoutChangeEvent) => {
        const { width } = event.nativeEvent.layout;
        if (width > 0) {
            setContainerWidth(width);
        }
    };

    const indicatorStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
    }));

    return (
        <>
            {/* Bottom Gradient Mask to dim content and block touches */}
            <LinearGradient
                colors={['transparent', 'rgba(255,255,255,0.15)', 'rgba(255,255,255,0.90)']}
                locations={[0, 0.4, 1]}
                style={styles.gradientMask}
                pointerEvents="auto"
            />

            <View style={styles.outerContainer} pointerEvents="box-none">
                <View
                    style={[
                        styles.container,
                        { maxWidth: Layout.maxContentWidth }
                    ]}
                    onLayout={onLayout}
                >
                    <Animated.View
                        style={[
                            styles.indicator,
                            indicatorStyle,
                            {
                                width: indicatorSize,
                                height: indicatorSize,
                                top: indicatorTop,
                            }
                        ]}
                    />

                    {state.routes.map((route, index) => {
                        const isFocused = state.index === index;

                        const onPress = () => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            const event = navigation.emit({
                                type: 'tabPress',
                                target: route.key,
                                canPreventDefault: true,
                            });

                            if (!isFocused && !event.defaultPrevented) {
                                navigation.navigate(route.name, route.params);
                            }
                        };

                        let Icon;
                        let label;
                        if (route.name === 'history') {
                            Icon = History;
                            label = 'HISTORY';
                        } else if (route.name === 'settings') {
                            Icon = Settings;
                            label = 'SETTINGS';
                        } else {
                            Icon = Layers;
                            label = 'TODAY';
                        }

                        return (
                            <Pressable
                                key={route.key}
                                onPress={onPress}
                                style={styles.tabItem}
                            >
                                <AnimatedTabContent
                                    Icon={Icon}
                                    label={label}
                                    isFocused={isFocused}
                                />
                            </Pressable>
                        );
                    })}
                </View>
            </View>
        </>
    );
}

// Separate component for animated content
const AnimatedTabContent = ({ Icon, label, isFocused }: { Icon: any, label: string, isFocused: boolean }) => {
    const scale = useSharedValue(isFocused ? 1.05 : 1);
    const opacity = useSharedValue(isFocused ? 1 : 0.6);

    useEffect(() => {
        scale.value = withSpring(isFocused ? 1.05 : 1, { damping: 100, stiffness: 500 });
        opacity.value = withSpring(isFocused ? 1 : 0.6, { damping: 100, stiffness: 500 });
    }, [isFocused]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: opacity.value,
    }));

    return (
        <Animated.View style={[styles.tabContent, animatedStyle]}>
            <View style={styles.iconContainer}>
                <Icon
                    size={20}
                    color={Colors.border}
                    strokeWidth={2.2}
                />
            </View>
            <Text style={styles.label}>
                {label}
            </Text>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    gradientMask: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 160,
        zIndex: 0,
    } as ViewStyle,
    outerContainer: {
        position: 'absolute',
        bottom: 34,
        left: Layout.screenPadding,
        right: Layout.screenPadding,
        alignItems: 'center',
        zIndex: 10,
    } as ViewStyle,
    container: {
        width: '100%',
        height: 100,
        backgroundColor: Colors.surface,
        borderWidth: Border.primary,
        borderColor: Colors.border,
        borderRadius: borderRadius.LARGE,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        ...createBrutalShadow(6, Colors.border),
    } as ViewStyle,
    tabItem: {
        flex: 1,
        height: '100%',
        zIndex: 1,
        position: 'relative',
    } as ViewStyle,
    tabContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconContainer: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    label: {
        fontSize: 10,
        fontFamily: FontNames.semibold,
        letterSpacing: 0.5,
        color: Colors.border,
        marginTop: 6,
    },
    indicator: {
        position: 'absolute',
        backgroundColor: Colors.primary,
        borderWidth: Border.secondary,
        borderColor: Colors.border,
        borderRadius: borderRadius.MEDIUM,
        left: -3,
        ...createBrutalShadow(2, Colors.border),
        zIndex: 0,
    } as ViewStyle,
});

