import { Tabs } from 'expo-router';
import React from 'react';

import { TabBar } from '@/components/ui/tab-bar';
import { TAB_BAR_SCREEN_OPTIONS } from '@/styles/navigation';

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        ...TAB_BAR_SCREEN_OPTIONS,
      }}>

      <Tabs.Screen
        name="history"
      />

      <Tabs.Screen
        name="index"
      />

      <Tabs.Screen
        name="settings"
      />
    </Tabs>
  );
}
