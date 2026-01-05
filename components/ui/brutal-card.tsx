import { Colors, Layout } from '@/constants/design-tokens';
import { createBrutalShadow } from '@/utils/platform-styles';
import React from 'react';
import { View, ViewProps } from 'react-native';

interface BrutalCardProps extends ViewProps {
    children: React.ReactNode;
    maxWidth?: number;
    width?: number;
}

export function BrutalCard({
    children,
    style,
    className = '',
    maxWidth = Layout.maxContentWidth,
    ...props
}: BrutalCardProps) {
    return (
        <View
            className={`bg-surface rounded-md p-5 relative w-full ${className}`}
            style={[
                {
                    maxWidth: maxWidth,
                    borderWidth: 4,
                    borderColor: Colors.border,
                    ...createBrutalShadow(4, Colors.border),
                },
                style
            ]}
            {...props}
        >
            {children}
        </View>
    );
}
