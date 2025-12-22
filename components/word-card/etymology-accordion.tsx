import { Colors } from '@/constants/design-tokens';
import { ChevronDown } from 'lucide-react-native';
import { ReactNode } from 'react';
import { LayoutChangeEvent, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

interface EtymologyAccordionProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

export function EtymologyAccordion({
  title,
  children,
  defaultOpen = false
}: EtymologyAccordionProps) {
  const height = useSharedValue(0);
  const contentHeight = useSharedValue(0);
  const isOpen = useSharedValue(defaultOpen);

  const toggleAccordion = () => {
    isOpen.value = !isOpen.value;

    if (isOpen.value) {
      height.value = withTiming(contentHeight.value, { duration: 300 });
    } else {
      height.value = withTiming(0, { duration: 300 });
    }
  };

  const onLayout = (event: LayoutChangeEvent) => {
    const onLayoutHeight = event.nativeEvent.layout.height;
    if (onLayoutHeight > 0 && contentHeight.value !== onLayoutHeight) {
      contentHeight.value = onLayoutHeight;
      if (isOpen.value) {
        height.value = withTiming(onLayoutHeight, { duration: 0 });
      }
    }
  };

  const animatedHeightStyle = useAnimatedStyle(() => ({
    height: height.value,
    opacity: height.value === 0 ? 0 : 1,
  }));

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: withSpring(isOpen.value ? '180deg' : '0deg') }],
  }));

  return (
    <View className="w-full">
      <TouchableOpacity
        onPress={toggleAccordion}
        activeOpacity={0.7}
        className="flex-row items-center justify-between py-3"
      >
        <Text
          className="text-accent-yellow font-bold text-xs uppercase flex-1"
        >
          {title}
        </Text>

        <Animated.View style={iconAnimatedStyle}>
          <ChevronDown size={18} color={Colors.accentYellow} strokeWidth={3} />
        </Animated.View>
      </TouchableOpacity>

      <Animated.View style={[animatedHeightStyle, { overflow: 'hidden' }]}>

        <View
          onLayout={onLayout}
          className="w-full absolute top-0 left-0"
        >
          {children}
        </View>
      </Animated.View>
    </View>
  );
}