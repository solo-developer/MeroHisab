import React, { useState, useEffect } from 'react';
import {
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    View,
    DeviceEventEmitter,
    ActivityIndicator,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import RNPickerSelect from 'react-native-picker-select';

import WalletRepository from '../repositories/WalletRepository';
import { TransferRequest, TransferService } from '../services/TransferService';
import { useSnackbar } from '../context/SnackbarContext';

export const AddTransferScreen = ({ navigation }: any) => {
    const { showSnackbar } = useSnackbar();
    const [amount, setAmount] = useState('');
    const [wallets, setWallets] = useState<any[]>([]);

    const [fromWalletId, setFromWalletId] = useState<number | null>(null);
    const [toWalletId, setToWalletId] = useState<number | null>(null);

    const [note, setNote] = useState('');
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            const walletsList = await WalletRepository.getAll();
            setWallets(walletsList);
        };
        fetchData();
    }, []);

    const handleSave = async () => {
        // Basic validation
        if (!fromWalletId) return showSnackbar('Select "From" account', 3000, 'error');
        if (!toWalletId) return showSnackbar('Select "To" account', 3000, 'error');
        if (fromWalletId === toWalletId) return showSnackbar('Cannot transfer to same account', 3000, 'error');

        const val = parseFloat(amount || '0');
        if (val <= 0) return showSnackbar('Enter valid amount', 3000, 'error');

        // Find ledgers
        const fromWallet = wallets.find(w => w.id === fromWalletId);
        const toWallet = wallets.find(w => w.id === toWalletId);

        if (!fromWallet?.ledgerId || !toWallet?.ledgerId) {
            return showSnackbar('Invalid wallet configuration', 3000, 'error');
        }

        const request: TransferRequest = {
            amount: val,
            fromLedgerId: fromWallet.ledgerId,
            toLedgerId: toWallet.ledgerId,
            date: date.toISOString(),
            note,
        };

        setLoading(true);
        try {
            await TransferService.createTransfer(request);
            showSnackbar('Transfer successful', 1500, 'success');
            DeviceEventEmitter.emit('transferAdded');
            DeviceEventEmitter.emit('transactionAdded');
            navigation.goBack();
        } catch (err: any) {
            showSnackbar(err.message || 'Transfer failed', 3000, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
            <StatusBar barStyle="dark-content" backgroundColor="#E3F2FD" />
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="close" size={24} color="#1565C0" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>New Transfer</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Amount */}
                <View style={styles.amountContainer}>
                    <Text style={styles.currencySymbol}>₹</Text>
                    <TextInput
                        style={styles.amountInput}
                        placeholder="0"
                        placeholderTextColor="#90CAF9"
                        keyboardType="numeric"
                        value={amount}
                        onChangeText={setAmount}
                        autoFocus
                    />
                </View>
                <Text style={styles.amountLabel}>Total Amount</Text>

                <View style={styles.formContainer}>

                    {/* FROM Wallet */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Transfer From</Text>
                        <RNPickerSelect
                            onValueChange={setFromWalletId}
                            items={wallets.map(w => ({ label: w.name, value: w.id }))}
                            value={fromWalletId}
                            style={pickerStyles}
                            placeholder={{ label: 'Select Source Engine', value: null }}
                            Icon={() => <Ionicons name="arrow-up-circle-outline" size={20} color="#C62828" style={{ marginTop: 12, marginRight: 10 }} />}
                        />
                    </View>

                    {/* TO Wallet */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Transfer To</Text>
                        <RNPickerSelect
                            onValueChange={setToWalletId}
                            items={wallets.map(w => ({ label: w.name, value: w.id }))}
                            value={toWalletId}
                            style={pickerStyles}
                            placeholder={{ label: 'Select Destination', value: null }}
                            Icon={() => <Ionicons name="arrow-down-circle-outline" size={20} color="#2E7D32" style={{ marginTop: 12, marginRight: 10 }} />}
                        />
                    </View>

                    {/* Date Picker */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Date</Text>
                        <TouchableOpacity style={styles.dateSelector} onPress={() => setShowDatePicker(true)}>
                            <Ionicons name="calendar-outline" size={20} color="#1565C0" />
                            <Text style={styles.dateText}>{date.toLocaleDateString()}</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Note */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Note</Text>
                        <View style={styles.textAreaWrapper}>
                            <TextInput
                                style={styles.textArea}
                                placeholder="About this transfer..."
                                multiline
                                numberOfLines={3}
                                value={note}
                                onChangeText={setNote}
                            />
                        </View>
                    </View>

                    {/* Save Button */}
                    <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading}>
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <>
                                <Text style={styles.saveButtonText}>Confirm Transfer</Text>
                                <Ionicons name="swap-horizontal" size={20} color="#fff" />
                            </>
                        )}
                    </TouchableOpacity>

                </View>
            </ScrollView>

            {showDatePicker && (
                <DateTimePicker
                    value={date}
                    mode="date"
                    onChange={(_, d) => {
                        setShowDatePicker(false);
                        if (d) setDate(d);
                    }}
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#E3F2FD' }, // Light Blue background
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backButton: {
        padding: 8,
        backgroundColor: 'rgba(21, 101, 192, 0.1)',
        borderRadius: 20,
    },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#1565C0' },

    scrollContent: { paddingBottom: 40 },

    amountContainer: { alignItems: 'center', justifyContent: 'center', marginVertical: 30 },
    currencySymbol: { fontSize: 32, color: '#90CAF9', fontWeight: '700' },
    amountInput: { fontSize: 56, color: '#1565C0', fontWeight: '900', textAlign: 'center', minWidth: 100 },
    amountLabel: { fontSize: 14, color: '#64B5F6', marginTop: -6 },

    formContainer: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 24,
        minHeight: 500,
    },

    inputGroup: { marginBottom: 20 },
    label: { fontSize: 13, fontWeight: '700', color: '#888', marginBottom: 8, textTransform: 'uppercase' },

    dateSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9F9F9',
        padding: 14,
        borderRadius: 12,
        gap: 10,
        borderWidth: 1,
        borderColor: '#EEE',
    },
    dateText: { fontSize: 16, fontWeight: '600', color: '#333' },

    textAreaWrapper: {
        backgroundColor: '#F9F9F9',
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: '#EEE',
    },
    textArea: { fontSize: 15, color: '#333', height: 80, textAlignVertical: 'top' },

    saveButton: {
        backgroundColor: '#1565C0',
        borderRadius: 16,
        paddingVertical: 18,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: 20,
        elevation: 4,
        shadowColor: '#1565C0',
        shadowOpacity: 0.3,
        shadowOffset: { width: 0, height: 4 },
    },
    saveButtonText: { color: '#fff', fontSize: 18, fontWeight: '800' },
});

const pickerStyles = {
    inputIOS: {
        fontSize: 16,
        paddingVertical: 14,
        paddingHorizontal: 14,
        backgroundColor: '#F9F9F9',
        borderRadius: 12,
        color: '#333',
        paddingRight: 30,
        fontWeight: '600' as any,
        borderWidth: 1,
        borderColor: '#EEE',
    },
    inputAndroid: {
        fontSize: 16,
        paddingVertical: 10,
        paddingHorizontal: 14,
        backgroundColor: '#F9F9F9',
        borderRadius: 12,
        color: '#333',
        paddingRight: 30,
        fontWeight: '600' as any,
        borderWidth: 1,
        borderColor: '#EEE',
    },
    iconContainer: { top: 0, right: 0 },
};
