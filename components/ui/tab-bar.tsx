import { Colors } from '@/constants/design-tokens';
import { NavigationStyles } from '@/styles/navigation';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { GalleryVerticalEnd, History, Settings } from 'lucide-react-native';
import { TouchableOpacity, View } from 'react-native';

export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
    return (
        <View style={NavigationStyles.container}>
            {state.routes.map((route, index) => {
                const { options } = descriptors[route.key];
                const isFocused = state.index === index;

                const onPress = () => {
                    const event = navigation.emit({
                        type: 'tabPress',
                        target: route.key,
                        canPreventDefault: true,
                    });

                    if (!isFocused && !event.defaultPrevented) {
                        navigation.navigate(route.name, route.params);
                    }
                };

                let Icon;
                if (route.name === 'history') {
                    Icon = History;
                } else if (route.name === 'settings') {
                    Icon = Settings;
                } else {
                    Icon = GalleryVerticalEnd;
                }

                return (
                    <TouchableOpacity
                        key={route.key}
                        onPress={onPress}
                        activeOpacity={0.7}
                        style={[
                            NavigationStyles.tabItem,
                            isFocused && NavigationStyles.activeTabItem
                        ]}
                    >
                        {isFocused && (
                            <View
                                className="absolute top-1.5 right-1.5 w-1.5 h-1.5 border border-white"
                                style={{ backgroundColor: Colors.border, borderColor: Colors.surface, borderWidth: 1 }}
                            />
                        )}
                        <Icon
                            size={24}
                            color={isFocused ? Colors.border : Colors.gray500}
                            strokeWidth={2.5}
                        />
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}
