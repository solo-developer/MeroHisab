import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { usePreferences } from '../context/PreferencesContext';
import { AppColors } from '../constants/Styles';

const CURRENCIES = [
    { code: 'NPR', symbol: 'Rs.', label: 'Nepalese Rupee (NPR)' },
    { code: 'INR', symbol: '₹', label: 'Indian Rupee (INR)' },
    { code: 'USD', symbol: '$', label: 'US Dollar (USD)' },
    { code: 'EUR', symbol: '€', label: 'Euro (EUR)' },
    { code: 'GBP', symbol: '£', label: 'British Pound (GBP)' },
    { code: 'AED', symbol: 'د.إ', label: 'UAE Dirham (AED)' },
    { code: 'AUD', symbol: 'A$', label: 'Australian Dollar (AUD)' },
    { code: 'CAD', symbol: 'C$', label: 'Canadian Dollar (CAD)' },
    { code: 'SGD', symbol: 'S$', label: 'Singapore Dollar (SGD)' },
    { code: 'JPY', symbol: '¥', label: 'Japanese Yen (JPY)' },
];

const CurrencySettingsScreen: React.FC<any> = ({ navigation }) => {
    const { currency, updateCurrency } = usePreferences();

    const handleSelect = async (code: string, symbol: string) => {
        await updateCurrency(code, symbol);
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <StatusBar barStyle="dark-content" backgroundColor="#F2F2F7" />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Currency</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.description}>
                    Select your preferred currency. This will be used app-wide to display balances and transaction amounts.
                </Text>

                <View style={styles.list}>
                    {CURRENCIES.map((c, index) => {
                        const isSelected = currency.code === c.code;
                        return (
                            <TouchableOpacity
                                key={c.code}
                                style={[styles.item, index === CURRENCIES.length - 1 && styles.itemLast]}
                                onPress={() => handleSelect(c.code, c.symbol)}
                                activeOpacity={0.7}
                            >
                                <View style={styles.currencyInfo}>
                                    <View style={[styles.symbolCircle, isSelected && styles.symbolCircleActive]}>
                                        <Text style={[styles.symbolText, isSelected && styles.symbolTextActive]}>
                                            {c.symbol}
                                        </Text>
                                    </View>
                                    <Text style={[styles.label, isSelected && styles.labelActive]}>
                                        {c.label}
                                    </Text>
                                </View>
                                {isSelected && (
                                    <Ionicons name="checkmark-circle" size={24} color={AppColors.primary} />
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F2F2F7' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#F2F2F7',
    },
    backButton: { padding: 4 },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#333' },
    content: { padding: 16 },
    description: {
        fontSize: 14,
        color: '#666',
        marginBottom: 24,
        lineHeight: 20,
        paddingHorizontal: 8,
    },
    list: {
        backgroundColor: '#fff',
        borderRadius: 12,
        overflow: 'hidden',
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#E5E5EA',
    },
    itemLast: { borderBottomWidth: 0 },
    currencyInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    symbolCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F2F2F7',
        alignItems: 'center',
        justifyContent: 'center',
    },
    symbolCircleActive: { backgroundColor: AppColors.primary + '20' },
    symbolText: { fontSize: 16, fontWeight: '700', color: '#666' },
    symbolTextActive: { color: AppColors.primary },
    label: { fontSize: 16, color: '#333', fontWeight: '500' },
    labelActive: { color: AppColors.primary, fontWeight: '700' },
});

export default CurrencySettingsScreen;
