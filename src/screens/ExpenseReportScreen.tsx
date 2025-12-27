import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';

import { ExpenseReportRepository, ExpenseReportRow } from '../repositories/ExpenseReportRepository';
import { toSQLDate } from '../helpers/DateHelper';
import { ExportHelper } from '../helpers/ExportHelper';
import { AppColors } from '../constants/Styles';

const ExpenseReportScreen: React.FC = () => {
  const navigation = useNavigation();

  // Search/Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [expenseList, setExpenseList] = useState<ExpenseReportRow[]>([]);
  const [total, setTotal] = useState(0);

  // Default date range: last 30 days
  const today = new Date();
  const lastMonth = new Date();
  lastMonth.setDate(today.getDate() - 30);

  const [fromDate, setFromDate] = useState<Date>(lastMonth);
  const [toDate, setToDate] = useState<Date>(today);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  const loadReport = () => {
    setLoading(true);
    ExpenseReportRepository.getExpenseReport(
      toSQLDate(fromDate) || '',
      toSQLDate(toDate) || '',
      searchQuery,
      (rows, totalSum) => {
        setExpenseList(rows);
        setTotal(totalSum);
        setLoading(false);
      }
    );
  };

  useEffect(() => {
    loadReport();
  }, [fromDate, toDate]);

  const debounceSearch = useCallback(() => {
    const timer = setTimeout(() => {
      loadReport();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, fromDate, toDate]);

  useEffect(() => {
    const cleanup = debounceSearch();
    return cleanup;
  }, [searchQuery]);

  const renderItem = ({ item }: { item: ExpenseReportRow }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.expenseBadge}>
          <Ionicons name="arrow-up-circle" size={12} color="#C62828" />
          <Text style={styles.expenseBadgeText}>EXPENSE</Text>
        </View>
        <Text style={styles.dateText}>{new Date(item.date).toLocaleDateString()}</Text>
      </View>
      <View style={styles.cardBody}>
        <View style={styles.mainInfo}>
          <Text style={styles.noteText} numberOfLines={1}>{item.note || 'No description'}</Text>
          <View style={styles.metaRow}>
            <Ionicons name="folder-outline" size={12} color="#666" />
            <Text style={styles.metaText}>{item.categoryName || 'General'}</Text>
            <Text style={styles.metaSeparator}>•</Text>
            <Ionicons name="wallet-outline" size={12} color="#666" />
            <Text style={styles.metaText}>{item.walletName || 'Native'}</Text>
          </View>
        </View>
        <Text style={styles.amountText}>-₹{item.amount.toFixed(0)}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Expense Spends</Text>
        <TouchableOpacity
          onPress={() => ExportHelper.exportReport('Expense_Report', expenseList)}
          style={styles.actionButton}
        >
          <Ionicons name="download-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <View style={styles.heroSection}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color="#666" />
          <TextInput
            placeholder="Search spends or categories..."
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <View style={styles.dateSelector}>
          <TouchableOpacity style={styles.dateChip} onPress={() => setShowFromPicker(true)}>
            <Text style={styles.dateChipText}>{fromDate.toLocaleDateString()}</Text>
          </TouchableOpacity>
          <Text style={styles.dateArrow}>to</Text>
          <TouchableOpacity style={styles.dateChip} onPress={() => setShowToPicker(true)}>
            <Text style={styles.dateChipText}>{toDate.toLocaleDateString()}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Summary Card - Fixed to Lighter/Smaller */}
      <View style={styles.totalHero}>
        <View style={styles.heroIconBox}>
          <Ionicons name="trending-down" size={20} color="#C62828" />
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.totalLabel}>Total Outflow</Text>
          <Text style={styles.totalValue}>₹{total.toFixed(0)}</Text>
        </View>
      </View>

      <FlatList
        data={expenseList}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listPadding}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" color="#C62828" style={{ marginTop: 40 }} />
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="trending-down-outline" size={64} color="#DDD" />
              <Text style={styles.emptyText}>No expense data found.</Text>
            </View>
          )
        }
      />

      {showFromPicker && <DateTimePicker value={fromDate} mode="date" onChange={(_, d) => { setShowFromPicker(false); if (d) setFromDate(d); }} />}
      {showToPicker && <DateTimePicker value={toDate} mode="date" onChange={(_, d) => { setShowToPicker(false); if (d) setToDate(d); }} />}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#333' },
  actionButton: { padding: 4 },

  heroSection: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 12,
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 14 },
  dateSelector: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12 },
  dateChip: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#F3F4F6', borderRadius: 12 },
  dateChipText: { fontSize: 12, fontWeight: '700', color: '#333' },
  dateArrow: { fontSize: 12, color: '#999', fontWeight: '500' },

  totalHero: {
    margin: 16,
    padding: 16,
    backgroundColor: '#FFEBEE',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  heroIconBox: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  totalLabel: { fontSize: 11, color: '#666', fontWeight: '700', textTransform: 'uppercase' },
  totalValue: { fontSize: 24, fontWeight: '900', color: '#C62828' },

  listPadding: { paddingHorizontal: 16, paddingBottom: 40 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  expenseBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FFEBEE', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  expenseBadgeText: { fontSize: 9, fontWeight: '800', color: '#C62828' },
  dateText: { fontSize: 11, color: '#999' },
  cardBody: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  mainInfo: { flex: 1, marginRight: 16 },
  noteText: { fontSize: 15, fontWeight: '600', color: '#333', marginBottom: 6 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, color: '#666', marginLeft: 2 },
  metaSeparator: { fontSize: 12, color: '#DDD', marginHorizontal: 4 },
  amountText: { fontSize: 18, fontWeight: '800', color: '#C62828' },

  emptyContainer: { alignItems: 'center', marginTop: 40 },
  emptyText: { marginTop: 12, fontSize: 14, color: '#999' },
});

export default ExpenseReportScreen;
