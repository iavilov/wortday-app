import { Colors } from '@/constants/design-tokens';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Line } from 'react-native-svg';

interface BrutalDividerProps {
    dashed?: boolean;
    className?: string;
}

export const BrutalDivider = ({ dashed = true, className }: BrutalDividerProps) => {
    if (dashed) {
        return (
            <View className={className} style={styles.svgContainer}>
                <Svg height="2" width="100%">
                    <Line
                        x1="0"
                        y1="1"
                        x2="100%"
                        y2="1"
                        stroke={Colors.border}
                        strokeWidth="2"
                        strokeDasharray="8, 6"
                    />
                </Svg>
            </View>
        );
    }

    return (
        <View
            className={className}
            style={[
                styles.divider,
                styles.solid
            ]}
        />
    );
}

const styles = StyleSheet.create({
    divider: {
        width: '100%',
    },
    svgContainer: {
        width: '100%',
        height: 2,
        justifyContent: 'center',
    },
    solid: {
        height: 1,
        backgroundColor: Colors.border,
    },
});
