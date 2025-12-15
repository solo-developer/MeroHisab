// AddIncomeScreen.tsx
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
import { LedgerRepository } from '../repositories/LedgerRepository';
import CategoryRepository from '../repositories/CategoryRepository';
import { AddIncomeRequest, IncomeService } from '../services/IncomeService';
import WalletRepository from '../repositories/WalletRepository';

export const AddIncomeScreen = ({ navigation }: any) => {
  const [grossAmount, setGrossAmount] = useState('');
  const [discount, setDiscount] = useState('');
  const [wallets, setWallets] = useState<any[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<number | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [note, setNote] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const walletsList = await WalletRepository.getAll();
      setWallets(walletsList);

      const categoriesList = await CategoryRepository.getAll();
      setCategories(categoriesList);
    };
    fetchData();
  }, []);

  const netAmount = grossAmount
    ? parseFloat(grossAmount) - (parseFloat(discount) || 0)
    : 0;
  const netAmountValue = !isNaN(netAmount) ? netAmount.toFixed(2) : '0.00';

  const handleSave = async () => {
    if (!selectedWallet)
      return Alert.alert('Error', 'Please select a wallet');

    const request: AddIncomeRequest = {
      amount: netAmount,
      grossAmount: grossAmount ? parseFloat(grossAmount) : undefined,
      discount: discount ? parseFloat(discount) : 0,
      walletId: selectedWallet,
      categoryId: selectedCategory || undefined,
      date: new Date().toISOString(),
      note,
    };

    try {
      await IncomeService.addIncome(request);
      Alert.alert('Success', 'Income added successfully');
      DeviceEventEmitter.emit('incomeAdded');
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to add income');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Income</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.label}>Gross Amount</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={grossAmount}
          onChangeText={setGrossAmount}
          placeholder="Enter gross amount"
        />

        <Text style={styles.label}>Discount</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={discount}
          onChangeText={setDiscount}
          placeholder="Enter discount"
        />

        <Text style={styles.label}>Net Amount</Text>
        <TextInput
          style={[styles.input, { backgroundColor: '#f0f0f0' }]}
          value={netAmountValue}
          editable={false}
        />

        <Text style={styles.label}>Wallet</Text>
        <RNPickerSelect
          placeholder={{ label: 'Select Wallet', value: undefined }}
          items={wallets.map((w) => ({
            label: String(w.name),
            value: w.id,
          }))}
          onValueChange={setSelectedWallet}
          value={selectedWallet}
          style={pickerStyles}
        />

        <Text style={styles.label}>Category</Text>
        <RNPickerSelect
          placeholder={{ label: 'Select Category', value: undefined }}
          items={categories.map((c) => ({
            label: String(c.name),
            value: c.id,
          }))}
          onValueChange={setSelectedCategory}
          value={selectedCategory}
          style={pickerStyles}
        />

        <Text style={styles.label}>Note</Text>
        <TextInput
          style={[styles.input, { height: 60 }]}
          value={note}
          onChangeText={setNote}
          multiline
          placeholder="Optional note"
        />

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveText}>Save Income</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 50,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    elevation: 2,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  container: {
    padding: 16,
    flexGrow: 1,
  },
  label: {
    fontWeight: '600',
    marginTop: 12,
    fontSize: 13,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    marginTop: 4,
    fontSize: 14,
  },
  saveBtn: {
    backgroundColor: '#4CAF50',
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

const pickerStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 14,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    color: 'black',
    paddingRight: 30,
    marginTop: 4,
    backgroundColor: '#fff',
  },
  inputAndroid: {
    fontSize: 14,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    color: 'black',
    paddingRight: 30,
    marginTop: 4,
    backgroundColor: '#fff',
  },
});
