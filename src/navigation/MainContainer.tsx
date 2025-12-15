import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';

import SwipeTabs from './SwipeTabs';
import BottomTabs from '../components/BottomTabs';
import { navigationRef, SwipeTabRoutes } from './navigationRef';
import RootStack from './RootStack';
import { AddIncomeScreen } from '../screens/AddIncomeScreen';

const MainContainer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SwipeTabRoutes>('Dashboard');

  useEffect(() => {
    const unsubscribe = navigationRef.addListener('state', () => {
      const route = navigationRef.getCurrentRoute();
      if (route?.name) setActiveTab(route.name as SwipeTabRoutes);
    });
    return unsubscribe;
  }, []);

  return (
    <NavigationContainer ref={navigationRef}>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        <RootStack.Screen name="MainTabs" component={SwipeTabs} />
        <RootStack.Screen name="AddIncome" component={AddIncomeScreen} />
      </RootStack.Navigator>

      <BottomTabs
        activeTab={activeTab}
        onTabPress={route =>
          navigationRef.current?.navigate('MainTabs', {
            screen: route,
          })
        }
        onFabPress={() => {
          navigationRef.navigate('Dashboard');
        }}
      />
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
});

export default MainContainer;
