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
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import { SettingsStackParamList } from '../navigation/SettingsStack';
import CategoryRepository from '../repositories/CategoryRepository';
import { CategoriesService } from '../services/CategoriesService';
import Category from '../models/Category';
import { CATEGORY_ICONS, CATEGORY_COLORS } from '../constants/categoryOptions';
import { useSnackbar } from '../context/SnackbarContext';

type Props = NativeStackScreenProps<SettingsStackParamList, 'ManageCategories'>;

const ManageCategoriesScreen: React.FC<Props> = ({ navigation }) => {
  const { showSnackbar } = useSnackbar();
  const [categories, setCategories] = useState<Category[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);

  const [name, setName] = useState('');
  const [icon, setIcon] = useState<string | null>(null);
  const [color, setColor] = useState<string | null>(null);
  const [type] = useState<'expense' | 'income'>('expense');

  const [showIcons, setShowIcons] = useState(false);
  const [showColors, setShowColors] = useState(false);

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
    setShowIcons(false);
    setShowColors(false);
    setModalVisible(true);
  };

  const openEdit = (category: Category) => {
    setEditing(category);
    setName(category.name);
    setIcon(category.icon || null);
    setColor(category.color || null);
    setShowIcons(false);
    setShowColors(false);
    setModalVisible(true);
  };

  const save = async () => {
    if (!name.trim() || !icon || !color) {
      showSnackbar('Please enter name, icon and color', 3000, 'error');
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
      showSnackbar(editing ? 'Category updated successfully' : 'Category created successfully', 3000, 'success');
    } catch {
      showSnackbar('Failed to save category', 3000, 'error');
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
          showSnackbar('Category deleted successfully', 3000, 'success');
          load();
        },
      },
    ]);
  };

  /* ---------------- EMPTY STATE ---------------- */

  const EmptyState = ({ onAdd }: { onAdd: () => void }) => (
    <View style={styles.emptyContainer}>
      <MaterialIcons
        name="category"
        size={56}
        color="#bbb"
        style={{ marginBottom: 12 }}
      />
      <Text style={styles.emptyTitle}>No categories yet</Text>
      <Text style={styles.emptyText}>
        Create categories to organize your income and expenses
      </Text>

      <TouchableOpacity onPress={onAdd} style={styles.emptyButton}>
        <Text style={styles.emptyButtonText}>Add Category</Text>
      </TouchableOpacity>
    </View>
  );

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
        ListEmptyComponent={<EmptyState onAdd={openAdd} />}
        contentContainerStyle={
          categories.length === 0 ? styles.emptyList : undefined
        }
      />

      {/* ---------------- MODAL ---------------- */}

      <Modal visible={modalVisible} transparent animationType="slide">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.overlay}
        >
          <View style={styles.modal}>
            <ScrollView keyboardShouldPersistTaps="handled">
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
              <TouchableOpacity
                style={styles.selectorRow}
                onPress={() => setShowIcons(v => !v)}
              >
                <View style={styles.selectorLeft}>
                  {icon ? (
                    <View style={styles.iconPreviewSmall}>
                      <MaterialIcons name={icon} size={18} color="#fff" />
                    </View>
                  ) : (
                    <Text style={styles.placeholder}>Select icon</Text>
                  )}
                </View>
                <MaterialIcons
                  name={showIcons ? 'expand-less' : 'expand-more'}
                  size={24}
                  color="#666"
                />
              </TouchableOpacity>

              {showIcons && (
                <View style={styles.iconGridCompact}>
                  {CATEGORY_ICONS.map(i => (
                    <TouchableOpacity
                      key={i}
                      style={[
                        styles.iconItemSmall,
                        icon === i && styles.iconSelected,
                      ]}
                      onPress={() => {
                        setIcon(i);
                        setShowIcons(false);
                      }}
                    >
                      <MaterialIcons
                        name={i}
                        size={20}
                        color={icon === i ? '#fff' : '#333'}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* COLOR PICKER */}
              <Text style={styles.label}>Color</Text>
              <TouchableOpacity
                style={styles.selectorRow}
                onPress={() => setShowColors(v => !v)}
              >
                <View
                  style={[
                    styles.colorPreview,
                    { backgroundColor: color || '#ddd' },
                  ]}
                />
                <MaterialIcons
                  name={showColors ? 'expand-less' : 'expand-more'}
                  size={24}
                  color="#666"
                />
              </TouchableOpacity>

              {showColors && (
                <View style={styles.colorRowCompact}>
                  {CATEGORY_COLORS.map(c => (
                    <TouchableOpacity
                      key={c}
                      style={[
                        styles.colorCircleSmall,
                        { backgroundColor: c },
                        color === c && styles.colorSelected,
                      ]}
                      onPress={() => {
                        setColor(c);
                        setShowColors(false);
                      }}
                    />
                  ))}
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
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

export default ManageCategoriesScreen;

/* ---------------- STYLES ---------------- */

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

  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },

  iconPreview: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },

  name: { fontSize: 16, fontWeight: '500', color: '#111' },

  actions: { flexDirection: 'row', gap: 16 },

  action: { fontSize: 14, fontWeight: '500', color: '#007AFF' },
  delete: { color: '#F44336' },

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modal: {
    width: '90%',
    maxHeight: '85%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },

  title: { fontSize: 20, fontWeight: '600', marginBottom: 16 },

  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    marginBottom: 14,
  },

  label: { fontSize: 14, fontWeight: '500', marginBottom: 6 },

  selectorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 12,
  },

  selectorLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },

  placeholder: { color: '#999' },

  iconPreviewSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  iconGridCompact: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },

  iconItemSmall: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
  },

  iconSelected: { backgroundColor: '#007AFF' },

  colorPreview: { width: 28, height: 28, borderRadius: 14 },

  colorRowCompact: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },

  colorCircleSmall: { width: 26, height: 26, borderRadius: 13 },

  colorSelected: { borderWidth: 3, borderColor: '#000' },

  modalActions: { flexDirection: 'row', gap: 10 },

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

  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
  },

  emptyContainer: {
    alignItems: 'center',
    paddingHorizontal: 30,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111',
    marginBottom: 6,
  },

  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },

  emptyButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },

  emptyButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
