// src/screens/DashboardScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  DeviceEventEmitter,
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
  { label: 'Budget Progress', icon: '📊', screen: 'BudgetOverview' },
  { label: 'Trend Analysis', icon: '📈', screen: 'TrendReport' },
  { label: 'Party Balance', icon: '👥', screen: 'PartyReport' },
];

const numColumns = 3; // max 3 per row
const spacing = 12;
const screenWidth = Dimensions.get('window').width;
const buttonWidth = (screenWidth - 16 * 2 - spacing * (numColumns - 1)) / numColumns;

const DashboardScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [range, setRange] = useState<ReportRange>('this_month');
  const [summary, setSummary] = useState({ income: 0, expense: 0 });

  const loadData = async () => {
    try {
      const data = await ReportService.getIncomeExpense(range);
      setSummary(data);
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
    ];

    return () => {
      subs.forEach(s => s.remove());
    };
  }, [range]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={range}
            onValueChange={(itemValue) => setRange(itemValue as ReportRange)}
            style={styles.picker}
            dropdownIconColor={AppColors.primary}
          >
            <Picker.Item label="This Week" value="this_week" />
            <Picker.Item label="This Month" value="this_month" />
            <Picker.Item label="Last Month" value="previous_month" />
          </Picker>
        </View>
      </View>

      <View style={styles.summaryRow}>
        <Card style={[styles.card, { borderTopColor: AppColors.success, borderTopWidth: 4 }]}>
          <Card.Content>
            <Text style={styles.cardLabel}>Income</Text>
            <Text style={[styles.cardValue, { color: AppColors.success }]}>
              ₹ {summary.income.toLocaleString()}
            </Text>
          </Card.Content>
        </Card>

        <Card style={[styles.card, { borderTopColor: AppColors.danger, borderTopWidth: 4 }]}>
          <Card.Content>
            <Text style={styles.cardLabel}>Expense</Text>
            <Text style={[styles.cardValue, { color: AppColors.danger }]}>
              ₹ {summary.expense.toLocaleString()}
            </Text>
          </Card.Content>
        </Card>
      </View>

      <Card style={[styles.card, { marginTop: 16, borderTopColor: AppColors.primary, borderTopWidth: 4 }]}>
        <Card.Content>
          <Text style={styles.cardLabel}>Net Balance</Text>
          <Text style={[styles.cardValue, { color: '#000', fontSize: 24 }]}>
            ₹ {(summary.income - summary.expense).toLocaleString()}
          </Text>
        </Card.Content>
      </Card>

      <Text style={styles.sectionTitle}>Quick Links</Text>
      <View style={styles.quickLinksContainer}>
        {quickLinks.map((link, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.quickLinkButton, { width: buttonWidth }]}
            onPress={() => navigation.navigate(link.screen)}
          >
            <Text style={styles.quickLinkIcon}>{link.icon}</Text>
            <Text style={styles.quickLinkText}>{link.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    height: 50,
    justifyContent: 'center',
    width: 160,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 2,
  },
  cardLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 30,
    marginBottom: 16,
    color: '#333',
  },
  quickLinksContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing,
  },
  quickLinkButton: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 1,
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 4,
  },
  quickLinkIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  quickLinkText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#444',
    textAlign: 'center',
  },
});

export default DashboardScreen;
