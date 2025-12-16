import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { DeviceEventEmitter } from 'react-native';

import { TransactionSummaryRepository } from '../repositories/TransactionSummaryRepository';

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

// Helper: format date/time for transactions
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

// Helper: get only yyyy-mm-dd for grouping
const getDateOnly = (isoString: string) => isoString.split('T')[0];

const TransactionsScreen: React.FC = () => {
  const [transactions, setTransactions] = useState<TransactionSummary[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const loadTransactions = () => {
    TransactionSummaryRepository.listWithNetAmount(
      summaries => {
        setTransactions(
          summaries.map(s => ({
            id: s.id,
            type: s.type,
            note: s.note,
            date: s.date,
            netAmount: s.netAmount,
            entries: [],
          }))
        );
      },
      err => console.error('Failed to load transactions', err)
    );
  };

  useFocusEffect(useCallback(() => loadTransactions(), []));

  useEffect(() => {
    const subs = [
      DeviceEventEmitter.addListener('transactionsUpdated', loadTransactions),
      DeviceEventEmitter.addListener('incomeAdded', loadTransactions),
      DeviceEventEmitter.addListener('expenseAdded', loadTransactions),
    ];
    return () => subs.forEach(sub => sub.remove());
  }, []);

  const toggleExpand = (id: number) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  // Group by date only
  const groupedTransactions: GroupedTransactions[] = Object.values(
    transactions.reduce((acc, tx) => {
      const dateKey = getDateOnly(tx.date);
      if (!acc[dateKey]) acc[dateKey] = { date: dateKey, transactions: [] };
      acc[dateKey].transactions.push(tx);
      return acc;
    }, {} as Record<string, GroupedTransactions>)
  ).sort((a, b) => (a.date < b.date ? 1 : -1)); // latest first

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
        </View>

        <FlatList
          data={groupedTransactions}
          keyExtractor={item => item.date}
          renderItem={renderGroup}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No transactions yet</Text>
              <Text style={styles.emptySubtitle}>
                Your expenses, income, and transfers will appear here.
              </Text>
            </View>
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
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ddd',
  },
  headerTitle: { fontSize: 22, fontWeight: '700' },
  listContent: { padding: 16, paddingBottom: 24 },
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
