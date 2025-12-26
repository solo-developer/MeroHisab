import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { GlobalStyles, AppColors } from '../constants/Styles';
import { getDatabase } from '../repositories/Database';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

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

  useEffect(() => {
    loadParties();
  }, [filterType]);

  const loadParties = async () => {
    const db = getDatabase();

    db.transaction((tx: any) => {
      let query = `SELECT p.id, p.name, p.type, COALESCE(pb.currentBalance, 0) as currentBalance 
                   FROM Parties p 
                   LEFT JOIN PartyBalance pb ON p.id = pb.partyId 
                   WHERE p.deletedAt IS NULL`;
      const params: any[] = [];

      if (filterType !== 'all') {
        query += ` AND type = ?`;
        params.push(filterType);
      }

      query += ` ORDER BY currentBalance DESC`;

      tx.executeSql(query, params, (_: any, results: any) => {
        const data: PartyBalance[] = [];
        for (let i = 0; i < results.rows.length; i++) {
          data.push(results.rows.item(i));
        }
        setParties(data);
      });
    });
  };

  const renderItem = ({ item }: { item: PartyBalance }) => {
    // Logic: Balance > 0 means they owe us (Receivable), Balance < 0 means we owe them (Payable)
    const isReceivable = item.currentBalance >= 0;
    const absBalance = Math.abs(item.currentBalance);

    return (
      <View style={styles.card}>
        <View style={GlobalStyles.rowBetween}>
          <View style={{ flex: 1 }}>
            <Text style={styles.partyName}>{item.name}</Text>
            <Text style={[styles.partyType, { color: isReceivable ? AppColors.success : AppColors.danger }]}>
              {isReceivable ? 'To Receive' : 'To Pay'}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.balanceLabel}>Balance</Text>
            <Text style={[styles.balance, { color: isReceivable ? AppColors.success : AppColors.danger }]}>
              ₹ {absBalance.toFixed(2)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={GlobalStyles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#333" />
        </TouchableOpacity>
        <Text style={GlobalStyles.headerTitle}>Party Balances</Text>
        <View style={{ width: 22 }} />
      </View>

      <View style={GlobalStyles.container}>
        <View style={styles.segmentedContainer}>
          {[
            { label: 'All', value: 'all' },
            { label: 'Receivable', value: 'debtor' },
            { label: 'Payable', value: 'creditor' }
          ].map((seg) => (
            <TouchableOpacity
              key={seg.value}
              style={[
                styles.segmentButton,
                filterType === seg.value && styles.segmentButtonActive
              ]}
              onPress={() => setFilterType(seg.value as any)}
            >
              <Text style={[
                styles.segmentText,
                filterType === seg.value && styles.segmentTextActive
              ]}>
                {seg.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <FlatList
          data={parties}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          ListEmptyComponent={<Text style={GlobalStyles.listEmptyText}>No parties found.</Text>}
          contentContainerStyle={{ paddingBottom: 160 }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  segmentedContainer: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 4,
    marginBottom: 20,
    marginHorizontal: 16,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
  segmentButtonActive: {
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  segmentTextActive: {
    color: AppColors.primary,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#eee',
    marginHorizontal: 16, // Ensure alignment with segmented container
  },
  partyName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  partyType: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  balanceLabel: {
    fontSize: 11,
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  balance: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 2,
  },
});

export default PartyReportScreen;
