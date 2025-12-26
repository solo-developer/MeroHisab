import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import WalletRepository, {
  WalletBalanceRow,
} from '../repositories/WalletRepository';
import { ExportHelper } from '../helpers/ExportHelper';
import { GlobalStyles } from '../constants/Styles';

const WalletBalanceReportScreen: React.FC = () => {
  const navigation = useNavigation();
  const [wallets, setWallets] = useState<WalletBalanceRow[]>([]);
  const [totalBalance, setTotalBalance] = useState<number>(0);

  useEffect(() => {
    WalletRepository.getWalletBalances((result: WalletBalanceRow[]) => {
      setWallets(result);

      // calculate total balance
      const total = result.reduce((sum, w) => sum + w.balance, 0);
      setTotalBalance(total);
    });
  }, []);

  const renderItem = ({ item }: { item: WalletBalanceRow }) => {
    const isNegative = item.balance < 0;

    return (
      <View
        style={[
          styles.row,
          isNegative && styles.negativeRow, // subtle negative highlight
        ]}
      >
        <Text style={styles.walletName}>{item.walletName}</Text>
        <Text
          style={[
            styles.balance,
            { color: isNegative ? '#F44336' : '#4CAF50' },
          ]}
        >
          {item.balance.toFixed(2)}
        </Text>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>No wallets found</Text>
      <Text style={styles.emptySubtitle}>
        You haven't added any wallets yet.
      </Text>


    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Wallet Balances</Text>
        <TouchableOpacity onPress={() => ExportHelper.exportReport('Wallet Balance', wallets)}>
          <Ionicons name="download-outline" size={22} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Total Wallet Balance Card */}
      {wallets.length > 0 && (
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Total Balance</Text>
          <Text
            style={[
              styles.totalValue,
              { color: totalBalance < 0 ? '#F44336' : '#4CAF50' },
            ]}
          >
            {totalBalance.toFixed(2)}
          </Text>
        </View>
      )}

      <FlatList
        data={wallets}
        keyExtractor={item => item.walletId.toString()}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={
          wallets.length === 0 ? { flex: 1 } : styles.listContent
        }
        ListEmptyComponent={renderEmptyState}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  backButton: {
    paddingRight: 12,
    paddingVertical: 4,
  },
  listContent: { paddingTop: 16, paddingBottom: 24 },

  /* Header */
  header: {
    height: 50,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    elevation: 2,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },

  /* Total card */
  totalCard: {
    backgroundColor: '#fff',
    margin: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    alignItems: 'center',
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  totalValue: {
    fontSize: 22,
    fontWeight: '700',
  },

  /* List rows */
  row: {
    backgroundColor: '#fff',
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 16,
  },
  negativeRow: {
    backgroundColor: '#FFF1F1', // subtle negative highlight
  },
  walletName: {
    fontSize: 16,
    fontWeight: '500',
  },
  balance: {
    fontSize: 16,
    fontWeight: '600',
  },
  separator: {
    height: 12,
  },

  /* Empty state */
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: '#4F8EF7',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 6,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default WalletBalanceReportScreen;
