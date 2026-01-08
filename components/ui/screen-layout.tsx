import { Layout } from '@/constants/design-tokens';
import { useIsFocused } from '@react-navigation/native';
import React, { useEffect } from 'react';
import { View, ViewProps } from 'react-native';
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
    <DottedBackground>
      <SafeAreaView
        style={{ flex: 1 }}
        edges={['top', 'left', 'right']}
      >
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Animated.View
            className={`w-full ${className || ''}`}
            style={[
              {
                flex: 1,
                height: '100%',
                maxWidth: 480,
                paddingHorizontal: Layout.screenPadding,
                width: '100%',
              },
              animatedStyle,
              style
            ]}
            {...props}
          >
            {children}
          </Animated.View>
        </View>
      </SafeAreaView>
    </DottedBackground>
  );
}
