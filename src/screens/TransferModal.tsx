import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Modal
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { TransferService, TransferRequest } from '../services/TransferService';
import WalletRepository from '../repositories/WalletRepository';

interface TransferModalProps {
  visible: boolean;
  onClose: () => void;
  onSaved: () => void;
}

const TransferModal: React.FC<TransferModalProps> = ({ visible, onClose, onSaved }) => {
  const [wallets, setWallets] = useState<any[]>([]);
  const [fromLedgerId, setFromLedgerId] = useState<number | undefined>();
  const [toLedgerId, setToLedgerId] = useState<number | undefined>();
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');

  useEffect(() => {
    // Load wallets/ledgers for pickers
    WalletRepository.getAll().then(ws => setWallets(ws));
  }, []);

  const save = async () => {
    const amt = Number(amount);
    if (amt <= 0) return alert('Amount must be greater than 0');
    if (!fromLedgerId && !toLedgerId) return alert('Select at least one ledger');

    const request: TransferRequest = {
      fromLedgerId,
      toLedgerId,
      amount: amt,
      date,
      note
    };

    try {
      await TransferService.createTransfer(request);
      onSaved();
      onClose();
    } catch (e) {
      console.error(e);
      alert('Failed to create transfer');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Add Transfer</Text>

          <Text>From (optional)</Text>
          <Picker
            selectedValue={fromLedgerId}
            onValueChange={val => setFromLedgerId(val)}
          >
            <Picker.Item label="External" value={undefined} />
            {wallets.map(w => (
              <Picker.Item key={w.id} label={w.name} value={w.ledgerId} />
            ))}
          </Picker>

          <Text>To (optional)</Text>
          <Picker
            selectedValue={toLedgerId}
            onValueChange={val => setToLedgerId(val)}
          >
            <Picker.Item label="External" value={undefined} />
            {wallets.map(w => (
              <Picker.Item key={w.id} label={w.name} value={w.ledgerId} />
            ))}
          </Picker>

          <Text>Amount</Text>
          <TextInput
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
            style={styles.input}
          />

          <Text>Date</Text>
          <TextInput
            value={date}
            onChangeText={setDate}
            style={styles.input}
          />

          <Text>Note</Text>
          <TextInput
            value={note}
            onChangeText={setNote}
            style={styles.input}
          />

          <View style={styles.actions}>
            <TouchableOpacity onPress={save} style={styles.save}>
              <Text style={styles.btnText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onClose} style={styles.cancel}>
              <Text style={styles.btnText}>Cancel</Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </Modal>
  );
};

export default TransferModal;

const styles = StyleSheet.create({
  overlay: {
    flex:1,
    backgroundColor:'rgba(0,0,0,0.45)',
    justifyContent:'center',
    alignItems:'center'
  },
  modal: {
    width:'85%',
    backgroundColor:'#fff',
    borderRadius:10,
    padding:20
  },
  title: { fontSize:20, fontWeight:'600', marginBottom:16 },
  input: { borderWidth:1, borderColor:'#ccc', borderRadius:8, padding:10, marginBottom:12 },
  actions: { flexDirection:'row', justifyContent:'space-between', marginTop:10 },
  save: { flex:1, backgroundColor:'#4CAF50', padding:12, borderRadius:8, marginRight:10 },
  cancel: { flex:1, backgroundColor:'#F44336', padding:12, borderRadius:8 },
  btnText: { color:'#fff', textAlign:'center', fontWeight:'600' }
});
function alert(arg0: string) {
    throw new Error('Function not implemented.');
}

