import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { SwipeTabRoutes } from '../navigation/navigationRef';

type Props = {
  activeTab: SwipeTabRoutes;
  onTabPress: (route: SwipeTabRoutes) => void;
  onFabPress: () => void;
};

const BottomTabs: React.FC<Props> = ({ activeTab, onTabPress, onFabPress }) => {
  const renderTab = (label: SwipeTabRoutes, icon: string) => {
    const isActive = activeTab === label;
    return (
      <TouchableOpacity style={styles.tab} onPress={() => onTabPress(label)}>
        <MaterialCommunityIcons
          name={icon}
          size={22}
          color={isActive ? '#0a84ff' : '#666'}
        />
        <Text style={[styles.label, isActive && styles.active]}>{label}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <>
      <View style={styles.container}>
        {renderTab('Dashboard', 'home-variant-outline')}
        {renderTab('Transactions', 'swap-horizontal')}

        <View style={{ width: 70, pointerEvents: 'none' }} />

        {renderTab('Reports', 'chart-line')}
        {renderTab('Settings', 'cog-outline')}
      </View>

      {/* Floating Add Button */}
      <TouchableOpacity style={styles.fab} onPress={onFabPress}>
        <MaterialCommunityIcons name="plus" size={32} color="#fff" />
      </TouchableOpacity>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 64,
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 0.5,
    borderTopColor: '#ddd',

    zIndex: 1,
  },

  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },
  active: {
    color: '#0a84ff',
    fontWeight: '600',
  },
  spacer: {
    width: 70,
  },
  fab: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: 32, // 👈 move above tab bar
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#0a84ff',
    justifyContent: 'center',
    alignItems: 'center',

    zIndex: 100, // 👈 iOS
    elevation: 12, // 👈 Android
  },
});

export default BottomTabs;
