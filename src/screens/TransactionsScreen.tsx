import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  DeviceEventEmitter,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

import { TransactionSummaryRepository } from '../repositories/TransactionSummaryRepository';


interface TransactionEntry {
  id: number;
  amount: number;
  notes?: string;
}

interface TransactionSummary {
  id: number;
  type: 'expense' | 'income' | 'transfer';
  note?: string;
  date: string;
  netAmount: number;
  entries: TransactionEntry[];
}

type ListItem =
  | { type: 'header'; title: string }
  | { type: 'item'; data: TransactionSummary };


const normalizeTransactionType = (
  type: string,
): 'expense' | 'income' | 'transfer' => {
  if (type === 'expense' || type === 'income' || type === 'transfer') {
    return type;
  }
  return 'expense';
};

const isToday = (date: string) => {
  const d = new Date(date);
  const t = new Date();
  return d.toDateString() === t.toDateString();
};

const isYesterday = (date: string) => {
  const d = new Date(date);
  const y = new Date();
  y.setDate(y.getDate() - 1);
  return d.toDateString() === y.toDateString();
};

const formatDateHeader = (date: string) => {
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  return new Date(date).toDateString();
};


const TransactionsScreen: React.FC = () => {
  const [transactions, setTransactions] = useState<TransactionSummary[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);


  const loadTransactions = () => {
    TransactionSummaryRepository.listWithNetAmount(
      rows => {
        setTransactions(
          rows.map(r => ({
            id: r.id,
            type: normalizeTransactionType(r.type),
            note: r.note,
            date: r.date,
            netAmount: r.netAmount,
            entries: [],
          })),
        );
      },
      err => console.error('Failed to load transactions', err),
    );
  };

  useFocusEffect(
    useCallback(() => {
      loadTransactions();
    }, []),
  );

  useEffect(() => {
    const subs = [
      DeviceEventEmitter.addListener(
        'transactionsUpdated',
        loadTransactions,
      ),
      DeviceEventEmitter.addListener('incomeAdded', loadTransactions),
      DeviceEventEmitter.addListener('expenseAdded', loadTransactions),
    ];

    return () => subs.forEach(s => s.remove());
  }, []);


  const groupedData: ListItem[] = useMemo(() => {
    const map = new Map<string, TransactionSummary[]>();

    transactions.forEach(tx => {
      const key = formatDateHeader(tx.date);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(tx);
    });

    const result: ListItem[] = [];
    map.forEach((items, date) => {
      result.push({ type: 'header', title: date });
      items.forEach(i =>
        result.push({ type: 'item', data: i }),
      );
    });

    return result;
  }, [transactions]);

  const stickyHeaderIndices = useMemo(
    () =>
      groupedData
        .map((item, index) =>
          item.type === 'header' ? index : null,
        )
        .filter(i => i !== null) as number[],
    [groupedData],
  );

  /* -------- UI helpers -------- */

  const toggleExpand = (id: number) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  const getAmountStyle = (
    type: TransactionSummary['type'],
  ) => {
    switch (type) {
      case 'expense':
        return styles.expense;
      case 'income':
        return styles.income;
      case 'transfer':
        return styles.transfer;
      default:
        return styles.amount;
    }
  };

  /* -------- Render -------- */

  const renderItem = ({ item }: { item: ListItem }) => {
    if (item.type === 'header') {
      return (
        <View style={styles.dateHeader}>
          <Text style={styles.dateHeaderText}>
            {item.title}
          </Text>
        </View>
      );
    }

    const tx = item.data;
    const isExpanded = expandedId === tx.id;

    return (
      <View style={styles.card}>
        <TouchableOpacity onPress={() => toggleExpand(tx.id)}>
          <View style={styles.summaryRow}>
            <Text style={styles.title}>
              {tx.note || tx.type}
            </Text>
            <Text
              style={[styles.amount, getAmountStyle(tx.type)]}
            >
              ₹ {tx.netAmount}
            </Text>
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.entriesContainer}>
            {tx.entries.map(e => (
              <View key={e.id} style={styles.entryRow}>
                <Text style={styles.entryAmount}>
                  ₹ {e.amount}
                </Text>
                {e.notes && (
                  <Text style={styles.entryNotes}>
                    {e.notes}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
  <SafeAreaView style={styles.safeArea}>
    {/* Fixed header */}
    <View style={styles.fixedHeader}>
      <Text style={styles.headerTitle}>Transactions</Text>
      <Text style={styles.headerSubtitle}>
        Expenses, income & transfers
      </Text>
    </View>

    {/* FlatList for transactions */}
    <FlatList
      style={{ flex: 1 }}
      data={groupedData}
      renderItem={renderItem}
      keyExtractor={(item, index) =>
        item.type === 'header'
          ? `header-${item.title}`
          : `tx-${item.data.id}`
      }
      stickyHeaderIndices={stickyHeaderIndices}
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
  </SafeAreaView>
);

};

export default TransactionsScreen;


const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },

  listHeader: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
  },

  headerSubtitle: {
    fontSize: 13,
    color: '#777',
    marginTop: 2,
  },

  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },

  dateHeader: {
    backgroundColor: '#fff',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ddd',
  },

  dateHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
  },

  card: {
    backgroundColor: '#fafafa',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  title: {
    fontSize: 16,
    fontWeight: '600',
  },

  amount: {
    fontSize: 16,
    fontWeight: '700',
  },

  expense: {
    color: '#D32F2F',
  },

  income: {
    color: '#2E7D32',
  },

  transfer: {
    color: '#1565C0',
  },

  entriesContainer: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e0e0e0',
  },

  entryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },

  entryAmount: {
    fontSize: 14,
    color: '#444',
  },

  entryNotes: {
    fontSize: 14,
    color: '#666',
    flex: 1,
    textAlign: 'right',
    marginLeft: 8,
  },

  emptyState: {
    marginTop: 80,
    alignItems: 'center',
    paddingHorizontal: 32,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },

  emptySubtitle: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
    lineHeight: 20,
  },
  fixedHeader: {
  paddingHorizontal: 16,
  paddingVertical: 12,
  backgroundColor: '#fff',       // matches your page background
  borderBottomWidth: StyleSheet.hairlineWidth,
  borderBottomColor: '#ddd',     // subtle separator
  zIndex: 10,                    // ensure header stays above content
  elevation: 2,                  // for Android shadow
},

});
