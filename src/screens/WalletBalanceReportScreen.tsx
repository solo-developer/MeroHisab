import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import WalletRepository, {
  WalletBalanceRow,
} from '../repositories/WalletRepository';
import { ExportHelper } from '../helpers/ExportHelper';
import { AppColors } from '../constants/Styles';
import { usePreferences } from '../context/PreferencesContext';

const WalletBalanceReportScreen: React.FC = () => {
  const navigation = useNavigation();
  const [wallets, setWallets] = useState<WalletBalanceRow[]>([]);
  const [filteredWallets, setFilteredWallets] = useState<WalletBalanceRow[]>([]);
  const [totalBalance, setTotalBalance] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState('');
  const { currency } = usePreferences();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWallets();
  }, []);

  const loadWallets = () => {
    setLoading(true);
    WalletRepository.getWalletBalances((result: WalletBalanceRow[]) => {
      setWallets(result);
      setFilteredWallets(result);
      // calculate total balance
      const total = result.reduce((sum, w) => sum + w.balance, 0);
      setTotalBalance(total);
      setLoading(false);
    });
  };

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredWallets(wallets);
    } else {
      const filtered = wallets.filter(w =>
        w.walletName.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredWallets(filtered);
    }
  }, [searchQuery, wallets]);

  const renderItem = ({ item }: { item: WalletBalanceRow }) => {
    const isNegative = item.balance < 0;

    return (
      <View style={styles.card}>
        <View style={styles.cardRow}>
          <View style={styles.iconCircle}>
            <Ionicons name="wallet-outline" size={24} color={AppColors.primary} />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.walletName}>{item.walletName}</Text>
            <Text style={styles.metaText}>Native Ledger</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.balanceLabel}>Account Balance</Text>
            <Text style={[styles.balance, { color: isNegative ? '#C62828' : '#2E7D32' }]}>
              {currency.symbol}{item.balance.toLocaleString()}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
      {/* Custom Header */}
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Asset Overview</Text>
        <TouchableOpacity
          onPress={() => ExportHelper.exportReport('Wallet_Balances', filteredWallets)}
          style={styles.actionButton}
        >
          <Ionicons name="download-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <View style={styles.filterSection}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color="#666" />
          <TextInput
            placeholder="Search assets or wallets..."
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Hero Summary - Lighter/Smaller */}
      <View style={[styles.heroCard, totalBalance < 0 ? styles.heroNegative : styles.heroPositive]}>
        <View style={styles.heroIconBox}>
          <Ionicons
            name={totalBalance < 0 ? "trending-down" : "trending-up"}
            size={22}
            color={totalBalance < 0 ? "#C62828" : "#2E7D32"}
          />
        </View>
        <View style={{ flex: 1, marginLeft: 16 }}>
          <Text style={[styles.heroLabel, totalBalance < 0 ? { color: '#B71C1C' } : { color: '#1B5E20' }]}>
            Net Liquidity
          </Text>
          <Text style={[styles.heroValue, totalBalance < 0 ? { color: '#C62828' } : { color: '#2E7D32' }]}>
            {currency.symbol}{totalBalance.toLocaleString()}
          </Text>
        </View>
      </View>

      <FlatList
        data={filteredWallets}
        keyExtractor={item => item.walletId.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listPadding}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" color={AppColors.primary} style={{ marginTop: 40 }} />
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="wallet-outline" size={64} color="#DDD" />
              <Text style={styles.emptyText}>No matching accounts found.</Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#333' },
  actionButton: { padding: 4 },

  filterSection: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 14, color: '#333' },

  heroCard: {
    margin: 16,
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  heroPositive: { backgroundColor: '#E8F5E9', borderColor: '#C8E6C9' },
  heroNegative: { backgroundColor: '#FFEBEE', borderColor: '#FFCDD2' },
  heroIconBox: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  heroLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  heroValue: { fontSize: 26, fontWeight: '900' },

  listPadding: { paddingHorizontal: 16, paddingBottom: 40 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  cardRow: { flexDirection: 'row', alignItems: 'center' },
  iconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },
  walletName: { fontSize: 15, fontWeight: '700', color: '#333' },
  metaText: { fontSize: 11, color: '#999', marginTop: 2 },
  balanceLabel: { fontSize: 9, color: '#AAA', textTransform: 'uppercase', marginBottom: 1 },
  balance: { fontSize: 17, fontWeight: '900' },

  emptyContainer: { alignItems: 'center', marginTop: 60 },
  emptyText: { marginTop: 12, fontSize: 14, color: '#999' },
});

export default WalletBalanceReportScreen;
