import { Colors, Layout } from '@/constants/design-tokens';
import { createBrutalShadow } from '@/utils/platform-styles';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { GalleryVerticalEnd, History, Settings } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { LayoutChangeEvent, Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
    const [containerWidth, setContainerWidth] = useState(Layout.maxContentWidth);

    // We use padding 16 from styles.container
    const horizontalPadding = 16;
    const contentWidth = containerWidth - (horizontalPadding * 2);
    const tabSpace = contentWidth / state.routes.length;
    const indicatorWidth = 60;

    const translateX = useSharedValue(horizontalPadding + (tabSpace - indicatorWidth) / 2);

    useEffect(() => {
        if (containerWidth > 0) {
            // Calculate center of the active tab
            const targetX = horizontalPadding + (state.index * tabSpace) + (tabSpace - indicatorWidth) / 2;
            translateX.value = withSpring(targetX, {
                damping: 20,
                stiffness: 150,
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
                    {/* Sliding Background Indicator */}
                    <Animated.View
                        style={[
                            styles.indicator,
                            indicatorStyle,
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
                        if (route.name === 'history') {
                            Icon = History;
                        } else if (route.name === 'settings') {
                            Icon = Settings;
                        } else {
                            Icon = GalleryVerticalEnd;
                        }

                        return (
                            <Pressable
                                key={route.key}
                                onPress={onPress}
                                style={styles.tabItem}
                            >
                                <AnimatedIcon
                                    Icon={Icon}
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

// Separate component for animated icon to handle scale
function AnimatedIcon({ Icon, isFocused }: { Icon: any, isFocused: boolean }) {
    const scale = useSharedValue(isFocused ? 1.2 : 1);

    useEffect(() => {
        scale.value = withSpring(isFocused ? 1.2 : 1, {
            damping: 100,
            stiffness: 500,
        });
    }, [isFocused]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    return (
        <Animated.View style={animatedStyle}>
            <Icon
                size={22}
                color={isFocused ? Colors.border : Colors.gray500}
                strokeWidth={isFocused ? 3 : 2.5}
            />
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    gradientMask: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 160, // Covers the bottom area including menu and gap
        zIndex: 0,
    } as ViewStyle,
    outerContainer: {
        position: 'absolute',
        bottom: 40,
        left: 24,
        right: 24,
        alignItems: 'center',
        zIndex: 10, // Ensure menu is above the gradient mask
    } as ViewStyle,
    container: {
        width: '100%',
        height: 82,
        backgroundColor: Colors.surface,
        borderWidth: 4,
        borderColor: Colors.border,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        ...createBrutalShadow(4, Colors.border),
    } as ViewStyle,
    tabItem: {
        flex: 1,
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    } as ViewStyle,
    indicator: {
        position: 'absolute',
        left: -3,
        top: 11,
        width: 60,
        height: 54,
        backgroundColor: Colors.primary,
        borderWidth: 2,
        borderColor: Colors.border,
        borderRadius: 12,
        ...createBrutalShadow(2, Colors.border),
        zIndex: 0,
    } as ViewStyle,
});
