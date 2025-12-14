// src/screens/ManageCategoriesScreen.tsx
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
import CategoryRepository from '../repositories/CategoryRepository';
import { CategoriesService } from '../services/CategoriesService';
import Category from '../models/Category';

type Props = NativeStackScreenProps<SettingsStackParamList, 'ManageCategories'>;

const ManageCategoriesScreen: React.FC<Props> = ({ navigation }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);

  const [name, setName] = useState('');
  const [icon, setIcon] = useState('');
  const [color, setColor] = useState('');
  const [type, setType] = useState<'expense' | 'income'>('expense');

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
    setCategories(await CategoryRepository.getAll());
  };

  const openAdd = () => {
    setEditing(null);
    setName('');
    setIcon('');
    setColor('');
    setType('expense');
    setModalVisible(true);
  };

  const openEdit = (category: Category) => {
    setEditing(category);
    setName(category.name);
    setIcon(category.icon || '');
    setColor(category.color || '');
    setModalVisible(true);
  };

  const save = async () => {
    if (!name.trim()) return;

    try {
      if (editing) {
        editing.name = name.trim();
        editing.icon = icon;
        editing.color = color;
        await CategoryRepository.update(editing);
      } else {
        await CategoriesService.createCategory({
          name: name.trim(),
          type,
          icon,
          color,
        });
      }

      setModalVisible(false);
      load();
    } catch {
      Alert.alert('Error', 'Failed to save category');
    }
  };

  const remove = (category: Category) => {
    Alert.alert('Delete Category', `Delete "${category.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await CategoryRepository.delete(category.id!);
          load();
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={categories}
        keyExtractor={i => i.id!.toString()}
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
      />

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.title}>
              {editing ? 'Edit Category' : 'Add Category'}
            </Text>

            <TextInput
              placeholder="Category Name"
              value={name}
              onChangeText={setName}
              style={styles.input}
            />

            <TextInput
              placeholder="Icon"
              value={icon}
              onChangeText={setIcon}
              style={styles.input}
            />

            <TextInput
              placeholder="Color"
              value={color}
              onChangeText={setColor}
              style={styles.input}
            />

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

export default ManageCategoriesScreen;

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

