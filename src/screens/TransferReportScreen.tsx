// src/screens/TransferReportScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';

import {
  TransferReportRepository,
  TransferReportRow,
} from '../repositories/TransferReportRepository';

const toSQLDate = (date?: Date) =>
  date ? date.toISOString().split('T')[0] : undefined;

const TransferReportScreen: React.FC = () => {
  const navigation = useNavigation();

  const [fromDate, setFromDate] = useState<Date | undefined>();
  const [toDate, setToDate] = useState<Date | undefined>();
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  const [transferList, setTransferList] = useState<TransferReportRow[]>([]);
  const [total, setTotal] = useState(0);

  const loadReport = () => {
    TransferReportRepository.getTransferReport(
      toSQLDate(fromDate),
      toSQLDate(toDate),
      rows => {
        setTransferList(rows);
        const sum = rows.reduce((acc, r) => acc + r.amount, 0);
        setTotal(sum);
      }
    );
  };

  useEffect(() => {
    loadReport();
  }, []);

  const renderItem = ({ item }: { item: TransferReportRow }) => (
    <View style={styles.row}>
      <View style={styles.left}>
        <Text style={styles.date}>
          {new Date(item.date).toLocaleDateString()}
        </Text>
        <Text style={styles.meta}>
          {item.fromWallet || 'N/A'} → {item.toWallet || 'N/A'}
        </Text>
        {item.note ? <Text style={styles.note}>{item.note}</Text> : null}
      </View>

      <Text style={[styles.amount, { color: '#1976D2' }]}>
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

        <Text style={styles.headerTitle}>Transfer Report</Text>

        <TouchableOpacity>
          <Ionicons name="download-outline" size={22} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <View style={styles.filters}>
        <TouchableOpacity
          style={styles.dateField}
          onPress={() => setShowFromPicker(true)}
        >
          <Ionicons name="calendar-outline" size={16} color="#666" />
          <Text style={styles.dateText}>
            {fromDate ? fromDate.toLocaleDateString() : 'From date'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.dateField}
          onPress={() => setShowToPicker(true)}
        >
          <Ionicons name="calendar-outline" size={16} color="#666" />
          <Text style={styles.dateText}>
            {toDate ? toDate.toLocaleDateString() : 'To date'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.applyBtn} onPress={loadReport}>
          <Text style={styles.applyText}>Apply</Text>
        </TouchableOpacity>
      </View>

      {/* Total */}
      <View style={styles.totalBar}>
        <Text style={styles.totalLabel}>Total Transfers</Text>
        <Text style={styles.totalAmount}>{total.toFixed(2)}</Text>
      </View>

      {/* List */}
      <FlatList
        data={transferList}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        contentContainerStyle={{ padding: 12 }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No transfer records found</Text>
        }
      />

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

  filters: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    gap: 8,
  },
  dateField: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    flex: 1,
    gap: 6,
  },
  dateText: { fontSize: 13, color: '#333' },

  applyBtn: {
    backgroundColor: '#1976D2',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  applyText: { color: '#fff', fontWeight: '600', fontSize: 13 },

  totalBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#E3F2FD',
  },
  totalLabel: { fontSize: 14, fontWeight: '600' },
  totalAmount: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0D47A1',
  },

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
  note: { fontSize: 12, color: '#888' },

  amount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1976D2',
  },

  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: '#777',
  },
});

export default TransferReportScreen;
