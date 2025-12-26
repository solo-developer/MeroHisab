import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';

import SwipeTabs from './SwipeTabs';
import BottomTabs from '../components/BottomTabs';
import { navigationRef, SwipeTabRoutes } from './navigationRef';
import RootStack from './RootStack';
import { AddIncomeScreen } from '../screens/AddIncomeScreen';
import { AddExpenseScreen } from '../screens/AddExpenseScreen';
import { AddPartyTransactionScreen } from '../screens/AddPartyTransactionScreen';
import WalletBalanceReportScreen from '../screens/WalletBalanceReportScreen';
import IncomeReportScreen from '../screens/IncomeReportScreen';
import ExpenseReportScreen from '../screens/ExpenseReportScreen';
import TransferReportScreen from '../screens/TransferReportScreen';
import ManageWalletsScreen from '../screens/ManageWalletsScreen';
import LedgerReportScreen from '../screens/LedgerReportScreen';
import ReportByMetaCategoryScreen from '../screens/ReportByMetaCategoryScreen';
import PartyReportScreen from '../screens/PartyReportScreen';
import PaymentReportScreen from '../screens/PaymentReportScreen';
import ReceiptReportScreen from '../screens/ReceiptReportScreen';
import TrendReportScreen from '../screens/TrendReportScreen';

const MainContainer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SwipeTabRoutes>('Dashboard');

  useEffect(() => {
    const unsubscribe = navigationRef.addListener('state', () => {
      const route = navigationRef.getCurrentRoute();
      if (route?.name) setActiveTab(route.name as SwipeTabRoutes);
    });
    return unsubscribe;
  }, []);

  return (
    <NavigationContainer ref={navigationRef}>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        <RootStack.Screen name="MainTabs" component={SwipeTabs} />
        <RootStack.Screen name="AddIncome" component={AddIncomeScreen} />
        <RootStack.Screen name="AddExpense" component={AddExpenseScreen} />
        <RootStack.Screen name="AddPartyTransaction" component={AddPartyTransactionScreen} />
        <RootStack.Screen
          name="WalletBalanceReport"
          component={WalletBalanceReportScreen}
        />
        <RootStack.Screen name="IncomeReport" component={IncomeReportScreen} />
        <RootStack.Screen
          name="ExpenseReport"
          component={ExpenseReportScreen}
        />
        <RootStack.Screen
          name="TransferReport"
          component={TransferReportScreen}
        />
        <RootStack.Screen
          name="ReportByLedger"
          component={LedgerReportScreen}
        />
        <RootStack.Screen
          name="ReportsByMetaCategory"
          component={ReportByMetaCategoryScreen}
        />
        <RootStack.Screen
          name="PartyReport"
          component={PartyReportScreen}
        />
        <RootStack.Screen
          name="PaymentReport"
          component={PaymentReportScreen}
        />
        <RootStack.Screen
          name="ReceiptReport"
          component={ReceiptReportScreen}
        />
        <RootStack.Screen
          name="TrendReport"
          component={TrendReportScreen}
        />
      </RootStack.Navigator>

      <BottomTabs
        activeTab={activeTab}
        onTabPress={route =>
          navigationRef.current?.navigate('MainTabs', {
            screen: route,
          })
        }
        onFabPress={() => {
          navigationRef.navigate('Dashboard');
        }}
      />
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
});

export default MainContainer;
