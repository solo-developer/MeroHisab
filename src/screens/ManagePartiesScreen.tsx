import React, { useEffect, useLayoutEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, TextInput, Alert } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { GlobalStyles, AppColors } from '../constants/Styles';
import { PartyService } from '../services/PartyService';
import { Party } from '../models/Party';

const ManagePartiesScreen = ({ navigation }: any) => {
  const [parties, setParties] = useState<Party[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [initialBalance, setInitialBalance] = useState('');
  const [partyType, setPartyType] = useState<'debtor' | 'creditor'>('debtor');

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={() => setModalVisible(true)} style={{ marginRight: 16 }}>
          <Ionicons name="add-circle" size={28} color="#007AFF" />
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

    const balance = parseFloat(initialBalance) || 0;
    const balanceText = balance > 0 ? `₹${balance.toFixed(2)}` : 'no balance';
    const typeText = partyType === 'debtor' ? 'They Owe You' : 'You Owe Them';

    Alert.alert(
      'Confirm Party Creation',
      `Create party "${name}" with ${balanceText}?\n\nType: ${typeText}\n\n⚠️ This action cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Create',
          style: 'default',
          onPress: async () => {
            await PartyService.createParty(name, partyType, balance);
            setModalVisible(false);
            resetForm();
            loadParties();
            Alert.alert('Success', `Party "${name}" has been created successfully!`);
          },
        },
      ]
    );
  };

  const resetForm = () => {
    setName('');
    setInitialBalance('');
    setPartyType('debtor');
  };

  const renderItem = ({ item }: { item: Party }) => (
    <View style={styles.partyCard}>
      <View style={styles.partyHeader}>
        <View style={styles.partyIconContainer}>
          <MaterialCommunityIcons
            name="account-circle"
            size={40}
            color={item.type === 'debtor' ? AppColors.success : AppColors.danger}
          />
        </View>
        <View style={styles.partyInfo}>
          <Text style={styles.partyName}>{item.name}</Text>
          <View style={styles.partyTypeContainer}>
            <MaterialCommunityIcons
              name={item.type === 'debtor' ? 'arrow-down-circle' : 'arrow-up-circle'}
              size={14}
              color={item.type === 'debtor' ? AppColors.success : AppColors.danger}
            />
            <Text style={[styles.partyTypeText, { color: item.type === 'debtor' ? AppColors.success : AppColors.danger }]}>
              {item.type === 'debtor' ? 'They Owe You' : 'You Owe Them'}
            </Text>
          </View>
        </View>
        <View style={styles.balanceContainer}>
          <Text style={styles.balanceLabel}>Balance</Text>
          <Text style={[styles.balanceAmount, { color: item.currentBalance >= 0 ? AppColors.success : AppColors.danger }]}>
            ₹{Math.abs(item.currentBalance).toFixed(2)}
          </Text>
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
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="account-group-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No parties added yet</Text>
            <Text style={styles.emptySubtext}>Tap the + button to add your first party</Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 20, paddingTop: 8 }}
      />

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setModalVisible(false);
          resetForm();
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Party</Text>
              <TouchableOpacity onPress={() => { setModalVisible(false); resetForm(); }}>
                <Ionicons name="close-circle" size={28} color="#999" />
              </TouchableOpacity>
            </View>

            <View style={styles.formSection}>
              <Text style={styles.inputLabel}>Party Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter party name (e.g., John Doe, ABC Suppliers)"
                value={name}
                onChangeText={setName}
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.formSection}>
              <Text style={styles.inputLabel}>Opening Balance (Optional)</Text>
              <View style={styles.balanceInputContainer}>
                <Text style={styles.currencySymbol}>₹</Text>
                <TextInput
                  style={styles.balanceInput}
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                  value={initialBalance}
                  onChangeText={setInitialBalance}
                  placeholderTextColor="#999"
                />
              </View>
              <Text style={styles.helperText}>Enter the initial amount if there's an existing balance</Text>
            </View>

            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Select Party Type *</Text>

              <TouchableOpacity
                style={[styles.radioOption, partyType === 'debtor' && styles.radioOptionSelected]}
                onPress={() => setPartyType('debtor')}
                activeOpacity={0.7}
              >
                <View style={styles.radioLeft}>
                  <View style={styles.radioCircle}>
                    {partyType === 'debtor' && <View style={styles.radioCircleSelected} />}
                  </View>
                  <View style={styles.radioTextContainer}>
                    <Text style={[styles.radioTitle, partyType === 'debtor' && styles.radioTitleSelected]}>
                      They Owe Me
                    </Text>
                    <Text style={styles.radioDescription}>
                      This party owes you money (Receivable)
                    </Text>
                  </View>
                </View>
                <MaterialCommunityIcons name="arrow-down-circle" size={24} color={AppColors.success} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.radioOption, partyType === 'creditor' && styles.radioOptionSelected]}
                onPress={() => setPartyType('creditor')}
                activeOpacity={0.7}
              >
                <View style={styles.radioLeft}>
                  <View style={styles.radioCircle}>
                    {partyType === 'creditor' && <View style={styles.radioCircleSelected} />}
                  </View>
                  <View style={styles.radioTextContainer}>
                    <Text style={[styles.radioTitle, partyType === 'creditor' && styles.radioTitleSelected]}>
                      I Owe Them
                    </Text>
                    <Text style={styles.radioDescription}>
                      You owe money to this party (Payable)
                    </Text>
                  </View>
                </View>
                <MaterialCommunityIcons name="arrow-up-circle" size={24} color={AppColors.danger} />
              </TouchableOpacity>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleSave}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons name="check-circle" size={20} color="#fff" />
                <Text style={styles.saveButtonText}>Save Party</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => { setModalVisible(false); resetForm(); }}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  // Party Card Styles
  partyCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  partyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  partyIconContainer: {
    marginRight: 12,
  },
  partyInfo: {
    flex: 1,
  },
  partyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  partyTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  partyTypeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  balanceContainer: {
    alignItems: 'flex-end',
  },
  balanceLabel: {
    fontSize: 11,
    color: '#999',
    marginBottom: 2,
  },
  balanceAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
  },

  // Form Styles
  formSection: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    color: '#333',
  },
  balanceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    backgroundColor: '#f9f9f9',
    paddingHorizontal: 14,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginRight: 8,
  },
  balanceInput: {
    flex: 1,
    padding: 14,
    fontSize: 16,
    color: '#333',
  },
  helperText: {
    fontSize: 12,
    color: '#999',
    marginTop: 6,
    fontStyle: 'italic',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },

  // Radio Button Styles
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#fafafa',
  },
  radioOptionSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f7ff',
  },
  radioLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  radioCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioCircleSelected: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#007AFF',
  },
  radioTextContainer: {
    flex: 1,
  },
  radioTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
    marginBottom: 2,
  },
  radioTitleSelected: {
    color: '#333',
    fontWeight: '600',
  },
  radioDescription: {
    fontSize: 12,
    color: '#999',
  },

  // Button Styles
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    gap: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ManagePartiesScreen;
