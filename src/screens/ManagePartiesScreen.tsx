import React, { useEffect, useLayoutEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, TextInput, Alert, Switch } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { GlobalStyles, AppColors } from '../constants/Styles';
import { PartyService } from '../services/PartyService';
import { Party } from '../models/Party';

const ManagePartiesScreen = ({ navigation }: any) => {
  const [parties, setParties] = useState<Party[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [initialBalance, setInitialBalance] = useState('');
  const [isCreditor, setIsCreditor] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={() => setModalVisible(true)} style={{ marginRight: 16 }}>
          <Text style={{ fontSize: 28, color: '#007AFF' }}>+</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  useEffect(() => {
    loadParties();
  }, []);

  const loadParties = async () => {
    const data = await PartyService.getAllParties();
    setParties(data);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a party name');
      return;
    }

    const type = isCreditor ? 'creditor' : 'debtor';
    const balance = parseFloat(initialBalance) || 0;

    await PartyService.createParty(name, type, balance);
    setModalVisible(false);
    resetForm();
    loadParties();
  };

  const resetForm = () => {
    setName('');
    setInitialBalance('');
    setIsCreditor(false);
  };

  const renderItem = ({ item }: { item: Party }) => (
    <View style={GlobalStyles.listItem}>
      <View style={GlobalStyles.rowBetween}>
        <View>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={[styles.itemType, { color: item.type === 'debtor' ? AppColors.success : AppColors.danger }]}>
            {item.type === 'debtor' ? 'To Receive (Debtor)' : 'To Pay (Creditor)'}
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
             <Text style={styles.balanceLabel}>Balance</Text>
             <Text style={styles.balance}>{item.currentBalance.toFixed(2)}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={GlobalStyles.container}>
      <FlatList
        data={parties}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={GlobalStyles.listEmptyText}>No parties added yet.</Text>}
        contentContainerStyle={{ paddingBottom: 20 }}
      />

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={GlobalStyles.title}>Add New Party</Text>
            
            <Text style={GlobalStyles.label}>Party Name</Text>
            <TextInput
              style={GlobalStyles.input}
              placeholder="e.g. John Doe, Supplier ABC"
              value={name}
              onChangeText={setName}
            />

            <Text style={GlobalStyles.label}>Opening Balance</Text>
            <TextInput
              style={GlobalStyles.input}
              placeholder="0.00"
              keyboardType="numeric"
              value={initialBalance}
              onChangeText={setInitialBalance}
            />

            <View style={[GlobalStyles.rowBetween, { marginVertical: 20 }]}>
                <Text style={GlobalStyles.label}>Party Type</Text>
                <View style={GlobalStyles.row}>
                    <Text style={{ marginRight: 10, color: isCreditor ? '#999' : AppColors.success, fontWeight: isCreditor ? 'normal' : 'bold' }}>Debtor (Receive)</Text>
                    <Switch
                        value={isCreditor}
                        onValueChange={setIsCreditor}
                        trackColor={{ false: AppColors.success, true: AppColors.danger }}
                    />
                    <Text style={{ marginLeft: 10, color: isCreditor ? AppColors.danger : '#999', fontWeight: isCreditor ? 'bold' : 'normal' }}>Creditor (Pay)</Text>
                </View>
            </View>

            <View style={GlobalStyles.rowBetween}>
                <TouchableOpacity style={[GlobalStyles.button, { backgroundColor: '#ccc', flex: 1, marginRight: 10 }]} onPress={() => setModalVisible(false)}>
                    <Text style={GlobalStyles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[GlobalStyles.button, { flex: 1 }]} onPress={handleSave}>
                    <Text style={GlobalStyles.buttonText}>Save</Text>
                </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    elevation: 5,
  },
  itemName: {
      fontSize: 16,
      fontWeight: '600',
      color: '#333'
  },
  itemType: {
      fontSize: 12,
      marginTop: 2
  },
  balanceLabel: {
      fontSize: 12,
      color: '#777'
  },
  balance: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#333'
  }
});

export default ManagePartiesScreen;
