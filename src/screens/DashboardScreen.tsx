// src/screens/DashboardScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Card } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import { ReportService } from '../services/ReportService';
import { ReportRange } from '../helpers/DateHelper';
import { AppColors, GlobalStyles } from '../constants/Styles';

const quickLinks = [
  { label: 'Wallet Balance', icon: '💰', screen: 'WalletBalanceReport' },
  { label: 'Transactions', icon: '🧾', screen: 'Transactions' },
  { label: 'Reports', icon: '📊', screen: 'Reports' },
  // Add more links here
];

const numColumns = 3; // max 3 per row
const spacing = 12;
const screenWidth = Dimensions.get('window').width;
const buttonWidth = (screenWidth - 16 * 2 - spacing * (numColumns - 1)) / numColumns;

const DashboardScreen: React.FC = () => {
  const navigation = useNavigation();

  const [range, setRange] = useState<ReportRange>('this_week'); // default range
  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);

  useEffect(() => {
    loadData(range);
  }, [range]);

  const loadData = async (selectedRange: ReportRange) => {
    try {
      // Replace with actual from/to dates if needed
      const report = await ReportService.getIncomeExpense(selectedRange);
      setIncome(report.income);
      setExpense(report.expense);
    } catch (error) {
      console.error('Error loading report:', error);
      setIncome(0);
      setExpense(0);
    }
  };

  const balance = income - expense;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 24 }}>
      {/* Dropdown for range selection */}
      <View style={styles.dropdownContainer}>
        <Picker
          selectedValue={range}
          onValueChange={itemValue => setRange(itemValue as ReportRange)}
          style={styles.picker}
        >
          <Picker.Item label="This Week" value="this_week" />
          <Picker.Item label="This Month" value="this_month" />
          <Picker.Item label="Previous Month" value="previous_month" />
        </Picker>
      </View>

      {/* Accounts Balance */}
      <View style={styles.balanceContainer}>
        <Text style={styles.balanceLabel}>Accounts Balance</Text>
        <Text
          style={[
            styles.balanceValue,
            { color: balance >= 0 ? AppColors.success : AppColors.danger },
          ]}
        >
          ${balance}
        </Text>
      </View>

      {/* Income / Expense Card */}
      <Card style={styles.card}>
        <View style={styles.cardContent}>
          {/* Income */}
          <View style={styles.incomeExpense}>
            <Text style={styles.arrowUp}>↑</Text>
            <Text style={styles.incomeText}>${income}</Text>
            <Text style={GlobalStyles.subText}>Income</Text>
          </View>

          {/* Expense */}
          <View style={styles.incomeExpense}>
            <Text style={styles.arrowDown}>↓</Text>
            <Text style={styles.expenseText}>${expense}</Text>
            <Text style={GlobalStyles.subText}>Expense</Text>
          </View>
        </View>
      </Card>

      {/* Quick Links */}
      <View style={styles.quickLinksContainer}>
        <Text style={styles.quickLinksTitle}>Quick Links</Text>
        <View style={styles.quickLinksGrid}>
          {quickLinks.map((link, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.quickLinkItem, { width: buttonWidth }]}
              onPress={() => navigation.navigate(link.screen as never)}
            >
              <Text style={styles.quickLinkIcon}>{link.icon}</Text>
              <Text style={styles.quickLinkText}>{link.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.backgroundLight,
    paddingHorizontal: 16,
    paddingTop: 40,
  },
  dropdownContainer: {
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  picker: { height: 50, width: '100%' },

  /* Accounts Balance */
  balanceContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
  },
  balanceLabel: {
    fontSize: 14,
    color: AppColors.textSecondary,
    marginBottom: 4,
  },
  balanceValue: {
    fontSize: 24,
    fontWeight: '700',
  },

  /* Income / Expense Card */
  card: { padding: 16, borderRadius: 12, marginBottom: 24, backgroundColor: '#fff' },
  cardContent: { flexDirection: 'row', justifyContent: 'space-between' },
  incomeExpense: { alignItems: 'center' },
  arrowUp: { fontSize: 24, color: AppColors.success, marginBottom: 4 },
  arrowDown: { fontSize: 24, color: AppColors.danger, marginBottom: 4 },
  incomeText: { fontSize: 20, fontWeight: 'bold', color: AppColors.success },
  expenseText: { fontSize: 20, fontWeight: 'bold', color: AppColors.danger },
  label: { fontSize: 14, color: '#555' },

  /* Quick Links */
  quickLinksContainer: { marginTop: 16 },
  quickLinksTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8, color: AppColors.text },
  quickLinksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickLinkItem: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
  },
  quickLinkIcon: { fontSize: 28 },
  quickLinkText: { fontSize: 14, marginTop: 6, textAlign: 'center', color: AppColors.primary },
});

export default DashboardScreen;
