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
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import { SettingsStackParamList } from '../navigation/SettingsStack';
import CategoryRepository from '../repositories/CategoryRepository';
import { CategoriesService } from '../services/CategoriesService';
import Category from '../models/Category';
import {
  CATEGORY_ICONS,
  CATEGORY_COLORS,
} from '../constants/categoryOptions';

type Props = NativeStackScreenProps<
  SettingsStackParamList,
  'ManageCategories'
>;

const ManageCategoriesScreen: React.FC<Props> = ({ navigation }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);

  const [name, setName] = useState('');
  const [icon, setIcon] = useState<string | null>(null);
  const [color, setColor] = useState<string | null>(null);
  const [type] = useState<'expense' | 'income'>('expense');

  /* ---------------- HEADER ---------------- */

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={openAdd} style={{ marginRight: 16 }}>
          <Text style={{ fontSize: 28, color: '#007AFF' }}>+</Text>
        </TouchableOpacity>
      ),
    });
  }, []);

  /* ---------------- DATA ---------------- */

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setCategories(await CategoryRepository.getAll());
  };

  /* ---------------- ACTIONS ---------------- */

  const openAdd = () => {
    setEditing(null);
    setName('');
    setIcon(null);
    setColor(null);
    setModalVisible(true);
  };

  const openEdit = (category: Category) => {
    setEditing(category);
    setName(category.name);
    setIcon(category.icon || null);
    setColor(category.color || null);
    setModalVisible(true);
  };

  const save = async () => {
    if (!name.trim() || !icon || !color) {
      Alert.alert(
        'Missing information',
        'Please enter name, icon and color'
      );
      return;
    }

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

  /* ---------------- UI ---------------- */

  return (
    <View style={styles.container}>
      <FlatList
        data={categories}
        keyExtractor={i => i.id!.toString()}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View
                style={[
                  styles.iconPreview,
                  { backgroundColor: item.color || '#ccc' },
                ]}
              >
                {item.icon && (
                  <MaterialIcons name={item.icon} size={20} color="#fff" />
                )}
              </View>
              <Text style={styles.name}>{item.name}</Text>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity onPress={() => openEdit(item)}>
                <Text style={styles.action}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => remove(item)}>
                <Text style={[styles.action, styles.delete]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* ---------------- MODAL ---------------- */}

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.title}>
              {editing ? 'Edit Category' : 'Add Category'}
            </Text>

            <TextInput
              placeholder="Category name"
              value={name}
              onChangeText={setName}
              style={styles.input}
            />

            {/* ICON PICKER */}
            <Text style={styles.label}>Icon</Text>
            <View style={styles.iconGrid}>
              {CATEGORY_ICONS.map(i => (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.iconItem,
                    icon === i && styles.iconSelected,
                  ]}
                  onPress={() => setIcon(i)}
                >
                  <MaterialIcons
                    name={i}
                    size={26}
                    color={icon === i ? '#fff' : '#333'}
                  />
                </TouchableOpacity>
              ))}
            </View>

            {/* COLOR PICKER */}
            <Text style={styles.label}>Color</Text>
            <View style={styles.colorRow}>
              {CATEGORY_COLORS.map(c => (
                <TouchableOpacity
                  key={c}
                  style={[
                    styles.colorCircle,
                    { backgroundColor: c },
                    color === c && styles.colorSelected,
                  ]}
                  onPress={() => setColor(c)}
                />
              ))}
            </View>

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

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },

  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  iconPreview: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },

  name: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111',
  },

  actions: {
    flexDirection: 'row',
    gap: 16,
  },

  action: {
    fontSize: 14,
    fontWeight: '500',
    color: '#007AFF',
  },

  delete: {
    color: '#F44336',
  },

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modal: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },

  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    color: '#111',
  },

  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    marginBottom: 14,
  },

  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
    color: '#444',
  },

  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },

  iconItem: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
  },

  iconSelected: {
    backgroundColor: '#007AFF',
  },

  colorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },

  colorCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },

  colorSelected: {
    borderWidth: 3,
    borderColor: '#000',
  },

  modalActions: {
    flexDirection: 'row',
    gap: 10,
  },

  save: {
    flex: 1,
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 8,
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
