import React, { useState, useEffect, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { CalendarRepository } from '../repositories/CalendarRepository';
import { AppColors } from '../constants/Styles';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const CalendarReportScreen = () => {
    const navigation = useNavigation();

    // State
    const [currentDate, setCurrentDate] = useState(new Date()); // Tracks the month being viewed
    const [selectedDate, setSelectedDate] = useState<Date>(new Date()); // Tracks the specific selected day
    const [summaries, setSummaries] = useState<Record<string, { income: number; expense: number }>>({});
    const [dayTransactions, setDayTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingList, setLoadingList] = useState(false);

    // Load month data when month changes
    useEffect(() => {
        loadMonthData();
    }, [currentDate.getFullYear(), currentDate.getMonth()]);

    // Load day data when selected date changes
    useEffect(() => {
        if (selectedDate) {
            loadDayDetails(selectedDate);
        }
    }, [selectedDate]);

    const loadMonthData = async () => {
        setLoading(true);
        try {
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth() + 1;
            const data = await CalendarRepository.getDailySummaries(year, month);
            setSummaries(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const loadDayDetails = async (date: Date) => {
        setLoadingList(true);
        try {
            const dateStr = toDateString(date);
            const list = await CalendarRepository.getDayTransactions(dateStr);
            setDayTransactions(list);
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingList(false);
        }
    };

    const toDateString = (date: Date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    };

    const changeMonth = (delta: number) => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() + delta);
        setCurrentDate(newDate);
    };

    // Calendar Grid Logic
    const calendarCells = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0); // Last day of current month

        const daysInMonth = lastDayOfMonth.getDate();
        const startDayOfWeek = firstDayOfMonth.getDay(); // 0 (Sun) - 6 (Sat)

        const cells = [];
        // Empty slots for start padding
        for (let i = 0; i < startDayOfWeek; i++) {
            cells.push({ type: 'empty', id: `empty-${i}` });
        }

        // Days
        for (let d = 1; d <= daysInMonth; d++) {
            const dateObj = new Date(year, month, d);
            const dateStr = toDateString(dateObj);
            const summary = summaries[dateStr];
            cells.push({
                type: 'day',
                id: dateStr,
                date: dateObj,
                day: d,
                hasIncome: summary?.income > 0,
                hasExpense: summary?.expense > 0,
                income: summary?.income || 0,
                expense: summary?.expense || 0,
            });
        }
        return cells;
    }, [currentDate, summaries]);

    const renderTransactionItem = ({ item }: { item: any }) => (
        <View style={styles.transactionCard}>
            <View style={[styles.iconBox, { backgroundColor: item.categoryColor || '#eee' }]}>
                {item.categoryIcon ? (
                    <Ionicons name={item.categoryIcon as any} size={20} color="#fff" />
                ) : (
                    <Text style={{ fontSize: 16 }}>?</Text>
                )}
            </View>
            <View style={styles.cardContent}>
                <Text style={styles.categoryName}>{item.categoryName || 'Unknown'}</Text>
                {item.note ? <Text style={styles.note} numberOfLines={1}>{item.note}</Text> : null}
            </View>
            <Text style={[styles.amount, item.type === 'income' ? styles.incomeText : styles.expenseText]}>
                {item.type === 'income' ? '+' : '-'} {item.amount.toFixed(0)}
            </Text>
        </View>
    );

    const selectedSummary = summaries[toDateString(selectedDate)];

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <View style={styles.monthSelector}>
                    <TouchableOpacity onPress={() => changeMonth(-1)}>
                        <Ionicons name="chevron-back" size={24} color="#333" />
                    </TouchableOpacity>
                    <Text style={styles.monthTitle}>{MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}</Text>
                    <TouchableOpacity onPress={() => changeMonth(1)}>
                        <Ionicons name="chevron-forward" size={24} color="#333" />
                    </TouchableOpacity>
                </View>
                <View style={{ width: 40 }} />
            </View>

            {/* Weekday Header */}
            <View style={styles.weekHeader}>
                {DAYS.map(d => (
                    <Text key={d} style={styles.weekText}>{d}</Text>
                ))}
            </View>

            {/* Calendar Grid */}
            <View style={styles.gridContainer}>
                {loading && <ActivityIndicator style={styles.loader} color={AppColors.primary} />}
                <View style={styles.grid}>
                    {calendarCells.map((cell: any) => {
                        if (cell.type === 'empty') {
                            return <View key={cell.id} style={styles.cell} />;
                        }
                        const isSelected = selectedDate.getDate() === cell.day &&
                            selectedDate.getMonth() === currentDate.getMonth() &&
                            selectedDate.getFullYear() === currentDate.getFullYear();

                        return (
                            <TouchableOpacity
                                key={cell.id}
                                style={[styles.cell, isSelected && styles.selectedCell]}
                                onPress={() => setSelectedDate(cell.date)}
                            >
                                <Text style={[styles.dayText, isSelected && styles.selectedDayText]}>{cell.day}</Text>
                                <View style={styles.dotRow}>
                                    {cell.hasIncome && <View style={styles.greenDot} />}
                                    {cell.hasExpense && <View style={styles.redDot} />}
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>

            {/* Selected Date Summary */}
            <View style={styles.summaryContainer}>
                <View style={styles.summaryHeader}>
                    <Text style={styles.summaryDate}>
                        {selectedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                    </Text>
                    {selectedSummary ? (
                        <View style={styles.netSummary}>
                            {selectedSummary.income > 0 && <Text style={styles.incomeText}>+ {selectedSummary.income}</Text>}
                            {selectedSummary.expense > 0 && <Text style={[styles.expenseText, { marginLeft: 8 }]}>- {selectedSummary.expense}</Text>}
                        </View>
                    ) : (
                        <Text style={styles.noActivityText}>No activity</Text>
                    )}
                </View>

                {loadingList ? (
                    <ActivityIndicator style={{ marginTop: 20 }} color="#999" />
                ) : (
                    <FlatList
                        data={dayTransactions}
                        keyExtractor={item => item.id.toString()}
                        renderItem={renderTransactionItem}
                        contentContainerStyle={styles.listContent}
                        ListEmptyComponent={
                            <View style={styles.emptyList}>
                                <Text style={styles.emptyListText}>No transactions for this day</Text>
                            </View>
                        }
                    />
                )}
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
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    backButton: { padding: 4 },
    monthSelector: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    monthTitle: { fontSize: 18, fontWeight: '700', color: '#333' },

    weekHeader: {
        flexDirection: 'row',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        backgroundColor: '#fafafa'
    },
    weekText: {
        flex: 1,
        textAlign: 'center',
        fontSize: 12,
        fontWeight: '600',
        color: '#999',
        textTransform: 'uppercase'
    },

    gridContainer: { position: 'relative' },
    loader: { position: 'absolute', top: 20, left: 0, right: 0, zIndex: 10 },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    cell: {
        width: '14.28%', // 100% / 7
        aspectRatio: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#f9f9f9',
    },
    dayText: { fontSize: 16, color: '#333', fontWeight: '500' },
    selectedCell: { backgroundColor: AppColors.primary, borderRadius: 8 },
    selectedDayText: { color: '#fff', fontWeight: '700' },

    dotRow: { flexDirection: 'row', gap: 4, marginTop: 4, height: 6 },
    greenDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#4CAF50' },
    redDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#F44336' },

    summaryContainer: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        marginTop: 10,
        overflow: 'hidden',
    },
    summaryHeader: {
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    summaryDate: { fontSize: 16, fontWeight: '700', color: '#444' },
    netSummary: { flexDirection: 'row' },
    noActivityText: { fontSize: 14, color: '#999', fontStyle: 'italic' },
    incomeText: { color: '#4CAF50', fontWeight: '700', fontSize: 15 },
    expenseText: { color: '#F44336', fontWeight: '700', fontSize: 15 },

    listContent: { padding: 16 },
    transactionCard: {
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        elevation: 1,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    cardContent: { flex: 1 },
    categoryName: { fontSize: 15, fontWeight: '600', color: '#222' },
    note: { fontSize: 12, color: '#888' },
    amount: { fontSize: 15, fontWeight: '700' },

    emptyList: { alignItems: 'center', marginTop: 30 },
    emptyListText: { color: '#999' },
});

export default CalendarReportScreen;
