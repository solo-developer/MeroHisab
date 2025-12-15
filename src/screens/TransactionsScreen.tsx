import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TransactionSummaryRepository } from '../repositories/TransactionSummaryRepository';
import { useFocusEffect } from '@react-navigation/native';
import { DeviceEventEmitter } from 'react-native';

interface TransactionEntry {
  id: number;
  amount: number;
  notes?: string;
}

interface TransactionSummary {
  id: number;
  type: string; // expense | income | transfer
  note?: string; // summary note
  date: string;
  netAmount: number;
  entries: TransactionEntry[];
}

const TransactionsScreen: React.FC = () => {
  const [transactions, setTransactions] = useState<TransactionSummary[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  function loadTransactions() {
    TransactionSummaryRepository.listWithNetAmount(
      summaries => {
        setTransactions(
          summaries.map(s => ({
            id: s.id,
            type: s.type,
            note: s.note,
            date: s.date,
            netAmount: s.netAmount,
            entries: [], // lazy-load later
          })),
        );
      },
      err => console.error('Failed to load transactions', err),
    );
  }

  useFocusEffect(
    useCallback(() => {
      // Load transactions every time screen comes into focus
      loadTransactions();
    }, []),
  );

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener(
      'transactionsUpdated',
      () => {
        loadTransactions();
      },
    );
    const incomeSubscription = DeviceEventEmitter.addListener(
      'incomeAdded',
      () => {
        loadTransactions();
      },
    );

    return () => {
      subscription.remove();
      incomeSubscription.remove();
    }; // cleanup
  }, []);

  const toggleExpand = (id: number) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  const renderItem = ({ item }: { item: TransactionSummary }) => {
    const isExpanded = expandedId === item.id;

    return (
      <View style={styles.card}>
        <TouchableOpacity onPress={() => toggleExpand(item.id)}>
          <View style={styles.summaryRow}>
            <View>
              <Text style={styles.title}>{item.note || item.type}</Text>
              <Text style={styles.date}>{item.date}</Text>
            </View>
            <Text
              style={[
                styles.amount,
                item.netAmount < 0 ? styles.expense : styles.income,
              ]}
            >
              ₹ {item.netAmount}
            </Text>
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.entriesContainer}>
            {item.entries.map(entry => (
              <View key={entry.id} style={styles.entryRow}>
                <Text style={styles.entryAmount}>₹ {entry.amount}</Text>
                {entry.notes ? (
                  <Text style={styles.entryNotes}>{entry.notes}</Text>
                ) : null}
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* ✅ HEADER — rendered once */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Transactions</Text>
        </View>

        {/* ✅ LIST — rows only */}
        <FlatList
          data={transactions}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
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
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },

  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  /* Header */
  header: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ddd',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
  },

  listContent: {
    padding: 16,
    paddingBottom: 24,
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

  date: {
    fontSize: 12,
    color: '#777',
    marginTop: 2,
  },

  amount: {
    fontSize: 16,
    fontWeight: '700',
  },

  expense: {
    color: '#d32f2f',
  },

  income: {
    color: '#2e7d32',
  },

  entriesContainer: {
    marginTop: 12,
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
    marginLeft: 8,
    flex: 1,
    textAlign: 'right',
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
});

export default TransactionsScreen;
