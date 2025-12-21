import { Colors } from '@/constants/design-tokens';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, Pattern, Rect } from 'react-native-svg';

interface DottedBackgroundProps {
    children: React.ReactNode;
}

/**
 * Dotted background pattern component
 * Works on both web and native platforms
 */
export function DottedBackground({ children }: DottedBackgroundProps) {
    return (
        <View style={styles.container}>
            {/* SVG Pattern Background */}
            <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
                <Defs>
                    <Pattern
                        id="dotPattern"
                        x="0"
                        y="0"
                        width="24"
                        height="24"
                        patternUnits="userSpaceOnUse"
                    >
                        {/* Dot in the pattern */}
                        <Circle cx="0.5" cy="0.5" r="0.5" fill="#121212" />
                    </Pattern>
                </Defs>
                {/* Background rectangle with pattern */}
                <Rect width="100%" height="100%" fill={Colors.background} />
                <Rect width="100%" height="100%" fill="url(#dotPattern)" />
            </Svg>

            {/* Content on top of the pattern */}
            <View style={styles.content}>
                {children}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: 'relative',
    },
    content: {
        flex: 1,
    },
});
