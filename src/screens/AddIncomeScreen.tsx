// AddIncomeScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  DeviceEventEmitter,
} from 'react-native';
import { LedgerRepository } from '../repositories/LedgerRepository';
import CategoryRepository from '../repositories/CategoryRepository';
import { AddIncomeRequest, IncomeService } from '../services/IncomeService';

export const AddIncomeScreen = ({ navigation }: any) => {
  const [amount, setAmount] = useState('');
  const [grossAmount, setGrossAmount] = useState('');
  const [discount, setDiscount] = useState('');
  const [wallets, setWallets] = useState<any[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<number | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [date, setDate] = useState(new Date());
  const [note, setNote] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const walletsList = await LedgerRepository.getAll(); // exclude system ledgers
      setWallets(walletsList);

      const categoriesList = await CategoryRepository.getAll();
      setCategories(categoriesList);
    };

    fetchData();
  }, []);

  const handleSave = async () => {
    if (!selectedWallet) return Alert.alert('Error', 'Please select a wallet');

    const netAmount =
      grossAmount && discount
        ? parseFloat(grossAmount) - parseFloat(discount)
        : parseFloat(amount) || 0;

    const request: AddIncomeRequest = {
      amount: netAmount,
      grossAmount: grossAmount ? parseFloat(grossAmount) : undefined,
      discount: discount ? parseFloat(discount) : 0,
      walletId: selectedWallet,
      categoryId: selectedCategory || undefined,
      date: date.toISOString(),
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
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>Amount</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />

      <Text style={styles.label}>Gross Amount (optional)</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={grossAmount}
        onChangeText={setGrossAmount}
      />

      <Text style={styles.label}>Discount Given (optional)</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={discount}
        onChangeText={setDiscount}
      />

      <Text style={styles.label}>Wallet</Text>
      {/* Replace with Picker or dropdown */}
      {wallets.map(w => (
        <TouchableOpacity key={w.id} onPress={() => setSelectedWallet(w.id)}>
          <Text
            style={[styles.wallet, selectedWallet === w.id && styles.selected]}
          >
            {w.name}
          </Text>
        </TouchableOpacity>
      ))}

      <Text style={styles.label}>Category (optional)</Text>
      {categories.map(c => (
        <TouchableOpacity key={c.id} onPress={() => setSelectedCategory(c.id)}>
          <Text
            style={[
              styles.wallet,
              selectedCategory === c.id && styles.selected,
            ]}
          >
            {c.name}
          </Text>
        </TouchableOpacity>
      ))}

      <Text style={styles.label}>Note (optional)</Text>
      <TextInput
        style={[styles.input, { height: 80 }]}
        value={note}
        onChangeText={setNote}
        multiline
      />

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
        <Text style={styles.saveText}>Save Income</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16 },
  label: { fontWeight: 'bold', marginTop: 12 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 8,
    marginTop: 4,
  },
  wallet: {
    padding: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    marginTop: 4,
  },
  selected: { borderColor: 'blue', backgroundColor: '#e0f0ff' },
  saveBtn: {
    backgroundColor: 'green',
    padding: 12,
    marginTop: 24,
    borderRadius: 6,
    alignItems: 'center',
  },
  saveText: { color: '#fff', fontWeight: 'bold' },
});
