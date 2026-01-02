import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    ScrollView,
    Modal,
    TextInput,
    ActivityIndicator,
    FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { AppColors } from '../constants/Styles';
import { GoalRepository } from '../repositories/GoalRepository';
import WalletRepository, { WalletBalanceRow } from '../repositories/WalletRepository';

type ModalType = 'DEPOSIT' | 'WITHDRAW';

const GoalDetailScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const [goal, setGoal] = useState<any>((route.params as any).goal);
    const [wallets, setWallets] = useState<WalletBalanceRow[]>([]);
    const [history, setHistory] = useState<any[]>([]);

    // Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [modalType, setModalType] = useState<ModalType>('DEPOSIT');
    const [amount, setAmount] = useState('');
    const [selectedWalletId, setSelectedWalletId] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadWallets();
    }, []);

    const loadWallets = () => {
        WalletRepository.getWalletBalances(rows => {
            setWallets(rows);
            if (rows.length > 0 && !selectedWalletId) {
                setSelectedWalletId(rows[0].walletId);
            }
        });

        GoalRepository.getGoalTransactions(goal.ledgerId).then(setHistory).catch(console.error);
    };

    const handleOpenModal = (type: ModalType) => {
        setModalType(type);
        setAmount('');
        setModalVisible(true);
    };

    const handleTransaction = async () => {
        if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
            Alert.alert('Error', 'Invalid amount');
            return;
        }
        if (!selectedWalletId) {
            Alert.alert('Error', 'Select a wallet');
            return;
        }

        const amt = Number(amount);
        const wallet = wallets.find(w => w.walletId === selectedWalletId);
        if (!wallet) return;

        if (modalType === 'DEPOSIT') {
            if (wallet.balance < amt) {
                Alert.alert('Insufficient Funds', 'The selected wallet does not have enough balance.');
                return;
            }
        } else {
            if (goal.currentAmount < amt) {
                Alert.alert('Insufficient Goal Balance', 'You cannot withdraw more than you have saved.');
                return;
            }
        }

        setLoading(true);
        try {
            const date = new Date().toISOString(); // UTC format
            if (modalType === 'DEPOSIT') {
                await GoalRepository.deposit(goal.id, goal.ledgerId, wallet.ledgerId, amt, date);
            } else {
                await GoalRepository.withdraw(goal.id, goal.ledgerId, wallet.ledgerId, amt, date);
            }

            // Refresh goal data locally
            const newAmount = modalType === 'DEPOSIT' ? goal.currentAmount + amt : goal.currentAmount - amt;
            setGoal({ ...goal, currentAmount: newAmount });

            // Reload wallets to update their balances
            loadWallets();
            // Reload history
            GoalRepository.getGoalTransactions(goal.ledgerId).then(setHistory).catch(console.error);

            setModalVisible(false);
            Alert.alert('Success', `Successfully ${modalType === 'DEPOSIT' ? 'deposited' : 'withdrawn'} funds.`);

        } catch (e) {
            console.error(e);
            Alert.alert('Error', 'Transaction failed.');
        } finally {
            setLoading(false);
        }
    };

    const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) : 0;
    const percentage = Math.min(100, Math.max(0, progress * 100));
    const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.title}>Goal Details</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Hero Card */}
                <View style={styles.heroCard}>
                    <View style={styles.goalIconContainer}>
                        <View style={[styles.goalIconCircle, { backgroundColor: goal.color }]}>
                            <Ionicons name={goal.icon || 'flag'} size={40} color="#fff" />
                        </View>
                    </View>
                    <Text style={styles.goalName}>{goal.name}</Text>
                    <Text style={[styles.goalAmount, { color: goal.color }]}>{goal.currentAmount.toLocaleString()}</Text>
                    <Text style={styles.goalTarget}>Target: {goal.targetAmount.toLocaleString()}</Text>

                    {/* Progress */}
                    <View style={styles.progressSection}>
                        <View style={styles.progressBg}>
                            <View style={[styles.progressFill, { width: `${percentage}%`, backgroundColor: goal.color }]} />
                        </View>
                        <Text style={styles.percentageText}>{percentage.toFixed(1)}% Completed</Text>
                        {remaining > 0 ? (
                            <Text style={styles.remainingText}>Need {remaining.toLocaleString()} more</Text>
                        ) : (
                            <Text style={styles.completedText}>Goal Reached! 🎉</Text>
                        )}
                    </View>
                </View>

                {/* Actions */}
                <View style={styles.actionsRow}>
                    <TouchableOpacity style={styles.actionBtn} onPress={() => handleOpenModal('DEPOSIT')}>
                        <View style={[styles.actionIcon, { backgroundColor: '#E8F5E9' }]}>
                            <Ionicons name="add" size={28} color="#4CAF50" />
                        </View>
                        <Text style={styles.actionLabel}>Add Fund</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionBtn} onPress={() => handleOpenModal('WITHDRAW')}>
                        <View style={[styles.actionIcon, { backgroundColor: '#FFEBEE' }]}>
                            <Ionicons name="remove" size={28} color="#F44336" />
                        </View>
                        <Text style={styles.actionLabel}>Withdraw</Text>
                    </TouchableOpacity>
                </View>

                {/* History Section */}
                <View style={styles.historyContainer}>
                    <Text style={styles.historyTitle}>History</Text>
                    {history.length === 0 ? (
                        <Text style={styles.emptyHistory}>No transactions yet</Text>
                    ) : (
                        history.map((item: any) => (
                            <View key={item.id} style={styles.historyItem}>
                                <View style={[styles.historyIcon, { backgroundColor: item.entryType === 'debit' ? '#E8F5E9' : '#FFEBEE' }]}>
                                    <Ionicons name={item.entryType === 'debit' ? 'arrow-down' : 'arrow-up'} size={18} color={item.entryType === 'debit' ? '#4CAF50' : '#F44336'} />
                                </View>
                                <View style={styles.historyContent}>
                                    <Text style={styles.historyLabel}>{item.entryType === 'debit' ? 'Deposit' : 'Withdraw'}</Text>
                                    <Text style={styles.historyDate}>
                                        {new Date(item.date).toLocaleDateString()} • {item.walletName || 'Unknown Wallet'}
                                    </Text>
                                </View>
                                <Text style={[styles.historyAmount, { color: item.entryType === 'debit' ? '#4CAF50' : '#F44336' }]}>
                                    {item.entryType === 'debit' ? '+' : '-'} {item.amount.toLocaleString()}
                                </Text>
                            </View>
                        ))
                    )}
                </View>
            </ScrollView>

            {/* Transaction Modal */}
            <Modal
                transparent
                visible={modalVisible}
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{modalType === 'DEPOSIT' ? 'Add Funds' : 'Withdraw Funds'}</Text>

                        <Text style={styles.label}>Select Wallet</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.walletScroll}>
                            {wallets.map(w => (
                                <TouchableOpacity
                                    key={w.walletId}
                                    style={[styles.walletChip, selectedWalletId === w.walletId && styles.selectedWallet]}
                                    onPress={() => setSelectedWalletId(w.walletId)}
                                >
                                    <Text style={[styles.walletName, selectedWalletId === w.walletId && { color: '#fff' }]}>{w.walletName}</Text>
                                    <Text style={[styles.walletBal, selectedWalletId === w.walletId && { color: '#fff' }]}>
                                        {w.balance.toLocaleString()}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <Text style={styles.label}>Amount</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="0.00"
                            keyboardType="numeric"
                            value={amount}
                            onChangeText={setAmount}
                            autoFocus
                        />

                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                                <Text style={styles.cancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.confirmBtn, { backgroundColor: modalType === 'DEPOSIT' ? '#4CAF50' : '#F44336' }]}
                                onPress={handleTransaction}
                                disabled={loading}
                            >
                                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.confirmText}>Confirm</Text>}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F7FA' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    backButton: { padding: 4 },
    title: { fontSize: 18, fontWeight: '700', color: '#1a1a1a' },
    content: { padding: 20 },

    heroCard: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 3,
        marginBottom: 24,
    },
    goalIconContainer: { marginBottom: 16 },
    goalIconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    goalName: { fontSize: 20, fontWeight: '700', color: '#333', marginBottom: 4 },
    goalAmount: { fontSize: 32, fontWeight: '800', marginBottom: 4 },
    goalTarget: { fontSize: 14, color: '#888', marginBottom: 24 },

    progressSection: { width: '100%' },
    progressBg: {
        height: 12,
        backgroundColor: '#f0f0f0',
        borderRadius: 6,
        overflow: 'hidden',
        marginBottom: 8,
    },
    progressFill: { height: '100%', borderRadius: 6 },
    percentageText: { textAlign: 'center', fontWeight: '700', color: '#333', marginBottom: 4 },
    remainingText: { textAlign: 'center', color: '#666', fontSize: 12 },
    completedText: { textAlign: 'center', color: '#4CAF50', fontWeight: '700' },

    actionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    actionBtn: { alignItems: 'center' },
    actionIcon: {
        width: 60,
        height: 60,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    actionLabel: { fontSize: 14, fontWeight: '600', color: '#333' },

    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        minHeight: 400,
    },
    modalTitle: { fontSize: 20, fontWeight: '700', color: '#333', marginBottom: 24, textAlign: 'center' },
    label: { fontSize: 14, fontWeight: '600', color: '#666', marginBottom: 8 },
    input: {
        backgroundColor: '#F5F7FA',
        borderRadius: 12,
        padding: 16,
        fontSize: 24,
        fontWeight: '700',
        color: '#333',
        textAlign: 'center',
        marginBottom: 24,
    },

    walletScroll: { flexDirection: 'row', marginBottom: 24 },
    walletChip: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        backgroundColor: '#F5F7FA',
        borderRadius: 20,
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#eee',
    },
    selectedWallet: {
        backgroundColor: AppColors.primary,
        borderColor: AppColors.primary,
    },
    walletName: { fontSize: 13, color: '#333', marginBottom: 2 },
    walletBal: { fontSize: 12, fontWeight: '600', color: '#666' },

    modalButtons: { flexDirection: 'row', gap: 16 },
    cancelBtn: {
        flex: 1,
        paddingVertical: 16,
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        borderRadius: 12,
    },
    cancelText: { fontWeight: '700', color: '#666' },
    confirmBtn: {
        flex: 1,
        paddingVertical: 16,
        alignItems: 'center',
        borderRadius: 12,
    },
    confirmText: { fontWeight: '700', color: '#fff' },

    historyContainer: { marginTop: 32 },
    historyTitle: { fontSize: 18, fontWeight: '700', color: '#1a1a1a', marginBottom: 16 },
    emptyHistory: { color: '#999', fontStyle: 'italic', textAlign: 'center', marginTop: 10 },
    historyItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    historyIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    historyContent: { flex: 1 },
    historyLabel: { fontSize: 15, fontWeight: '600', color: '#333' },
    historyDate: { fontSize: 12, color: '#888' },
    historyAmount: { fontSize: 15, fontWeight: '700' },
});

export default GoalDetailScreen;
