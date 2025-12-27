import React, { useState } from 'react';
import { View, Text, TextInput, Switch, TouchableOpacity, ScrollView, Platform, StyleSheet, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import RNPickerSelect from 'react-native-picker-select';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { GlobalStyles, AppColors, PickerStyles } from '../constants/Styles';
import { ReminderService } from '../services/ReminderService';
import { Reminder } from '../models/Reminder';

const ReminderScreen = ({ navigation }: any) => {
  const [message, setMessage] = useState('');
  const [date, setDate] = useState(new Date());
  const [isRecurring, setIsRecurring] = useState(false);
  const [frequency, setFrequency] = useState('daily');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const newDate = new Date(date);
      newDate.setFullYear(selectedDate.getFullYear());
      newDate.setMonth(selectedDate.getMonth());
      newDate.setDate(selectedDate.getDate());
      setDate(newDate);
    }
  };

  const onTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const newDate = new Date(date);
      newDate.setHours(selectedTime.getHours());
      newDate.setMinutes(selectedTime.getMinutes());
      setDate(newDate);
    }
  };

  const handleSave = async () => {
    try {
      if (!message.trim()) {
        Alert.alert('Error', 'Please enter a message');
        return;
      }

      // Check for permissions
      const hasPermission = await ReminderService.requestPermissions();
      if (!hasPermission) {
        Alert.alert(
          'Notifications Disabled',
          'To receive reminders, please enable notifications for Mero Hisab in your phone settings.',
          [{ text: 'OK' }]
        );
        return;
      }

      const newReminder: Reminder = {
        message: message,
        date: date.toISOString(),
        isRecurring: isRecurring,
        frequency: isRecurring ? frequency : undefined,
      };

      await ReminderService.scheduleReminder(newReminder);

      Alert.alert("Success", "Reminder set successfully!");
      navigation.goBack();
    } catch (error: any) {
      console.error(error);
      Alert.alert("Error", error.message || "Failed to schedule reminder.");
    }
  };

  return (
    <ScrollView style={GlobalStyles.container} contentContainerStyle={{ paddingBottom: 20 }}>
      <Text style={GlobalStyles.label}>Notification Message</Text>
      <TextInput
        style={[GlobalStyles.input, { height: 100, textAlignVertical: 'top' }]}
        placeholder="Enter your reminder message..."
        placeholderTextColor="#999"
        value={message}
        onChangeText={setMessage}
        multiline
      />

      <Text style={GlobalStyles.label}>Date</Text>
      <TouchableOpacity
        style={styles.pickerButton}
        onPress={() => setShowDatePicker(true)}
      >
        <Text style={GlobalStyles.text}>{date.toLocaleDateString()}</Text>
        <Ionicons name="calendar-outline" size={20} color={AppColors.textSecondary} />
      </TouchableOpacity>

      <Text style={GlobalStyles.label}>Time</Text>
      <TouchableOpacity
        style={styles.pickerButton}
        onPress={() => setShowTimePicker(true)}
      >
        <Text style={GlobalStyles.text}>{date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
        <Ionicons name="time-outline" size={20} color={AppColors.textSecondary} />
      </TouchableOpacity>

      <View style={[GlobalStyles.rowBetween, { marginTop: 20 }]}>
        <View>
          <Text style={[GlobalStyles.text, { fontSize: 16, fontWeight: '500' }]}>Recurring Reminder</Text>
          <Text style={GlobalStyles.subText}>Repeat this reminder regularly</Text>
        </View>
        <Switch
          value={isRecurring}
          onValueChange={setIsRecurring}
          trackColor={{ false: '#ccc', true: AppColors.primary }}
          thumbColor={'#fff'}
        />
      </View>

      {isRecurring && (
        <View style={{ marginTop: 15 }}>
          <Text style={GlobalStyles.label}>Frequency</Text>
          <RNPickerSelect
            onValueChange={(value: string) => setFrequency(value)}
            items={[
              { label: 'Daily', value: 'daily' },
              { label: 'Weekly', value: 'weekly' },
              { label: 'Monthly', value: 'monthly' },
              { label: 'Yearly', value: 'yearly' },
            ]}
            value={frequency}
            style={PickerStyles}
            useNativeAndroidPickerStyle={false}
            Icon={() => <Ionicons name="chevron-down" size={20} color="gray" style={{ marginTop: 10 }} />}
          />
        </View>
      )}

      <TouchableOpacity
        style={[GlobalStyles.button, { marginTop: 30 }]}
        onPress={handleSave}
      >
        <Text style={GlobalStyles.buttonText}>Set Reminder</Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onDateChange}
        />
      )}

      {showTimePicker && (
        <DateTimePicker
          value={date}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onTimeChange}
        />
      )}

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  pickerButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 12,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  }
});

export default ReminderScreen;
