// src/components/BottomTabs.tsx
import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Platform,
  GestureResponderEvent,
} from 'react-native';

type Props = {
  onTabPress: (route: 'Dashboard' | 'Transactions' | 'Reports' | 'Settings') => void;
  onFabPress: (event?: GestureResponderEvent) => void;
};

const BottomTabs: React.FC<Props> = ({ onTabPress, onFabPress }) => {
  const [active, setActive] = useState<'Dashboard' | 'Transactions' | 'Reports' | 'Settings'>(
    'Dashboard'
  );

  const handlePress = (route: Props['onTabPress'] extends (...args: any) => void ? any : never) => {
    setActive(route);
    onTabPress(route);
  };

  return (
    <>
      <View style={styles.container}>
        <TouchableOpacity style={styles.tab} onPress={() => handlePress('Dashboard')}>
          <Text style={[styles.label, active === 'Dashboard' && styles.active]}>Dashboard</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tab} onPress={() => handlePress('Transactions')}>
          <Text style={[styles.label, active === 'Transactions' && styles.active]}>Transactions</Text>
        </TouchableOpacity>

        {/* spacer for center FAB */}
        <View style={styles.spacer} />

        <TouchableOpacity style={styles.tab} onPress={() => handlePress('Reports')}>
          <Text style={[styles.label, active === 'Reports' && styles.active]}>Reports</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tab} onPress={() => handlePress('Settings')}>
          <Text style={[styles.label, active === 'Settings' && styles.active]}>Settings</Text>
        </TouchableOpacity>
      </View>

      {/* Floating Add Button positioned above the bar */}
      <TouchableOpacity style={styles.fab} onPress={onFabPress}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    backgroundColor: '#fff',
    borderTopWidth: 0.5,
    borderTopColor: '#ddd',
    // ensure it sits above content
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  spacer: {
    width: 70, // enough space for the FAB to sit in the middle
  },
  label: {
    fontSize: 12,
    color: '#444',
  },
  active: {
    color: '#0a84ff',
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: 24, // adjust to rise above the bar
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#0a84ff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  fabText: {
    color: '#fff',
    fontSize: 32,
    lineHeight: Platform.OS === 'ios' ? 36 : 32,
  },
});

export default BottomTabs;
