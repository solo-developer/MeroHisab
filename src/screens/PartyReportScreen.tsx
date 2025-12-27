import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlobalStyles, AppColors } from '../constants/Styles';
import { getDatabase } from '../repositories/Database';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ExportHelper } from '../helpers/ExportHelper';

interface PartyBalance {
  id: number;
  name: string;
  type: 'debtor' | 'creditor';
  currentBalance: number;
}

const PartyReportScreen = () => {
  const navigation = useNavigation();
  const [parties, setParties] = useState<PartyBalance[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'debtor' | 'creditor'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadParties();
  }, [filterType]);

  useEffect(() => {
    const handler = setTimeout(() => {
      loadParties();
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const loadParties = async () => {
    setLoading(true);
    const db = getDatabase();

    db.transaction((tx: any) => {
      let query = `SELECT p.id, p.name, p.type, COALESCE(pb.currentBalance, 0) as currentBalance 
                   FROM Parties p 
                   LEFT JOIN PartyBalance pb ON p.id = pb.partyId 
                   WHERE p.deletedAt IS NULL`;
      const params: any[] = [];

      if (filterType !== 'all') {
        query += ` AND p.type = ?`;
        params.push(filterType);
      }

      if (searchQuery) {
        query += ` AND (p.name LIKE ?)`;
        params.push(`%${searchQuery}%`);
      }

      query += ` ORDER BY p.name ASC`;

      tx.executeSql(query, params, (_: any, results: any) => {
        const data: PartyBalance[] = [];
        for (let i = 0; i < results.rows.length; i++) {
          data.push(results.rows.item(i));
        }
        setParties(data);
        setLoading(false);
      });
    });
  };

  const renderItem = ({ item }: { item: PartyBalance }) => {
    const isReceivable = item.currentBalance >= 0;
    const absBalance = Math.abs(item.currentBalance);

    return (
      <View style={styles.card}>
        <View style={styles.cardRow}>
          <View style={styles.partyIcon}>
            <Ionicons name="person-circle-outline" size={28} color={AppColors.primary} />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.partyName}>{item.name}</Text>
            <View style={[styles.typeBadge, { backgroundColor: isReceivable ? '#E8F5E9' : '#FFEBEE' }]}>
              <Text style={[styles.typeText, { color: isReceivable ? '#2E7D32' : '#C62828' }]}>
                {isReceivable ? 'RECEIVABLE' : 'PAYABLE'}
              </Text>
            </View>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.balanceLabel}>Current Balance</Text>
            <Text style={[styles.balance, { color: isReceivable ? '#2E7D32' : '#C62828' }]}>
              ₹{absBalance.toFixed(0)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Party Ledger</Text>
        <TouchableOpacity onPress={() => ExportHelper.exportReport('Party_Balances', parties)} style={styles.actionButton}>
          <Ionicons name="download-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color="#666" />
          <TextInput
            placeholder="Search party name..."
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={styles.tabBar}>
          {[
            { label: 'All', value: 'all' },
            { label: 'Receivable', value: 'debtor' },
            { label: 'Payable', value: 'creditor' }
          ].map((seg) => (
            <TouchableOpacity
              key={seg.value}
              style={[
                styles.tabItem,
                filterType === seg.value && styles.tabItemActive
              ]}
              onPress={() => setFilterType(seg.value as any)}
            >
              <Text style={[
                styles.tabText,
                filterType === seg.value && styles.tabTextActive
              ]}>
                {seg.label}
              </Text>
              {filterType === seg.value && <View style={styles.activeIndicator} />}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        data={parties}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listPadding}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" color={AppColors.primary} style={{ marginTop: 40 }} />
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={64} color="#DDD" />
              <Text style={styles.emptyText}>No parties found.</Text>
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

  searchSection: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingBottom: 4,
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
    marginBottom: 12,
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 14, color: '#333' },

  tabBar: { flexDirection: 'row', gap: 16 },
  tabItem: { paddingVertical: 8, alignItems: 'center' },
  tabText: { fontSize: 13, fontWeight: '600', color: '#888' },
  tabTextActive: { color: AppColors.primary },
  activeIndicator: { height: 3, width: '100%', backgroundColor: AppColors.primary, borderRadius: 2, marginTop: 4 },

  listPadding: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  cardRow: { flexDirection: 'row', alignItems: 'center' },
  partyIcon: { padding: 6, backgroundColor: '#F3F4F6', borderRadius: 24 },
  partyName: { fontSize: 15, fontWeight: '700', color: '#333' },
  typeBadge: { alignSelf: 'flex-start', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginTop: 4 },
  typeText: { fontSize: 8, fontWeight: '800' },
  balanceLabel: { fontSize: 9, color: '#999', textTransform: 'uppercase', marginBottom: 1 },
  balance: { fontSize: 17, fontWeight: '900' },

  emptyContainer: { alignItems: 'center', marginTop: 80 },
  emptyText: { marginTop: 12, fontSize: 14, color: '#999' },
});

export default PartyReportScreen;
