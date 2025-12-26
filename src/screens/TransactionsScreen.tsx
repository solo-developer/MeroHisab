import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { DeviceEventEmitter } from 'react-native';

import { TransactionSummaryRepository } from '../repositories/TransactionSummaryRepository';
import { ExportHelper } from '../helpers/ExportHelper';
import { toSQLDate } from '../helpers/DateHelper';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface TransactionEntry {
  id: number;
  amount: number;
  notes?: string;
}

interface TransactionSummary {
  id: number;
  type: string; // expense | income | transfer
  note?: string;
  date: string;
  netAmount: number;
  entries: TransactionEntry[];
}

interface GroupedTransactions {
  date: string; // yyyy-mm-dd
  transactions: TransactionSummary[];
}

const typeColors: Record<string, string> = {
  income: '#2e7d32',
  expense: '#d32f2f',
  transfer: '#1976d2',
};

const PAGE_SIZE = 20;

const formatDateTime = (isoString: string) => {
  const dt = new Date(isoString);
  const options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };
  return dt.toLocaleString('en-IN', options);
};

const getDateOnly = (isoString: string) => toSQLDate(new Date(isoString)) || isoString.split(' ')[0];

const TransactionsScreen: React.FC = () => {
  const [transactions, setTransactions] = useState<TransactionSummary[]>([]);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const loadTransactions = (isRefresh = false) => {
    if (loading) return;
    if (!isRefresh && !hasMore) return;

    setLoading(true);
    const currentOffset = isRefresh ? 0 : offset;

    TransactionSummaryRepository.listWithNetAmount(
      PAGE_SIZE,
      currentOffset,
      summaries => {
        const mapped = summaries.map(s => ({
          id: s.id,
          type: s.type,
          note: s.note,
          date: s.date,
          netAmount: s.netAmount,
          entries: [],
        }));

        if (isRefresh) {
          setTransactions(mapped);
          setOffset(PAGE_SIZE);
        } else {
          setTransactions(prev => [...prev, ...mapped]);
          setOffset(prev => prev + PAGE_SIZE);
        }

        setHasMore(summaries.length === PAGE_SIZE);
        setLoading(false);
        setRefreshing(false);
      },
      err => {
        console.error('Failed to load transactions', err);
        setLoading(false);
        setRefreshing(false);
      }
    );
  };

  useFocusEffect(useCallback(() => {
    loadTransactions(true);
  }, []));

  useEffect(() => {
    const subs = [
      DeviceEventEmitter.addListener('transactionsUpdated', () => loadTransactions(true)),
      DeviceEventEmitter.addListener('incomeAdded', () => loadTransactions(true)),
      DeviceEventEmitter.addListener('expenseAdded', () => loadTransactions(true)),
    ];
    return () => subs.forEach(sub => sub.remove());
  }, [offset, hasMore]);

  const onRefresh = () => {
    setRefreshing(true);
    loadTransactions(true);
  };

  const onEndReached = () => {
    if (!loading && hasMore) {
      loadTransactions();
    }
  };

  const toggleExpand = (id: number) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  // Group by date only
  const groupedTransactions: GroupedTransactions[] = [];
  const groups: Record<string, TransactionSummary[]> = {};

  transactions.forEach(tx => {
    const dateKey = getDateOnly(tx.date);
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(tx);
  });

  Object.keys(groups).sort((a, b) => b.localeCompare(a)).forEach(date => {
    groupedTransactions.push({ date, transactions: groups[date] });
  });

  const renderTransaction = (tx: TransactionSummary) => {
    const isExpanded = expandedId === tx.id;
    const color = typeColors[tx.type] || '#444';

    return (
      <View key={tx.id} style={styles.card}>
        <TouchableOpacity onPress={() => toggleExpand(tx.id)}>
          <View style={styles.summaryRow}>
            <View>
              <Text style={[styles.title, { color }]}>{tx.note || tx.type}</Text>
              <Text style={styles.date}>{formatDateTime(tx.date)}</Text>
            </View>
            <Text style={[styles.amount, { color }]}>₹ {tx.netAmount}</Text>
          </View>
        </TouchableOpacity>

        {isExpanded && tx.entries.length > 0 && (
          <View style={styles.entriesContainer}>
            {tx.entries.map(entry => (
              <View key={entry.id} style={styles.entryRow}>
                <Text style={styles.entryAmount}>₹ {entry.amount}</Text>
                {entry.notes && <Text style={styles.entryNotes}>{entry.notes}</Text>}
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderGroup = ({ item }: { item: GroupedTransactions }) => (
    <View style={styles.groupContainer}>
      <Text style={styles.groupDate}>{item.date}</Text>
      {item.transactions.map(renderTransaction)}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Transactions</Text>
          <TouchableOpacity onPress={() => ExportHelper.exportReport('Transactions', transactions)}>
            <Ionicons name="download-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={groupedTransactions}
          keyExtractor={item => item.date}
          renderItem={renderGroup}
          contentContainerStyle={styles.listContent}
          onRefresh={onRefresh}
          refreshing={refreshing}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.5}
          ListFooterComponent={() => (
            loading && !refreshing ? <ActivityIndicator style={{ marginVertical: 20 }} color="#0a84ff" /> : null
          )}
          ListEmptyComponent={
            !loading ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>No transactions yet</Text>
                <Text style={styles.emptySubtitle}>
                  Your expenses, income, and transfers will appear here.
                </Text>
              </View>
            ) : null
          }
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f5f5f5' },
  container: { flex: 1 },
  header: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ddd',
  },
  headerTitle: { fontSize: 22, fontWeight: '700' },
  listContent: {
    padding: 16,
    paddingBottom: 160
  },
  groupContainer: { marginBottom: 16 },
  groupDate: { fontSize: 14, fontWeight: '600', marginBottom: 8, color: '#555' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#eee',
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 16, fontWeight: '600' },
  date: { fontSize: 12, color: '#777', marginTop: 2 },
  amount: { fontSize: 16, fontWeight: '700' },
  entriesContainer: { marginTop: 12, paddingTop: 8, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#e0e0e0' },
  entryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  entryAmount: { fontSize: 14, color: '#444' },
  entryNotes: { fontSize: 14, color: '#666', marginLeft: 8, flex: 1, textAlign: 'right' },
  emptyState: { marginTop: 80, alignItems: 'center', paddingHorizontal: 32 },
  emptyTitle: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: '#777', textAlign: 'center', lineHeight: 20 },
});

export default TransactionsScreen;
