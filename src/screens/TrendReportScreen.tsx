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
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart } from 'react-native-gifted-charts';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { AppColors, GlobalStyles } from '../constants/Styles';
import { ReportService, TrendDataPoint } from '../services/ReportService';

const SCREEN_WIDTH = Dimensions.get('window').width;

type RangeType = '1M' | '3M';

const TrendReportScreen: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [range, setRange] = useState<RangeType>('1M');
    const [data, setData] = useState<TrendDataPoint[]>([]);

    const loadData = async (selectedRange: RangeType) => {
        try {
            setLoading(true);
            const endDate = new Date();
            const startDate = new Date();
            if (selectedRange === '1M') {
                startDate.setMonth(startDate.getMonth() - 1);
            } else {
                startDate.setMonth(startDate.getMonth() - 3);
            }

            const trendData = await ReportService.getTrendData(startDate, endDate);

            // Fill gaps
            const filledData: TrendDataPoint[] = [];
            const curr = new Date(startDate);
            while (curr <= endDate) {
                const dateStr = curr.toISOString().split('T')[0];
                const existing = trendData.find(d => d.date === dateStr);
                filledData.push(existing || { date: dateStr, income: 0, expense: 0 });
                curr.setDate(curr.getDate() + 1);
            }

            setData(filledData);
        } catch (error) {
            console.error('Failed to load trend data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData(range);
    }, [range]);

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
            (acc, curr) => ({
                income: acc.income + curr.income,
                expense: acc.expense + curr.expense,
            }),
            { income: 0, expense: 0 }
        );
    }, [data]);

    return (
        <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Trend Analysis</Text>
                <View style={styles.rangeSelector}>
                    <TouchableOpacity
                        style={[styles.rangeButton, range === '1M' && styles.rangeButtonActive]}
                        onPress={() => setRange('1M')}
                    >
                        <Text style={[styles.rangeText, range === '1M' && styles.rangeTextActive]}>1 Month</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.rangeButton, range === '3M' && styles.rangeButtonActive]}
                        onPress={() => setRange('3M')}
                    >
                        <Text style={[styles.rangeText, range === '3M' && styles.rangeTextActive]}>3 Months</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
                {/* Summary Cards */}
                <View style={styles.summaryContainer}>
                    <View style={[styles.summaryCard, { borderLeftColor: AppColors.success }]}>
                        <Text style={styles.summaryLabel}>Total Income</Text>
                        <Text style={[styles.summaryValue, { color: AppColors.success }]}>
                            ₹ {totals.income.toLocaleString()}
                        </Text>
                    </View>
                    <View style={[styles.summaryCard, { borderLeftColor: AppColors.danger }]}>
                        <Text style={styles.summaryLabel}>Total Expense</Text>
                        <Text style={[styles.summaryValue, { color: AppColors.danger }]}>
                            ₹ {totals.expense.toLocaleString()}
                        </Text>
                    </View>
                </View>

                {/* Chart Section */}
                <View style={styles.chartContainer}>
                    <Text style={styles.chartTitle}>Income vs Expense Trend</Text>

                    <View style={styles.legendContainer}>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: AppColors.success }]} />
                            <Text style={styles.legendText}>Income</Text>
                        </View>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: AppColors.danger }]} />
                            <Text style={styles.legendText}>Expense</Text>
                        </View>
                    </View>

                    {loading ? (
                        <View style={styles.loaderContainer}>
                            <ActivityIndicator size="large" color={AppColors.primary} />
                        </View>
                    ) : data.length > 0 ? (
                        <LineChart
                            data={chartData.income}
                            data2={chartData.expense}
                            height={250}
                            width={SCREEN_WIDTH - 80}
                            initialSpacing={30}
                            spacing={range === '1M' ? 35 : 55}
                            color1={AppColors.success}
                            color2={AppColors.danger}
                            thickness={4}
                            dataPointsColor1={AppColors.success}
                            dataPointsColor2={AppColors.danger}
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
                            startFillColor1={AppColors.success}
                            startFillColor2={AppColors.danger}
                            startOpacity={0.4}
                            endOpacity={0.1}
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
                                            <Text style={styles.pointerText}>Inc: ₹{items[0]?.value || 0}</Text>
                                            {items.length > 1 && (
                                                <Text style={[styles.pointerText, { color: AppColors.danger }]}>
                                                    Exp: ₹{items[1]?.value || 0}
                                                </Text>
                                            )}
                                        </View>
                                    );
                                },
                            }}
                        />
                    ) : (
                        <View style={styles.emptyContainer}>
                            <MaterialIcons name="show-chart" size={48} color="#ccc" />
                            <Text style={styles.emptyText}>No data available for this range</Text>
                        </View>
                    )}
                </View>

                {/* Info Card */}
                <View style={styles.infoCard}>
                    <MaterialIcons name="info-outline" size={20} color={AppColors.primary} />
                    <Text style={styles.infoText}>
                        Showing daily aggregation for the selected period. Labels represent the day of the month.
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
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 10,
        marginBottom: 15,
    },
    rangeSelector: {
        flexDirection: 'row',
        backgroundColor: '#f5f5f5',
        borderRadius: 10,
        padding: 4,
    },
    rangeButton: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        borderRadius: 8,
    },
    rangeButtonActive: {
        backgroundColor: '#fff',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
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
        gap: 15,
        marginBottom: 20,
    },
    summaryCard: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 12,
        borderLeftWidth: 4,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    summaryLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 5,
    },
    summaryValue: {
        fontSize: 18,
        fontWeight: '500',
    },
    pointerLabel: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        padding: 8,
        borderRadius: 8,
        width: 100,
    },
    pointerText: {
        color: AppColors.success,
        fontSize: 10,
        fontWeight: 'bold',
    },
    chartContainer: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 16,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        marginBottom: 20,
    },
    chartTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
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
