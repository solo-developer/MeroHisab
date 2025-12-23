import React, { useEffect, useLayoutEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Reminder } from '../models/Reminder';
import { ReminderService } from '../services/ReminderService';
import { GlobalStyles, AppColors } from '../constants/Styles';

const ReminderListScreen = ({ navigation }: any) => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const isFocused = useIsFocused();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={() => navigation.navigate('Reminder')} style={{ marginRight: 16 }}>
          <Ionicons name="add-circle" size={28} color="#007AFF" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  useEffect(() => {
    if (isFocused) {
      loadReminders();
    }
  }, [isFocused]);

  const loadReminders = async () => {
    const data = await ReminderService.getAllReminders();
    setReminders(data);
  };

  const handleDelete = (id: number, notificationId?: string) => {
    Alert.alert(
      "Delete Reminder",
      "Are you sure you want to delete this reminder?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete", style: "destructive", onPress: async () => {
            await ReminderService.deleteReminder(id, notificationId);
            loadReminders();
          }
        }
      ]
    )
  };

  const renderItem = ({ item }: { item: Reminder }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name="time-outline" size={16} color={AppColors.primary} style={{ marginRight: 6 }} />
          <Text style={styles.date}>
            {new Date(item.date).toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
        <TouchableOpacity onPress={() => item.id && handleDelete(item.id, item.notificationId)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="trash-outline" size={20} color={AppColors.danger} />
        </TouchableOpacity>
      </View>

      <Text style={styles.message}>{item.message}</Text>

      {item.isRecurring && (
        <View style={styles.recurringBadge}>
          <Ionicons name="repeat" size={12} color="#fff" style={{ marginRight: 4 }} />
          <Text style={styles.recurringText}>{item.frequency}</Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={GlobalStyles.container}>
      <FlatList
        data={reminders}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={GlobalStyles.listEmptyText}>No reminders set.</Text>}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#eee',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 8,
  },
  date: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  message: {
    fontSize: 16,
    color: '#444',
    marginBottom: 8,
  },
  recurringBadge: {
    alignSelf: 'flex-start',
    backgroundColor: AppColors.primary,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  recurringText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
});

export default ReminderListScreen;
