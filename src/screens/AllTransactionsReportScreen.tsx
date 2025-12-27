import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Modal,
    ScrollView,
    TouchableWithoutFeedback,
    TextInput,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import RNPickerSelect from 'react-native-picker-select';

import { TransactionSummaryRepository, TransactionSummaryRow } from '../repositories/TransactionSummaryRepository';
import CategoryRepository from '../repositories/CategoryRepository';
import { toSQLDate } from '../helpers/DateHelper';
import { ExportHelper } from '../helpers/ExportHelper';
import { AppColors } from '../constants/Styles';

const PAGE_SIZE = 50;

const AllTransactionsReportScreen: React.FC = () => {
    const navigation = useNavigation();

    // Basic search/list state
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [reportList, setReportList] = useState<TransactionSummaryRow[]>([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);

    // Filter states
    const today = new Date();
    const lastMonth = new Date();
    lastMonth.setMonth(today.getMonth() - 1);

    const [fromDate, setFromDate] = useState<Date>(lastMonth);
    const [toDate, setToDate] = useState<Date>(today);
    const [showFromPicker, setShowFromPicker] = useState(false);
    const [showToPicker, setShowToPicker] = useState(false);

    const [filterType, setFilterType] = useState<string>('all');
    const [filterCategoryId, setFilterCategoryId] = useState<number | undefined>();
    const [categories, setCategories] = useState<{ label: string; value: number | undefined }[]>([]);

    // Totals
    const [totalIncome, setTotalIncome] = useState(0);
    const [totalExpense, setTotalExpense] = useState(0);

    useEffect(() => {
        loadCategories();
        resetAndLoad();
    }, []);

    const loadCategories = async () => {
        const cats = await CategoryRepository.getAll();
        setCategories(cats.map(c => ({ label: c.name, value: c.id })));
    };

    const resetAndLoad = async () => {
        setPage(0);
        setReportList([]);
        setHasMore(true);
        loadReport(0, true);
    };

    const loadReport = async (pageNum: number, isReset: boolean) => {
        if (!isReset && (!hasMore || loadingMore)) return;

        if (isReset) setLoading(true);
        else setLoadingMore(true);

        try {
            const filterOptions = {
                query: searchQuery,
                fromDate: toSQLDate(fromDate) || '',
                toDate: toSQLDate(toDate) || '',
                type: filterType,
                categoryId: filterCategoryId,
                limit: PAGE_SIZE,
                offset: pageNum * PAGE_SIZE
            };

            const rows = await TransactionSummaryRepository.search(filterOptions);

            if (isReset) {
                setReportList(rows);
                // Also load grand totals for the entire range
                const totals = await TransactionSummaryRepository.getIncomeExpense(filterOptions);
                setTotalIncome(totals.income);
                setTotalExpense(totals.expense);
            } else {
                setReportList(prev => [...prev, ...rows]);
            }

            setHasMore(rows.length === PAGE_SIZE);
            setPage(pageNum);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        const handler = setTimeout(() => {
            resetAndLoad();
        }, 500);
        return () => clearTimeout(handler);
    }, [searchQuery]);

    const renderItem = ({ item }: { item: any }) => {
        const isIncome = ['income', 'receipt'].includes(item.type);
        const color = isIncome ? '#2E7D32' : (['transfer'].includes(item.type) ? '#1565C0' : '#C62828');

        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <View style={[styles.typeTag, { backgroundColor: color + '15' }]}>
                        <Text style={[styles.typeText, { color }]}>{item.type.toUpperCase()}</Text>
                    </View>
                    <Text style={styles.dateText}>{new Date(item.date).toLocaleDateString()}</Text>
                </View>
                <View style={styles.cardBody}>
                    <View style={styles.mainInfo}>
                        <Text style={styles.noteText} numberOfLines={1}>{item.note || 'No description'}</Text>
                        {item.categoryName && (
                            <View style={styles.categoryTag}>
                                <Ionicons name="folder-outline" size={12} color="#666" />
                                <Text style={styles.categoryText}>{item.categoryName}</Text>
                            </View>
                        )}
                    </View>
                    <Text style={[styles.amountText, { color }]}>
                        {isIncome ? '+' : (['transfer'].includes(item.type) ? '' : '-')} ₹{item.netAmount.toFixed(0)}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
            <View style={styles.headerBar}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>All Transactions</Text>
                <View style={styles.headerActions}>
                    <TouchableOpacity
                        onPress={() => ExportHelper.exportReport('All_Transactions', reportList)}
                        style={styles.actionButton}
                    >
                        <Ionicons name="download-outline" size={24} color="#333" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.actionButton}>
                        <Ionicons name="options-outline" size={24} color="#333" />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                    <Ionicons name="search-outline" size={20} color="#666" />
                    <TextInput
                        placeholder="Search notes or categories..."
                        style={styles.searchInput}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={18} color="#999" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <View style={styles.summaryContainer}>
                <View style={[styles.summaryChip, { backgroundColor: '#E8F5E9', borderLeftWidth: 3, borderLeftColor: '#2E7D32' }]}>
                    <Text style={styles.summaryLabel}>Total Income</Text>
                    <Text style={[styles.summaryValue, { color: '#1B5E20' }]}>+₹{totalIncome.toFixed(0)}</Text>
                </View>
                <View style={[styles.summaryChip, { backgroundColor: '#FFEBEE', borderLeftWidth: 3, borderLeftColor: '#C62828' }]}>
                    <Text style={styles.summaryLabel}>Total Expense</Text>
                    <Text style={[styles.summaryValue, { color: '#B71C1C' }]}>-₹{totalExpense.toFixed(0)}</Text>
                </View>
            </View>

            <FlatList
                data={reportList}
                keyExtractor={item => item.id.toString()}
                renderItem={renderItem}
                contentContainerStyle={styles.listPadding}
                onEndReached={() => loadReport(page + 1, false)}
                onEndReachedThreshold={0.5}
                ListFooterComponent={() =>
                    loadingMore ? <ActivityIndicator size="small" color={AppColors.primary} style={{ marginVertical: 20 }} /> : null
                }
                ListEmptyComponent={
                    loading ? (
                        <ActivityIndicator size="large" color={AppColors.primary} style={{ marginTop: 40 }} />
                    ) : (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="document-text-outline" size={64} color="#DDD" />
                            <Text style={styles.emptyText}>No transactions found.</Text>
                        </View>
                    )
                }
            />

            <Modal visible={modalVisible} animationType="slide" transparent>
                <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                    <View style={styles.modalOverlay}>
                        <TouchableWithoutFeedback>
                            <View style={styles.modalContent}>
                                <View style={styles.modalHeader}>
                                    <Text style={styles.modalTitle}>Refine Results</Text>
                                    <TouchableOpacity onPress={() => setModalVisible(false)}>
                                        <Ionicons name="close" size={24} color="#333" />
                                    </TouchableOpacity>
                                </View>

                                <ScrollView showsVerticalScrollIndicator={false}>
                                    <Text style={styles.label}>Date Range</Text>
                                    <View style={styles.row}>
                                        <TouchableOpacity style={styles.datePickerBtn} onPress={() => setShowFromPicker(true)}>
                                            <Text style={styles.datePickerLabel}>From</Text>
                                            <Text style={styles.datePickerValue}>{fromDate.toLocaleDateString()}</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.datePickerBtn} onPress={() => setShowToPicker(true)}>
                                            <Text style={styles.datePickerLabel}>To</Text>
                                            <Text style={styles.datePickerValue}>{toDate.toLocaleDateString()}</Text>
                                        </TouchableOpacity>
                                    </View>

                                    <Text style={styles.label}>Transaction Type</Text>
                                    <RNPickerSelect
                                        onValueChange={setFilterType}
                                        items={[
                                            { label: 'All Types', value: 'all' },
                                            { label: 'Income', value: 'income' },
                                            { label: 'Expense', value: 'expense' },
                                            { label: 'Transfer', value: 'transfer' },
                                            { label: 'Payment', value: 'payment' },
                                            { label: 'Receipt', value: 'receipt' },
                                        ]}
                                        value={filterType}
                                        style={pickerSelectStyles}
                                    />

                                    <Text style={styles.label}>Category</Text>
                                    <RNPickerSelect
                                        onValueChange={setFilterCategoryId}
                                        items={categories}
                                        value={filterCategoryId}
                                        placeholder={{ label: 'All Categories', value: undefined }}
                                        style={pickerSelectStyles}
                                    />

                                    <TouchableOpacity
                                        style={styles.applyButton}
                                        onPress={() => {
                                            resetAndLoad();
                                            setModalVisible(false);
                                        }}
                                    >
                                        <Text style={styles.applyButtonText}>Update Report</Text>
                                    </TouchableOpacity>
                                </ScrollView>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>

            {showFromPicker && <DateTimePicker value={fromDate} mode="date" onChange={(_, d) => { setShowFromPicker(false); if (d) setFromDate(d); }} />}
            {showToPicker && <DateTimePicker value={toDate} mode="date" onChange={(_, d) => { setShowToPicker(false); if (d) setToDate(d); }} />}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FAFAFA' },
    headerBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
    },
    backButton: { padding: 4 },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#333' },
    headerActions: { flexDirection: 'row' },
    actionButton: { padding: 4, marginLeft: 16 },

    searchContainer: { padding: 16, backgroundColor: '#fff' },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 48,
    },
    searchInput: { flex: 1, marginLeft: 8, fontSize: 14, color: '#333' },

    summaryContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingBottom: 12,
        backgroundColor: '#fff',
        gap: 12,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 5,
    },
    summaryChip: {
        flex: 1,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 12
    },
    summaryLabel: { fontSize: 10, fontWeight: '700', color: '#666', marginBottom: 1 },
    summaryValue: { fontSize: 15, fontWeight: '900' },

    listPadding: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40 },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    typeTag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
    typeText: { fontSize: 9, fontWeight: '800' },
    dateText: { fontSize: 11, color: '#999' },
    cardBody: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    mainInfo: { flex: 1, marginRight: 16 },
    noteText: { fontSize: 15, fontWeight: '600', color: '#333', marginBottom: 6 },
    categoryTag: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    categoryText: { fontSize: 12, color: '#666' },
    amountText: { fontSize: 18, fontWeight: '900' },

    emptyContainer: { alignItems: 'center', marginTop: 80 },
    emptyText: { marginTop: 12, fontSize: 14, color: '#999' },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '85%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    modalTitle: { fontSize: 20, fontWeight: '800', color: '#333' },
    label: { fontSize: 13, fontWeight: '700', color: '#666', marginTop: 20, marginBottom: 8 },
    row: { flexDirection: 'row', gap: 12 },
    datePickerBtn: { flex: 1, backgroundColor: '#F3F4F6', padding: 12, borderRadius: 12 },
    datePickerLabel: { fontSize: 9, color: '#666', textTransform: 'uppercase', marginBottom: 2 },
    datePickerValue: { fontSize: 14, fontWeight: '700', color: '#333' },
    applyButton: { backgroundColor: AppColors.primary, paddingVertical: 16, borderRadius: 16, alignItems: 'center', marginTop: 32, marginBottom: 16 },
    applyButtonText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});

const pickerSelectStyles = {
    inputIOS: { fontSize: 15, paddingVertical: 12, paddingHorizontal: 12, backgroundColor: '#F3F4F6', borderRadius: 12, color: '#333', paddingRight: 30 },
    inputAndroid: { fontSize: 15, paddingVertical: 8, paddingHorizontal: 12, backgroundColor: '#F3F4F6', borderRadius: 12, color: '#333', paddingRight: 30 },
};

export default AllTransactionsReportScreen;
