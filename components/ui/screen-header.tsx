import { Colors, Layout, borderRadius as tokensBorderRadius } from '@/constants/design-tokens';
import { createBrutalShadow } from '@/utils/platform-styles';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import React from 'react';
import { Text, View, ViewProps } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { BrutalButton } from './brutal-button';

interface ScreenHeaderProps extends ViewProps {
    title: string;
    badgeText?: string;
    badgeColor?: string;
    leftElement?: React.ReactNode;
    rightElement?: React.ReactNode;
    titleAlign?: 'left' | 'right';
    maxWidth?: number;
    showBackButton?: boolean;
    onBackPress?: () => void;
}

/**
 * Reusable Screen Header with Neo-brutalist badge and title.
 * Supports left/right elements, alignment, and back button for secondary screens.
 */
export const ScreenHeader = ({
    title,
    badgeText,
    badgeColor = Colors.accentYellow,
    leftElement,
    rightElement,
    titleAlign,
    maxWidth = Layout.maxContentWidth,
    showBackButton = false,
    onBackPress,
    className = '',
    style,
    ...props
}: ScreenHeaderProps) => {
    const router = useRouter();

    // Determine the layout type based on props
    // State 1: secondary screen (showBackButton) -> align title right
    // State 2: primary tab screen (no back button, no right element) -> align title right
    // State 3: home screen (no back button, has right element) -> align title left
    const isHome = !showBackButton && !!rightElement;
    const align = titleAlign || (isHome ? 'left' : 'right');
    const isRight = align === 'right';

    const handleBackPress = () => {
        if (onBackPress) {
            onBackPress();
        } else {
            router.back();
        }
    };

    const TitleBlock = (
        <View className={`flex-col ${isRight ? 'items-end' : 'items-start'}`}>
            {badgeText && (
                <View
                    style={{
                        backgroundColor: badgeColor,
                        borderWidth: 2,
                        borderColor: Colors.border,
                        borderRadius: tokensBorderRadius.SHARP,
                        ...createBrutalShadow(1, Colors.border),
                    }}
                    className={`px-2 py-0.5 mb-1`}
                >
                    <Text
                        className="text-border font-w-bold uppercase tracking-[2px] text-[11px]"
                    >
                        {badgeText}
                    </Text>
                </View>
            )}
            <Text
                className="text-xl font-w-bold uppercase tracking-[1px]"
                style={{ color: Colors.gray800 }}
            >
                {title}
            </Text>
        </View>
    );

    return (
        <View
            className={`flex-row items-center justify-between w-full pt-8 pb-10 ${className}`}
            style={[{ maxWidth }, style]}
            {...props}
        >
            {/* Left Slot: Back Button or Title (if left-aligned) */}
            <View className="flex-1 items-start">
                {showBackButton ? (
                    <Animated.View
                        entering={FadeInDown.duration(100)}
                    >
                        <BrutalButton
                            onPress={handleBackPress}
                            borderRadius={tokensBorderRadius.ROUND}
                            shadowOffset={2}
                            style={{ width: 48, height: 48 }}
                            contentContainerStyle={{ width: '100%', height: '100%' }}
                        >
                            <ChevronLeft size={24} color={Colors.border} strokeWidth={2.5} />
                        </BrutalButton>
                    </Animated.View>
                ) : (
                    !isRight && TitleBlock
                )}
                {leftElement}
            </View>

            {/* Right Slot: Title (if right-aligned) or Right Element */}
            <View className="flex-1 items-end">
                {isRight ? TitleBlock : rightElement}
            </View>
        </View>
    );
}
