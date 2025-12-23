// src/navigation/SettingsStack.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SettingsScreen from '../screens/SettingsScreen';
import ManageCategoriesScreen from '../screens/ManageCategoriesScreen';
import ManageWalletsScreen from '../screens/ManageWalletsScreen';
import ManageMetaCategoriesScreen from '../screens/ManageMetaCategoriesScreen';
import ReminderScreen from '../screens/ReminderScreen';
import ReminderListScreen from '../screens/ReminderListScreen';

export type SettingsStackParamList = {
  SettingsMain: undefined;
  ManageCategories: undefined;
  ManageWallets: undefined;
  ManageMetaCategories: undefined;
  Reminder: undefined;
  ReminderList: undefined;
};

const Stack = createNativeStackNavigator<SettingsStackParamList>();

const SettingsStack: React.FC = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="SettingsMain"
        component={SettingsScreen}
        options={{ headerShown: false }} // we can show a custom header inside the screen
      />
      <Stack.Screen
        name="ManageCategories"
        component={ManageCategoriesScreen}
        options={{ title: 'Manage Categories' }}
      />
      <Stack.Screen
        name="ManageWallets"
        component={ManageWalletsScreen}
        options={{ title: 'Manage Wallets' }}
      />
      <Stack.Screen
        name="ManageMetaCategories"
        component={ManageMetaCategoriesScreen}
        options={{ title: 'Manage Meta Categories' }}
      />
      <Stack.Screen
        name="Reminder"
        component={ReminderScreen}
        options={{ title: 'Set Reminder' }}
      />
      <Stack.Screen
        name="ReminderList"
        component={ReminderListScreen}
        options={{ title: 'Reminders' }}
      />
    </Stack.Navigator>
  );
};

export default SettingsStack;
