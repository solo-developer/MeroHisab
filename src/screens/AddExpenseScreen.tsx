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
import CategoryRepository from '../repositories/CategoryRepository';
import WalletRepository from '../repositories/WalletRepository';
import { AddExpenseRequest, ExpenseService } from '../services/ExpenseService';
import { AppColors, GlobalStyles, PickerStyles } from '../constants/Styles';

export const AddExpenseScreen = ({ navigation }: any) => {
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

    if (!grossAmount || netAmount <= 0)
      return Alert.alert('Error', 'Invalid amount');

    const request: AddExpenseRequest = {
      amount: netAmount,
      grossAmount: parseFloat(grossAmount),
      discount: discount ? parseFloat(discount) : 0,
      walletId: selectedWallet,
      categoryId: selectedCategory || undefined,
      date: new Date().toISOString(),
      note,
    };

    try {
      await ExpenseService.addExpense(request);
      Alert.alert('Success', 'Expense added successfully');
      DeviceEventEmitter.emit('expenseAdded');
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to add expense');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Header */}
      <View style={GlobalStyles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#333" />
        </TouchableOpacity>
        <Text style={GlobalStyles.headerTitle}>Add Expense</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={GlobalStyles.container}>
        <Text style={GlobalStyles.label}>Gross Amount</Text>
        <TextInput
          style={GlobalStyles.input}
          keyboardType="numeric"
          value={grossAmount}
          onChangeText={setGrossAmount}
          placeholder="Enter gross amount"
        />

        <Text style={GlobalStyles.label}>Discount</Text>
        <TextInput
          style={GlobalStyles.input}
          keyboardType="numeric"
          value={discount}
          onChangeText={setDiscount}
          placeholder="Enter discount"
        />

        <Text style={GlobalStyles.label}>Net Amount</Text>
        <TextInput
          style={[GlobalStyles.input, { backgroundColor: '#f0f0f0' }]}
          value={netAmountValue}
          editable={false}
        />

        <Text style={GlobalStyles.label}>Wallet</Text>
        <RNPickerSelect
          placeholder={{ label: 'Select Wallet', value: undefined }}
          items={wallets.map((w) => ({
            label: String(w.name),
            value: w.id,
          }))}
          onValueChange={setSelectedWallet}
          value={selectedWallet}
          style={PickerStyles}
        />

        <Text style={GlobalStyles.label}>Category</Text>
        <RNPickerSelect
          placeholder={{ label: 'Select Category', value: undefined }}
          items={categories.map((c) => ({
            label: String(c.name),
            value: c.id,
          }))}
          onValueChange={setSelectedCategory}
          value={selectedCategory}
          style={PickerStyles}
        />

        <Text style={GlobalStyles.label}>Note</Text>
        <TextInput
          style={[GlobalStyles.input, { height: 60 }]}
          value={note}
          onChangeText={setNote}
          multiline
          placeholder="Optional note"
        />

        <TouchableOpacity style={localStyles.saveBtn} onPress={handleSave}>
          <Text style={localStyles.saveText}>Save Expense</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const localStyles = StyleSheet.create({
  saveBtn: {
    backgroundColor: AppColors.danger,
    padding: 14,
    marginTop: 20,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 2,
  },
  saveText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
});
