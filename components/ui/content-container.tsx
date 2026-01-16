import { Layout } from '@/constants/design-tokens';
import React from 'react';
import { View, ViewProps } from 'react-native';

interface ContentContainerProps extends ViewProps {
    children: React.ReactNode;
}

/**
 * A reusable container that constrains content to a maximum width
 * and centers it. Used to maintain layout consistency across Web and Mobile.
 */
export const ContentContainer = ({ children, style, className = '', ...props }: ContentContainerProps) => {
    return (
        <View
            className={`w-full px-1 ${className}`}
            style={[
                {
                    maxWidth: Layout.maxContentWidth,
                    alignSelf: 'center',
                },
                style
            ]}
            {...props}
        >
            {children}
        </View>
    );
}
