import React, { useState, useEffect } from 'react';
import {
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    View,
    ActivityIndicator,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import RNPickerSelect from 'react-native-picker-select';

import CategoryRepository from '../repositories/CategoryRepository';
import WalletRepository from '../repositories/WalletRepository';
import { RecurringTransactionService } from '../services/RecurringTransactionService';
import { AppColors } from '../constants/Styles';
import { useSnackbar } from '../context/SnackbarContext';

const AddRecurringTransactionScreen = () => {
    const navigation = useNavigation<any>();
    const { showSnackbar } = useSnackbar();

    const [type, setType] = useState<'expense' | 'income'>('expense');
    const [amount, setAmount] = useState('');
    const [wallets, setWallets] = useState<any[]>([]);
    const [selectedWallet, setSelectedWallet] = useState<number | null>(null);
    const [categories, setCategories] = useState<any[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [note, setNote] = useState('');
    const [startDate, setStartDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            const walletsList = await WalletRepository.getAll();
            setWallets(walletsList);
            if (walletsList.length > 0) setSelectedWallet(walletsList[0].id || null);

            const categoriesList = await CategoryRepository.getAll();
            // Filter categories based on type
            const targetType = type === 'expense' ? 'Expense' : 'Income';
            const filtered = categoriesList.filter(c => c.type === targetType);
            setCategories(filtered);
            if (filtered.length > 0) setSelectedCategory(filtered[0].id || null);
            else setSelectedCategory(null);
        };
        fetchData();
    }, [type]);

    const handleSave = async () => {
        if (!selectedWallet) return showSnackbar('Please select a wallet', 3000, 'error');
        if (!selectedCategory) return showSnackbar('Please select a category', 3000, 'error');

        const amountVal = parseFloat(amount || '0');
        if (amountVal <= 0) return showSnackbar('Please enter a valid amount', 3000, 'error');

        const data = {
            type,
            amount: amountVal,
            walletId: selectedWallet,
            categoryId: selectedCategory,
            startDate: startDate.toISOString().split('T')[0],
            frequency,
            note,
        };

        setLoading(true);
        try {
            await RecurringTransactionService.addRecurring(data);
            showSnackbar('Recurring transaction setup complete', 2000, 'success');
            navigation.goBack();
        } catch (err: any) {
            showSnackbar(err.message || 'Failed to setup recurring transaction', 3000, 'error');
        } finally {
            setLoading(false);
        }
    };

    const frequencies = [
        { label: 'Daily', value: 'daily' },
        { label: 'Weekly', value: 'weekly' },
        { label: 'Monthly', value: 'monthly' },
        { label: 'Yearly', value: 'yearly' },
    ];

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: type === 'expense' ? '#FFEBEE' : '#E8F5E9' }]} edges={['top', 'bottom', 'left', 'right']}>
            <StatusBar barStyle="dark-content" backgroundColor={type === 'expense' ? '#FFEBEE' : '#E8F5E9'} />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="close" size={24} color={type === 'expense' ? '#C62828' : '#2E7D32'} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: type === 'expense' ? '#C62828' : '#2E7D32' }]}>Schedule {type === 'expense' ? 'Expense' : 'Income'}</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Type Selector */}
                <View style={styles.typeSelector}>
                    <TouchableOpacity
                        style={[styles.typeBtn, type === 'expense' && styles.activeExpenseBtn]}
                        onPress={() => setType('expense')}
                    >
                        <Text style={[styles.typeBtnText, type === 'expense' && styles.activeTypeText]}>Expense</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.typeBtn, type === 'income' && styles.activeIncomeBtn]}
                        onPress={() => setType('income')}
                    >
                        <Text style={[styles.typeBtnText, type === 'income' && styles.activeTypeText]}>Income</Text>
                    </TouchableOpacity>
                </View>

                {/* Amount Input */}
                <View style={styles.amountContainer}>
                    <Text style={[styles.currencySymbol, { color: type === 'expense' ? '#EF9A9A' : '#A5D6A7' }]}>₹</Text>
                    <TextInput
                        style={[styles.amountInput, { color: type === 'expense' ? '#C62828' : '#2E7D32' }]}
                        placeholder="0"
                        placeholderTextColor={type === 'expense' ? '#EF9A9A' : '#A5D6A7'}
                        keyboardType="numeric"
                        value={amount}
                        onChangeText={setAmount}
                    />
                </View>

                <View style={styles.formContainer}>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Frequency</Text>
                        <RNPickerSelect
                            onValueChange={(val) => setFrequency(val)}
                            items={frequencies}
                            value={frequency}
                            style={pickerStyles}
                            placeholder={{}}
                            Icon={() => <Ionicons name="repeat-outline" size={20} color="#999" style={{ marginTop: 12, marginRight: 10 }} />}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Start Date</Text>
                        <TouchableOpacity style={styles.dateSelector} onPress={() => setShowDatePicker(true)}>
                            <Ionicons name="calendar-outline" size={20} color="#999" />
                            <Text style={styles.dateText}>{startDate.toLocaleDateString()}</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Category</Text>
                        <RNPickerSelect
                            onValueChange={setSelectedCategory}
                            items={categories.map(c => ({ label: c.name, value: c.id }))}
                            value={selectedCategory}
                            style={pickerStyles}
                            placeholder={{ label: 'Select Category', value: null }}
                            Icon={() => <Ionicons name="grid-outline" size={20} color="#999" style={{ marginTop: 12, marginRight: 10 }} />}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Wallet</Text>
                        <RNPickerSelect
                            onValueChange={setSelectedWallet}
                            items={wallets.map(w => ({ label: w.name, value: w.id }))}
                            value={selectedWallet}
                            style={pickerStyles}
                            placeholder={{ label: 'Select Wallet', value: null }}
                            Icon={() => <Ionicons name="wallet-outline" size={20} color="#999" style={{ marginTop: 12, marginRight: 10 }} />}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Note</Text>
                        <View style={styles.textAreaWrapper}>
                            <TextInput
                                style={styles.textArea}
                                placeholder="Ex: Monthly Rent, SIP, Salary..."
                                multiline
                                numberOfLines={3}
                                value={note}
                                onChangeText={setNote}
                            />
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.saveButton, { backgroundColor: type === 'expense' ? '#C62828' : '#2E7D32' }]}
                        onPress={handleSave}
                        disabled={loading}
                    >
                        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Confirm Schedule</Text>}
                    </TouchableOpacity>

                </View>
            </ScrollView>

            {showDatePicker && (
                <DateTimePicker
                    value={startDate}
                    mode="date"
                    minimumDate={new Date()}
                    onChange={(_, d) => {
                        setShowDatePicker(false);
                        if (d) setStartDate(d);
                    }}
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backButton: {
        padding: 8,
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderRadius: 20,
    },
    headerTitle: { fontSize: 18, fontWeight: '700' },
    scrollContent: { paddingBottom: 40 },
    typeSelector: {
        flexDirection: 'row',
        backgroundColor: 'rgba(0,0,0,0.05)',
        marginHorizontal: 40,
        borderRadius: 12,
        padding: 4,
        marginBottom: 20,
    },
    typeBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
    activeExpenseBtn: { backgroundColor: '#C62828' },
    activeIncomeBtn: { backgroundColor: '#2E7D32' },
    typeBtnText: { fontWeight: '700', color: '#666' },
    activeTypeText: { color: '#fff' },
    amountContainer: { alignItems: 'center', justifyContent: 'center', marginVertical: 20 },
    currencySymbol: { fontSize: 24, fontWeight: '700' },
    amountInput: { fontSize: 48, fontWeight: '900', textAlign: 'center', minWidth: 100 },
    formContainer: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 24,
    },
    inputGroup: { marginBottom: 20 },
    label: { fontSize: 12, fontWeight: '700', color: '#888', marginBottom: 8, textTransform: 'uppercase' },
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
        borderRadius: 16,
        paddingVertical: 18,
        alignItems: 'center',
        marginTop: 20,
        elevation: 4,
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

export default AddRecurringTransactionScreen;
