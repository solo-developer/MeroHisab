import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlobalStyles, AppColors } from '../constants/Styles';
import DateTimePicker from '@react-native-community/datetimepicker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { ReportService, PaymentReceiptRecord } from '../services/ReportService';
import { ExportHelper } from '../helpers/ExportHelper';

const PaymentReportScreen = () => {
  const navigation = useNavigation();
  const [payments, setPayments] = useState<PaymentReceiptRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  // Default: last 30 days
  const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 30)));
  const [endDate, setEndDate] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const loadPayments = async () => {
    setLoading(true);
    try {
      const data = await ReportService.getPayments(startDate, endDate, searchQuery);
      setPayments(data);
    } catch (error) {
      console.error('Error loading payments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, [startDate, endDate]);

  useEffect(() => {
    const handler = setTimeout(() => {
      loadPayments();
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const renderItem = ({ item }: { item: PaymentReceiptRecord }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.payBadge}>
          <Ionicons name="arrow-undo-outline" size={12} color="#C62828" />
          <Text style={styles.payBadgeText}>PAYMENT</Text>
        </View>
        <Text style={styles.dateText}>{new Date(item.date).toLocaleDateString()}</Text>
      </View>
      <View style={styles.cardBody}>
        <View style={{ flex: 1 }}>
          <Text style={styles.partyName}>{item.partyName}</Text>
          <Text style={styles.note} numberOfLines={1}>{item.note || 'No note available'}</Text>
        </View>
        <Text style={styles.amount}>₹{item.amount.toFixed(0)}</Text>
      </View>
    </View>
  );

  const totalPayments = payments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payments View</Text>
        <TouchableOpacity onPress={() => ExportHelper.exportReport('Payments_Report', payments)} style={styles.actionButton}>
          <Ionicons name="download-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <View style={styles.heroSection}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color="#666" />
          <TextInput
            placeholder="Search party or payment note..."
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <View style={styles.dateSelector}>
          <TouchableOpacity style={styles.dateChip} onPress={() => setShowStartPicker(true)}>
            <Text style={styles.dateChipText}>{startDate.toLocaleDateString()}</Text>
          </TouchableOpacity>
          <Text style={styles.dateArrow}>to</Text>
          <TouchableOpacity style={styles.dateChip} onPress={() => setShowEndPicker(true)}>
            <Text style={styles.dateChipText}>{endDate.toLocaleDateString()}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Summary Box - Lighter/Smaller */}
      <View style={styles.summaryBox}>
        <View style={styles.heroIconBox}>
          <Ionicons name="arrow-undo-outline" size={20} color="#C62828" />
        </View>
        <View style={{ flex: 1, marginLeft: 16 }}>
          <Text style={styles.summaryLabel}>Total Paid Out</Text>
          <Text style={styles.summaryValue}>₹{totalPayments.toFixed(0)}</Text>
        </View>
      </View>

      <FlatList
        data={payments}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listPadding}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" color="#C62828" style={{ marginTop: 40 }} />
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="receipt-outline" size={64} color="#DDD" />
              <Text style={styles.emptyText}>No payments recorded.</Text>
            </View>
          )
        }
      />

      {showStartPicker && (
        <DateTimePicker value={startDate} mode="date" onChange={(_, d) => { setShowStartPicker(false); if (d) setStartDate(d); }} />
      )}
      {showEndPicker && (
        <DateTimePicker value={endDate} mode="date" onChange={(_, d) => { setShowEndPicker(false); if (d) setEndDate(d); }} />
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
  searchInput: { flex: 1, marginLeft: 8, fontSize: 14, color: '#333' },
  dateSelector: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12 },
  dateChip: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#F3F4F6', borderRadius: 12 },
  dateChipText: { fontSize: 12, fontWeight: '700', color: '#333' },
  dateArrow: { fontSize: 12, color: '#999', fontWeight: '500' },

  summaryBox: {
    margin: 16,
    padding: 16,
    backgroundColor: '#FFEBEE',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  heroIconBox: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  summaryLabel: { fontSize: 11, color: '#B71C1C', fontWeight: '700', textTransform: 'uppercase' },
  summaryValue: { fontSize: 26, fontWeight: '900', color: '#C62828' },

  listPadding: { paddingHorizontal: 16, paddingBottom: 40 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  payBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FFEBEE', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  payBadgeText: { fontSize: 9, fontWeight: '800', color: '#C62828' },
  dateText: { fontSize: 11, color: '#999' },
  cardBody: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  partyName: { fontSize: 15, fontWeight: '700', color: '#333' },
  note: { fontSize: 12, color: '#888', marginTop: 2 },
  amount: { fontSize: 17, fontWeight: '900', color: '#C62828' },

  emptyContainer: { alignItems: 'center', marginTop: 40 },
  emptyText: { marginTop: 12, fontSize: 14, color: '#999' },
});

export default PaymentReportScreen;
