import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { GlobalStyles, AppColors } from '../constants/Styles';
import DateTimePicker from '@react-native-community/datetimepicker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { ReportService, PaymentReceiptRecord } from '../services/ReportService';
import { ExportHelper } from '../helpers/ExportHelper';

interface PaymentRecord {
  id: number;
  partyName: string;
  amount: number;
  date: string;
  note?: string;
}

const PaymentReportScreen = () => {
  const navigation = useNavigation();
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 6)));
  const [endDate, setEndDate] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  useEffect(() => {
    loadPayments();
  }, [startDate, endDate]);

  const loadPayments = async () => {
    try {
      const data = await ReportService.getPayments(startDate, endDate);
      setPayments(data);
    } catch (error) {
      console.error('Error loading payments:', error);
    }
  };

  const renderItem = ({ item }: { item: PaymentRecord }) => (
    <View style={styles.card}>
      <View style={GlobalStyles.rowBetween}>
        <View style={{ flex: 1 }}>
          <Text style={styles.partyName}>{item.partyName}</Text>
          <Text style={styles.date}>{new Date(item.date).toLocaleDateString()}</Text>
          {item.note && <Text style={styles.note}>{item.note}</Text>}
        </View>
        <Text style={[styles.amount, { color: AppColors.danger }]}>₹ {item.amount.toFixed(2)}</Text>
      </View>
    </View>
  );

  const totalPayments = payments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={GlobalStyles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#333" />
        </TouchableOpacity>
        <Text style={GlobalStyles.headerTitle}>Payments</Text>
        <TouchableOpacity onPress={() => ExportHelper.exportReport('Payments Report', payments)}>
          <Ionicons name="download-outline" size={22} color="#333" />
        </TouchableOpacity>
      </View>

      <View style={GlobalStyles.container}>
        <View style={styles.dateFilters}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={GlobalStyles.label}>From</Text>
            <TouchableOpacity style={styles.dateButton} onPress={() => setShowStartPicker(true)}>
              <Text>{startDate.toLocaleDateString()}</Text>
            </TouchableOpacity>
          </View>
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={GlobalStyles.label}>To</Text>
            <TouchableOpacity style={styles.dateButton} onPress={() => setShowEndPicker(true)}>
              <Text>{endDate.toLocaleDateString()}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Total Payments</Text>
          <Text style={[styles.totalAmount, { color: AppColors.danger }]}>₹ {totalPayments.toFixed(2)}</Text>
        </View>

        <FlatList
          data={payments}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          ListEmptyComponent={<Text style={GlobalStyles.listEmptyText}>No payments found.</Text>}
          contentContainerStyle={{ paddingBottom: 20 }}
        />

        {showStartPicker && (
          <DateTimePicker
            value={startDate}
            mode="date"
            onChange={(event, date) => {
              setShowStartPicker(false);
              if (date) setStartDate(date);
            }}
          />
        )}

        {showEndPicker && (
          <DateTimePicker
            value={endDate}
            mode="date"
            onChange={(event, date) => {
              setShowEndPicker(false);
              if (date) setEndDate(date);
            }}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  dateFilters: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 12,
    backgroundColor: '#fff',
  },
  totalCard: {
    backgroundColor: AppColors.backgroundLight,
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 14,
    color: '#666',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#eee',
  },
  partyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  date: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  note: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    fontStyle: 'italic',
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default PaymentReportScreen;
