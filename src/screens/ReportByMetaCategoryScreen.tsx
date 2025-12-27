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

import MetaCategoryRepository, { MetaCategory, MetaCategoryLedgerRow } from '../repositories/MetaCategoryRepository';
import { toSQLDate } from '../helpers/DateHelper';
import { ExportHelper } from '../helpers/ExportHelper';
import { AppColors } from '../constants/Styles';

const ReportByMetaCategoryScreen: React.FC = () => {
  const navigation = useNavigation();

  // Search/Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  // Default date range: last 30 days
  const today = new Date();
  const lastMonth = new Date();
  lastMonth.setDate(today.getDate() - 30);

  const [fromDate, setFromDate] = useState<Date>(lastMonth);
  const [toDate, setToDate] = useState<Date>(today);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  const [metaCategories, setMetaCategories] = useState<MetaCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>(undefined);

  const [ledgerReport, setLedgerReport] = useState<MetaCategoryLedgerRow[]>([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);

  useEffect(() => {
    const loadCategories = async () => {
      const cats = await MetaCategoryRepository.getAll();
      setMetaCategories(cats);
      if (cats.length > 0 && selectedCategoryId === undefined) {
        setSelectedCategoryId(cats[0].id);
      }
    };
    loadCategories();
  }, []);

  const loadReport = async (catId?: number) => {
    const targetId = catId || selectedCategoryId;
    if (!targetId) return;
    setLoading(true);

    try {
      const rows = await MetaCategoryRepository.getReportByMetaCategory(
        targetId,
        toSQLDate(fromDate) || '',
        toSQLDate(toDate) || '',
        searchQuery
      );

      setLedgerReport(rows);
      setTotalIncome(rows.reduce((acc, r) => acc + r.totalIncome, 0));
      setTotalExpense(rows.reduce((acc, r) => acc + r.totalExpense, 0));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, [selectedCategoryId, fromDate, toDate]);

  useEffect(() => {
    const handler = setTimeout(() => {
      loadReport();
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const renderItem = ({ item }: { item: MetaCategoryLedgerRow }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.dateText}>{new Date(item.date).toLocaleDateString()}</Text>
        <Text style={styles.ledgerName}>{item.ledgerName}</Text>
      </View>
      <View style={styles.cardValues}>
        <View style={styles.valueBox}>
          <Text style={styles.valueLabel}>Inflow</Text>
          <Text style={[styles.valueText, styles.positive]}>+₹{item.totalIncome.toFixed(0)}</Text>
        </View>
        <View style={styles.valueBox}>
          <Text style={styles.valueLabel}>Outflow</Text>
          <Text style={[styles.valueText, styles.negative]}>-₹{item.totalExpense.toFixed(0)}</Text>
        </View>
      </View>
    </View>
  );

  const selectedCategoryName = metaCategories.find(c => c.id === selectedCategoryId)?.name || 'Select Group';

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
      {/* Header Bar */}
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Category Analysis</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() => ExportHelper.exportReport('Meta_Report', ledgerReport)}
            style={styles.actionButton}
          >
            <Ionicons name="download-outline" size={24} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.actionButton}>
            <Ionicons name="options-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Meta Category Selection - Prominent Horizontal Scroll */}
      <View style={styles.selectionArea}>
        <Text style={styles.selectionTitle}>Selected Group</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsContainer}>
          {metaCategories.map(cat => (
            <TouchableOpacity
              key={cat.id}
              onPress={() => setSelectedCategoryId(cat.id)}
              style={[
                styles.tab,
                selectedCategoryId === cat.id && styles.activeTab
              ]}
            >
              <Text style={[
                styles.tabText,
                selectedCategoryId === cat.id && styles.activeTabText
              ]}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
          {metaCategories.length === 0 && (
            <Text style={styles.noGroupText}>No Metadata Groups found. Create one in Settings.</Text>
          )}
        </ScrollView>
      </View>

      <View style={styles.filterBar}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color="#666" />
          <TextInput
            placeholder={`Search within ${selectedCategoryName}...`}
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, { backgroundColor: '#E8F5E9', borderLeftWidth: 3, borderLeftColor: '#2E7D32' }]}>
          <Text style={styles.summaryLabel}>Range Income</Text>
          <Text style={[styles.summaryValue, styles.positive]}>₹{totalIncome.toFixed(0)}</Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: '#FFEBEE', borderLeftWidth: 3, borderLeftColor: '#C62828' }]}>
          <Text style={styles.summaryLabel}>Range Expense</Text>
          <Text style={[styles.summaryValue, styles.negative]}>₹{totalExpense.toFixed(0)}</Text>
        </View>
      </View>

      <FlatList
        data={ledgerReport}
        keyExtractor={(item, index) => `${item.date}-${item.ledgerName}-${index}`}
        renderItem={renderItem}
        contentContainerStyle={styles.listPadding}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" color={AppColors.primary} style={{ marginTop: 40 }} />
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="pie-chart-outline" size={64} color="#DDD" />
              <Text style={styles.emptyText}>No data available. Try changing filters.</Text>
            </View>
          )
        }
      />

      {/* Filter Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Refine Report</Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Ionicons name="close" size={24} color="#333" />
                  </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                  <Text style={styles.label}>Analysis Group</Text>
                  <RNPickerSelect
                    onValueChange={value => setSelectedCategoryId(Number(value))}
                    items={metaCategories.map(c => ({ label: c.name, value: c.id }))}
                    value={selectedCategoryId}
                    placeholder={{ label: 'Select Meta Category...', value: undefined }}
                    style={pickerSelectStyles}
                  />

                  <Text style={styles.label}>Time Period</Text>
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

                  <TouchableOpacity style={styles.applyBtn} onPress={() => { loadReport(); setModalVisible(false); }}>
                    <Text style={styles.applyBtnText}>Apply Selection</Text>
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

  selectionArea: {
    backgroundColor: '#fff',
    paddingTop: 8,
    paddingBottom: 12,
  },
  selectionTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#999',
    textTransform: 'uppercase',
    marginLeft: 16,
    marginBottom: 8,
  },
  tabsContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  activeTab: {
    backgroundColor: AppColors.primary,
    borderColor: AppColors.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: '#fff',
  },
  noGroupText: { fontSize: 12, color: '#999', fontStyle: 'italic' },

  filterBar: {
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
  searchInput: { flex: 1, marginLeft: 8, fontSize: 13, color: '#333' },

  summaryRow: { flexDirection: 'row', gap: 12, padding: 16 },
  summaryCard: { flex: 1, padding: 10, borderRadius: 12 },
  summaryLabel: { fontSize: 10, fontWeight: '700', color: '#666', marginBottom: 2 },
  summaryValue: { fontSize: 16, fontWeight: '900' },

  listPadding: { paddingHorizontal: 16, paddingBottom: 40 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  cardHeader: { marginBottom: 10 },
  dateText: { fontSize: 10, color: '#999', marginBottom: 2 },
  ledgerName: { fontSize: 15, fontWeight: '700', color: '#333' },
  cardValues: { flexDirection: 'row', gap: 24, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F5F5F5' },
  valueBox: { flex: 1 },
  valueLabel: { fontSize: 9, color: '#999', textTransform: 'uppercase', marginBottom: 1 },
  valueText: { fontSize: 15, fontWeight: '800' },

  positive: { color: '#2E7D32' },
  negative: { color: '#C62828' },

  emptyContainer: { alignItems: 'center', marginTop: 40 },
  emptyText: { marginTop: 12, fontSize: 14, color: '#999' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '800' },
  label: { fontSize: 13, fontWeight: '700', color: '#666', marginTop: 24, marginBottom: 10 },
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

export default ReportByMetaCategoryScreen;
