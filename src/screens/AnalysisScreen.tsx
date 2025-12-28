import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    StatusBar,
    Dimensions,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

type AnalysisItem = {
    key: string;
    title: string;
    icon: string;
    color: string;
    description: string;
};

const analysisItems: AnalysisItem[] = [
    {
        key: 'trend',
        title: 'Trend Analysis',
        icon: 'trending-up-outline',
        color: '#2196F3',
        description: 'Income vs Expense over time'
    },
    {
        key: 'category-breakdown',
        title: 'Category Breakdown',
        icon: 'pie-chart-outline',
        color: '#8E24AA',
        description: 'Categorized spending expenses'
    },
    {
        key: 'meta-breakdown',
        title: 'Meta Category Breakdown',
        icon: 'pie-chart',
        color: '#795548',
        description: 'Grouped categories analysis'
    },
];

import { usePreferences } from '../context/PreferencesContext';

const { width } = Dimensions.get('window');

const AnalysisScreen: React.FC = () => {
    const navigation = useNavigation();
    const { visibleAnalysis } = usePreferences();

    const filteredItems = analysisItems.filter(item => visibleAnalysis.includes(item.key));

    const handlePress = (key: string) => {
        const nav = navigation as any;
        switch (key) {
            case 'trend': nav.navigate('TrendReport'); break;
            case 'category-breakdown': nav.navigate('CategoryExpenseReport'); break;
            case 'meta-breakdown': nav.navigate('MetaCategoryExpenseReport'); break;
            default: console.log('Pressed:', key);
        }
    };

    const renderItem = (item: AnalysisItem) => (
        <TouchableOpacity
            key={item.key}
            style={styles.card}
            onPress={() => handlePress(item.key)}
            activeOpacity={0.7}
        >
            <View style={[styles.iconWrapper, { backgroundColor: item.color + '20' }]}>
                <Ionicons name={item.icon} size={32} color={item.color} />
            </View>
            <View style={styles.textContainer}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardDesc}>{item.description}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            <StatusBar barStyle="dark-content" backgroundColor="#F5F7FA" />
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Analysis</Text>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.introText}>
                    Visual insights into your financial health.
                </Text>
                <View style={styles.list}>
                    {filteredItems.length > 0 ? (
                        filteredItems.map(item => renderItem(item))
                    ) : (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="bar-chart-outline" size={64} color="#ddd" />
                            <Text style={styles.emptyText}>No analysis reports enabled</Text>
                            <TouchableOpacity
                                style={styles.customizeBtn}
                                onPress={() => (navigation as any).navigate('SettingsStack', { screen: 'CustomizeLayout' })}
                            >
                                <Text style={styles.customizeBtnText}>Customize Layout</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#F5F7FA' },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#F5F7FA',
    },
    headerTitle: {
        fontSize: 34,
        fontWeight: '800',
        color: '#1a1a1a',
        letterSpacing: -0.5,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 100,
    },
    introText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 24,
        marginLeft: 4,
    },
    list: {
        gap: 16,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#f0f0f0',
    },
    iconWrapper: {
        width: 56,
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    textContainer: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#333',
        marginBottom: 4,
    },
    cardDesc: {
        fontSize: 12,
        color: '#888',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 16,
        color: '#999',
        marginTop: 16,
        marginBottom: 24,
        fontWeight: '500',
    },
    customizeBtn: {
        backgroundColor: '#fff',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    customizeBtnText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#333',
    },
});

export default AnalysisScreen;
