import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Dimensions,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
      { key: 'wallet-balance', title: 'Wallet Balance', icon: 'wallet-outline', color: '#009688' }, // Teal
      { key: 'income', title: 'Income Analysis', icon: 'arrow-down-circle-outline', color: '#4CAF50' }, // Green
      { key: 'expense', title: 'Expense Analysis', icon: 'arrow-up-circle-outline', color: '#F44336' }, // Red
    ],
  },
  {
    title: 'Transactions',
    data: [
      { key: 'transactions', title: 'All Transactions', icon: 'receipt-outline', color: '#5C6BC0' }, // Indigo
      { key: 'transfer', title: 'Transfers', icon: 'swap-horizontal-outline', color: '#AB47BC' }, // Purple
      { key: 'ledger', title: 'By Ledger', icon: 'book-outline', color: '#FFB74D' }, // Orange
      { key: 'meta-category', title: 'By Category', icon: 'folder-open-outline', color: '#795548' }, // Brown
    ],
  },
  {
    title: 'Party Management',
    data: [
      { key: 'party', title: 'Party Balances', icon: 'people-outline', color: '#3F51B5' },
      { key: 'payment', title: 'Payments Made', icon: 'remove-circle-outline', color: '#E91E63' },
      { key: 'receipt', title: 'Receipts', icon: 'add-circle-outline', color: '#00BCD4' },
    ],
  },
];

const { width } = Dimensions.get('window');
// 2 columns with padding
const GAP = 16;
const PADDING = 20;
const ITEM_WIDTH = (width - (PADDING * 2) - GAP) / 2;

const ReportsScreen: React.FC = () => {
  const navigation = useNavigation();

  const handlePress = (key: string) => {
    const nav = navigation as any;
    switch (key) {
      case 'wallet-balance': nav.navigate('WalletBalanceReport'); break;
      case 'income': nav.navigate('IncomeReport'); break;
      case 'expense': nav.navigate('ExpenseReport'); break;
      case 'transfer': nav.navigate('TransferReport'); break;
      case 'ledger': nav.navigate('ReportByLedger'); break;
      case 'meta-category': nav.navigate('ReportsByMetaCategory'); break;
      case 'party': nav.navigate('PartyReport'); break;
      case 'payment': nav.navigate('PaymentReport'); break;
      case 'receipt': nav.navigate('ReceiptReport'); break;
      case 'transactions': nav.navigate('AllTransactionsReport'); break;
      default: console.log('Pressed:', key);
    }
  };

  const renderItem = (item: ReportItem) => (
    <TouchableOpacity
      key={item.key}
      style={styles.card}
      onPress={() => handlePress(item.key)}
      activeOpacity={0.7}
    >
      <View style={[styles.iconWrapper, { backgroundColor: item.color + '20' }]}>
        <Ionicons name={item.icon} size={28} color={item.color} />
      </View>
      <Text style={styles.cardTitle}>{item.title}</Text>
      <View style={styles.arrowIcon}>
        <Ionicons name="chevron-forward" size={16} color="#ccc" />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F7FA" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Reports</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {reportSections.map(section => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title.toUpperCase()}</Text>
            <View style={styles.grid}>
              {section.data.map(item => renderItem(item))}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F5F7FA' },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#F5F7FA',
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: '800',
    color: '#1a1a1a',
    letterSpacing: -0.5,
  },
  scrollContent: {
    paddingHorizontal: PADDING,
    paddingBottom: 100,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#888',
    marginBottom: 12,
    letterSpacing: 1,
    marginLeft: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GAP,
  },
  card: {
    width: ITEM_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    justifyContent: 'space-between',
    minHeight: 110,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
    lineHeight: 20,
    flex: 1,
  },
  arrowIcon: {
    position: 'absolute',
    bottom: 16,
    right: 16,
  }
});

export default ReportsScreen;
