import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  ScrollView,
  TouchableWithoutFeedback,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
import { AppColors } from '../constants/Styles';

const PAGE_SIZE = 50;

const LedgerReportScreen: React.FC = () => {
  const navigation = useNavigation();

  // Search/Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  // Pagination
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // Default date range: last 30 days
  const today = new Date();
  const lastMonth = new Date();
  lastMonth.setDate(today.getDate() - 30);

  const [fromDate, setFromDate] = useState<Date>(lastMonth);
  const [toDate, setToDate] = useState<Date>(today);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  const [filterType, setFilterType] = useState<LedgerFilterType>('ALL');
  const [filterId, setFilterId] = useState<number | undefined>();
  const [secondaryOptions, setSecondaryOptions] = useState<{ id?: number; name: string }[]>([]);

  const [reportList, setReportList] = useState<LedgerReportRow[]>([]);
  const [total, setTotal] = useState(0);
  const [openingBalance, setOpeningBalance] = useState(0);
  const [closingBalance, setClosingBalance] = useState(0);

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

  const resetAndLoad = () => {
    setPage(0);
    setHasMore(true);
    setReportList([]);
    loadReport(0, true);
  };

  const loadReport = async (pageNum: number, isReset: boolean) => {
    if (!isReset && (!hasMore || loadingMore)) return;

    if (isReset) setLoading(true);
    else setLoadingMore(true);

    try {
      const rows = await LedgerReportRepository.getReport(
        toSQLDate(fromDate) || '',
        toSQLDate(toDate) || '',
        filterType,
        filterId,
        searchQuery,
        PAGE_SIZE,
        pageNum * PAGE_SIZE
      );

      if (isReset) {
        setReportList(rows);
        const totalRes = await LedgerReportRepository.getReportTotal(
          toSQLDate(fromDate) || '',
          toSQLDate(toDate) || '',
          filterType,
          filterId,
          searchQuery
        );
        setTotal(totalRes.total);

        const opBal = await LedgerReportRepository.getOpeningBalance(
          toSQLDate(fromDate) || '',
          filterType,
          filterId,
          searchQuery
        );
        setOpeningBalance(opBal);
        setClosingBalance(opBal + totalRes.total);
      } else {
        setReportList(prev => [...prev, ...rows]);
      }

      setHasMore(rows.length === PAGE_SIZE);
      setPage(pageNum);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    resetAndLoad();
  }, [fromDate, toDate, filterType, filterId]);

  const debounceSearch = useCallback(() => {
    const timer = setTimeout(() => {
      resetAndLoad();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, fromDate, toDate, filterType, filterId]);

  useEffect(() => {
    const cleanup = debounceSearch();
    return cleanup;
  }, [searchQuery]);

  const renderItem = ({ item }: { item: LedgerReportRow }) => (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.left}>
          <Text style={styles.dateText}>{new Date(item.date).toLocaleDateString()}</Text>
          <Text style={styles.ledgerName}>{item.ledgerName || 'N/A'}</Text>
        </View>
        <Text style={[styles.amountText, item.amount >= 0 ? styles.positiveColor : styles.negativeColor]}>
          ₹{item.amount.toFixed(0)}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ledger Summary</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() => ExportHelper.exportReport('Ledger_Report', reportList)}
            style={styles.actionButton}
          >
            <Ionicons name="download-outline" size={24} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.actionButton}>
            <Ionicons name="options-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchBox}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color="#666" />
          <TextInput
            placeholder="Search activity or account..."
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <View style={styles.rangeIndicator}>
          <Ionicons name="calendar-outline" size={12} color="#888" />
          <Text style={styles.rangeText}>
            {fromDate.toLocaleDateString()} — {toDate.toLocaleDateString()}
          </Text>
        </View>
      </View>

      {/* Summary Card */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Opening Balance</Text>
            <Text style={[styles.summaryValue, openingBalance >= 0 ? styles.posText : styles.negText]}>
              ₹{openingBalance.toFixed(2)}
            </Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Net Change</Text>
            <Text style={[styles.summaryValue, total >= 0 ? styles.posText : styles.negText]}>
              {total >= 0 ? '+' : ''}₹{total.toFixed(2)}
            </Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Closing Balance</Text>
            <Text style={[styles.summaryValue, closingBalance >= 0 ? styles.posText : styles.negText]}>
              ₹{closingBalance.toFixed(2)}
            </Text>
          </View>
        </View>
      </View>

      <FlatList
        data={reportList}
        keyExtractor={item => `${item.date}-${item.ledgerId}`}
        renderItem={renderItem}
        contentContainerStyle={styles.listPadding}
        onEndReached={() => loadReport(page + 1, false)}
        onEndReachedThreshold={0.5}
        ListFooterComponent={() =>
          loadingMore ? <ActivityIndicator size="small" color={AppColors.primary} style={{ marginVertical: 20 }} /> : null
        }
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" color={AppColors.primary} style={{ marginTop: 40 }} />
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="book-outline" size={64} color="#DDD" />
              <Text style={styles.emptyText}>No records match your criteria.</Text>
            </View>
          )
        }
      />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Refine Ledger</Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Ionicons name="close" size={24} color="#333" />
                  </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                  <Text style={styles.label}>Date Range</Text>
                  <View style={styles.dateRow}>
                    <TouchableOpacity style={styles.dateBtn} onPress={() => setShowFromPicker(true)}>
                      <Text style={styles.dateBtnLabel}>From</Text>
                      <Text style={styles.dateBtnValue}>{fromDate.toLocaleDateString()}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.dateBtn} onPress={() => setShowToPicker(true)}>
                      <Text style={styles.dateBtnLabel}>To</Text>
                      <Text style={styles.dateBtnValue}>{toDate.toLocaleDateString()}</Text>
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.label}>Filter By Object</Text>
                  <RNPickerSelect
                    onValueChange={value => setFilterType(value as LedgerFilterType)}
                    items={[
                      { label: 'All Ledgers', value: 'ALL' },
                      { label: 'Specific Ledger', value: 'LEDGER' },
                      { label: 'Specific Category', value: 'CATEGORY' },
                      { label: 'Specific Wallet', value: 'WALLET' },
                    ]}
                    value={filterType}
                    style={pickerSelectStyles}
                  />

                  {filterType !== 'ALL' && (
                    <>
                      <Text style={styles.label}>Choose {filterType.toLowerCase()}</Text>
                      <RNPickerSelect
                        onValueChange={value => setFilterId(Number(value))}
                        items={secondaryOptions.map(opt => ({ label: opt.name, value: opt.id }))}
                        value={filterId}
                        placeholder={{ label: 'Select...', value: undefined }}
                        style={pickerSelectStyles}
                      />
                    </>
                  )}

                  <TouchableOpacity style={styles.applyBtn} onPress={() => { resetAndLoad(); setModalVisible(false); }}>
                    <Text style={styles.applyBtnText}>Update Results</Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {showFromPicker && (
        <DateTimePicker value={fromDate} mode="date" onChange={(_, d) => { setShowFromPicker(false); if (d) setFromDate(d); }} />
      )}
      {showToPicker && (
        <DateTimePicker value={toDate} mode="date" onChange={(_, d) => { setShowToPicker(false); if (d) setToDate(d); }} />
      )}
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
  headerActions: { flexDirection: 'row' },
  actionButton: { padding: 4, marginLeft: 16 },

  searchBox: {
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
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 14 },
  rangeIndicator: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10, justifyContent: 'center' },
  rangeText: { fontSize: 11, color: '#888', fontWeight: '600' },

  summaryCard: {
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryLabel: { fontSize: 11, color: '#666', marginBottom: 4, fontWeight: '600', textTransform: 'uppercase' },
  summaryValue: { fontSize: 15, fontWeight: '800' },
  posText: { color: '#2E7D32' },
  negText: { color: '#C62828' },
  positiveColor: { color: '#2E7D32' },
  negativeColor: { color: '#C62828' },
  summaryDivider: { width: 1, height: '100%', backgroundColor: '#EEE' },

  listPadding: { paddingHorizontal: 16, paddingBottom: 40 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  left: { flex: 1 },
  dateText: { fontSize: 11, color: '#999', marginBottom: 2 },
  ledgerName: { fontSize: 15, fontWeight: '700', color: '#333' },
  amountText: { fontSize: 16, fontWeight: '800' },

  emptyContainer: { alignItems: 'center', marginTop: 40 },
  emptyText: { marginTop: 12, fontSize: 14, color: '#999' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '800' },
  label: { fontSize: 13, fontWeight: '700', color: '#666', marginTop: 20, marginBottom: 8 },
  dateRow: { flexDirection: 'row', gap: 12 },
  dateBtn: { flex: 1, backgroundColor: '#F3F4F6', padding: 12, borderRadius: 12 },
  dateBtnLabel: { fontSize: 10, color: '#666', textTransform: 'uppercase' },
  dateBtnValue: { fontSize: 14, fontWeight: '600', color: '#333' },
  applyBtn: { backgroundColor: AppColors.primary, paddingVertical: 16, borderRadius: 16, alignItems: 'center', marginTop: 30 },
  applyBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});

const pickerSelectStyles = {
  inputIOS: { fontSize: 15, paddingVertical: 12, paddingHorizontal: 12, backgroundColor: '#F3F4F6', borderRadius: 12, color: '#333', marginTop: 4 },
  inputAndroid: { fontSize: 15, paddingVertical: 8, paddingHorizontal: 12, backgroundColor: '#F3F4F6', borderRadius: 12, color: '#333', marginTop: 4 },
};

export default LedgerReportScreen;
