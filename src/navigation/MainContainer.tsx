import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';

import SwipeTabs from './SwipeTabs';
import BottomTabs from '../components/BottomTabs';
import { navigationRef, SwipeTabRoutes } from './navigationRef';

const MainContainer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SwipeTabRoutes>('Dashboard');

  useEffect(() => {
    const unsubscribe = navigationRef.addListener('state', () => {
      const route = navigationRef.getCurrentRoute();
      if (route?.name) {
        setActiveTab(route.name as SwipeTabRoutes);
      }
    });

    return unsubscribe;
  }, []);

  return (
    <NavigationContainer ref={navigationRef}>
      <View style={styles.container}>
        <SwipeTabs />

        <BottomTabs
          activeTab={activeTab}
          onTabPress={(route) => navigationRef.navigate(route)}
          onFabPress={() => {
            // later: open add-transaction modal
            navigationRef.navigate('Transactions');
          }}
        />
      </View>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
});

export default MainContainer;
