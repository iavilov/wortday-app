import { Colors, Layout } from '@/constants/design-tokens';
import { createBrutalShadow } from '@/utils/platform-styles';
import React from 'react';
import { Text, View, ViewProps } from 'react-native';

interface ScreenHeaderProps extends ViewProps {
    title: string;
    badgeText: string;
    badgeColor?: string;
    leftElement?: React.ReactNode;
    rightElement?: React.ReactNode;
    titleAlign?: 'left' | 'right';
    maxWidth?: number;
}

/**
 * Reusable Screen Header with Neo-brutalist badge and title.
 * Supports left/right elements and alignment.
 */
export function ScreenHeader({
    title,
    badgeText,
    badgeColor = Colors.accentYellow,
    leftElement,
    rightElement,
    titleAlign = 'left',
    maxWidth = Layout.maxContentWidth,
    className = '',
    style,
    ...props
}: ScreenHeaderProps) {
    const isRight = titleAlign === 'right';

    const TitleBlock = (
        <View className={`flex-row items-center ${isRight ? 'flex-row-reverse' : ''}`}>
            <View
                style={{
                    backgroundColor: badgeColor,
                    borderWidth: 2,
                    borderColor: Colors.border,
                    // transform: [{ rotate: '-2deg' }],
                    ...createBrutalShadow(2, Colors.border),
                }}
                className={`px-2 py-0.5 ${isRight ? 'ml-3' : 'mr-3'}`}
            >
                <Text
                    className="text-border  font-w-extrabold uppercase tracking-[2px] text-[11px]"
                >
                    {badgeText}
                </Text>
            </View>
            <Text
                className="text-xl font-w-extrabold uppercase tracking-[1px]"
                style={{ color: Colors.gray800 }}
            >
                {title}
            </Text>
        </View>
    );

    return (
        <View
            className={`flex-row items-center justify-between pt-8 pb-10 w-full ${className}`}
            style={[{ maxWidth }, style]}
            {...props}
        >
            {leftElement}
            {!isRight && TitleBlock}
            {rightElement}
            {isRight && TitleBlock}
        </View>
    );
}
