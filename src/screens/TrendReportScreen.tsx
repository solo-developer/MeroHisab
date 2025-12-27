import React, { useEffect, useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart } from 'react-native-gifted-charts';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { AppColors } from '../constants/Styles';
import { ReportService, TrendDataPoint } from '../services/ReportService';
import { ExportHelper } from '../helpers/ExportHelper';
import { toSQLDate } from '../helpers/DateHelper';

const SCREEN_WIDTH = Dimensions.get('window').width;

type RangeType = '1W' | '1M' | '3M';

const TrendReportScreen: React.FC = () => {
    const navigation = useNavigation();
    const [loading, setLoading] = useState(true);
    const [range, setRange] = useState<RangeType>('1W');
    const [data, setData] = useState<TrendDataPoint[]>([]);
    const [spacingMultiplier, setSpacingMultiplier] = useState(1);

    const loadData = async (selectedRange: RangeType) => {
        try {
            setLoading(true);
            const endDate = new Date();
            endDate.setHours(23, 59, 59, 999); // Ensure today is included
            const startDate = new Date();
            if (selectedRange === '1W') {
                startDate.setDate(startDate.getDate() - 6);
            } else if (selectedRange === '1M') {
                startDate.setMonth(startDate.getMonth() - 1);
            } else {
                startDate.setMonth(startDate.getMonth() - 3);
            }

            const trendData = await ReportService.getTrendData(startDate, endDate);

            // Fill gaps
            const filledData: TrendDataPoint[] = [];
            const curr = new Date(startDate);
            // Normalize dates for comparison
            const endCompare = new Date(endDate);
            endCompare.setHours(0, 0, 0, 0);

            while (true) {
                const dateStr = toSQLDate(curr)!;
                const existing = trendData.find(d => d.date === dateStr);
                filledData.push(existing || { date: dateStr, income: 0, expense: 0 });

                const currCompare = new Date(curr);
                currCompare.setHours(0, 0, 0, 0);
                if (currCompare >= endCompare) break;

                curr.setDate(curr.getDate() + 1);
            }

            setData(filledData);
            setSpacingMultiplier(1); // Reset zoom on range change
        } catch (error) {
            console.error('Failed to load trend data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData(range);
    }, [range]);

    // Calculate spacing to FIT center of screen
    const baseSpacing = useMemo(() => {
        if (data.length <= 1) return 100;
        const availableWidth = SCREEN_WIDTH - 100; // Left axis + paddings
        const fit = availableWidth / (data.length - 1);
        return Math.max(fit, 15); // Minimum 15px spacing
    }, [data]);

    const chartData = useMemo(() => {
        if (data.length === 0) return { income: [], expense: [] };

        const incomeData = data.map(v => ({
            value: v.income,
            label: v.date.split('-')[2], // Day only for label
            dataPointText: v.income > 0 ? v.income.toString() : undefined,
        }));

        const expenseData = data.map(v => ({
            value: v.expense,
            label: v.date.split('-')[2],
            dataPointText: v.expense > 0 ? Math.round(v.expense).toString() : undefined,
        }));

        return { income: incomeData, expense: expenseData };
    }, [data]);

    const totals = useMemo(() => {
        return data.reduce(
            (acc: any, curr: any) => ({
                income: acc.income + curr.income,
                expense: acc.expense + curr.expense,
            }),
            { income: 0, expense: 0 }
        );
    }, [data]);

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
            <View style={styles.header}>
                <View style={styles.headerTopRow}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <TouchableOpacity onPress={() => (navigation as any).goBack()} style={{ marginRight: 12 }}>
                            <MaterialIcons name="arrow-back" size={24} color="#333" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Trend Analysis</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => ExportHelper.exportReport('Trend Analysis', data)}
                        style={styles.downloadIcon}
                    >
                        <MaterialIcons name="download" size={26} color={AppColors.primary} />
                    </TouchableOpacity>
                </View>

                <View style={styles.rangeSelector}>
                    <TouchableOpacity
                        style={[styles.rangeButton, range === '1W' && styles.rangeButtonActive]}
                        onPress={() => setRange('1W')}
                    >
                        <Text style={[styles.rangeText, range === '1W' && styles.rangeTextActive]}>1W</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.rangeButton, range === '1M' && styles.rangeButtonActive]}
                        onPress={() => setRange('1M')}
                    >
                        <Text style={[styles.rangeText, range === '1M' && styles.rangeTextActive]}>1M</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.rangeButton, range === '3M' && styles.rangeButtonActive]}
                        onPress={() => setRange('3M')}
                    >
                        <Text style={[styles.rangeText, range === '3M' && styles.rangeTextActive]}>3M</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
                {/* Summary Cards */}
                <View style={styles.summaryContainer}>
                    <View style={[styles.summaryCard, { backgroundColor: '#E8F5E9', borderLeftColor: '#4CAF50' }]}>
                        <Text style={styles.summaryLabel}>Total Income</Text>
                        <Text style={[styles.summaryValue, { color: '#2E7D32' }]}>
                            ₹ {totals.income.toLocaleString()}
                        </Text>
                    </View>
                    <View style={[styles.summaryCard, { backgroundColor: '#FFEBEE', borderLeftColor: '#F44336' }]}>
                        <Text style={styles.summaryLabel}>Total Expense</Text>
                        <Text style={[styles.summaryValue, { color: '#C62828' }]}>
                            ₹ {totals.expense.toLocaleString()}
                        </Text>
                    </View>
                </View>

                {/* Chart Section */}
                <View style={styles.chartSection}>
                    <View style={styles.chartHeader}>
                        <Text style={styles.chartTitle}>Income vs Expense</Text>

                        {/* Zoom Controls */}
                        <View style={styles.zoomControls}>
                            <TouchableOpacity
                                onPress={() => setSpacingMultiplier(Math.max(0.5, spacingMultiplier - 0.2))}
                                style={styles.zoomBtn}
                            >
                                <MaterialIcons name="remove" size={18} color="#666" />
                            </TouchableOpacity>
                            <Text style={styles.zoomVal}>{Math.round(spacingMultiplier * 100)}%</Text>
                            <TouchableOpacity
                                onPress={() => setSpacingMultiplier(Math.min(5, spacingMultiplier + 0.2))}
                                style={styles.zoomBtn}
                            >
                                <MaterialIcons name="add" size={18} color="#666" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.legendContainer}>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: '#2E7D32' }]} />
                            <Text style={styles.legendText}>Income</Text>
                        </View>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: '#C62828' }]} />
                            <Text style={styles.legendText}>Expense</Text>
                        </View>
                    </View>

                    {loading ? (
                        <View style={styles.loaderContainer}>
                            <ActivityIndicator size="large" color={AppColors.primary} />
                        </View>
                    ) : data.length > 0 ? (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 40 }}>
                            <LineChart
                                data={chartData.income}
                                data2={chartData.expense}
                                height={250}
                                initialSpacing={30}
                                spacing={baseSpacing * spacingMultiplier}
                                color1={'#2E7D32'}
                                color2={'#C62828'}
                                thickness={4}
                                dataPointsColor1={'#2E7D32'}
                                dataPointsColor2={'#C62828'}
                                dataPointsRadius={4}
                                showValuesAsDataPointsText={false}
                                yAxisColor="#ccc"
                                xAxisColor="#ccc"
                                yAxisTextStyle={{ color: '#666', fontSize: 10 }}
                                xAxisLabelTextStyle={{ color: '#666', fontSize: 9, width: 40 }}
                                noOfSections={5}
                                curved
                                animateOnDataChange
                                animationDuration={1000}
                                areaChart
                                startFillColor1={'#2E7D32'}
                                startFillColor2={'#C62828'}
                                startOpacity={0.2}
                                endOpacity={0.05}
                                rulesType="dashed"
                                rulesColor="#eee"
                                yAxisExtraHeight={20}
                                pointerConfig={{
                                    pointerStripColor: '#ddd',
                                    pointerStripWidth: 2,
                                    pointerColor: AppColors.primary,
                                    radius: 5,
                                    pointerLabelComponent: (items: any) => {
                                        if (!items || items.length === 0) return null;
                                        return (
                                            <View style={styles.pointerLabel}>
                                                <Text style={[styles.pointerText, { color: '#2E7D32' }]}>Inc: ₹{items[0]?.value || 0}</Text>
                                                {items.length > 1 && (
                                                    <Text style={[styles.pointerText, { color: '#C62828', marginTop: 4 }]}>
                                                        Exp: ₹{items[1]?.value || 0}
                                                    </Text>
                                                )}
                                            </View>
                                        );
                                    },
                                }}
                            />
                        </ScrollView>
                    ) : (
                        <View style={styles.emptyContainer}>
                            <MaterialIcons name="show-chart" size={48} color="#ccc" />
                            <Text style={styles.emptyText}>No data available for this range</Text>
                        </View>
                    )}
                </View>

                {/* Info Card */}
                <View style={[styles.infoCard, { marginBottom: 120 }]}>
                    <MaterialIcons name="info-outline" size={20} color={AppColors.primary} />
                    <Text style={styles.infoText}>
                        Showing daily aggregation. Use the <MaterialIcons name="add" size={12} /> and <MaterialIcons name="remove" size={12} /> buttons to stretch or contract the chart.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        paddingHorizontal: 20,
        paddingBottom: 15,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    headerTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 15,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    downloadIcon: {
        padding: 5,
    },
    rangeSelector: {
        flexDirection: 'row',
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
        padding: 4,
        width: 180,
    },
    rangeButton: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        borderRadius: 10,
    },
    rangeButtonActive: {
        backgroundColor: '#fff',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.15,
        shadowRadius: 2,
    },
    rangeText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    rangeTextActive: {
        color: AppColors.primary,
    },
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    scrollContent: {
        padding: 20,
    },
    summaryContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    summaryCard: {
        flex: 1,
        padding: 12,
        borderRadius: 12,
        borderLeftWidth: 4,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    summaryLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 5,
    },
    summaryValue: {
        fontSize: 18,
        fontWeight: '700',
    },
    pointerLabel: {
        backgroundColor: 'rgba(255,255,255,0.95)',
        padding: 10,
        borderRadius: 10,
        width: 110,
        borderWidth: 1,
        borderColor: '#eee',
        elevation: 5,
    },
    pointerText: {
        fontSize: 11,
        fontWeight: 'bold',
    },
    chartSection: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 18,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
        marginBottom: 20,
        overflow: 'hidden',
    },
    chartHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    zoomControls: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        borderRadius: 20,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderWidth: 1,
        borderColor: '#eee',
    },
    zoomBtn: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#eee',
    },
    zoomVal: {
        fontSize: 11,
        fontWeight: '700',
        color: '#333',
        marginHorizontal: 10,
        minWidth: 35,
        textAlign: 'center',
    },
    chartTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#333',
    },
    legendContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 20,
        marginBottom: 20,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    legendDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    legendText: {
        fontSize: 12,
        color: '#666',
        fontWeight: '500',
    },
    loaderContainer: {
        height: 250,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        height: 250,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        marginTop: 10,
        color: '#999',
        fontSize: 14,
    },
    infoCard: {
        flexDirection: 'row',
        backgroundColor: '#E8F0FE',
        padding: 15,
        borderRadius: 12,
        alignItems: 'center',
        gap: 10,
    },
    infoText: {
        flex: 1,
        fontSize: 12,
        color: '#1967D2',
        lineHeight: 18,
    },
});

export default TrendReportScreen;
