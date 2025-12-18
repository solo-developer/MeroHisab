import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { IncomeReportRepository, IncomeReportRow } from '../repositories/IncomeReportRepository';

const IncomeReportScreen: React.FC = () => {
  const navigation = useNavigation();
  const [incomeList, setIncomeList] = useState<IncomeReportRow[]>([]);

  useEffect(() => {
    IncomeReportRepository.getIncomeReport((rows) => {
      setIncomeList(rows);
    });
  }, []);

  const renderItem = ({ item }: { item: IncomeReportRow }) => {
    return (
      <View style={styles.row}>
        <View style={styles.left}>
          <Text style={styles.date}>{new Date(item.date).toLocaleDateString()}</Text>
          <Text style={styles.category}>{item.categoryName || 'N/A'} / {item.walletName || 'N/A'}</Text>
          {item.note ? <Text style={styles.note}>{item.note}</Text> : null}
        </View>
        <Text style={[styles.amount, { color: item.amount < 0 ? '#F44336' : '#4CAF50' }]}>
          {item.amount.toFixed(2)}
        </Text>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No income transactions found</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="arrow-back" size={22} color="#333" onPress={() => navigation.goBack()} />
        <Text style={styles.headerTitle}>Income Report</Text>
        <View style={{ width: 22 }} />
      </View>

      <FlatList
        data={incomeList}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={incomeList.length === 0 ? { flex: 1, justifyContent: 'center', alignItems: 'center' } : { padding: 16 }}
      />
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
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },

  row: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  left: { flex: 1 },
  date: { fontSize: 14, color: '#666', marginBottom: 2 },
  category: { fontSize: 14, fontWeight: '500', marginBottom: 2 },
  note: { fontSize: 13, color: '#888' },
  amount: { fontSize: 16, fontWeight: '600' },

  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 16, color: '#666' },
});

export default IncomeReportScreen;
