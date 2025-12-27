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

import { TransferReportRepository, TransferReportRow } from '../repositories/TransferReportRepository';
import { toSQLDate } from '../helpers/DateHelper';
import { ExportHelper } from '../helpers/ExportHelper';
import { AppColors } from '../constants/Styles';

const PAGE_SIZE = 50;

const TransferReportScreen: React.FC = () => {
  const navigation = useNavigation();

  // Search/Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [transferList, setTransferList] = useState<TransferReportRow[]>([]);
  const [total, setTotal] = useState(0);

  // Pagination
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // Date states
  const today = new Date();
  const lastWeek = new Date();
  lastWeek.setDate(today.getDate() - 30); // Show last 30 days by default

  const [fromDate, setFromDate] = useState<Date>(lastWeek);
  const [toDate, setToDate] = useState<Date>(today);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  useEffect(() => {
    resetAndLoad();
  }, [fromDate, toDate]);

  const resetAndLoad = () => {
    setPage(0);
    setHasMore(true);
    setTransferList([]);
    loadReport(0, true);
  };

  const loadReport = async (pageNum: number, isReset: boolean) => {
    if (!isReset && (!hasMore || loadingMore)) return;

    if (isReset) setLoading(true);
    else setLoadingMore(true);

    try {
      const options = {
        fromDate: toSQLDate(fromDate),
        toDate: toSQLDate(toDate),
        query: searchQuery,
        limit: PAGE_SIZE,
        offset: pageNum * PAGE_SIZE
      };

      const rows = await TransferReportRepository.search(options);

      if (isReset) {
        setTransferList(rows);
        const totalAmount = await TransferReportRepository.getTotalAmount(options);
        setTotal(totalAmount);
      } else {
        setTransferList(prev => [...prev, ...rows]);
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

  // Handle search with debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      resetAndLoad();
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const renderItem = ({ item }: { item: TransferReportRow }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.transferIcon}>
          <Ionicons name="swap-horizontal" size={20} color={AppColors.primary} />
        </View>
        <Text style={styles.dateText}>{new Date(item.date).toLocaleDateString()}</Text>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.pathInfo}>
          <View style={styles.pathRow}>
            <View style={[styles.dot, { backgroundColor: '#FF9800' }]} />
            <Text style={styles.walletName}>{item.fromWallet || 'Unknown'}</Text>
          </View>
          <View style={styles.line} />
          <View style={styles.pathRow}>
            <View style={[styles.dot, { backgroundColor: '#4CAF50' }]} />
            <Text style={styles.walletName}>{item.toWallet || 'Unknown'}</Text>
          </View>
          {item.note ? <Text style={styles.noteText}>{item.note}</Text> : null}
        </View>
        <Text style={styles.amountText}>₹{item.amount.toFixed(0)}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
      {/* Header Bar */}
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transfer History</Text>
        <TouchableOpacity
          onPress={() => ExportHelper.exportReport('Transfers', transferList)}
          style={styles.actionButton}
        >
          <Ionicons name="download-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <View style={styles.heroSection}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color="#666" />
          <TextInput
            placeholder="Search note or wallet..."
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={styles.dateRow}>
          <TouchableOpacity style={styles.dateChip} onPress={() => setShowFromPicker(true)}>
            <Ionicons name="calendar-outline" size={12} color="#666" />
            <Text style={styles.dateChipText}>{fromDate.toLocaleDateString()}</Text>
          </TouchableOpacity>
          <Ionicons name="arrow-forward" size={12} color="#CCC" />
          <TouchableOpacity style={styles.dateChip} onPress={() => setShowToPicker(true)}>
            <Ionicons name="calendar-outline" size={12} color="#666" />
            <Text style={styles.dateChipText}>{toDate.toLocaleDateString()}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Summary Chips - Lighter/Smaller */}
      <View style={styles.summaryBox}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Total Volume</Text>
          <Text style={styles.summaryValue}>₹{total.toFixed(0)}</Text>
        </View>
        <View style={[styles.verticalDivider]} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Total Count</Text>
          <Text style={styles.summaryValue}>{transferList.length}</Text>
        </View>
      </View>

      <FlatList
        data={transferList}
        keyExtractor={item => item.id.toString()}
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
              <Ionicons name="swap-horizontal-outline" size={64} color="#DDD" />
              <Text style={styles.emptyText}>No transfers found.</Text>
            </View>
          )
        }
      />

      {showFromPicker && (
        <DateTimePicker
          value={fromDate}
          mode="date"
          onChange={(_, d) => { setShowFromPicker(false); if (d) setFromDate(d); }}
        />
      )}
      {showToPicker && (
        <DateTimePicker
          value={toDate}
          mode="date"
          onChange={(_, d) => { setShowToPicker(false); if (d) setToDate(d); }}
        />
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
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  dateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    gap: 4,
  },
  dateChipText: { fontSize: 12, fontWeight: '700', color: '#333' },

  summaryBox: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#BBDEFB',
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryLabel: { fontSize: 10, color: '#1976D2', fontWeight: '700', textTransform: 'uppercase', marginBottom: 2 },
  summaryValue: { fontSize: 16, fontWeight: '900', color: '#0D47A1' },
  verticalDivider: { width: 1, backgroundColor: '#BBDEFB', marginVertical: 4 },

  listPadding: { padding: 16, paddingBottom: 40 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  transferIcon: {
    padding: 6,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
  },
  dateText: { fontSize: 11, color: '#999', fontWeight: '500' },
  cardBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  pathInfo: { flex: 1 },
  pathRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  walletName: { fontSize: 14, fontWeight: '700', color: '#333' },
  line: { width: 1.5, height: 10, backgroundColor: '#EEE', marginLeft: 2, marginVertical: 1 },
  noteText: { marginTop: 6, fontSize: 12, color: '#666', fontStyle: 'italic' },
  amountText: { fontSize: 17, fontWeight: '900', color: '#1976D2' },

  emptyContainer: { alignItems: 'center', marginTop: 60 },
  emptyText: { marginTop: 12, fontSize: 14, color: '#999' },
});

export default TransferReportScreen;
