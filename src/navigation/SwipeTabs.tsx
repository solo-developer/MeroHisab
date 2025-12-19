import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import DashboardScreen from '../screens/DashboardScreen';
import TransactionsScreen from '../screens/TransactionsScreen';
import ReportsScreen from '../screens/ReportsScreen';
import SettingsStack from './SettingsStack';

export type TopTabParamList = {
  Dashboard: undefined;
  Transactions: undefined;
  Reports: undefined;
  Settings: undefined;
};

const Tab = createMaterialTopTabNavigator<TopTabParamList>();

const SwipeTabs: React.FC = () => {
  return (
    <Tab.Navigator
      initialRouteName="Dashboard"
      screenOptions={{
        swipeEnabled: true,
        lazy: true, // <-- important: lazy load screen components
        tabBarStyle: { display: 'none' }, // hide top tab bar (we use custom bottom tabs)
        // keep tab scenes separate so they don't render until focused
      }}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Transactions" component={TransactionsScreen} />
      <Tab.Screen name="Reports" component={ReportsScreen} />
      <Tab.Screen name="Settings" component={SettingsStack} />
    </Tab.Navigator>
  );
};

export default SwipeTabs;
