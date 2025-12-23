// src/screens/IncomeReportScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';

import {
  IncomeReportRepository,
  IncomeReportRow,
} from '../repositories/IncomeReportRepository';
import { toSQLDate } from '../helpers/DateHelper';
import { AppColors, GlobalStyles } from '../constants/Styles';

const IncomeReportScreen: React.FC = () => {
  const navigation = useNavigation();

    // Default date range: last 7 days
  const today = new Date();
  const lastWeek = new Date();
  lastWeek.setDate(today.getDate() - 7);

  const [fromDate, setFromDate] = useState<Date>(lastWeek);
  const [toDate, setToDate] = useState<Date>(today);

  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  const [incomeList, setIncomeList] = useState<IncomeReportRow[]>([]);
  const [total, setTotal] = useState(0);

  const loadReport = () => {
    IncomeReportRepository.getIncomeReport(
      toSQLDate(fromDate) || '',
      toSQLDate(toDate) || '',
      rows => {
        setIncomeList(rows);
        const sum = rows.reduce((acc, r) => acc + r.amount, 0);
        setTotal(sum);
      },
    );
  };

  useEffect(() => {
    loadReport();
  }, []);

  const renderItem = ({ item }: { item: IncomeReportRow }) => (
    <View style={GlobalStyles.listItem}>
      <View style={styles.left}>
        <Text style={GlobalStyles.subText}>
          {new Date(item.date).toLocaleDateString()}
        </Text>
        <Text style={[GlobalStyles.text, { fontWeight: '500' }]}>
          {item.categoryName || 'N/A'} • {item.walletName || 'N/A'}
        </Text>
        {item.note ? <Text style={GlobalStyles.subText}>{item.note}</Text> : null}
      </View>

      <Text style={[styles.amount, { color: AppColors.success }]}>
        {item.amount.toFixed(2)}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={GlobalStyles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#333" />
        </TouchableOpacity>

        <Text style={GlobalStyles.headerTitle}>Income Report</Text>

        <TouchableOpacity>
          <Ionicons name="download-outline" size={22} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <View style={styles.filters}>
        <TouchableOpacity
          style={styles.dateField}
          onPress={() => setShowFromPicker(true)}
        >
          <Ionicons name="calendar-outline" size={16} color="#666" />
          <Text style={styles.dateText}>
            {fromDate ? fromDate.toLocaleDateString() : 'From date'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.dateField}
          onPress={() => setShowToPicker(true)}
        >
          <Ionicons name="calendar-outline" size={16} color="#666" />
          <Text style={styles.dateText}>
            {toDate ? toDate.toLocaleDateString() : 'To date'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.applyBtn} onPress={loadReport}>
          <Text style={styles.applyText}>Apply</Text>
        </TouchableOpacity>
      </View>

      {/* Total */}
      <View style={styles.totalBar}>
        <Text style={styles.totalLabel}>Total Income</Text>
        <Text style={styles.totalAmount}>{total.toFixed(2)}</Text>
      </View>

      {/* List */}
      <FlatList
        data={incomeList}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        contentContainerStyle={{ padding: 12 }}
        ListEmptyComponent={
          <Text style={GlobalStyles.listEmptyText}>No income records found</Text>
        }
      />

      {/* Date Pickers */}
      {showFromPicker && (
        <DateTimePicker
          value={fromDate || new Date()}
          mode="date"
          display="default"
          onChange={(_, d) => {
            setShowFromPicker(false);
            if (d) setFromDate(d);
          }}
        />
      )}

      {showToPicker && (
        <DateTimePicker
          value={toDate || new Date()}
          mode="date"
          display="default"
          onChange={(_, d) => {
            setShowToPicker(false);
            if (d) setToDate(d);
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AppColors.backgroundLight },

  filters: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    gap: 8,
  },
  dateField: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    flex: 1,
    gap: 6,
  },
  dateText: { fontSize: 13, color: '#333' },

  applyBtn: {
    backgroundColor: AppColors.success,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  applyText: { color: '#fff', fontWeight: '600', fontSize: 13 },

  totalBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#E8F5E9',
  },
  totalLabel: { fontSize: 14, fontWeight: '600' },
  totalAmount: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2E7D32',
  },

  left: { flex: 1, paddingRight: 8 },

  amount: {
    fontSize: 14,
    fontWeight: '700',
    color: AppColors.success,
  },
});

export default IncomeReportScreen;
