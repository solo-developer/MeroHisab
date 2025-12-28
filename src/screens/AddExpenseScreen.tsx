import React, { useState, useEffect } from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  View,
  DeviceEventEmitter,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import RNPickerSelect from 'react-native-picker-select';

import CategoryRepository from '../repositories/CategoryRepository';
import WalletRepository from '../repositories/WalletRepository';
import { AddExpenseRequest, ExpenseService } from '../services/ExpenseService';
import { AppColors } from '../constants/Styles';
import { useSnackbar } from '../context/SnackbarContext';
import { toSQLDate } from '../helpers/DateHelper';
import { usePreferences } from '../context/PreferencesContext';

export const AddExpenseScreen = ({ navigation }: any) => {
  const { showSnackbar } = useSnackbar();
  const { currency } = usePreferences();
  const [amount, setAmount] = useState('');
  const [discount, setDiscount] = useState('');
  const [wallets, setWallets] = useState<any[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<number | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const walletsList = await WalletRepository.getAll();
      setWallets(walletsList);
      if (walletsList.length > 0) setSelectedWallet(walletsList[0].id || null);

      const categoriesList = await CategoryRepository.getAll();
      setCategories(categoriesList);
      if (categoriesList.length > 0) setSelectedCategory(categoriesList[0].id || null);
    };
    fetchData();
  }, []);

  const handleSave = async () => {
    if (!selectedWallet) return showSnackbar('Please select a wallet', 3000, 'error');
    if (!selectedCategory) return showSnackbar('Please select a category', 3000, 'error');

    // Parse amounts
    const grossVal = parseFloat(amount || '0');
    const discountVal = parseFloat(discount || '0');

    if (grossVal <= 0) return showSnackbar('Please enter a valid amount', 3000, 'error');

    const netVal = grossVal - discountVal;

    const request: AddExpenseRequest = {
      amount: netVal,
      grossAmount: grossVal,
      discount: discountVal,
      walletId: selectedWallet,
      categoryId: selectedCategory,
      date: toSQLDate(date)!,
      note,
    };

    setLoading(true);
    try {
      await ExpenseService.addExpense(request);
      showSnackbar('Expense recorded', 1500, 'success');
      DeviceEventEmitter.emit('expenseAdded');
      DeviceEventEmitter.emit('transactionAdded'); // Ensure dashboard updates
      navigation.goBack();
    } catch (err: any) {
      showSnackbar(err.message || 'Failed to add expense', 3000, 'error');
    } finally {
      setLoading(false);
    }
  };

  const selectedWalletName = wallets.find(w => w.id === selectedWallet)?.name || 'Select Wallet';
  const selectedCategoryName = categories.find(c => c.id === selectedCategory)?.name || 'Select Category';

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFEBEE" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="close" size={24} color="#C62828" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Expense</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Amount Input */}
        <View style={styles.amountContainer}>
          <Text style={styles.currencySymbol}>{currency.symbol}</Text>
          <TextInput
            style={styles.amountInput}
            placeholder="0"
            placeholderTextColor="#EF9A9A"
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
            autoFocus
          />
        </View>
        <Text style={styles.amountLabel}>Total Amount</Text>

        <View style={styles.formContainer}>

          {/* Discount Section (Optional) */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Discount (if any)</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="pricetag-outline" size={20} color="#999" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="0.00"
                keyboardType="numeric"
                value={discount}
                onChangeText={setDiscount}
              />
            </View>
          </View>

          {/* Wallet Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Paid From</Text>
            <RNPickerSelect
              onValueChange={setSelectedWallet}
              items={wallets.map(w => ({ label: w.name, value: w.id }))}
              value={selectedWallet}
              style={pickerStyles}
              placeholder={{}}
              Icon={() => <Ionicons name="wallet-outline" size={20} color="#C62828" style={{ marginTop: 12, marginRight: 10 }} />}
            />
          </View>

          {/* Category Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Category</Text>
            <RNPickerSelect
              onValueChange={setSelectedCategory}
              items={categories.map(c => ({ label: c.name, value: c.id }))}
              value={selectedCategory}
              style={pickerStyles}
              placeholder={{}}
              Icon={() => <Ionicons name="grid-outline" size={20} color="#C62828" style={{ marginTop: 12, marginRight: 10 }} />}
            />
          </View>

          {/* Date Picker */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Date</Text>
            <TouchableOpacity style={styles.dateSelector} onPress={() => setShowDatePicker(true)}>
              <Ionicons name="calendar-outline" size={20} color="#C62828" />
              <Text style={styles.dateText}>{date.toLocaleDateString()}</Text>
            </TouchableOpacity>
          </View>

          {/* Notes */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Note</Text>
            <View style={styles.textAreaWrapper}>
              <TextInput
                style={styles.textArea}
                placeholder="Add a remark..."
                multiline
                numberOfLines={3}
                value={note}
                onChangeText={setNote}
              />
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.saveButtonText}>Save Expense</Text>
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
              </>
            )}
          </TouchableOpacity>

        </View>
      </ScrollView>

      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          onChange={(_, d) => {
            setShowDatePicker(false);
            if (d) setDate(d);
          }}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFEBEE' }, // Light Red background
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
    backgroundColor: 'rgba(198, 40, 40, 0.1)', // Light red tint
    borderRadius: 20,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#C62828' }, // Dark Red Text

  scrollContent: { paddingBottom: 40 },

  amountContainer: { alignItems: 'center', justifyContent: 'center', marginVertical: 30 },
  currencySymbol: { fontSize: 32, color: '#EF9A9A', fontWeight: '700' },
  amountInput: { fontSize: 56, color: '#C62828', fontWeight: '900', textAlign: 'center', minWidth: 100 },
  amountLabel: { fontSize: 14, color: '#E57373', marginTop: -6 },

  formContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    minHeight: 500,
  },

  inputGroup: { marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '700', color: '#888', marginBottom: 8, textTransform: 'uppercase' },

  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  inputIcon: { marginRight: 8 },
  textInput: { flex: 1, height: 50, fontSize: 16, color: '#333', fontWeight: '600' },

  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    padding: 14,
    borderRadius: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  dateText: { fontSize: 16, fontWeight: '600', color: '#333' },

  textAreaWrapper: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  textArea: { fontSize: 15, color: '#333', height: 80, textAlignVertical: 'top' },

  saveButton: {
    backgroundColor: '#C62828',
    borderRadius: 16,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
    elevation: 4,
    shadowColor: '#C62828',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
  },
  saveButtonText: { color: '#fff', fontSize: 18, fontWeight: '800' },
});

const pickerStyles = {
  inputIOS: {
    fontSize: 16,
    paddingVertical: 14,
    paddingHorizontal: 14,
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    color: '#333',
    paddingRight: 30,
    fontWeight: '600' as any,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  inputAndroid: {
    fontSize: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    color: '#333',
    paddingRight: 30,
    fontWeight: '600' as any,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  iconContainer: { top: 0, right: 0 },
};

export default AddExpenseScreen;
