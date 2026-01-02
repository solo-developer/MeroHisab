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
import { AddTransferScreen } from '../screens/AddTransferScreen';
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
import BudgetOverviewScreen from '../screens/BudgetOverviewScreen';
import ManageBudgetsScreen from '../screens/ManageBudgetsScreen';
import AllTransactionsReportScreen from '../screens/AllTransactionsReportScreen';
import CategoryExpenseReportScreen from '../screens/CategoryExpenseReportScreen';
import CalendarReportScreen from '../screens/CalendarReportScreen';
import MetaCategoryExpenseReportScreen from '../screens/MetaCategoryExpenseReportScreen';
import GoalsListScreen from '../screens/GoalsListScreen';
import AddGoalScreen from '../screens/AddGoalScreen';
import GoalDetailScreen from '../screens/GoalDetailScreen';
import SettingsStack from './SettingsStack';

const MainContainer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SwipeTabRoutes>('Dashboard');
  const [currentRoute, setCurrentRoute] = useState<string>('Dashboard');

  useEffect(() => {
    const unsubscribe = navigationRef.addListener('state', () => {
      const route = navigationRef.getCurrentRoute();
      if (route?.name) {
        setCurrentRoute(route.name);
        if (['Dashboard', 'Transactions', 'Analysis', 'Reports'].includes(route.name)) {
          setActiveTab(route.name as SwipeTabRoutes);
        }
      }
    });
    return unsubscribe;
  }, []);

  const showTabs = ['Dashboard', 'Transactions', 'Analysis', 'Reports'].includes(currentRoute);

  return (
    <NavigationContainer ref={navigationRef}>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        <RootStack.Screen name="MainTabs" component={SwipeTabs} />
        <RootStack.Screen name="AddIncome" component={AddIncomeScreen} />
        <RootStack.Screen name="AddExpense" component={AddExpenseScreen} />
        <RootStack.Screen name="AddPartyTransaction" component={AddPartyTransactionScreen} />
        <RootStack.Screen name="AddTransferScreen" component={AddTransferScreen} />
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
        <RootStack.Screen
          name="BudgetOverview"
          component={BudgetOverviewScreen}
        />
        <RootStack.Screen
          name="ManageBudgets"
          component={ManageBudgetsScreen}
        />
        <RootStack.Screen
          name="AllTransactionsReport"
          component={AllTransactionsReportScreen}
        />
        <RootStack.Screen
          name="CalendarReport"
          component={CalendarReportScreen}
        />
        <RootStack.Screen
          name="CategoryExpenseReport"
          component={CategoryExpenseReportScreen}
        />
        <RootStack.Screen
          name="MetaCategoryExpenseReport"
          component={MetaCategoryExpenseReportScreen}
        />
        <RootStack.Screen name="GoalsList" component={GoalsListScreen} />
        <RootStack.Screen name="AddGoal" component={AddGoalScreen} />
        <RootStack.Screen name="GoalDetail" component={GoalDetailScreen} />
        <RootStack.Screen
          name="SettingsStack"
          component={SettingsStack}
        />
      </RootStack.Navigator>

      {showTabs && (
        <BottomTabs
          activeTab={activeTab}
          onTabPress={route =>
            (navigationRef as any).navigate('MainTabs', {
              screen: route,
            })
          }
        />
      )}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
});

export default MainContainer;
