import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { SwipeTabRoutes } from '../navigation/navigationRef';
import TransferModal from '../screens/TransferModal';

type Props = {
  activeTab: SwipeTabRoutes;
  onTabPress: (route: SwipeTabRoutes) => void;
};

type FabItemProps = {
  label: 'Income' | 'Expense' | 'Transfer';
  icon: string;
  style: object;
  onPress: () => void;
};

const FabItem: React.FC<FabItemProps> = ({ label, icon, style, onPress }) => (
  <TouchableOpacity style={[styles.fabItem, style]} onPress={onPress}>
    <MaterialCommunityIcons name={icon} size={20} color="#fff" />
    <Text style={styles.fabLabel}>{label}</Text>
  </TouchableOpacity>
);

const BottomTabs: React.FC<Props> = ({ activeTab, onTabPress }) => {
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [transferModalVisible, setTransferModalVisible] = useState(false);

  const renderTab = (label: SwipeTabRoutes, icon: string) => {
    const isActive = activeTab === label;
    return (
      <TouchableOpacity style={styles.tab} onPress={() => onTabPress(label)}>
        <MaterialCommunityIcons
          name={icon}
          size={isActive ? 24 : 22}
          color={isActive ? '#0a84ff' : '#666'}
        />
        <Text style={[styles.label, isActive && styles.activeLabel]}>{label}</Text>
      </TouchableOpacity>
    );
  };

  const { width } = Dimensions.get('window');
  const fabBottom = 32;
  const fabRadius = 80;

  // FAB items
  const fabItems: FabItemProps[] = [
    { label: 'Income', icon: 'plus-circle-outline', style: {}, onPress: () => console.log('Income') },
    { label: 'Expense', icon: 'minus-circle-outline', style: {}, onPress: () => console.log('Expense') },
    { label: 'Transfer', icon: 'swap-horizontal-bold', style: {}, onPress: () => setTransferModalVisible(true) },
  ];

  const totalItems = fabItems.length;
  const startAngle = -90 - 60;
  const endAngle = -90 + 60;

  return (
    <>
      {/* FAB Overlay */}
      {isFabOpen && (
        <View style={styles.fabOverlay}>
          {fabItems.map((item, index) => {
            const angle = startAngle + (index * (endAngle - startAngle)) / (totalItems - 1);
            const rad = (angle * Math.PI) / 180;
            const x = fabRadius * Math.cos(rad);
            const y = fabRadius * Math.sin(rad);

            return (
              <FabItem
                key={item.label}
                label={item.label}
                icon={item.icon}
                style={{
                  position: 'absolute',
                  bottom: fabBottom + 32,
                  left: width / 2 - 32 + x,
                  transform: [{ translateY: y }],
                }}
                onPress={() => {
                  setIsFabOpen(false);
                  item.onPress();
                }}
              />
            );
          })}
          <TouchableOpacity
            style={styles.fabOverlayTouchable}
            onPress={() => setIsFabOpen(false)}
          />
        </View>
      )}

      {/* Bottom tabs */}
      <View style={styles.container}>
        {renderTab('Dashboard', 'home-variant-outline')}
        {renderTab('Transactions', 'swap-horizontal')}
        <View style={{ width: 70, pointerEvents: 'none' }} />
        {renderTab('Reports', 'chart-line')}
        {renderTab('Settings', 'cog-outline')}
      </View>

      {/* FAB */}
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

      {/* Transfer Modal */}
      <TransferModal
        visible={transferModalVisible}
        onClose={() => setTransferModalVisible(false)}
        onSaved={() => {
          console.log('Transfer saved!');
        }}
      />
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
  fabOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99 },
  fabOverlayTouchable: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  fabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0a84ff',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 24,
    elevation: 6,
  },
  fabLabel: { color: '#fff', fontSize: 13, marginLeft: 6, fontWeight: '500' },
});
