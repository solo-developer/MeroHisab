import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { SettingsStackParamList } from '../navigation/SettingsStack';
import { GlobalStyles, AppColors } from '../constants/Styles';
import BudgetRepository, { BudgetMetric } from '../repositories/BudgetRepository';

type Props = NativeStackScreenProps<SettingsStackParamList, 'BudgetOverview'>;

const BudgetOverviewScreen: React.FC<any> = ({ navigation }) => {
    const [metrics, setMetrics] = useState<BudgetMetric[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());

    const monthLabel = useMemo(() => {
        return selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    }, [selectedDate]);

    const monthKey = useMemo(() => {
        const y = selectedDate.getFullYear();
        const m = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
        return `${y}-${m}`;
    }, [selectedDate]);

    const loadData = useCallback(async () => {
        try {
            const data = await BudgetRepository.getMonthlyMetrics(monthKey);
            setMetrics(data);
        } catch (error) {
            console.error('Failed to load budget metrics', error);
        }
    }, [monthKey]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const totals = useMemo(() => {
        const budgeted = metrics.reduce((sum, m) => sum + m.monthlyLimit, 0);
        const spent = metrics.reduce((sum, m) => sum + m.spent, 0);
        return { budgeted, spent, remaining: budgeted - spent };
    }, [metrics]);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    const changeMonth = (offset: number) => {
        const newDate = new Date(selectedDate);
        newDate.setMonth(newDate.getMonth() + offset);
        setSelectedDate(newDate);
    };

    const getStatusColor = (percentage: number) => {
        if (percentage > 100) return '#F44336';
        if (percentage > 80) return '#FF9800';
        return '#4CAF50';
    };

    const isCurrentMonth = useMemo(() => {
        const now = new Date();
        return now.getMonth() === selectedDate.getMonth() && now.getFullYear() === selectedDate.getFullYear();
    }, [selectedDate]);

    const daysInfo = useMemo(() => {
        const now = new Date();
        const totalDays = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate();

        if (isCurrentMonth) {
            const spent = now.getDate();
            return { total: totalDays, spent, left: totalDays - spent };
        }

        return { total: totalDays, spent: totalDays, left: 0 };
    }, [selectedDate, isCurrentMonth]);

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F9FA' }} edges={['bottom', 'left', 'right']}>
            <ScrollView
                style={[GlobalStyles.container, { backgroundColor: '#F8F9FA' }]}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {/* Month Selector */}
                <View style={styles.monthSelector}>
                    <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.navButton}>
                        <MaterialIcons name="chevron-left" size={28} color={AppColors.primary} />
                    </TouchableOpacity>
                    <View style={styles.monthLabelContainer}>
                        <Text style={styles.monthLabel}>{monthLabel}</Text>
                        {isCurrentMonth && <View style={styles.currentBadge}><Text style={styles.currentBadgeText}>Current</Text></View>}
                    </View>
                    <TouchableOpacity onPress={() => changeMonth(1)} style={styles.navButton}>
                        <MaterialIcons name="chevron-right" size={28} color={AppColors.primary} />
                    </TouchableOpacity>
                </View>

                {/* Summary Card */}
                <View style={styles.summaryCard}>
                    <View style={styles.summaryRow}>
                        <View style={styles.summaryItem}>
                            <Text style={styles.summaryValue}>Rs. {totals.spent.toFixed(0)}</Text>
                            <Text style={styles.summaryLabel}>Total Spent</Text>
                        </View>
                        <View style={[styles.summaryItem, { borderLeftWidth: 1, borderLeftColor: '#E9ECEF' }]}>
                            <Text style={[styles.summaryValue, totals.remaining < 0 && { color: '#F44336' }]}>
                                Rs. {totals.remaining.toFixed(0)}
                            </Text>
                            <Text style={styles.summaryLabel}>{totals.remaining < 0 ? 'Exceeded By' : 'Remaining'}</Text>
                        </View>
                    </View>
                    <View style={styles.progressBarBg}>
                        <View
                            style={[
                                styles.progressBarFill,
                                {
                                    width: `${Math.min((totals.spent / (totals.budgeted || 1)) * 100, 100)}%`,
                                    backgroundColor: getStatusColor((totals.spent / (totals.budgeted || 1)) * 100)
                                }
                            ]}
                        />
                    </View>
                    <Text style={styles.progressText}>
                        Budget: Rs. {totals.budgeted.toFixed(0)} • {((totals.spent / (totals.budgeted || 1)) * 100).toFixed(1)}% Used
                    </Text>
                </View>

                {isCurrentMonth && (
                    <View style={styles.miniStatsContainer}>
                        <View style={styles.miniStatCard}>
                            <MaterialIcons name="event" size={20} color={AppColors.primary} />
                            <View style={{ marginLeft: 8 }}>
                                <Text style={styles.miniStatValue}>{daysInfo.left}</Text>
                                <Text style={styles.miniStatLabel}>Days Left</Text>
                            </View>
                        </View>
                        <View style={styles.miniStatCard}>
                            <MaterialIcons name="trending-up" size={20} color={AppColors.warning} />
                            <View style={{ marginLeft: 8 }}>
                                <Text style={styles.miniStatValue}>Rs. {(totals.spent / (daysInfo.spent || 1)).toFixed(0)}</Text>
                                <Text style={styles.miniStatLabel}>Daily Average</Text>
                            </View>
                        </View>
                    </View>
                )}

                <View style={styles.sectionHeaderRow}>
                    <Text style={styles.sectionHeader}>Category Budgets</Text>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('ManageBudgets', { month: monthKey })}
                        style={styles.setupButton}
                    >
                        <MaterialIcons name="settings" size={16} color={AppColors.primary} />
                        <Text style={styles.setupButtonText}>Adjust Limits</Text>
                    </TouchableOpacity>
                </View>

                {metrics.length === 0 ? (
                    <View style={styles.emptyCard}>
                        <MaterialIcons name="assignment-late" size={40} color="#ADB5BD" />
                        <Text style={styles.emptyText}>No budgets configured for this month.</Text>
                        <TouchableOpacity
                            style={styles.emptyButton}
                            onPress={() => navigation.navigate('ManageBudgets', { month: monthKey })}
                        >
                            <Text style={styles.emptyButtonText}>Setup Budget</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    metrics.map((item) => (
                        <View key={item.categoryId} style={styles.categoryCard}>
                            <View style={styles.categoryHeader}>
                                <View style={styles.categoryInfo}>
                                    <View style={[styles.iconBox, { backgroundColor: item.categoryColor }]}>
                                        <MaterialIcons name={item.categoryIcon} size={18} color="#fff" />
                                    </View>
                                    <Text style={styles.categoryName}>{item.categoryName}</Text>
                                </View>
                                <Text style={styles.categoryLimit}>Limit: {item.monthlyLimit}</Text>
                            </View>

                            <View style={styles.categoryStatsRow}>
                                <View>
                                    <Text style={styles.statValue}>Rs. {item.spent.toFixed(0)}</Text>
                                    <Text style={styles.statLabel}>Spent</Text>
                                </View>
                                <View style={{ alignItems: 'flex-end' }}>
                                    <Text style={[styles.statValue, { color: item.remaining < 0 ? '#F44336' : AppColors.text }]}>
                                        Rs. {item.remaining.toFixed(0)}
                                    </Text>
                                    <Text style={styles.statLabel}>Remaining</Text>
                                </View>
                            </View>

                            <View style={styles.progressBarBg}>
                                <View
                                    style={[
                                        styles.progressBarFill,
                                        {
                                            width: `${Math.min(item.usagePercentage, 100)}%`,
                                            backgroundColor: getStatusColor(item.usagePercentage)
                                        }
                                    ]}
                                />
                            </View>

                            <View style={styles.detailsRow}>
                                <Text style={styles.detailText}>
                                    {item.usagePercentage.toFixed(1)}% Used
                                </Text>
                                {isCurrentMonth && item.remaining > 0 && (
                                    <Text style={styles.detailText}>
                                        Allowance: Rs. {(item.remaining / (daysInfo.left || 1)).toFixed(0)} / day
                                    </Text>
                                )}
                            </View>
                        </View>
                    ))
                )}

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    monthSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 10,
        marginTop: 10,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E9ECEF',
    },
    monthLabelContainer: {
        alignItems: 'center',
    },
    monthLabel: {
        fontSize: 18,
        fontWeight: '700',
        color: AppColors.text,
    },
    currentBadge: {
        backgroundColor: '#E7F5FF',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
        marginTop: 4,
    },
    currentBadgeText: {
        fontSize: 10,
        color: AppColors.primary,
        fontWeight: '700',
    },
    navButton: {
        padding: 5,
    },
    summaryCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    summaryRow: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    summaryItem: {
        flex: 1,
        alignItems: 'center',
    },
    summaryValue: {
        fontSize: 20,
        fontWeight: '800',
        color: AppColors.text,
    },
    summaryLabel: {
        fontSize: 12,
        color: AppColors.textSecondary,
        marginTop: 4,
    },
    progressBarBg: {
        height: 10,
        backgroundColor: '#E9ECEF',
        borderRadius: 5,
        overflow: 'hidden',
        marginVertical: 10,
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 5,
    },
    progressText: {
        fontSize: 12,
        color: AppColors.textSecondary,
        textAlign: 'center',
    },
    miniStatsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    miniStatCard: {
        backgroundColor: '#fff',
        flex: 0.48,
        borderRadius: 12,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E9ECEF',
    },
    miniStatValue: {
        fontSize: 16,
        fontWeight: '700',
        color: AppColors.text,
    },
    miniStatLabel: {
        fontSize: 11,
        color: AppColors.textSecondary,
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionHeader: {
        fontSize: 18,
        fontWeight: '800',
        color: AppColors.text,
    },
    setupButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: AppColors.primary,
    },
    setupButtonText: {
        fontSize: 12,
        color: AppColors.primary,
        fontWeight: '700',
        marginLeft: 4,
    },
    categoryCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E9ECEF',
    },
    categoryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    categoryInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconBox: {
        width: 32,
        height: 32,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    categoryName: {
        fontSize: 16,
        fontWeight: '600',
        color: AppColors.text,
    },
    categoryLimit: {
        fontSize: 13,
        fontWeight: '500',
        color: AppColors.textSecondary,
    },
    categoryStatsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    statValue: {
        fontSize: 15,
        fontWeight: '700',
        color: AppColors.text,
    },
    statLabel: {
        fontSize: 11,
        color: AppColors.textSecondary,
        marginTop: 2,
    },
    detailsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 4,
    },
    detailText: {
        fontSize: 11,
        color: AppColors.textSecondary,
    },
    emptyCard: {
        backgroundColor: '#fff',
        padding: 30,
        borderRadius: 16,
        alignItems: 'center',
        borderStyle: 'dashed',
        borderWidth: 1,
        borderColor: '#ADB5BD',
    },
    emptyText: {
        color: AppColors.textSecondary,
        textAlign: 'center',
        lineHeight: 20,
        marginTop: 10,
        marginBottom: 20,
    },
    emptyButton: {
        backgroundColor: AppColors.primary,
        paddingHorizontal: 24,
        paddingVertical: 10,
        borderRadius: 20,
    },
    emptyButtonText: {
        color: '#fff',
        fontWeight: '700',
    }
});

export default BudgetOverviewScreen;
