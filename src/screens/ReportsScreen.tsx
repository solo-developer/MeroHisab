// src/screens/ReportsScreen.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';

type ReportItem = {
  key: string;
  title: string;
  icon: string;
  color: string;
};

type ReportSection = {
  title: string;
  data: ReportItem[];
};

const reportSections: ReportSection[] = [
  {
    title: 'Financial Overview',
    data: [
      {
        key: 'wallet-balance',
        title: 'Wallet Balance',
        icon: 'wallet-outline',
        color: '#009688',
      },
      { key: 'income', title: 'Income', icon: 'cash-multiple', color: '#4CAF50' },
      {
        key: 'expense',
        title: 'Expense',
        icon: 'credit-card-minus',
        color: '#F44336',
      },
      {
        key: 'trend',
        title: 'Trend Analysis',
        icon: 'chart-line',
        color: '#2196F3',
      },
    ],
  },
  {
    title: 'Transactions',
    data: [
      {
        key: 'transactions',
        title: 'All Transactions',
        icon: 'file-document-outline',
        color: '#4F8EF7',
      },
      {
        key: 'transfer',
        title: 'Transfers',
        icon: 'swap-horizontal',
        color: '#9C27B0',
      },
      {
        key: 'ledger',
        title: 'By Ledger',
        icon: 'book-open-outline',
        color: '#FFB74D',
      },
      {
        key: 'meta-category',
        title: 'By Category',
        icon: 'folder-outline',
        color: '#795548',
      },
    ],
  },
  {
    title: 'Party Management',
    data: [
      {
        key: 'party',
        title: 'Party Balances',
        icon: 'account-group',
        color: '#3F51B5',
      },
      {
        key: 'payment',
        title: 'Payments',
        icon: 'cash-minus',
        color: '#E91E63',
      },
      {
        key: 'receipt',
        title: 'Receipts',
        icon: 'cash-plus',
        color: '#00BCD4',
      },
    ],
  },
];

const numColumns = 3;
const { width } = Dimensions.get('window');
const CARD_SIZE = (width - 24 * 2 - 16 * (numColumns - 1)) / numColumns;

const ReportsScreen: React.FC = () => {
  const navigation = useNavigation();

  const handlePress = (key: string) => {
    switch (key) {
      case 'wallet-balance':
        navigation.navigate('WalletBalanceReport');
        break;
      case 'income':
        navigation.navigate('IncomeReport');
        break;
      case 'expense':
        navigation.navigate('ExpenseReport');
        break;
      case 'transfer':
        navigation.navigate('TransferReport');
        break;
      case 'ledger':
        navigation.navigate('ReportByLedger');
        break;
      case 'meta-category':
        navigation.navigate('ReportsByMetaCategory');
        break;
      case 'party':
        navigation.navigate('PartyReport');
        break;
      case 'payment':
        navigation.navigate('PaymentReport');
        break;
      case 'receipt':
        navigation.navigate('ReceiptReport');
        break;
      case 'trend':
        navigation.navigate('TrendReport');
        break;
      default:
        console.log('Pressed:', key);
    }
  };

  const renderItem = (item: ReportItem) => (
    <TouchableOpacity
      key={item.key}
      style={styles.card}
      onPress={() => handlePress(item.key)}
      activeOpacity={0.8}
    >
      <View
        style={[styles.iconWrapper, { backgroundColor: item.color }]}
      >
        <Icon name={item.icon} size={24} color="#fff" />
      </View>
      <Text style={styles.cardTitle}>
        {item.title}
      </Text>
    </TouchableOpacity>
  );

  const renderSection = (section: ReportSection) => (
    <View key={section.title} style={styles.section}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      <View style={styles.sectionContent}>
        {section.data.map(item => renderItem(item))}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Reports</Text>
      </View>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {reportSections.map(section => renderSection(section))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ddd',
  },
  headerTitle: { fontSize: 22, fontWeight: '700' },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 120, // Increased to avoid overlap with BottomTabs
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    marginLeft: 4,
  },
  sectionContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: 16,
  },
  card: {
    width: CARD_SIZE,
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: 'center',
    marginBottom: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '600',
    color: '#333'
  },
});

export default ReportsScreen;
