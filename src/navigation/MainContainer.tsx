// src/navigation/MainContainer.tsx
import React, { useRef } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import SwipeTabs, { TopTabParamList } from './SwipeTabs';
import BottomTabs from '../components/BottomTabs';

type NavRef = NavigationContainerRef<TopTabParamList>;

const MainContainer: React.FC = () => {
  const navRef = useRef<NavRef | null>(null);

  return (
    <NavigationContainer ref={navRef}>
      <View style={styles.container}>
        {/* Swipe-enabled top tabs (full screen) */}
        <SwipeTabs />

        {/* Custom bottom tabs overlayed on top of navigator */}
        <BottomTabs
          onTabPress={(routeName) => {
            // navigate to top tab when bottom button pressed
            if (navRef.current) {
              // routeName must match one of: 'Dashboard'|'Transactions'|'Reports'|'Settings'
              navRef.current.navigate(routeName as keyof TopTabParamList);
            }
          }}
          onFabPress={() => {
            // handle FAB press (open add modal / screen etc.)
            // for now navigate to Transactions to show example
            if (navRef.current) navRef.current.navigate('Transactions');
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
