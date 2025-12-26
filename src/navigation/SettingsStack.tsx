// src/navigation/SettingsStack.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SettingsScreen from '../screens/SettingsScreen';
import ManageCategoriesScreen from '../screens/ManageCategoriesScreen';
import ManageWalletsScreen from '../screens/ManageWalletsScreen';
import ManageMetaCategoriesScreen from '../screens/ManageMetaCategoriesScreen';
import ReminderScreen from '../screens/ReminderScreen';
import ReminderListScreen from '../screens/ReminderListScreen';
import ManagePartiesScreen from '../screens/ManagePartiesScreen';
import AboutUsScreen from '../screens/AboutUsScreen';
import TermsOfUseScreen from '../screens/TermsOfUseScreen';
import HelpCentreScreen from '../screens/HelpCentreScreen';
import BudgetOverviewScreen from '../screens/BudgetOverviewScreen';
import ManageBudgetsScreen from '../screens/ManageBudgetsScreen';

export type SettingsStackParamList = {
  SettingsMain: undefined;
  ManageCategories: undefined;
  ManageWallets: undefined;
  ManageMetaCategories: undefined;
  Reminder: undefined;
  ReminderList: undefined;
  ManageParties: undefined;
  AboutUs: undefined;
  TermsOfUse: undefined;
  HelpCentre: undefined;
  BudgetOverview: undefined;
  ManageBudgets: { month: string };
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
      <Stack.Screen
        name="ManageParties"
        component={ManagePartiesScreen}
        options={{ title: 'Manage Parties' }}
      />
      <Stack.Screen
        name="AboutUs"
        component={AboutUsScreen}
        options={{ title: 'About Us' }}
      />
      <Stack.Screen
        name="TermsOfUse"
        component={TermsOfUseScreen}
        options={{ title: 'Terms of Use' }}
      />
      <Stack.Screen
        name="HelpCentre"
        component={HelpCentreScreen}
        options={{ title: 'Help Centre' }}
      />
      <Stack.Screen
        name="BudgetOverview"
        component={BudgetOverviewScreen}
        options={{ title: 'Budget Progress' }}
      />
      <Stack.Screen
        name="ManageBudgets"
        component={ManageBudgetsScreen}
        options={{ title: 'Set Budget' }}
      />
    </Stack.Navigator>
  );
};

export default SettingsStack;
