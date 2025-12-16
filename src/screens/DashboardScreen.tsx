// src/screens/DashboardScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import { ReportService, ReportRange } from '../services/ReportService';

const DashboardScreen: React.FC = () => {
  const [range, setRange] = useState<ReportRange>('this_week'); // default range
  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);

  useEffect(() => {
    loadData(range);
  }, [range]);

  const loadData = async (selectedRange: ReportRange) => {
    try {
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
    <View style={styles.container}>
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
            { color: balance >= 0 ? 'green' : 'red' },
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
            <Text style={styles.label}>Income</Text>
          </View>

          {/* Expense */}
          <View style={styles.incomeExpense}>
            <Text style={styles.arrowDown}>↓</Text>
            <Text style={styles.expenseText}>${expense}</Text>
            <Text style={styles.label}>Expense</Text>
          </View>
        </View>
      </Card>

     
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
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
    color: '#777',
    marginBottom: 4,
  },
  balanceValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
  },

  card: { padding: 16, borderRadius: 12, marginBottom: 24 },
  cardContent: { flexDirection: 'row', justifyContent: 'space-between' },
  incomeExpense: { alignItems: 'center' },
  arrowUp: { fontSize: 24, color: 'green', marginBottom: 4 },
  arrowDown: { fontSize: 24, color: 'red', marginBottom: 4 },
  incomeText: { fontSize: 20, fontWeight: 'bold', color: 'green' },
  expenseText: { fontSize: 20, fontWeight: 'bold', color: 'red' },
  label: { fontSize: 14, color: '#555' },

  widgetContainer: { marginTop: 16 },
  widgetTitle: { fontSize: 18, marginBottom: 8 },
});

export default DashboardScreen;
