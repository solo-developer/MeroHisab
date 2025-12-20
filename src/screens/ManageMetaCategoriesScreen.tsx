// src/screens/ManageMetaCategoriesScreen.tsx
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
  ScrollView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SettingsStackParamList } from '../navigation/SettingsStack';
import MetaCategoryRepository from '../repositories/MetaCategoryRepository';
import { Ledger, LedgerRepository } from '../repositories/LedgerRepository';

type Props = NativeStackScreenProps<SettingsStackParamList, 'ManageMetaCategories'>;

interface MetaCategory {
  id: number;
  name: string;
}

const ManageMetaCategoriesScreen: React.FC<Props> = ({ navigation }) => {
  const [categories, setCategories] = useState<MetaCategory[]>([]);
  const [allLedgers, setAllLedgers] = useState<Ledger[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<MetaCategory | null>(null);
  const [name, setName] = useState('');
  const [selectedLedgerIds, setSelectedLedgerIds] = useState<number[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchText, setSearchText] = useState('');

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
    loadCategories();
    loadLedgers();
  }, []);

  const loadCategories = async () => setCategories(await MetaCategoryRepository.getAll());
  const loadLedgers = async () => setAllLedgers(await LedgerRepository.getAll());

  const openAdd = () => {
    setEditing(null);
    setName('');
    setSelectedLedgerIds([]);
    setSearchText('');
    setDropdownOpen(false);
    setModalVisible(true);
  };

  const openEdit = async (category: MetaCategory) => {
    setEditing(category);
    setName(category.name);
    const assignedLedgers = await MetaCategoryRepository.getLedgers(category.id);
    setSelectedLedgerIds(assignedLedgers.map(l => l.id!));
    setSearchText('');
    setDropdownOpen(false);
    setModalVisible(true);
  };

  const toggleLedger = (ledgerId: number) => {
    setSelectedLedgerIds(prev =>
      prev.includes(ledgerId) ? prev.filter(id => id !== ledgerId) : [...prev, ledgerId]
    );
  };

  const save = async () => {
    if (!name.trim()) return;

    try {
      if (editing) {
        await MetaCategoryRepository.update(editing.id, name.trim(), selectedLedgerIds);
      } else {
        await MetaCategoryRepository.create(name.trim(), selectedLedgerIds);
      }
      setModalVisible(false);
      loadCategories();
    } catch (e) {
      Alert.alert('Error', 'Failed to save meta category');
    }
  };

  const remove = (category: MetaCategory) => {
    Alert.alert('Delete Meta Category', `Delete "${category.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await MetaCategoryRepository.delete(category.id);
          loadCategories();
        },
      },
    ]);
  };

  // Filter ledgers for dropdown
  const filteredLedgers = allLedgers.filter(
    l => l.name.toLowerCase().includes(searchText.toLowerCase()) && !selectedLedgerIds.includes(l.id!)
  );

  const EmptyState = ({ onAdd }: { onAdd: () => void }) => (
    <View style={styles.emptyContainer}>
      <Text style={{ fontSize: 56, marginBottom: 12 }}>📂</Text>
      <Text style={styles.emptyTitle}>No Meta Categories yet</Text>
      <Text style={styles.emptyText}>
        Group ledgers into meta categories for consolidated reports
      </Text>
      <TouchableOpacity onPress={onAdd} style={styles.emptyButton}>
        <Text style={styles.emptyButtonText}>Add Meta Category</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={categories}
        keyExtractor={i => i.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.name}>{item.name}</Text>
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
        ListEmptyComponent={<EmptyState onAdd={openAdd} />}
        contentContainerStyle={categories.length === 0 ? styles.emptyList : undefined}
      />

      {/* -------- MODAL -------- */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={[styles.modal, { maxHeight: '85%' }]}>
            <Text style={styles.title}>
              {editing ? 'Edit Meta Category' : 'Add Meta Category'}
            </Text>

            {/* Meta Category Name */}
            <TextInput
              placeholder="Meta Category Name"
              value={name}
              onChangeText={setName}
              style={styles.input}
            />

            {/* Selected Ledgers Chips */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginBottom: 12 }}
            >
              {selectedLedgerIds
                .map(id => allLedgers.find(l => l.id === id))
                .filter(Boolean)
                .map(l => (
                  <View key={l!.id} style={styles.chip}>
                    <Text style={styles.chipText}>{l!.name}</Text>
                    <TouchableOpacity onPress={() => toggleLedger(l!.id!)}>
                      <Text style={{ color: '#fff', marginLeft: 6 }}>×</Text>
                    </TouchableOpacity>
                  </View>
                ))}
            </ScrollView>

            {/* Searchable Dropdown */}
            <TouchableOpacity
              style={styles.dropdownInput}
              onPress={() => setDropdownOpen(prev => !prev)}
            >
              <Text style={{ color: '#555' }}>
                {dropdownOpen ? 'Select ledgers...' : 'Tap to select ledgers'}
              </Text>
            </TouchableOpacity>

            {dropdownOpen && (
              <View style={styles.dropdownList}>
                <TextInput
                  placeholder="Search ledgers..."
                  value={searchText}
                  onChangeText={setSearchText}
                  style={styles.dropdownSearch}
                />
                <ScrollView style={{ maxHeight: 200 }}>
                  {filteredLedgers.map(l => (
                    <TouchableOpacity
                      key={l.id}
                      onPress={() => toggleLedger(l.id!)}
                      style={styles.dropdownItem}
                    >
                      <Text>{l.name}</Text>
                    </TouchableOpacity>
                  ))}
                  {filteredLedgers.length === 0 && (
                    <Text style={{ padding: 8, color: '#888' }}>No ledgers found</Text>
                  )}
                </ScrollView>
              </View>
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

export default ManageMetaCategoriesScreen;

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
  actions: { flexDirection: 'row', gap: 16 },
  action: { fontSize: 14, fontWeight: '500', color: '#007AFF' },

  overlay: {
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
  emptyList: { flexGrow: 1, justifyContent: 'center' },
  emptyContainer: { alignItems: 'center', paddingHorizontal: 30 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#111', marginBottom: 6 },
  emptyText: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 20 },
  emptyButton: { backgroundColor: '#007AFF', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8 },
  emptyButtonText: { color: '#fff', fontSize: 15, fontWeight: '600' },

  chip: {
    flexDirection: 'row',
    backgroundColor: '#007AFF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    alignItems: 'center',
  },
  chipText: { color: '#fff', fontWeight: '500' },

  dropdownInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 4,
  },
  dropdownList: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 14,
    backgroundColor: '#fff',
  },
  dropdownSearch: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  dropdownItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
});
