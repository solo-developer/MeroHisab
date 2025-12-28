import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  DeviceEventEmitter,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { ReportService } from '../services/ReportService';
import { ReportRange } from '../helpers/DateHelper';
import { AppColors } from '../constants/Styles';
import { usePreferences } from '../context/PreferencesContext';

const { width } = Dimensions.get('window');

const DashboardScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [range, setRange] = useState<ReportRange>('this_month');
  const [summary, setSummary] = useState({ income: 0, expense: 0 });
  const { quickAddActions, currency } = usePreferences();

  // Quick Links Configuration
  const quickLinks = [
    { label: 'Wallets', icon: 'wallet-outline', screen: 'WalletBalanceReport', color: '#26A69A' }, // Teal
    { label: 'Parties', icon: 'people-outline', screen: 'PartyReport', color: '#AB47BC' }, // Purple
    { label: 'Trends', icon: 'trending-up-outline', screen: 'TrendReport', color: '#FFA726' }, // Orange
    { label: 'Transactions', icon: 'receipt-outline', screen: 'Transactions', color: '#5C6BC0' }, // Indigo
  ];

  const allQuickAddActions = [
    { key: 'income', label: 'Income', icon: 'add-circle', iconType: 'Ionicons', color: '#2E7D32', bgColor: '#E8F5E9', screen: 'AddIncome' },
    { key: 'expense', label: 'Expense', icon: 'remove-circle', iconType: 'Ionicons', color: '#C62828', bgColor: '#FFEBEE', screen: 'AddExpense' },
    { key: 'transfer', label: 'Transfer', icon: 'swap-horizontal', iconType: 'Ionicons', color: '#1565C0', bgColor: '#E3F2FD', screen: 'AddTransferScreen' },
    { key: 'receipt', label: 'Receipt', icon: 'cash-plus', iconType: 'MaterialCommunityIcons', color: '#00BCD4', bgColor: '#E0F7FA', screen: 'AddPartyTransaction', params: { type: 'receipt' } },
    { key: 'payment', label: 'Payment', icon: 'cash-minus', iconType: 'MaterialCommunityIcons', color: '#E91E63', bgColor: '#FCE4EC', screen: 'AddPartyTransaction', params: { type: 'payment' } },
  ];

  const visibleQuickAdd = allQuickAddActions.filter(a => quickAddActions.includes(a.key));

  const loadData = async () => {
    try {
      const summaryData = await ReportService.getIncomeExpense(range);
      setSummary(summaryData);
    } catch (error) {
      console.error('Dashboard loadData error:', error);
    }
  };

  useEffect(() => {
    loadData();
    const subs = [
      DeviceEventEmitter.addListener('transactionAdded', loadData),
      DeviceEventEmitter.addListener('expenseAdded', loadData),
      DeviceEventEmitter.addListener('incomeAdded', loadData),
      DeviceEventEmitter.addListener('transferAdded', loadData),
    ];
    return () => subs.forEach(s => s.remove());
  }, [range]);

  const netBalance = summary.income - summary.expense;

  const renderQuickLink = (link: any, index: number) => (
    <TouchableOpacity
      key={index}
      style={styles.quickLinkCard}
      onPress={() => navigation.navigate(link.screen)}
      activeOpacity={0.7}
    >
      <View style={[styles.iconCircle, { backgroundColor: link.color + '20' }]}>
        <Ionicons name={link.icon} size={24} color={link.color} />
      </View>
      <Text style={styles.quickLinkText}>{link.label}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome Back,</Text>
          <Text style={styles.appName}>MeroHisab</Text>
        </View>
        <TouchableOpacity
          style={styles.settingsBtn}
          onPress={() => navigation.navigate('SettingsStack')}
        >
          <Ionicons name="settings-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Date Filter Tabs */}
        <View style={styles.filterTabs}>
          {['this_month', 'last_month', 'this_week'].map((r) => (
            <TouchableOpacity
              key={r}
              style={[styles.filterTab, range === r && styles.activeFilterTab]}
              onPress={() => setRange(r as ReportRange)}
            >
              <Text style={[styles.filterText, range === r && styles.activeFilterText]}>
                {r.replace('_', ' ').toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Hero Card - Net Balance */}
        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>Net Balance ({range.replace('_', ' ')})</Text>
          <Text style={styles.heroAmount}>
            {currency.symbol} {netBalance.toLocaleString()}
          </Text>
          <View style={styles.heroRow}>
            <View style={styles.heroItem}>
              <View style={styles.heroBadgeIncome}>
                <Ionicons name="arrow-down-outline" size={14} color="#2E7D32" />
              </View>
              <View>
                <Text style={styles.heroItemLabel}>Income</Text>
                <Text style={styles.heroItemValueIncome}>{currency.symbol}{summary.income.toLocaleString()}</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.heroItem}>
              <View style={styles.heroBadgeExpense}>
                <Ionicons name="arrow-up-outline" size={14} color="#C62828" />
              </View>
              <View>
                <Text style={styles.heroItemLabel}>Expense</Text>
                <Text style={styles.heroItemValueExpense}>{currency.symbol}{summary.expense.toLocaleString()}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Shortcuts Grid */}
        <Text style={styles.sectionTitle}>Overview</Text>
        <View style={styles.gridContainer}>
          {quickLinks.map(renderQuickLink)}
        </View>

        {/* Add Actions */}
        <Text style={styles.sectionTitle}>Quick Add</Text>
        <View style={styles.actionRow}>
          {visibleQuickAdd.length > 0 ? (
            visibleQuickAdd.map((action) => (
              <TouchableOpacity
                key={action.key}
                style={[styles.actionBtn, { backgroundColor: action.bgColor }]}
                onPress={() => navigation.navigate(action.screen, action.params)}
              >
                {action.iconType === 'MaterialCommunityIcons' ? (
                  <MaterialCommunityIcons name={action.icon as any} size={24} color={action.color} />
                ) : (
                  <Ionicons name={action.icon as any} size={24} color={action.color} />
                )}
                <Text style={[styles.actionBtnText, { color: action.color }]}>{action.label}</Text>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyActionRow}>
              <Text style={styles.emptyActionText}>No quick add actions enabled</Text>
              <TouchableOpacity onPress={() => navigation.navigate('SettingsStack', { screen: 'CustomizeLayout' })}>
                <Text style={styles.customizeLink}>Customize</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
  },
  greeting: { fontSize: 14, color: '#666', fontWeight: '500' },
  appName: { fontSize: 22, fontWeight: '800', color: AppColors.primary },
  settingsBtn: { padding: 4 },

  scrollContent: { paddingHorizontal: 20, paddingBottom: 100 },

  filterTabs: { flexDirection: 'row', marginBottom: 20, backgroundColor: '#F0F0F0', borderRadius: 12, padding: 4 },
  filterTab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 10 },
  activeFilterTab: { backgroundColor: '#fff', elevation: 2 },
  filterText: { fontSize: 11, fontWeight: '600', color: '#888' },
  activeFilterText: { color: '#333', fontWeight: '800' },

  heroCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  heroLabel: { fontSize: 13, color: '#888', fontWeight: '600', marginBottom: 8, textAlign: 'center', textTransform: 'uppercase' },
  heroAmount: { fontSize: 36, color: '#333', fontWeight: '900', textAlign: 'center', marginBottom: 24 },

  heroRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  heroItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  heroBadgeIncome: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#E8F5E9', justifyContent: 'center', alignItems: 'center' },
  heroBadgeExpense: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#FFEBEE', justifyContent: 'center', alignItems: 'center' },
  heroItemLabel: { fontSize: 11, color: '#999', fontWeight: '600' },
  heroItemValueIncome: { fontSize: 16, fontWeight: '800', color: '#2E7D32' },
  heroItemValueExpense: { fontSize: 16, fontWeight: '800', color: '#C62828' },
  divider: { width: 1, height: 30, backgroundColor: '#EEE' },

  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#333', marginBottom: 12 },

  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  quickLinkCard: {
    width: (width - 40 - 12) / 2, // 2 columns
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  iconCircle: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  quickLinkText: { fontSize: 14, fontWeight: '600', color: '#333' },

  actionRow: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  actionBtn: { width: (width - 40 - 24) / 3, paddingVertical: 16, borderRadius: 16, alignItems: 'center', gap: 8, marginBottom: 12 },
  actionBtnText: { fontSize: 13, fontWeight: '700' },
  emptyActionRow: { flex: 1, alignItems: 'center', paddingVertical: 20 },
  emptyActionText: { fontSize: 14, color: '#999', marginBottom: 8 },
  customizeLink: { color: AppColors.primary, fontWeight: '700' },
});

export default DashboardScreen;
