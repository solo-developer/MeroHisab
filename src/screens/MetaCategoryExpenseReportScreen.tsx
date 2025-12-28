import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { PieChart } from 'react-native-gifted-charts';

import { ReportService, CategoryExpenseData } from '../services/ReportService';
import { getRangeDates, ReportRange } from '../helpers/DateHelper';
import { AppColors } from '../constants/Styles';
import { ExportHelper } from '../helpers/ExportHelper';

const { width } = Dimensions.get('window');

// Extended palette for meta categories since they don't have colors
const META_COLORS = [
    '#4CAF50', '#2196F3', '#FF9800', '#F44336', '#9C27B0',
    '#3F51B5', '#009688', '#FFEB3B', '#795548', '#607D8B'
];

const MetaCategoryExpenseReportScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const [range, setRange] = useState<ReportRange>('this_month');
    const [loading, setLoading] = useState(false);
    const [metaData, setMetaData] = useState<CategoryExpenseData[]>([]);
    const [totalExpense, setTotalExpense] = useState(0);

    const loadData = async () => {
        try {
            setLoading(true);
            const { startDate, endDate } = getRangeDates(range);
            const data = await ReportService.getMetaCategoryWiseExpense(startDate, endDate);

            // Assign colors manually
            const colorAssignedData = data.map((item, index) => ({
                ...item,
                categoryColor: item.categoryName === 'Uncategorized'
                    ? '#9E9E9E'
                    : META_COLORS[index % META_COLORS.length]
            }));

            setMetaData(colorAssignedData);
            setTotalExpense(colorAssignedData.reduce((sum, item) => sum + item.total, 0));
        } catch (error) {
            console.error('Failed to load meta category expense report:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [range]);

    const pieData = metaData.map(c => ({
        value: c.total,
        color: c.categoryColor,
        text: '',
    }));

    const renderLegend = () => {
        return (
            <View style={styles.legendContainer}>
                {metaData.map((cat, idx) => (
                    <View key={idx} style={styles.legendItem}>
                        <View style={styles.legendLeft}>
                            <View style={[styles.legendDot, { backgroundColor: cat.categoryColor }]} />
                            <Text style={styles.legendText} numberOfLines={1}>{cat.categoryName}</Text>
                        </View>
                        <View style={styles.legendRight}>
                            <Text style={styles.legendAmount}>₹{cat.total.toLocaleString()}</Text>
                            <Text style={styles.legendPercent}>
                                {totalExpense > 0 ? ((cat.total / totalExpense) * 100).toFixed(1) : 0}%
                            </Text>
                        </View>
                    </View>
                ))}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Meta Category Breakdown</Text>
                <TouchableOpacity
                    onPress={() => ExportHelper.exportReport('Meta Category Breakdown', metaData)}
                    style={styles.exportBtn}
                >
                    <Ionicons name="download-outline" size={24} color="#333" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Date Filter Tabs */}
                <View style={styles.filterTabs}>
                    {['this_month', 'last_month', 'this_week', 'this_year'].map((r) => (
                        <TouchableOpacity
                            key={r}
                            style={[styles.filterTab, range === r && styles.activeFilterTab]}
                            onPress={() => setRange(r as ReportRange)}
                        >
                            <Text style={[styles.filterText, range === r && styles.activeFilterText]}>
                                {r.replace('_', ' ').toUpperCase()}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color={AppColors.primary} style={{ marginTop: 40 }} />
                ) : (
                    <>
                        <View style={styles.chartCard}>
                            {totalExpense > 0 ? (
                                <View style={styles.chartContainer}>
                                    <PieChart
                                        data={pieData}
                                        donut
                                        radius={100}
                                        innerRadius={70}
                                        centerLabelComponent={() => (
                                            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                                                <Text style={styles.centerLabel}>Total</Text>
                                                <Text style={styles.centerValue}>₹{totalExpense.toLocaleString()}</Text>
                                            </View>
                                        )}
                                    />
                                </View>
                            ) : (
                                <View style={styles.emptyChart}>
                                    <Ionicons name="pie-chart-outline" size={64} color="#ddd" />
                                    <Text style={styles.emptyChartText}>No expenses found</Text>
                                </View>
                            )}
                        </View>

                        {totalExpense > 0 && (
                            <View style={styles.detailsCard}>
                                <Text style={styles.sectionTitle}>Groups Breakdown</Text>
                                {renderLegend()}
                            </View>
                        )}
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FAFAFA' },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    backBtn: { padding: 4 },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#333' },
    exportBtn: { padding: 4 },

    scrollContent: { padding: 16, paddingBottom: 40 },

    filterTabs: { flexDirection: 'row', marginBottom: 20, backgroundColor: '#fff', borderRadius: 12, padding: 4, elevation: 2 },
    filterTab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
    activeFilterTab: { backgroundColor: AppColors.primary },
    filterText: { fontSize: 10, fontWeight: '700', color: '#666' },
    activeFilterText: { color: '#fff' },

    chartCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 24,
        marginBottom: 20,
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
    },
    chartContainer: { alignItems: 'center', justifyContent: 'center' },
    centerLabel: { fontSize: 14, color: '#888', fontWeight: '600' },
    centerValue: { fontSize: 18, color: '#333', fontWeight: '800' },

    emptyChart: { alignItems: 'center', paddingVertical: 40 },
    emptyChartText: { marginTop: 12, fontSize: 14, color: '#999' },

    detailsCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
    },
    sectionTitle: { fontSize: 16, fontWeight: '800', color: '#333', marginBottom: 16 },
    legendContainer: { gap: 16 },
    legendItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    legendLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    legendDot: { width: 12, height: 12, borderRadius: 6, marginRight: 12 },
    legendText: { fontSize: 14, color: '#333', fontWeight: '600', flex: 1 },
    legendRight: { alignItems: 'flex-end' },
    legendAmount: { fontSize: 14, fontWeight: '800', color: '#333' },
    legendPercent: { fontSize: 11, color: '#888', fontWeight: '500' },
});

export default MetaCategoryExpenseReportScreen;
