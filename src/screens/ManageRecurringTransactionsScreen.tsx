import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Alert,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { RecurringTransactionService } from '../services/RecurringTransactionService';
import { RecurringTransaction } from '../repositories/RecurringTransactionRepository';
import { AppColors } from '../constants/Styles';

const ManageRecurringTransactionsScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const isFocused = useIsFocused();
    const [items, setItems] = useState<RecurringTransaction[]>([]);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await RecurringTransactionService.list();
            setItems(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isFocused) {
            loadData();
        }
    }, [isFocused]);

    const handleDelete = (id: number) => {
        Alert.alert(
            'Delete Recurring Transaction',
            'Are you sure you want to stop and delete this scheduled transaction?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        await RecurringTransactionService.delete(id);
                        loadData();
                    }
                },
            ]
        );
    };

    const handleToggle = async (id: number, currentStatus: number) => {
        await RecurringTransactionService.toggle(id, currentStatus === 0);
        loadData();
    };

    const renderItem = ({ item }: { item: RecurringTransaction }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.typeBadge(item.type)}>
                    <Text style={styles.typeText}>{item.type.toUpperCase()}</Text>
                </View>
                <TouchableOpacity onPress={() => handleDelete(item.id)}>
                    <Ionicons name="trash-outline" size={20} color="#E53935" />
                </TouchableOpacity>
            </View>

            <View style={styles.cardBody}>
                <View style={styles.mainInfo}>
                    <Text style={styles.amount}>₹ {item.amount.toLocaleString()}</Text>
                    <Text style={styles.category}>{item.categoryName} • {item.walletName}</Text>
                    {item.note ? <Text style={styles.note}>{item.note}</Text> : null}
                </View>

                <View style={styles.scheduleInfo}>
                    <View style={styles.infoRow}>
                        <Ionicons name="repeat-outline" size={16} color="#666" />
                        <Text style={styles.infoText}>{item.frequency.charAt(0).toUpperCase() + item.frequency.slice(1)}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Ionicons name="calendar-outline" size={16} color="#666" />
                        <Text style={styles.infoText}>Next: {item.nextRunDate}</Text>
                    </View>
                </View>
            </View>

            <TouchableOpacity
                style={[styles.statusToggle, item.isActive === 0 && styles.statusToggleInactive]}
                onPress={() => handleToggle(item.id, item.isActive)}
            >
                <Text style={styles.statusToggleText}>
                    {item.isActive === 1 ? 'Active' : 'Paused'}
                </Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Recurring Transactions</Text>
                <TouchableOpacity onPress={() => navigation.navigate('AddRecurringTransaction')}>
                    <Ionicons name="add" size={28} color={AppColors.primary} />
                </TouchableOpacity>
            </View>

            <FlatList
                data={items}
                renderItem={renderItem}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    !loading ? (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="timer-outline" size={64} color="#ccc" />
                            <Text style={styles.emptyText}>No recurring transactions setup yet.</Text>
                            <TouchableOpacity
                                style={styles.addBtn}
                                onPress={() => navigation.navigate('AddRecurringTransaction')}
                            >
                                <Text style={styles.addBtnText}>Setup Recurring Transaction</Text>
                            </TouchableOpacity>
                        </View>
                    ) : null
                }
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
    },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#333' },
    listContent: { padding: 16, pb: 100 },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    typeBadge: (type: string) => ({
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        backgroundColor: type === 'expense' ? '#FFEBEE' : '#E8F5E9',
    }),
    typeText: { fontSize: 10, fontWeight: '800', color: '#444' },
    cardBody: { marginBottom: 16 },
    amount: { fontSize: 20, fontWeight: '800', color: '#333', marginBottom: 4 },
    category: { fontSize: 14, color: '#666', fontWeight: '500' },
    note: { fontSize: 13, color: '#888', fontStyle: 'italic', marginTop: 4 },
    scheduleInfo: {
        flexDirection: 'row',
        gap: 16,
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0'
    },
    infoRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    infoText: { fontSize: 12, color: '#666', fontWeight: '600' },
    statusToggle: {
        backgroundColor: '#E3F2FD',
        paddingVertical: 8,
        borderRadius: 8,
        alignItems: 'center',
    },
    statusToggleInactive: { backgroundColor: '#F5F5F5' },
    statusToggleText: { fontSize: 13, fontWeight: '700', color: AppColors.primary },
    emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 100 },
    emptyText: { fontSize: 16, color: '#999', marginTop: 16, marginBottom: 24 },
    addBtn: { backgroundColor: AppColors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
    addBtnText: { color: '#fff', fontWeight: '700' },
} as any);

export default ManageRecurringTransactionsScreen;
