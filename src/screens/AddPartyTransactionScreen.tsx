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

export const AddPartyTransactionScreen = ({ navigation }: any) => {
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
    if (!selectedWallet) return Alert.alert('Error', 'Please select a wallet');
    if (!selectedParty) return Alert.alert('Error', 'Please select a party');
    if (!amount) return Alert.alert('Error', 'Please enter amount');

    const amountVal = parseFloat(amount);
    if (isNaN(amountVal) || amountVal <= 0) return Alert.alert('Error', 'Invalid amount');

    try {
      await PartyService.addTransaction({
        type,
        partyId: selectedParty,
        walletId: selectedWallet,
        amount: amountVal,
        date: date.toISOString(),
        note
      });
      
      Alert.alert('Success', 'Transaction recorded successfully');
      DeviceEventEmitter.emit('transactionAdded'); // refresh dashboard/lists if listening
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to record transaction');
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

        {/* 
            Payment (Pay to Creditor): Party is Receiver, Wallet is Source.
            Receipt (Receive from Debtor): Wallet is Receiver, Party is Source. 
        */}

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
        {/* We would render DateTimePicker modal here if using common pattern, assuming DateField handles display only */}
        {/* Since I cannot see DateField implementation deeply or if it includes the modal, I'll assume standard pattern or simple native picker usage if DateField requires external picker. 
           Actually, looking at previous ReminderScreen, I might need the datetimepicker component here too.
           For brevity, just keeping DateField display logic and verify if DateField has internal picker or if I should add it.
           The DateField read earlier seemed to just have a TouchableOpacity.
        */}
        
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
      
      {/* Import DateTimePicker dynamically or at top if needed. I'll stick to a simple impl for now and if user needs it, I'll add the proper picker code similar to ReminderScreen. 
          Actually, let's just add it to be safe.
      */}
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
