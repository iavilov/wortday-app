/**
 * Etymology Accordion Component
 * Collapsible section for etymology information with smooth animations
 */

import { ChevronDown } from 'lucide-react-native';
import { ReactNode, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
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
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const rotation = useSharedValue(defaultOpen ? 180 : 0);
  const heightValue = useSharedValue(defaultOpen ? 1 : 0);

  const toggleAccordion = () => {
    setIsOpen(!isOpen);
    rotation.value = withSpring(isOpen ? 0 : 180, {
      damping: 15,
      stiffness: 150,
    });
    heightValue.value = withTiming(isOpen ? 0 : 1, {
      duration: 300,
    });
  };

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: heightValue.value,
    maxHeight: heightValue.value === 0 ? 0 : undefined,
  }));

  return (
    <View className="w-full">
      {/* Header - Clickable */}
      <TouchableOpacity
        onPress={toggleAccordion}
        activeOpacity={0.7}
        className="flex-row items-center justify-between py-3"
      >
        <Text 
          className="text-accent-purple font-bold text-xs uppercase flex-1"
          style={{ fontFamily: 'Rubik_700Bold' }}
        >
          {title}
        </Text>
        
        <Animated.View style={iconAnimatedStyle}>
          <ChevronDown size={18} color="#8B5CF6" strokeWidth={3} />
        </Animated.View>
      </TouchableOpacity>

      {/* Content - Collapsible */}
      {isOpen && (
        <Animated.View style={contentAnimatedStyle}>
          {children}
        </Animated.View>
      )}
    </View>
  );
}
