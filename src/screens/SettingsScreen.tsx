// SettingsScreen.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SettingsStackParamList } from '../navigation/SettingsStack';

type Props = NativeStackScreenProps<SettingsStackParamList, 'SettingsMain'>;

const Tab = createMaterialTopTabNavigator();

// --- Manage Tab ---
const ManageScreen = ({ navigation }: any) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('ManageCategories')}>
        <Icon name="category" size={24} color="#333" />
        <Text style={styles.itemText}>Manage Categories</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('ManageWallets')}>
        <Icon name="wallet" size={24} color="#333" />
        <Text style={styles.itemText}>Manage Wallets</Text>
      </TouchableOpacity>


      {/* --- New Meta Categories Option --- */}
      <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('ManageMetaCategories')}>
        <Icon name="folder" size={24} color="#333" />
        <Text style={styles.itemText}>Manage Meta Categories</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('ManageParties')}>
        <Icon name="people" size={24} color="#333" />
        <Text style={styles.itemText}>Manage Parties</Text>
      </TouchableOpacity>
    </View>
  );

};

// --- General Tab ---
const GeneralScreen = ({ navigation }: any) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('BudgetOverview')}>
        <Icon name="bar-chart" size={24} color="#333" />
        <Text style={styles.itemText}>Budget Progress</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('BackupSync')}>
        <Icon name="backup" size={24} color="#333" />
        <Text style={styles.itemText}>Backup & Sync</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('ReminderList')}>
        <Icon name="alarm" size={24} color="#333" />
        <Text style={styles.itemText}>Reminders</Text>
      </TouchableOpacity>
    </View>
  );
};

// --- About Tab ---
const AboutScreen = ({ navigation }: any) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('AboutUs')}>
        <Icon name="info" size={24} color="#333" />
        <Text style={styles.itemText}>About Us</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('HelpCentre')}>
        <Icon name="help-outline" size={24} color="#333" />
        <Text style={styles.itemText}>Help Center</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('TermsOfUse')}>
        <Icon name="description" size={24} color="#333" />
        <Text style={styles.itemText}>Terms of Use</Text>
      </TouchableOpacity>
    </View>
  );
};

// --- Main Settings Top Tabs ---
const SettingsScreen = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarLabelStyle: { fontSize: 14, fontWeight: 'bold' },
        tabBarIndicatorStyle: { backgroundColor: '#4CAF50' },
      }}
    >
      <Tab.Screen name="Manage" component={ManageScreen} />
      <Tab.Screen name="General" component={GeneralScreen} />
      <Tab.Screen name="About" component={AboutScreen} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 10,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  itemText: {
    fontSize: 16,
    marginLeft: 15,
  },
});

export default SettingsScreen;
