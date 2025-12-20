import { Colors } from '@/constants/design-tokens';
import React from 'react';
import { View, ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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

  const bottomPadding = withBottomPadding ? 60 : 0;

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: Colors.gray100 }}
      edges={['top', 'left', 'right']}
    >
      <View
        className={`flex-1 w-full self-center px-4 ${className || ''}`}
        style={[
          {
            maxWidth: 480,
            paddingBottom: bottomPadding,
          },
          style
        ]}
        {...props}
      >
        {children}
      </View>
    </SafeAreaView>
  );
}
