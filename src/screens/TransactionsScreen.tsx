import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  SectionList,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { DeviceEventEmitter } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { TransactionSummaryRepository } from '../repositories/TransactionSummaryRepository';
import { ExportHelper } from '../helpers/ExportHelper';
import { toSQLDate } from '../helpers/DateHelper';

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

interface SectionData {
  title: string;
  data: TransactionSummary[];
}

const PAGE_SIZE = 50; // Increased page size for SectionList smooth scrolling

const formatDateTime = (isoString: string) => {
  const dt = new Date(isoString);
  return dt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
};

const formatDateHeader = (dateString: string) => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';

  return date.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
  });
};

const getDateOnly = (isoString: string) => toSQLDate(new Date(isoString)) || isoString.split(' ')[0];

const TransactionsScreen: React.FC = () => {
  const [sections, setSections] = useState<SectionData[]>([]);
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
        const mapped: TransactionSummary[] = summaries.map(s => ({
          id: s.id,
          type: s.type,
          note: s.note,
          date: s.date,
          netAmount: s.netAmount,
          entries: [],
        }));

        processData(mapped, isRefresh);

        setHasMore(summaries.length === PAGE_SIZE);
        setLoading(false);
        setRefreshing(false);
        if (isRefresh) setOffset(PAGE_SIZE);
        else setOffset(prev => prev + PAGE_SIZE);
      },
      err => {
        console.error('Failed to load transactions', err);
        setLoading(false);
        setRefreshing(false);
      }
    );
  };

  const processData = (newTransactions: TransactionSummary[], isRefresh: boolean) => {
    setSections(currentSections => {
      let allTransactions = isRefresh ? newTransactions : [];

      if (!isRefresh) {
        // Flatten current sections back to array to merge
        currentSections.forEach(section => {
          allTransactions.push(...section.data);
        });
        allTransactions.push(...newTransactions);
      }

      // Group by date
      const groups: Record<string, TransactionSummary[]> = {};
      allTransactions.forEach(tx => {
        const dateKey = getDateOnly(tx.date);
        if (!groups[dateKey]) groups[dateKey] = [];
        groups[dateKey].push(tx);
      });

      // Convert to SectionList format
      const result: SectionData[] = Object.keys(groups)
        .sort((a, b) => b.localeCompare(a))
        .map(date => ({
          title: formatDateHeader(date),
          data: groups[date],
        }));

      return result;
    });
  };

  useFocusEffect(useCallback(() => {
    loadTransactions(true);
  }, []));

  useEffect(() => {
    const subs = [
      DeviceEventEmitter.addListener('transactionsUpdated', () => loadTransactions(true)),
      DeviceEventEmitter.addListener('incomeAdded', () => loadTransactions(true)),
      DeviceEventEmitter.addListener('expenseAdded', () => loadTransactions(true)),
      DeviceEventEmitter.addListener('transferAdded', () => loadTransactions(true)),
    ];
    return () => subs.forEach(sub => sub.remove());
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadTransactions(true);
  };

  const toggleExpand = (id: number) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  const getIconInfo = (type: string) => {
    switch (type) {
      case 'income': return { name: 'arrow-down', color: '#2E7D32', bg: '#E8F5E9' };
      case 'expense': return { name: 'arrow-up', color: '#C62828', bg: '#FFEBEE' };
      case 'transfer': return { name: 'swap-horizontal', color: '#1565C0', bg: '#E3F2FD' };
      default: return { name: 'help', color: '#757575', bg: '#EEEEEE' };
    }
  };

  const renderItem = ({ item }: { item: TransactionSummary }) => {
    const isExpanded = expandedId === item.id;
    const { name, color, bg } = getIconInfo(item.type);
    const isIncome = item.type === 'income';

    return (
      <View style={styles.cardContainer}>
        <TouchableOpacity
          style={styles.card}
          onPress={() => toggleExpand(item.id)}
          activeOpacity={0.7}
        >
          <View style={[styles.iconBox, { backgroundColor: bg }]}>
            <Ionicons name={name} size={20} color={color} />
          </View>

          <View style={styles.contentBox}>
            <View style={styles.rowTop}>
              <Text style={styles.title} numberOfLines={1}>
                {item.note || item.type.charAt(0).toUpperCase() + item.type.slice(1)}
              </Text>
              <Text style={[
                styles.amount,
                { color: item.type === 'transfer' ? '#333' : (isIncome ? '#2E7D32' : '#C62828') }
              ]}>
                {isIncome ? '+' : (item.type === 'expense' ? '-' : '')} ₹{item.netAmount.toLocaleString()}
              </Text>
            </View>

            <View style={styles.rowBottom}>
              <Text style={styles.time}>{formatDateTime(item.date)}</Text>
              <Text style={styles.typeLabel}>{item.type}</Text>
            </View>
          </View>
        </TouchableOpacity>

        {isExpanded && item.entries && item.entries.length > 0 && (
          <View style={styles.expandedContent}>
            {item.entries.map((entry, idx) => (
              <View key={idx} style={styles.subItem}>
                <Text style={styles.subNote}>{entry.notes || 'Entry'}</Text>
                <Text style={styles.subAmount}>₹{entry.amount}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderSectionHeader = ({ section: { title } }: { section: SectionData }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>{title}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F7FA" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Transactions</Text>
        <TouchableOpacity
          style={styles.exportBtn}
          onPress={() => {
            // Flatten sections for export
            const allItems = sections.flatMap(s => s.data);
            ExportHelper.exportReport('Transactions', allItems);
          }}
        >
          <Ionicons name="download-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        contentContainerStyle={styles.listContent}
        onRefresh={onRefresh}
        refreshing={refreshing}
        onEndReached={() => loadTransactions(false)}
        onEndReachedThreshold={0.5}
        stickySectionHeadersEnabled={false}
        ListFooterComponent={() => (
          loading && !refreshing ? <ActivityIndicator style={{ padding: 20 }} color="#666" /> : <View style={{ height: 40 }} />
        )}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconBg}>
                <Ionicons name="receipt-outline" size={48} color="#ccc" />
              </View>
              <Text style={styles.emptyTitle}>No transactions yet</Text>
              <Text style={styles.emptySubtitle}>
                Add income or expenses to see them listed here.
              </Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F5F7FA' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#F5F7FA',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1a1a1a',
    letterSpacing: -0.5,
  },
  exportBtn: {
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  sectionHeader: {
    marginTop: 24,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionHeaderText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  cardContainer: {
    marginBottom: 12,
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  contentBox: {
    flex: 1,
  },
  rowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
  },
  rowBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  time: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
  typeLabel: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  expandedContent: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  subItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  subNote: {
    fontSize: 13,
    color: '#666',
  },
  subAmount: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 80,
    paddingHorizontal: 32,
  },
  emptyIconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EAEAEA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#888',
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default TransactionsScreen;
