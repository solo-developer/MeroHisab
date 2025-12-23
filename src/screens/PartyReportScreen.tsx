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
    
    db.transaction(tx => {
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
      
      tx.executeSql(query, params, (_, results) => {
        const data: PartyBalance[] = [];
        for (let i = 0; i < results.rows.length; i++) {
          data.push(results.rows.item(i));
        }
        setParties(data);
      });
    });
  };

  const renderItem = ({ item }: { item: PartyBalance }) => (
    <View style={styles.card}>
      <View style={GlobalStyles.rowBetween}>
        <View style={{ flex: 1 }}>
          <Text style={styles.partyName}>{item.name}</Text>
          <Text style={[styles.partyType, { color: item.type === 'debtor' ? AppColors.success : AppColors.danger }]}>
            {item.type === 'debtor' ? 'To Receive' : 'To Pay'}
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.balanceLabel}>Balance</Text>
          <Text style={[styles.balance, { color: item.currentBalance > 0 ? (item.type === 'debtor' ? AppColors.success : AppColors.danger) : '#999' }]}>
            ${item.currentBalance.toFixed(2)}
          </Text>
        </View>
      </View>
    </View>
  );

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
        <View style={styles.filterContainer}>
          <Text style={GlobalStyles.label}>Filter by Type</Text>
          <Picker
            selectedValue={filterType}
            onValueChange={(value) => setFilterType(value as any)}
            style={styles.picker}
          >
            <Picker.Item label="All Parties" value="all" />
            <Picker.Item label="Debtors (To Receive)" value="debtor" />
            <Picker.Item label="Creditors (To Pay)" value="creditor" />
          </Picker>
        </View>

        <FlatList
          data={parties}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          ListEmptyComponent={<Text style={GlobalStyles.listEmptyText}>No parties found.</Text>}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  filterContainer: {
    marginBottom: 16,
  },
  picker: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    backgroundColor: '#fff',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#eee',
  },
  partyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  partyType: {
    fontSize: 12,
    marginTop: 4,
  },
  balanceLabel: {
    fontSize: 12,
    color: '#777',
  },
  balance: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 4,
  },
});

export default PartyReportScreen;
