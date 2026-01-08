import { Colors } from '@/constants/design-tokens';
import React from 'react';
import { View, ViewStyle } from 'react-native';
import Svg, { Line } from 'react-native-svg';

interface BrutalDashedLineProps {
    color?: string;
    thickness?: number;
    dashArray?: string;
    style?: ViewStyle;
    marginHorizontal?: number;
}

/**
 * A Neobrutalist dashed line component using SVG for consistent cross-platform rendering.
 */
export function BrutalDashedLine({
    color = Colors.border,
    thickness = 2,
    dashArray = "6, 6",
    style,
    marginHorizontal = 16,
}: BrutalDashedLineProps) {
    return (
        <View style={[{ height: thickness, marginHorizontal }, style]}>
            <Svg height={thickness} width="100%">
                <Line
                    x1="0"
                    y1={thickness / 2}
                    x2="100%"
                    y2={thickness / 2}
                    stroke={color}
                    strokeWidth={thickness}
                    strokeDasharray={dashArray}
                />
            </Svg>
        </View>
    );
}
