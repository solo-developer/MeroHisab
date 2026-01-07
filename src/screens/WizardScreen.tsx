import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ScrollView,
    Alert,
    Dimensions,
    StatusBar,
    FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AppColors } from '../constants/Styles';
import { usePreferences } from '../context/PreferencesContext';
import { WalletsService } from '../services/WalletsService';
import { CategoriesService } from '../services/CategoriesService';
import { PartyRepository } from '../repositories/PartyRepository';

const { width } = Dimensions.get('window');

const WizardScreen = () => {
    const { updateCurrency, finishWizard, currency } = usePreferences();
    const [step, setStep] = useState(0);

    // Data States
    const [selectedCurrency, setSelectedCurrency] = useState(currency);
    const [walletName, setWalletName] = useState('Cash');
    const [walletBalance, setWalletBalance] = useState('');
    const [parties, setParties] = useState<{ name: string; phone: string }[]>([]);
    const [newPartyName, setNewPartyName] = useState('');
    const [newPartyPhone, setNewPartyPhone] = useState('');

    const [incomeCategories, setIncomeCategories] = useState([
        { name: 'Salary', icon: 'cash-outline', color: '#4CAF50', selected: true },
        { name: 'Business', icon: 'briefcase-outline', color: '#2196F3', selected: true },
        { name: 'Gift', icon: 'gift-outline', color: '#E91E63', selected: true },
        { name: 'Interest', icon: 'trending-up-outline', color: '#FF9800', selected: false },
    ]);

    const [expenseCategories, setExpenseCategories] = useState([
        { name: 'Food', icon: 'fast-food-outline', color: '#F44336', selected: true },
        { name: 'Transport', icon: 'bus-outline', color: '#FF9800', selected: true },
        { name: 'Shopping', icon: 'cart-outline', color: '#E91E63', selected: true },
        { name: 'Entertainment', icon: 'game-controller-outline', color: '#9C27B0', selected: true },
        { name: 'Bills', icon: 'receipt-outline', color: '#607D8B', selected: true },
        { name: 'Health', icon: 'medkit-outline', color: '#2196F3', selected: false },
        { name: 'Education', icon: 'school-outline', color: '#3F51B5', selected: false },
    ]);

    const handleNext = async () => {
        if (step === 2) {
            // Validate Wallet
            if (!walletName.trim()) {
                Alert.alert('Required', 'Please enter a wallet name (e.g., Cash, Bank).');
                return;
            }
            // Save Wallet
            try {
                const balance = parseFloat(walletBalance) || 0;
                await WalletsService.createWallet({
                    name: walletName,
                    openingBalance: balance
                });
            } catch (error) {
                console.error('Failed to create wallet', error);
                Alert.alert('Error', 'Failed to create wallet');
                return;
            }
        }

        if (step === 3) {
            // Save Categories
            try {
                const selectedIncome = incomeCategories.filter(c => c.selected);
                const selectedExpense = expenseCategories.filter(c => c.selected);

                // Add default categories
                for (const cat of selectedIncome) {
                    await CategoriesService.createCategory({
                        name: cat.name,
                        type: 'income',
                        icon: cat.icon,
                        color: cat.color
                    });
                }
                for (const cat of selectedExpense) {
                    await CategoriesService.createCategory({
                        name: cat.name,
                        type: 'expense',
                        icon: cat.icon,
                        color: cat.color
                    });
                }
            } catch (error) {
                console.error('Failed to create categories', error);
            }
        }

        if (step === 4) {
            // Save Parties
            try {
                for (const p of parties) {
                    await PartyRepository.create({
                        name: p.name,
                        type: 'debtor', // Default
                        initialBalance: 0,
                        currentBalance: 0
                    });
                }
            } catch (error) {
                console.error('Failed to create parties', error);
            }
        }

        if (step === 5) {
            await finishWizard(); // Finish
            return;
        }

        setStep(step + 1);
    };

    const handleBack = () => {
        if (step > 0) setStep(step - 1);
    };

    const addParty = () => {
        if (newPartyName.trim()) {
            setParties([...parties, { name: newPartyName, phone: newPartyPhone }]);
            setNewPartyName('');
            setNewPartyPhone('');
        }
    };

    const renderWelcome = () => (
        <View style={styles.stepContent}>
            <View style={styles.iconCircleBig}>
                <Ionicons name="wallet" size={60} color={AppColors.primary} />
            </View>
            <Text style={styles.title}>Welcome to PocketTracker</Text>
            <Text style={styles.description}>
                Your personal finance companion. Let's get you set up in a few simple steps.
            </Text>
            <Text style={styles.description}>
                We'll help you organize your wallets, categories, and contacts so you can start tracking immediately.
            </Text>
        </View>
    );

    const renderCurrency = () => (
        <View style={styles.stepContent}>
            <Text style={styles.title}>Select Currency</Text>
            <Text style={styles.description}>Choose the primary currency for your transactions.</Text>

            <View style={styles.currencyContainer}>
                {['NPR', 'USD', 'INR', 'EUR', 'GBP'].map((code) => {
                    let symbol = '';
                    switch (code) {
                        case 'NPR': symbol = 'Rs.'; break;
                        case 'USD': symbol = '$'; break;
                        case 'INR': symbol = '₹'; break;
                        case 'EUR': symbol = '€'; break;
                        case 'GBP': symbol = '£'; break;
                    }
                    const isSelected = selectedCurrency.code === code;
                    return (
                        <TouchableOpacity
                            key={code}
                            style={[styles.currencyOption, isSelected && styles.currencySelected]}
                            onPress={() => {
                                const newCurr = { code, symbol };
                                setSelectedCurrency(newCurr);
                                updateCurrency(code, symbol);
                            }}
                        >
                            <Text style={[styles.currencyText, isSelected && styles.currencyTextSelected]}>{code} ({symbol})</Text>
                            {isSelected && <Ionicons name="checkmark-circle" size={20} color={AppColors.primary} />}
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );

    const renderWallets = () => (
        <View style={styles.stepContent}>
            <Text style={styles.title}>Create First Wallet</Text>
            <Text style={styles.description}>Transactions need a source. Let's create your main wallet (e.g., Cash or Bank).</Text>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Wallet Name</Text>
                <TextInput
                    style={styles.input}
                    value={walletName}
                    onChangeText={setWalletName}
                    placeholder="e.g. Cash in Hand"
                />
            </View>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Opening Balance (Optional)</Text>
                <TextInput
                    style={styles.input}
                    value={walletBalance}
                    onChangeText={setWalletBalance}
                    placeholder="0.00"
                    keyboardType="numeric"
                />
            </View>
        </View>
    );

    const renderCategories = () => {
        const toggleCat = (list: any[], setList: any, index: number) => {
            const newList = [...list];
            newList[index].selected = !newList[index].selected;
            setList(newList);
        };

        const renderCatItem = (item: any, index: number, list: any[], setList: any) => (
            <TouchableOpacity
                key={item.name}
                style={[styles.catOption, item.selected && { backgroundColor: item.color + '20', borderColor: item.color }]}
                onPress={() => toggleCat(list, setList, index)}
            >
                <Ionicons name={item.icon} size={20} color={item.selected ? item.color : '#999'} />
                <Text style={[styles.catText, item.selected && { color: item.color, fontWeight: '700' }]}>{item.name}</Text>
                {item.selected && <View style={styles.checkBadge}><Ionicons name="checkmark" size={10} color="#fff" /></View>}
            </TouchableOpacity>
        );

        return (
            <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.stepScroll}>
                <Text style={styles.title}>Setup Categories</Text>
                <Text style={styles.description}>Select categories relevant to you. You can always change this later.</Text>

                <Text style={styles.sectionHeader}>Income</Text>
                <View style={styles.catGrid}>
                    {incomeCategories.map((item, idx) => renderCatItem(item, idx, incomeCategories, setIncomeCategories))}
                </View>

                <Text style={styles.sectionHeader}>Expense</Text>
                <View style={styles.catGrid}>
                    {expenseCategories.map((item, idx) => renderCatItem(item, idx, expenseCategories, setExpenseCategories))}
                </View>
            </ScrollView>
        );
    };

    const renderParties = () => (
        <View style={styles.stepContent}>
            <Text style={styles.title}>Add Parties (Optional)</Text>
            <Text style={styles.description}>Add people you frequently lend or borrow money with.</Text>

            <View style={styles.addPartyRow}>
                <TextInput
                    style={[styles.input, { flex: 1, marginBottom: 0 }]}
                    value={newPartyName}
                    onChangeText={setNewPartyName}
                    placeholder="Name"
                />
                <TouchableOpacity style={styles.addButton} onPress={addParty}>
                    <Ionicons name="add" size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            <FlatList
                data={parties}
                keyExtractor={(_, i) => i.toString()}
                renderItem={({ item, index }) => (
                    <View style={styles.partyItem}>
                        <View style={styles.partyAvatar}>
                            <Text style={styles.partyAvatarText}>{item.name[0]?.toUpperCase()}</Text>
                        </View>
                        <Text style={styles.partyName}>{item.name}</Text>
                        <TouchableOpacity onPress={() => setParties(parties.filter((_, i) => i !== index))}>
                            <Ionicons name="close-circle" size={20} color="#FF5252" />
                        </TouchableOpacity>
                    </View>
                )}
                style={{ marginTop: 20 }}
            />
        </View>
    );

    const renderFinish = () => (
        <View style={styles.stepContent}>
            <View style={styles.iconCircleBig}>
                <Ionicons name="checkmark-done" size={60} color="#4CAF50" />
            </View>
            <Text style={styles.title}>You're All Set!</Text>
            <Text style={styles.description}>
                You have successfully set up your profile. You can now start tracking your expenses and mastering your finances.
            </Text>
        </View>
    );

    const steps = [
        renderWelcome,
        renderCurrency,
        renderWallets,
        renderCategories,
        renderParties,
        renderFinish
    ];

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            {/* Header */}
            <View style={styles.header}>
                {step > 0 ? (
                    <TouchableOpacity onPress={handleBack} style={styles.navBtn}>
                        <Ionicons name="arrow-back" size={24} color={AppColors.text} />
                    </TouchableOpacity>
                ) : <View style={{ width: 24 }} />}

                <View style={styles.progressContainer}>
                    {steps.map((_, i) => (
                        <View key={i} style={[styles.dot, i <= step && styles.activeDot]} />
                    ))}
                </View>

                {step < steps.length - 1 && step > 1 ? (
                    <TouchableOpacity onPress={() => setStep(step + 1)}>
                        <Text style={styles.skipText}>Skip</Text>
                    </TouchableOpacity>
                ) : <View style={{ width: 40 }} />}
            </View>

            {/* Content */}
            <View style={styles.content}>
                {steps[step]()}
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                    <Text style={styles.nextButtonText}>{step === steps.length - 1 ? "Start Tracking" : "Next"}</Text>
                    <Ionicons name={step === steps.length - 1 ? "rocket-outline" : "arrow-forward"} size={20} color="#fff" />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        height: 60,
    },
    navBtn: { padding: 4 },
    progressContainer: { flexDirection: 'row', gap: 8 },
    dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#E0E0E0' },
    activeDot: { backgroundColor: AppColors.primary, width: 20 },
    skipText: { color: '#888', fontWeight: '600' },

    content: { flex: 1 },
    stepContent: { flex: 1, padding: 24, alignItems: 'center', justifyContent: 'center' },
    stepScroll: { padding: 24, paddingBottom: 100 },

    iconCircleBig: {
        width: 120, height: 120, borderRadius: 60, backgroundColor: AppColors.primary + '10',
        justifyContent: 'center', alignItems: 'center', marginBottom: 32
    },
    title: { fontSize: 24, fontWeight: '800', color: '#333', textAlign: 'center', marginBottom: 12 },
    description: { fontSize: 16, color: '#666', textAlign: 'center', lineHeight: 24, marginBottom: 24 },

    // Form
    inputContainer: { width: '100%', marginBottom: 20 },
    label: { fontSize: 14, fontWeight: '600', color: '#555', marginBottom: 8 },
    input: {
        backgroundColor: '#F5F5F5', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12,
        fontSize: 16, color: '#333', borderWidth: 1, borderColor: '#E0E0E0'
    },

    // Currency
    currencyContainer: { width: '100%', gap: 12 },
    currencyOption: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        padding: 16, borderRadius: 12, backgroundColor: '#FAFAFA', borderWidth: 1, borderColor: '#EEE'
    },
    currencySelected: { borderColor: AppColors.primary, backgroundColor: AppColors.primary + '05' },
    currencyText: { fontSize: 16, fontWeight: '600', color: '#555' },
    currencyTextSelected: { color: AppColors.primary },

    // Categories
    sectionHeader: { fontSize: 18, fontWeight: '700', color: '#333', marginBottom: 12, marginTop: 12, alignSelf: 'flex-start' },
    catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    catOption: {
        paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: '#E0E0E0',
        flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fff', marginBottom: 8
    },
    catText: { fontSize: 13, color: '#555', fontWeight: '500' },
    checkBadge: { width: 16, height: 16, borderRadius: 8, backgroundColor: AppColors.primary, justifyContent: 'center', alignItems: 'center' },

    // Party
    addPartyRow: { flexDirection: 'row', gap: 12, width: '100%' },
    addButton: { width: 50, borderRadius: 12, backgroundColor: AppColors.primary, justifyContent: 'center', alignItems: 'center' },
    partyItem: {
        flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: '#F9F9F9',
        borderRadius: 12, marginBottom: 8, width: '100%', justifyContent: 'space-between'
    },
    partyAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#E0E0E0', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    partyAvatarText: { fontWeight: '700', color: '#666' },
    partyName: { flex: 1, fontSize: 16, fontWeight: '600', color: '#333' },

    footer: { padding: 20, borderTopWidth: 1, borderTopColor: '#F0F0F0' },
    nextButton: {
        backgroundColor: AppColors.primary, borderRadius: 16, height: 56,
        flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12
    },
    nextButtonText: { color: '#fff', fontSize: 18, fontWeight: '700' },
});

export default WizardScreen;
