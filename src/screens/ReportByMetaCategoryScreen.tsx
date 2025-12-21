// src/screens/ReportsByMetaCategoryScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  ScrollView,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import RNPickerSelect from 'react-native-picker-select';

import MetaCategoryRepository, { MetaCategory } from '../repositories/MetaCategoryRepository';
import { Ledger } from '../repositories/LedgerRepository';

const toSQLDate = (date?: Date) => date ? date.toISOString().split('T')[0] : undefined;

interface MetaCategoryLedgerRow {
  ledgerName: string;
  totalIncome: number;
  totalExpense: number;
}

const ReportByMetaCategoryScreen: React.FC = () => {
  const navigation = useNavigation();

  // Default date range: last 7 days
  const today = new Date();
  const lastWeek = new Date();
  lastWeek.setDate(today.getDate() - 7);

  const [fromDate, setFromDate] = useState<Date>(lastWeek);
  const [toDate, setToDate] = useState<Date>(today);

  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  const [metaCategories, setMetaCategories] = useState<MetaCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>(undefined);

  const [ledgerReport, setLedgerReport] = useState<MetaCategoryLedgerRow[]>([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [loading, setLoading] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);

  // Load meta categories
  useEffect(() => {
    const loadCategories = async () => {
      const cats = await MetaCategoryRepository.getAll();
      setMetaCategories(cats);
    };
    loadCategories();
  }, []);

  // Load report
  const loadReport = async () => {
  if (!selectedCategoryId) return;
  setLoading(true);

  const rows = await MetaCategoryRepository.getReportByMetaCategory(
    selectedCategoryId,
    toSQLDate(fromDate),
    toSQLDate(toDate)
  );

  setLedgerReport(rows);

  // Compute totals
  const incomeTotal = rows.reduce((acc, r) => acc + r.totalIncome, 0);
  const expenseTotal = rows.reduce((acc, r) => acc + r.totalExpense, 0);
  setTotalIncome(incomeTotal);
  setTotalExpense(expenseTotal);

  setLoading(false);
};

  useEffect(() => {
    loadReport();
  }, [selectedCategoryId, fromDate, toDate]);

  const renderItem = ({ item }: { item: MetaCategoryLedgerRow }) => (
    <View style={styles.row}>
      <View style={styles.left}>
        <Text style={styles.meta}>{item.ledgerName}</Text>
      </View>
      <View style={styles.right}>
        <Text style={[styles.amount, styles.positive]}>₹ {item.totalIncome.toFixed(2)}</Text>
        <Text style={[styles.amount, styles.negative]}>₹ {item.totalExpense.toFixed(2)}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Meta Category Report</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Ionicons name="filter-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Total Bar */}
      <View style={styles.totalBar}>
        <Text style={styles.totalLabel}>Total Income</Text>
        <Text style={[styles.totalAmount, styles.positive]}>₹ {totalIncome.toFixed(2)}</Text>
        <Text style={styles.totalLabel}>Total Expense</Text>
        <Text style={[styles.totalAmount, styles.negative]}>₹ {totalExpense.toFixed(2)}</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={ledgerReport}
          keyExtractor={item => item.ledgerName}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 12 }}
          ListEmptyComponent={<Text style={styles.emptyText}>No records found</Text>}
        />
      )}

      {/* Filter Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <View style={styles.dragHandle} />
                <ScrollView>
                  <Text style={styles.modalTitle}>Filter Report</Text>

                  {/* Date Range */}
                  <Text style={styles.label}>From Date</Text>
                  <TouchableOpacity
                    style={styles.dateField}
                    onPress={() => setShowFromPicker(true)}
                  >
                    <Ionicons name="calendar-outline" size={16} color="#666" />
                    <Text style={styles.dateText}>{fromDate.toLocaleDateString()}</Text>
                  </TouchableOpacity>

                  <Text style={styles.label}>To Date</Text>
                  <TouchableOpacity
                    style={styles.dateField}
                    onPress={() => setShowToPicker(true)}
                  >
                    <Ionicons name="calendar-outline" size={16} color="#666" />
                    <Text style={styles.dateText}>{toDate.toLocaleDateString()}</Text>
                  </TouchableOpacity>

                  {/* Meta Category Picker */}
                  <Text style={styles.label}>Meta Category</Text>
                  <RNPickerSelect
                    placeholder={{ label: 'Select Meta Category', value: undefined }}
                    value={selectedCategoryId}
                    onValueChange={value => setSelectedCategoryId(Number(value))}
                    items={metaCategories.map(c => ({ label: c.name, value: c.id }))}
                    style={pickerSelectStyles}
                  />

                  <TouchableOpacity
                    style={[styles.applyBtn, { marginTop: 20 }]}
                    onPress={() => {
                      loadReport();
                      setModalVisible(false);
                    }}
                  >
                    <Text style={styles.applyText}>Apply</Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Date Pickers */}
      {showFromPicker && (
        <DateTimePicker
          value={fromDate}
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
          value={toDate}
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

export default ReportByMetaCategoryScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },

  header: {
    height: 50,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    elevation: 2,
  },
  headerTitle: { fontSize: 16, fontWeight: '700' },

  totalBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#E8F5E9',
    marginTop: 8,
  },
  totalLabel: { fontSize: 14, fontWeight: '600' },
  totalAmount: { fontSize: 15, fontWeight: '700' },

  row: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  left: { flex: 1, paddingRight: 8 },
  right: { alignItems: 'flex-end' },
  meta: { fontSize: 13, fontWeight: '500' },
  amount: { fontSize: 14, fontWeight: '700' },
  positive: { color: '#4CAF50' },
  negative: { color: '#F44336' },

  emptyText: { textAlign: 'center', marginTop: 40, color: '#777' },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopRightRadius: 16,
    borderTopLeftRadius: 16,
    maxHeight: '80%',
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#ccc',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  dateField: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    gap: 6,
    marginTop: 4,
  },
  dateText: { fontSize: 13, color: '#333' },
  label: { fontSize: 12, fontWeight: '600', color: '#555', marginTop: 12 },
  applyBtn: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  applyText: { color: '#fff', fontWeight: '600', fontSize: 14 },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 14,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    color: '#333',
    marginTop: 4,
  },
  inputAndroid: {
    fontSize: 14,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    color: '#333',
    marginTop: 4,
  },
});
