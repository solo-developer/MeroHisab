// src/screens/ReportsScreen.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';

const reportOptions = [
  {
    key: 'transactions',
    title: 'Transactions',
    icon: 'file-document-outline',
    color: '#4F8EF7',
  },
  {
    key: 'ledger',
    title: 'By Ledger',
    icon: 'book-open-outline',
    color: '#FFB74D',
  },
  { key: 'income', title: 'Income', icon: 'cash-multiple', color: '#4CAF50' },
  {
    key: 'expense',
    title: 'Expense',
    icon: 'credit-card-minus',
    color: '#F44336',
  },
  {
    key: 'transfer',
    title: 'Transfer',
    icon: 'swap-horizontal',
    color: '#9C27B0',
  },
];

const numColumns = 3;
const { width } = Dimensions.get('window');
const CARD_SIZE = (width - 24 * 2 - 16 * (numColumns - 1)) / numColumns;

const ReportsScreen: React.FC = () => {
  const navigation = useNavigation();

  const handlePress = (key: string) => {
    console.log('Pressed:', key);
  };

  const renderItem = ({ item }: { item: (typeof reportOptions)[0] }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handlePress(item.key)}
      activeOpacity={0.7}
    >
      <View
        style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}
      >
        <Icon name={item.icon} size={28} color={item.color} />
      </View>
      <Text style={[styles.cardTitle, { color: item.color }]}>
        {item.title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Reports</Text>
      </View>
      <FlatList
        data={reportOptions}
        renderItem={renderItem}
        keyExtractor={item => item.key}
        numColumns={numColumns}
        columnWrapperStyle={styles.row}
        contentContainerStyle={{ paddingBottom: 24, marginTop:20 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  row: { justifyContent: 'space-between', marginBottom: 16 },
  header: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ddd',
  },
  headerTitle: { fontSize: 22, fontWeight: '700' },
  card: {
    width: CARD_SIZE,
    alignItems: 'center',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30, // circle
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: { fontSize: 14, textAlign: 'center', fontWeight: '500' },
});

export default ReportsScreen;
