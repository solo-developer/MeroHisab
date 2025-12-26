import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { SettingsStackParamList } from '../navigation/SettingsStack';
import { GlobalStyles, AppColors } from '../constants/Styles';
import BudgetRepository from '../repositories/BudgetRepository';
import CategoryRepository from '../repositories/CategoryRepository';

type Props = NativeStackScreenProps<SettingsStackParamList, 'ManageBudgets'>;

interface CategoryBudgetConfig {
    id: number;
    name: string;
    icon: string;
    color: string;
    amount: number;
    initialAmount: number;
}

const ManageBudgetsScreen: React.FC<Props> = ({ route, navigation }) => {
    const { month } = route.params;
    const [categories, setCategories] = useState<CategoryBudgetConfig[]>([]);
    const [loading, setLoading] = useState(true);
    const [monthBudgets, setMonthBudgets] = useState<Record<number, number>>({});

    const formattedMonth = new Date(month + '-01').toLocaleString('default', { month: 'long', year: 'numeric' });

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const allCategories = await CategoryRepository.getAll();
            const expenseCategories = allCategories.filter(c => c.type.toLowerCase() === 'expense');
            const budgets = await BudgetRepository.getCategoryBudgets(month);

            const budgetMap: Record<number, number> = {};
            budgets.forEach(b => {
                budgetMap[b.id] = b.amount;
            });

            const merged = expenseCategories.map(c => ({
                id: c.id!,
                name: c.name,
                icon: c.icon,
                color: c.color,
                amount: budgetMap[c.id!] || 0,
                initialAmount: budgetMap[c.id!] || 0
            }));

            setCategories(merged);
        } catch (error) {
            console.error('Failed to load budget setup data:', error);
        } finally {
            setLoading(false);
        }
    }, [month]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const updateAmount = (id: number, val: string) => {
        const amount = parseFloat(val) || 0;
        setCategories(prev => prev.map(c => c.id === id ? { ...c, amount } : c));
    };

    const handleSave = async () => {
        try {
            const changed = categories.filter(c => c.amount !== c.initialAmount);
            if (changed.length === 0) {
                navigation.goBack();
                return;
            }

            for (const cat of changed) {
                await BudgetRepository.setBudget(cat.id, month, cat.amount);
            }

            Alert.alert('Success', 'Budget limits updated successfully.');
            navigation.goBack();
        } catch (error) {
            Alert.alert('Error', 'Failed to save budget limits.');
        }
    };

    const renderItem = ({ item }: { item: CategoryBudgetConfig }) => (
        <View style={styles.itemCard}>
            <View style={styles.infoCol}>
                <View style={[styles.iconBox, { backgroundColor: item.color }]}>
                    <MaterialIcons name={item.icon} size={20} color="#fff" />
                </View>
                <Text style={styles.itemName}>{item.name}</Text>
            </View>
            <View style={styles.inputCol}>
                <Text style={styles.rsLabel}>Rs.</Text>
                <TextInput
                    style={styles.limitInput}
                    keyboardType="numeric"
                    placeholder="0"
                    value={item.amount === 0 ? '' : item.amount.toString()}
                    onChangeText={(val) => updateAmount(item.id, val)}
                    selectTextOnFocus
                />
            </View>
        </View>
    );

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F9FA' }} edges={['bottom', 'left', 'right']}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
            >
                <View style={[GlobalStyles.container, { backgroundColor: '#F8F9FA', paddingBottom: 0 }]}>
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Budget Setup</Text>
                        <Text style={styles.headerSubtitle}>Set monthly spending limits for {formattedMonth}</Text>
                    </View>

                    <FlatList
                        data={categories}
                        keyExtractor={item => item.id.toString()}
                        renderItem={renderItem}
                        style={{ flex: 1 }}
                        contentContainerStyle={{ paddingBottom: 20 }}
                        ListEmptyComponent={
                            !loading ? <Text style={styles.emptyText}>No expense categories found. Create some in Manage Categories first.</Text> : null
                        }
                    />

                    <View style={styles.footer}>
                        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                            <Text style={styles.saveButtonText}>Apply Limits</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    header: {
        marginBottom: 20,
        marginTop: 10,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: AppColors.text,
    },
    headerSubtitle: {
        fontSize: 14,
        color: AppColors.textSecondary,
        marginTop: 4,
    },
    itemCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E9ECEF',
    },
    infoCol: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 0.6,
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    itemName: {
        fontSize: 15,
        fontWeight: '600',
        color: AppColors.text,
    },
    inputCol: {
        flex: 0.4,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F1F3F5',
        borderRadius: 8,
        paddingHorizontal: 10,
    },
    rsLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: AppColors.textSecondary,
        marginRight: 4,
    },
    limitInput: {
        flex: 1,
        height: 40,
        fontSize: 15,
        fontWeight: '700',
        color: AppColors.text,
        textAlign: 'right',
    },
    footer: {
        backgroundColor: '#fff',
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#E9ECEF',
    },
    saveButton: {
        backgroundColor: AppColors.primary,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    emptyText: {
        textAlign: 'center',
        color: AppColors.textSecondary,
        marginTop: 40,
        paddingHorizontal: 40,
    }
});

export default ManageBudgetsScreen;
