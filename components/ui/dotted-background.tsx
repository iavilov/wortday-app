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
    const patternId = React.useId();

    return (
        <View style={styles.container}>
            {/* SVG Pattern Background */}
            <View style={StyleSheet.absoluteFill} pointerEvents="none">
                <Svg width="100%" height="100%" preserveAspectRatio="none">
                    <Defs>
                        <Pattern
                            id={patternId}
                            x="0"
                            y="0"
                            width="24"
                            height="24"
                            patternUnits="userSpaceOnUse"
                        >
                            {/* Dot in the pattern */}
                            <Circle cx="12" cy="12" r="0.8" fill="#121212" fillOpacity={0.5} />
                        </Pattern>
                    </Defs>
                    {/* Background rectangle with pattern */}
                    <Rect width="100%" height="100%" fill={Colors.background} />
                    <Rect width="100%" height="100%" fill={`url(#${patternId})`} />
                </Svg>
            </View>

            {/* Content on top of the pattern */}
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: 'relative',
    },
});
