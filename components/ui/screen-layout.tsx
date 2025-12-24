import { Colors } from '@/constants/design-tokens';
import { useIsFocused } from '@react-navigation/native';
import React, { useEffect } from 'react';
import { ViewProps } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DottedBackground } from './dotted-background';

interface ScreenLayoutProps extends ViewProps {
  children: React.ReactNode;
  withBottomPadding?: boolean;
}

export function ScreenLayout({
  children,
  style,
  className,
  withBottomPadding = true,
  ...props
}: ScreenLayoutProps) {
  const isFocused = useIsFocused();
  const bottomPadding = withBottomPadding ? 60 : 0;

  const translateY = useSharedValue(20);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (isFocused) {
      // Прыжок вверх и появление
      translateY.value = withSpring(0, { damping: 20, stiffness: 150, mass: 0.8 });
      opacity.value = withTiming(1, { duration: 300 });
    } else {
      // Сброс в исходное состояние при уходе с экрана
      translateY.value = 20;
      opacity.value = 0;
    }
  }, [isFocused]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: Colors.background }}
      edges={['top', 'left', 'right']}
    >
      <DottedBackground>
        <Animated.View
          className={`flex-1 w-full self-center px-6 ${className || ''}`}
          style={[
            {
              maxWidth: 480,
              paddingBottom: bottomPadding,
            },
            animatedStyle,
            style
          ]}
          {...props}
        >
          {children}
        </Animated.View>
      </DottedBackground>
    </SafeAreaView>
  );
}
