import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface DateFieldProps {
  label: string;
  value?: Date;
  onPress: () => void;
}

const DateField: React.FC<DateFieldProps> = ({ label, value, onPress }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <TouchableOpacity
        style={styles.input}
        activeOpacity={0.7}
        onPress={onPress}
      >
        <Text
          style={[
            styles.text,
            !value && styles.placeholder,
          ]}
        >
          {value ? value.toLocaleDateString() : 'Select date'}
        </Text>

        <Ionicons name="calendar-outline" size={18} color="#555" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 12 },
  label: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 6,
    paddingHorizontal: 10,
    backgroundColor: '#FAFAFA',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  text: {
    fontSize: 14,
    color: '#333',
  },
  placeholder: {
    color: '#999',
  },
});

export default DateField;
