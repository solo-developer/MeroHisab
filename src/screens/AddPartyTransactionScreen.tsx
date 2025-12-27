import React, { useState, useEffect } from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  View,
  DeviceEventEmitter,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import RNPickerSelect from 'react-native-picker-select';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Platform } from 'react-native';
import { PartyRepository } from '../repositories/PartyRepository';
import WalletRepository from '../repositories/WalletRepository';
import { PartyService } from '../services/PartyService';
import { AppColors, GlobalStyles, PickerStyles } from '../constants/Styles';
import { Party } from '../models/Party';
import { useRoute } from '@react-navigation/native';
import DateField from '../components/DateField';
import { useSnackbar } from '../context/SnackbarContext';

export const AddPartyTransactionScreen = ({ navigation }: any) => {
  const { showSnackbar } = useSnackbar();
  const route = useRoute();
  const { type } = route.params as { type: 'payment' | 'receipt' };
  const isPayment = type === 'payment';

  const [amount, setAmount] = useState('');
  const [wallets, setWallets] = useState<any[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<number | null>(null);
  const [parties, setParties] = useState<Party[]>([]);
  const [selectedParty, setSelectedParty] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Theme Colors based on Type
  const accentColor = isPayment ? '#C62828' : '#2E7D32'; // Red vs Green
  const bgLightColor = isPayment ? '#FFEBEE' : '#E8F5E9'; // Light Red vs Light Green
  const placeholderColor = isPayment ? '#EF9A9A' : '#A5D6A7';

  useEffect(() => {
    const fetchData = async () => {
      const walletsList = await WalletRepository.getAll();
      setWallets(walletsList);

      const partiesList = await PartyRepository.getAll();
      setParties(partiesList);
    };
    fetchData();
  }, []);

  const handleSave = async () => {
    if (!selectedWallet) return showSnackbar('Please select a wallet', 3000, 'error');
    if (!selectedParty) return showSnackbar('Please select a party', 3000, 'error');
    if (!amount) return showSnackbar('Please enter amount', 3000, 'error');

    const amountVal = parseFloat(amount);
    if (isNaN(amountVal) || amountVal <= 0) return showSnackbar('Invalid amount', 3000, 'error');

    try {
      await PartyService.addTransaction({
        type,
        partyId: selectedParty,
        walletId: selectedWallet,
        amount: amountVal,
        date: date.toISOString(),
        note
      });

      showSnackbar('Transaction recorded successfully', 3000, 'success');
      DeviceEventEmitter.emit('transactionAdded'); // refresh dashboard/lists if listening
      navigation.goBack();
    } catch (err: any) {
      showSnackbar(err.message || 'Failed to record transaction', 3000, 'error');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgLightColor }]} edges={['top', 'bottom', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={bgLightColor} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backButton, { backgroundColor: isPayment ? 'rgba(198, 40, 40, 0.1)' : 'rgba(46, 125, 50, 0.1)' }]}>
          <Ionicons name="close" size={24} color={accentColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: accentColor }]}>{isPayment ? 'Make Payment' : 'Receive Payment'}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Amount */}
        <View style={styles.amountContainer}>
          <Text style={[styles.currencySymbol, { color: placeholderColor }]}>₹</Text>
          <TextInput
            style={[styles.amountInput, { color: accentColor }]}
            placeholder="0"
            placeholderTextColor={placeholderColor}
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
            autoFocus
          />
        </View>
        <Text style={[styles.amountLabel, { color: isPayment ? '#E57373' : '#81C784' }]}>Total Amount</Text>

        <View style={styles.formContainer}>

          {/* Party Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{isPayment ? 'Paid To (Party)' : 'Received From (Party)'}</Text>
            <RNPickerSelect
              onValueChange={setSelectedParty}
              items={parties.map(p => ({ label: p.name, value: p.id }))}
              value={selectedParty}
              style={pickerStyles}
              placeholder={{ label: 'Select Party', value: null }}
              Icon={() => <Ionicons name="person-outline" size={20} color={accentColor} style={{ marginTop: 12, marginRight: 10 }} />}
            />
          </View>

          {/* Wallet Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{isPayment ? 'Paid From (Wallet)' : 'Deposit To (Wallet)'}</Text>
            <RNPickerSelect
              onValueChange={setSelectedWallet}
              items={wallets.map(w => ({ label: w.name, value: w.id }))}
              value={selectedWallet}
              style={pickerStyles}
              placeholder={{ label: 'Select Wallet', value: null }}
              Icon={() => <Ionicons name="wallet-outline" size={20} color={accentColor} style={{ marginTop: 12, marginRight: 10 }} />}
            />
          </View>

          {/* Date Picker */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Date</Text>
            <TouchableOpacity style={styles.dateSelector} onPress={() => setShowDatePicker(true)}>
              <Ionicons name="calendar-outline" size={20} color={accentColor} />
              <Text style={styles.dateText}>{date.toLocaleDateString()}</Text>
            </TouchableOpacity>
          </View>

          {/* Note */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Note</Text>
            <View style={styles.textAreaWrapper}>
              <TextInput
                style={styles.textArea}
                placeholder="About this transaction..."
                multiline
                numberOfLines={3}
                value={note}
                onChangeText={setNote}
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: accentColor }]}
            onPress={handleSave}
          >
            <Text style={styles.saveButtonText}>{isPayment ? 'Save Payment' : 'Save Receipt'}</Text>
            <Ionicons name="checkmark-circle" size={20} color="#fff" />
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
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
  },
  headerTitle: { fontSize: 18, fontWeight: '700' },

  scrollContent: { paddingBottom: 40 },

  amountContainer: { alignItems: 'center', justifyContent: 'center', marginVertical: 30 },
  currencySymbol: { fontSize: 32, fontWeight: '700' },
  amountInput: { fontSize: 56, fontWeight: '900', textAlign: 'center', minWidth: 100 },
  amountLabel: { fontSize: 14, marginTop: -6 },

  formContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    minHeight: 500,
  },

  inputGroup: { marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '700', color: '#888', marginBottom: 8, textTransform: 'uppercase' },

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
    borderRadius: 16,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
    elevation: 4,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
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

export default AddPartyTransactionScreen;
