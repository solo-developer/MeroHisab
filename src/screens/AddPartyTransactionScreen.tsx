import React, { useState, useEffect } from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  View,
  DeviceEventEmitter,
} from 'react-native';
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

  const [amount, setAmount] = useState('');
  const [wallets, setWallets] = useState<any[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<number | null>(null);
  const [parties, setParties] = useState<Party[]>([]);
  const [selectedParty, setSelectedParty] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

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

  const isPayment = type === 'payment';

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={GlobalStyles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#333" />
        </TouchableOpacity>
        <Text style={GlobalStyles.headerTitle}>{isPayment ? 'Make Payment' : 'Receive Payment'}</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={GlobalStyles.container}>
        <Text style={GlobalStyles.label}>Amount</Text>
        <TextInput
          style={GlobalStyles.input}
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
          placeholder="Enter amount"
        />

        <Text style={GlobalStyles.label}>{isPayment ? 'Paid To (Party)' : 'Received From (Party)'}</Text>
        <RNPickerSelect
          placeholder={{ label: 'Select Party', value: undefined }}
          items={parties.map((p) => ({
            label: p.name + ` (${p.type === 'creditor' ? 'Cr' : 'Dr'})`,
            value: p.id,
          }))}
          onValueChange={setSelectedParty}
          value={selectedParty}
          style={PickerStyles}
        />

        <Text style={GlobalStyles.label}>{isPayment ? 'Paid From (Wallet)' : 'Deposit To (Wallet)'}</Text>
        <RNPickerSelect
          placeholder={{ label: 'Select Wallet', value: undefined }}
          items={wallets.map((w) => ({
            label: String(w.name) + ` (Bal: ${w.balance})`,
            value: w.id,
          }))}
          onValueChange={setSelectedWallet}
          value={selectedWallet}
          style={PickerStyles}
        />

        <DateField
          label="Date"
          value={date}
          onPress={() => setShowDatePicker(true)}
        />

        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) setDate(selectedDate);
            }}
          />
        )}

        <Text style={GlobalStyles.label}>Note</Text>
        <TextInput
          style={[GlobalStyles.input, { height: 60 }]}
          value={note}
          onChangeText={setNote}
          multiline
          placeholder="Optional note"
        />

        <TouchableOpacity
          style={[localStyles.saveBtn, { backgroundColor: isPayment ? AppColors.danger : AppColors.success }]}
          onPress={handleSave}
        >
          <Text style={localStyles.saveText}>{isPayment ? 'Save Payment' : 'Save Receipt'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const localStyles = StyleSheet.create({
  saveBtn: {
    padding: 14,
    marginTop: 20,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 2,
  },
  saveText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
});
