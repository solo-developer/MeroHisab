import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { LedgerRepository } from '../repositories/LedgerRepository';
import { TransferService } from '../services/TransferService';

type Props = {
  onClose: () => void;
  onSaved: () => void;
};

type LedgerItem = { id: number; name: string };

const TransferModalContent: React.FC<Props> = ({ onClose, onSaved }) => {
  const [fromLedger, setFromLedger] = useState<LedgerItem | null>(null);
  const [toLedger, setToLedger] = useState<LedgerItem | null>(null);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  const [ledgerList, setLedgerList] = useState<LedgerItem[]>([]);
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);

  useEffect(() => {
    loadLedgers();
  }, []);

  const loadLedgers = async () => {
    const ledgers = await LedgerRepository.getAll();
    setLedgerList(ledgers.map(l => ({ id: l.id!, name: l.name })));
  };

  const saveTransfer = async () => {
    if (!fromLedger || !toLedger) {
      Alert.alert('Error', 'Select both From and To ledgers');
      return;
    }
    if (!amount || Number(amount) <= 0) {
      Alert.alert('Error', 'Enter a valid amount');
      return;
    }

    try {
      await TransferService.createTransfer({
        fromLedgerId: fromLedger.id,
        toLedgerId: toLedger.id,
        amount: Number(amount),
        note,
      });
      Alert.alert('Success', 'Transfer saved!');
      setFromLedger(null);
      setToLedger(null);
      setAmount('');
      setNote('');
      onSaved();
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to save transfer');
    }
  };

  const renderLedgerDropdown = (
    label: string,
    selected: LedgerItem | null,
    setSelected: (item: LedgerItem) => void,
    showDropdown: boolean,
    setShowDropdown: (v: boolean) => void,
  ) => (
    <View style={{ marginBottom: 16 }}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={[styles.dropdownButton, showDropdown && { borderColor: '#0a84ff' }]}
        onPress={() => setShowDropdown(prev => !prev)}
      >
        <Text style={{ color: selected ? '#000' : '#999', fontSize: 16 }}>
          {selected ? selected.name : `Select ${label}`}
        </Text>
        <MaterialCommunityIcons
          name={showDropdown ? 'chevron-up' : 'chevron-down'}
          size={24}
          color="#666"
        />
      </TouchableOpacity>
      {showDropdown && (
        <FlatList
          data={ledgerList}
          keyExtractor={item => item.id.toString()}
          style={styles.dropdownList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => {
                setSelected(item);
                setShowDropdown(false);
              }}
            >
              <Text style={{ fontSize: 16 }}>{item.name}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.overlay}
    >
      <View style={styles.modal}>
        <Text style={styles.title}>New Transfer</Text>

        {renderLedgerDropdown('From Ledger', fromLedger, setFromLedger, showFromDropdown, setShowFromDropdown)}
        {renderLedgerDropdown('To Ledger', toLedger, setToLedger, showToDropdown, setShowToDropdown)}

        <View style={{ marginBottom: 16 }}>
          <Text style={styles.label}>Amount</Text>
          <TextInput
            placeholder="Enter amount"
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
            style={styles.input}
          />
        </View>

        <View style={{ marginBottom: 16 }}>
          <Text style={styles.label}>Note (optional)</Text>
          <TextInput
            placeholder="Enter note"
            value={note}
            onChangeText={setNote}
            style={styles.input}
          />
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.saveButton} onPress={saveTransfer}>
            <Text style={styles.btnText}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.btnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default TransferModalContent;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modal: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 8,
  },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 24, textAlign: 'center' },
  label: { fontSize: 14, fontWeight: '600', color: '#555', marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#f9f9f9',
  },
  dropdownList: {
    maxHeight: 160,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    marginTop: 4,
    backgroundColor: '#fff',
    elevation: 4,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: '#eee',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    borderRadius: 10,
    marginRight: 10,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F44336',
    paddingVertical: 14,
    borderRadius: 10,
  },
  btnText: { color: '#fff', fontWeight: '700', textAlign: 'center', fontSize: 16 },
});
