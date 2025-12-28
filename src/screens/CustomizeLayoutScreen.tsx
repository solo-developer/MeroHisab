import React from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { usePreferences } from '../context/PreferencesContext';
import { AppColors } from '../constants/Styles';

const CustomizeLayoutScreen: React.FC = () => {
    const navigation = useNavigation();
    const {
        visibleAnalysis,
        visibleReports,
        quickAddActions,
        togglePreference,
        loading
    } = usePreferences();

    const analysisOptions = [
        { key: 'trend', label: 'Trend Analysis', icon: 'trending-up-outline', iconType: 'Ionicons', color: '#2196F3' },
        { key: 'category-breakdown', label: 'Category Breakdown', icon: 'pie-chart-outline', iconType: 'Ionicons', color: '#8E24AA' },
        { key: 'meta-breakdown', label: 'Meta Category Breakdown', icon: 'pie-chart', iconType: 'Ionicons', color: '#795548' },
    ];

    const reportOptions = [
        { key: 'wallet-balance', label: 'Wallet Balance', icon: 'wallet-outline', iconType: 'Ionicons', color: '#009688' },
        { key: 'income', label: 'Income Analysis', icon: 'arrow-down-circle-outline', iconType: 'Ionicons', color: '#4CAF50' },
        { key: 'expense', label: 'Expense Analysis', icon: 'arrow-up-circle-outline', iconType: 'Ionicons', color: '#F44336' },
        { key: 'transactions', label: 'All Transactions', icon: 'receipt-outline', iconType: 'Ionicons', color: '#5C6BC0' },
        { key: 'transfer', label: 'Transfers', icon: 'swap-horizontal-outline', iconType: 'Ionicons', color: '#AB47BC' },
        { key: 'ledger', label: 'By Ledger', icon: 'book-outline', iconType: 'Ionicons', color: '#FFB74D' },
        { key: 'meta-category', label: 'By Category', icon: 'folder-open-outline', iconType: 'Ionicons', color: '#795548' },
        { key: 'party', label: 'Party Balances', icon: 'people-outline', iconType: 'Ionicons', color: '#3F51B5' },
        { key: 'payment', label: 'Payments Made', icon: 'remove-circle-outline', iconType: 'Ionicons', color: '#E91E63' },
        { key: 'receipt', label: 'Receipts', icon: 'add-circle-outline', iconType: 'Ionicons', color: '#00BCD4' },
    ];

    const quickAddOptions = [
        { key: 'income', label: 'Add Income', icon: 'add-circle', iconType: 'Ionicons', color: '#2E7D32' },
        { key: 'expense', label: 'Add Expense', icon: 'remove-circle', iconType: 'Ionicons', color: '#C62828' },
        { key: 'transfer', label: 'Add Transfer', icon: 'swap-horizontal', iconType: 'Ionicons', color: '#1565C0' },
        { key: 'receipt', label: 'Add Receipt', icon: 'cash-plus', iconType: 'MaterialCommunityIcons', color: '#00BCD4' },
        { key: 'payment', label: 'Add Payment', icon: 'cash-minus', iconType: 'MaterialCommunityIcons', color: '#E91E63' },
    ];

    const renderSection = (title: string, data: any[], selected: string[], type: 'analysis' | 'reports' | 'quickAdd') => (
        <View style={styles.section}>
            <Text style={styles.sectionHeader}>{title}</Text>
            <View style={styles.sectionBody}>
                {data.map((item, index) => {
                    const isSelected = selected.includes(item.key);
                    const isLast = index === data.length - 1;

                    return (
                        <View key={item.key} style={[styles.item, isLast && styles.itemLast]}>
                            <View style={styles.itemLeft}>
                                <View style={[styles.iconBox, { backgroundColor: item.color + '15' }]}>
                                    {item.iconType === 'MaterialCommunityIcons' ? (
                                        <MaterialCommunityIcons name={item.icon} size={20} color={item.color} />
                                    ) : (
                                        <Ionicons name={item.icon} size={20} color={item.color} />
                                    )}
                                </View>
                                <Text style={styles.itemLabel}>{item.label}</Text>
                            </View>
                            <Switch
                                value={isSelected}
                                onValueChange={() => togglePreference(type, item.key)}
                                trackColor={{ false: '#D1D1D6', true: AppColors.primary }}
                                thumbColor={Platform.OS === 'android' ? '#fff' : undefined}
                                ios_backgroundColor="#D1D1D6"
                            />
                        </View>
                    );
                })}
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Customize Layout</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {renderSection('Analysis Tab', analysisOptions, visibleAnalysis, 'analysis')}
                {renderSection('Reports Tab', reportOptions, visibleReports, 'reports')}
                {renderSection('Quick Add Actions', quickAddOptions, quickAddActions, 'quickAdd')}
            </ScrollView>
        </SafeAreaView>
    );
};

import { Platform } from 'react-native';

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F2F2F7' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#F2F2F7',
    },
    backBtn: { marginRight: 16 },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#000',
    },
    content: {
        padding: 16,
        paddingBottom: 40,
    },
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        fontSize: 13,
        fontWeight: '600',
        color: '#6e6e73',
        marginBottom: 8,
        marginLeft: 12,
        textTransform: 'uppercase',
    },
    sectionBody: {
        backgroundColor: '#fff',
        borderRadius: 12,
        overflow: 'hidden',
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#E5E5EA',
    },
    itemLast: {
        borderBottomWidth: 0,
    },
    itemLabel: {
        fontSize: 16,
        color: '#000',
    },
    itemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconBox: {
        width: 32,
        height: 32,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
});

export default CustomizeLayoutScreen;
