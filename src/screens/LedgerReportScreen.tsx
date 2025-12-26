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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import RNPickerSelect from 'react-native-picker-select';

import {
  LedgerReportRepository,
  LedgerReportRow,
  LedgerFilterType,
} from '../repositories/LedgerReportRepository';

import { LedgerRepository } from '../repositories/LedgerRepository';
import CategoryRepository from '../repositories/CategoryRepository';
import WalletRepository from '../repositories/WalletRepository';

import { toSQLDate } from '../helpers/DateHelper';
import { ExportHelper } from '../helpers/ExportHelper';

const LedgerReportScreen: React.FC = () => {
  const navigation = useNavigation();

  // Default date range: last 7 days
  const today = new Date();
  const lastWeek = new Date();
  lastWeek.setDate(today.getDate() - 6);

  const [fromDate, setFromDate] = useState<Date>(lastWeek);
  const [toDate, setToDate] = useState<Date>(today);

  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  const [filterType, setFilterType] = useState<LedgerFilterType>('ALL');
  const [filterId, setFilterId] = useState<number | undefined>();
  const [secondaryOptions, setSecondaryOptions] = useState<
    { id?: number; name: string }[]
  >([]);

  const [reportList, setReportList] = useState<LedgerReportRow[]>([]);
  const [total, setTotal] = useState(0);

  const [modalVisible, setModalVisible] = useState(false);

  /** Load secondary dropdown options */
  const loadSecondaryOptions = async () => {
    setFilterId(undefined);
    if (filterType === 'LEDGER') {
      const ledgers = await LedgerRepository.getAll();
      setSecondaryOptions(ledgers.map(l => ({ id: l.id, name: l.name })));
    } else if (filterType === 'CATEGORY') {
      const categories = await CategoryRepository.getAll();
      setSecondaryOptions(categories.map(c => ({ id: c.id, name: c.name })));
    } else if (filterType === 'WALLET') {
      const wallets = await WalletRepository.getAll();
      setSecondaryOptions(wallets.map(w => ({ id: w.id, name: w.name })));
    } else {
      setSecondaryOptions([]);
    }
  };

  useEffect(() => {
    loadSecondaryOptions();
  }, [filterType]);

  /** Load ledger report */
  const loadReport = async () => {
    const rows = await LedgerReportRepository.getReport(
      toSQLDate(fromDate) || '',
      toSQLDate(toDate) || '',
      filterType,
      filterId,
    );
    setReportList(rows);
    setTotal(rows.reduce((acc, r) => acc + r.amount, 0));
  };

  useEffect(() => {
    loadReport();
  }, []);

  const renderItem = ({ item }: { item: LedgerReportRow }) => (
    <View style={styles.row}>
      <View style={styles.left}>
        <Text style={styles.date}>
          {new Date(item.date).toLocaleDateString()}
        </Text>
        <Text style={styles.meta}>{item.ledgerName || 'N/A'}</Text>
      </View>

      <Text
        style={[
          styles.amount,
          item.amount >= 0 ? styles.positive : styles.negative,
        ]}
      >
        {item.amount.toFixed(2)}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ledger Report</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity
            onPress={() => ExportHelper.exportReport('Ledger Report', reportList)}
            style={{ marginRight: 15 }}
          >
            <Ionicons name="download-outline" size={22} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Ionicons name="filter-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Total */}
      <View style={styles.totalBar}>
        <Text style={styles.totalLabel}>Total Amount</Text>
        <Text
          style={[
            styles.totalAmount,
            total >= 0 ? styles.positive : styles.negative,
          ]}
        >
          {total.toFixed(2)}
        </Text>
      </View>

      {/* Ledger List */}
      <FlatList
        data={reportList}
        keyExtractor={item => `${item.date}-${item.ledgerId}`}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        contentContainerStyle={{ padding: 12 }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No records found</Text>
        }
      />

      {/* Filter Modal as Bottom Sheet */}
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
                {/* Drag handle */}
                <View style={styles.dragHandle} />

                <ScrollView>
                  <Text style={styles.modalTitle}>Filter Ledger Report</Text>

                  {/* Date Range */}
                  <Text style={styles.label}>From Date</Text>
                  <TouchableOpacity
                    style={styles.dateField}
                    onPress={() => setShowFromPicker(true)}
                  >
                    <Ionicons name="calendar-outline" size={16} color="#666" />
                    <Text style={styles.dateText}>
                      {fromDate ? fromDate.toLocaleDateString() : 'Select Date'}
                    </Text>
                  </TouchableOpacity>

                  <Text style={styles.label}>To Date</Text>
                  <TouchableOpacity
                    style={styles.dateField}
                    onPress={() => setShowToPicker(true)}
                  >
                    <Ionicons name="calendar-outline" size={16} color="#666" />
                    <Text style={styles.dateText}>
                      {toDate ? toDate.toLocaleDateString() : 'Select Date'}
                    </Text>
                  </TouchableOpacity>

                  {/* Filter Type */}
                  <Text style={styles.label}>Filter Type</Text>
                  <RNPickerSelect
                    placeholder={{ label: 'Select Filter Type', value: 'ALL' }}
                    value={filterType}
                    onValueChange={value =>
                      setFilterType(value as LedgerFilterType)
                    }
                    items={[
                      { label: 'All', value: 'ALL' },
                      { label: 'Ledger', value: 'LEDGER' },
                      { label: 'Category', value: 'CATEGORY' },
                      { label: 'Wallet', value: 'WALLET' },
                    ]}
                    style={pickerSelectStyles}
                  />

                  {filterType !== 'ALL' && (
                    <>
                      <Text style={styles.label}>Select Option</Text>
                      <RNPickerSelect
                        placeholder={{ label: 'Select...', value: undefined }}
                        value={filterId}
                        onValueChange={value => setFilterId(Number(value))}
                        items={secondaryOptions.map(opt => ({
                          label: opt.name,
                          value: opt.id,
                        }))}
                        style={pickerSelectStyles}
                      />
                    </>
                  )}

                  {/* Apply Button */}
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
  totalAmount: { fontSize: 15, fontWeight: '700', color: '#2E7D32' },

  row: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  left: { flex: 1, paddingRight: 8 },
  date: { fontSize: 12, color: '#666' },
  meta: { fontSize: 13, fontWeight: '500' },

  amount: { fontSize: 14, fontWeight: '700', color: '#4CAF50' },
  positive: { color: '#2E7D32' },
  negative: { color: '#C62828' },

  emptyText: { textAlign: 'center', marginTop: 40, color: '#777' },

  // Modal styles
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

export default LedgerReportScreen;
