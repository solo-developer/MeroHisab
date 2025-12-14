// src/screens/ManageWalletsScreen.tsx
import React, { useEffect, useLayoutEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  StyleSheet,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SettingsStackParamList } from '../navigation/SettingsStack';
import WalletRepository from '../repositories/WalletRepository';
import { WalletsService } from '../services/WalletsService';
import Wallet from '../models/Wallet';

type Props = NativeStackScreenProps<SettingsStackParamList, 'ManageWallets'>;

const ManageWalletsScreen: React.FC<Props> = ({ navigation }) => {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<Wallet | null>(null);

  const [name, setName] = useState('');
  const [openingBalance, setOpeningBalance] = useState('');

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={openAdd} style={{ marginRight: 15 }}>
          <Text style={{ fontSize: 28 }}>+</Text>
        </TouchableOpacity>
      ),
    });
  }, []);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setWallets(await WalletRepository.getAll());
  };

  const openAdd = () => {
    setEditing(null);
    setName('');
    setOpeningBalance('');
    setModalVisible(true);
  };

  const openEdit = (wallet: Wallet) => {
    setEditing(wallet);
    setName(wallet.name);
    setOpeningBalance('');
    setModalVisible(true);
  };

  const save = async () => {
    if (!name.trim()) return;

    try {
      if (editing) {
        editing.name = name.trim();
        await WalletRepository.update(editing);
      } else {
        await WalletsService.createWallet({
          name: name.trim(),
          openingBalance: Number(openingBalance) || 0,
        });
      }

      setModalVisible(false);
      load();
    } catch (e) {
      Alert.alert('Error', 'Failed to save wallet');
    }
  };

  const remove = (wallet: Wallet) => {
    Alert.alert('Delete Wallet', `Delete "${wallet.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await WalletRepository.delete(wallet.id!);
          load();
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={wallets}
        keyExtractor={i => i.id!.toString()}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.balance}>₹ {item.balance}</Text>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity onPress={() => openEdit(item)}>
                <Text style={styles.action}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => remove(item)}>
                <Text style={styles.action}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* -------- MODAL -------- */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.title}>
              {editing ? 'Edit Wallet' : 'Add Wallet'}
            </Text>

            <TextInput
              placeholder="Wallet Name"
              value={name}
              onChangeText={setName}
              style={styles.input}
            />

            {!editing && (
              <TextInput
                placeholder="Opening Balance"
                keyboardType="numeric"
                value={openingBalance}
                onChangeText={setOpeningBalance}
                style={styles.input}
              />
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity onPress={save} style={styles.save}>
                <Text style={styles.btnText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.cancel}
              >
                <Text style={styles.btnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ManageWalletsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  name: { fontSize: 16, fontWeight: '500', color: '#111' },
  balance: { marginTop: 4, fontSize: 14, color: '#666' },
  actions: { flexDirection: 'row', gap: 16 },
  action: { fontSize: 14, fontWeight: '500', color: '#007AFF' },
  /* ---------- MODAL ---------- */ overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
  },
  title: { fontSize: 20, fontWeight: '600', marginBottom: 16, color: '#111' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    marginBottom: 14,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  save: {
    flex: 1,
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 10,
  },
  cancel: {
    flex: 1,
    backgroundColor: '#F44336',
    paddingVertical: 12,
    borderRadius: 8,
  },
  btnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
});
