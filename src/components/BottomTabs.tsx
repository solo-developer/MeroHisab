// src/components/BottomTabs.tsx
import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Dimensions,
  Modal,
  Keyboard,
  Platform,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { navigationRef, SwipeTabRoutes } from '../navigation/navigationRef';
import TransferModalContent from '../screens/TransferModalContent';
import { usePreferences } from '../context/PreferencesContext';

type Props = {
  activeTab: SwipeTabRoutes;
  onTabPress: (route: SwipeTabRoutes) => void;
};

type FabItemProps = {
  label: 'Income' | 'Expense' | 'Transfer' | 'Receipt' | 'Payment';
  icon: string;
  onPress: () => void;
};

const FabItem: React.FC<FabItemProps & { style?: object }> = ({
  label,
  icon,
  style,
  onPress,
}) => (
  <TouchableOpacity style={[styles.fabItem, style]} onPress={onPress}>
    <MaterialCommunityIcons name={icon} size={20} color="#fff" />
    <Text style={styles.fabLabel}>{label}</Text>
  </TouchableOpacity>
);

const BottomTabs: React.FC<Props> = ({ activeTab, onTabPress }) => {
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [isTransferModalVisible, setIsTransferModalVisible] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const { quickAddActions } = usePreferences();

  React.useEffect(() => {
    const showSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setIsKeyboardVisible(true)
    );
    const hideSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setIsKeyboardVisible(false)
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const { width } = Dimensions.get('window');
  const fabBottom = 32;

  const allFabItems: FabItemProps[] = [
    { label: 'Income', icon: 'plus-circle-outline', onPress: () => { } },
    { label: 'Expense', icon: 'minus-circle-outline', onPress: () => { } },
    { label: 'Transfer', icon: 'swap-horizontal-bold', onPress: () => { } },
    { label: 'Receipt', icon: 'cash-plus', onPress: () => { } },
    { label: 'Payment', icon: 'cash-minus', onPress: () => { } },
  ];

  const visibleFabItems = allFabItems.filter(item =>
    quickAddActions.includes(item.label.toLowerCase())
  );

  const onFabItemPress = (item: FabItemProps) => {
    setIsFabOpen(false);
    if (item.label === 'Transfer') {
      setTimeout(() => setIsTransferModalVisible(true), 50);
    } else if (item.label === 'Income') {
      (navigationRef as any).navigate('AddIncome');
    } else if (item.label === 'Expense') {
      (navigationRef as any).navigate('AddExpense');
    } else if (item.label === 'Receipt') {
      (navigationRef as any).navigate('AddPartyTransaction', { type: 'receipt' });
    } else if (item.label === 'Payment') {
      (navigationRef as any).navigate('AddPartyTransaction', { type: 'payment' });
    } else {
      item.onPress();
    }
  };

  const renderTab = (label: SwipeTabRoutes, icon: string) => {
    const isActive = activeTab === label;
    return (
      <TouchableOpacity style={styles.tab} onPress={() => onTabPress(label)}>
        <MaterialCommunityIcons
          name={icon}
          size={isActive ? 24 : 22}
          color={isActive ? '#0a84ff' : '#666'}
        />
        <Text style={[styles.label, isActive && styles.activeLabel]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <>
      {/* FAB Overlay */}
      {isFabOpen && !isKeyboardVisible && (
        <View style={styles.fabOverlay}>
          {/* Background touchable behind FAB items */}
          <TouchableOpacity
            style={styles.fabOverlayTouchable}
            onPress={() => setIsFabOpen(false)}
          />

          {/* FAB Items */}
          {visibleFabItems.length > 0 ? visibleFabItems.map((item, index) => {
            const totalExtended = visibleFabItems.length;
            const buttonWidth = 56; // Width of each circular button
            const spacing = 16; // Space between buttons
            const totalWidth = (buttonWidth * totalExtended) + (spacing * (totalExtended - 1));
            const startX = (width - totalWidth) / 2; // Center the entire row
            const xPosition = startX + (index * (buttonWidth + spacing));

            // Create a subtle arc - middle buttons are higher
            const normalizedPosition = totalExtended > 1 ? index / (totalExtended - 1) : 0.5;
            const arcHeight = 30 * (1 - Math.pow((normalizedPosition - 0.5) * 2, 2));

            return (
              <View
                key={item.label}
                style={{
                  position: 'absolute',
                  bottom: fabBottom + 32 + arcHeight,
                  left: xPosition,
                  zIndex: 100,
                  alignItems: 'center',
                }}
              >
                <TouchableOpacity
                  style={styles.fabItemCircle}
                  onPress={() => onFabItemPress(item)}
                  activeOpacity={0.8}
                >
                  <MaterialCommunityIcons name={item.icon} size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.fabItemLabel}>{item.label}</Text>
              </View>
            );
          }) : (
            <View style={{ position: 'absolute', bottom: 120, width: '100%', alignItems: 'center' }}>
              <Text style={{ color: '#fff', backgroundColor: 'rgba(0,0,0,0.5)', padding: 10, borderRadius: 10 }}>No actions enabled</Text>
            </View>
          )}
        </View>
      )}

      {/* Bottom Tabs */}
      {!isKeyboardVisible && (
        <View style={styles.container}>
          {renderTab('Dashboard', 'home-variant-outline')}
          {renderTab('Transactions', 'swap-horizontal')}
          <View style={{ width: 70, pointerEvents: 'none' }} />
          {renderTab('Analysis', 'chart-pie')}
          {renderTab('Reports', 'text-box-outline')}
        </View>
      )}

      {/* FAB Button */}
      {!isKeyboardVisible && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setIsFabOpen(prev => !prev)}
          activeOpacity={0.85}
        >
          <MaterialCommunityIcons
            name={isFabOpen ? 'close' : 'plus'}
            size={32}
            color="#fff"
          />
        </TouchableOpacity>
      )}

      {/* Transfer Modal */}
      <Modal
        visible={isTransferModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsTransferModalVisible(false)}
      >
        <TransferModalContent
          onClose={() => setIsTransferModalVisible(false)}
          onSaved={() => setIsTransferModalVisible(false)}
        />
      </Modal>
    </>
  );
};

export default BottomTabs;

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
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 11, color: '#666', marginTop: 2 },
  activeLabel: { color: '#0a84ff', fontWeight: '600' },
  fab: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: 32,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#0a84ff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 12,
    zIndex: 100,
  },
  fabOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.2)', // Added a slight dim to highlight FAB items
    zIndex: 99,
  },
  fabOverlayTouchable: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  fabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0a84ff',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 24,
    elevation: 6,
  },
  fabItemCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0a84ff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  fabItemLabel: {
    color: '#333',
    fontSize: 11,
    marginTop: 4,
    fontWeight: '600',
    textAlign: 'center',
  },
  fabLabel: { color: '#fff', fontSize: 13, marginLeft: 6, fontWeight: '500' },
});
