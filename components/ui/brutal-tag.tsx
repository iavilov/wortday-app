import { Border, Colors, borderRadius as tokensBorderRadius } from '@/constants/design-tokens';
import { createBrutalShadow } from '@/utils/platform-styles';
import React from 'react';
import { Text, TextStyle, View, ViewProps } from 'react-native';

interface BrutalTagProps extends ViewProps {
  text: string;
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  shadowOffset?: number;
  paddingHorizontal?: number;
  paddingVertical?: number;
  uppercase?: boolean;
  textStyle?: TextStyle;
  textClassName?: string;
}

/**
 * Simple brutalist tag for badges/chips with configurable shadow and sizing.
 */
export const BrutalTag = ({
  text,
  backgroundColor = Colors.surface,
  textColor = Colors.border,
  borderColor = Colors.border,
  borderWidth = Border.secondary,
  borderRadius = tokensBorderRadius.SMALL,
  shadowOffset = 0,
  paddingHorizontal = 10,
  paddingVertical = 6,
  uppercase = true,
  style,
  textStyle,
  textClassName = '',
  ...props
}: BrutalTagProps) => {
  return (
    <View
      style={[
        {
          backgroundColor,
          borderColor,
          borderWidth,
          borderRadius,
          paddingHorizontal,
          paddingVertical,
          ...createBrutalShadow(shadowOffset, borderColor),
        },
        style,
      ]}
      {...props}
    >
      <Text
        className={`text-border font-w-bold ${uppercase ? 'uppercase' : ''} ${textClassName}`}
        style={[
          {
            color: textColor,
            letterSpacing: uppercase ? 1 : 0.5,
          },
          textStyle,
        ]}
      >
        {text}
      </Text>
    </View>
  );
}
