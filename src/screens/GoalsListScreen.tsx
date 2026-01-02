import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Alert,
    RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { AppColors } from '../constants/Styles';
import { GoalRepository } from '../repositories/GoalRepository';
import { FAB } from 'react-native-paper';

const GoalsListScreen = () => {
    const navigation = useNavigation();
    const isFocused = useIsFocused();
    const [goals, setGoals] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isFocused) {
            loadGoals();
        }
    }, [isFocused]);

    const loadGoals = async () => {
        setLoading(true);
        try {
            const list = await GoalRepository.getAll();
            setGoals(list);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (id: number) => {
        Alert.alert(
            'Delete Goal',
            'Are you sure you want to delete this saving goal?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        await GoalRepository.delete(id);
                        loadGoals();
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }: { item: any }) => {
        const progress = item.targetAmount > 0 ? (item.currentAmount / item.targetAmount) : 0;
        const percentage = Math.min(100, Math.max(0, progress * 100));

        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() => (navigation as any).navigate('GoalDetail', { goal: item })}
                onLongPress={() => handleDelete(item.id)}
            >
                <View style={styles.cardHeader}>
                    <View style={[styles.iconBox, { backgroundColor: item.color + '20' }]}>
                        <Ionicons name={item.icon || 'flag'} size={24} color={item.color} />
                    </View>
                    <View style={styles.headerInfo}>
                        <Text style={styles.goalName}>{item.name}</Text>
                        {item.deadline && <Text style={styles.deadline}>Target: {item.deadline}</Text>}
                    </View>
                    <Text style={styles.amountText}>
                        <Text style={{ fontSize: 14, color: '#666' }}>saved </Text>
                        {item.currentAmount.toLocaleString()}
                    </Text>
                </View>

                <View style={styles.progressContainer}>
                    <View style={[styles.progressBar, { width: `${percentage}%`, backgroundColor: item.color }]} />
                </View>
                <View style={styles.progressLabels}>
                    <Text style={styles.percentText}>{percentage.toFixed(1)}%</Text>
                    <Text style={styles.targetText}>of {item.targetAmount.toLocaleString()}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.title}>Saving Goals</Text>
                <View style={{ width: 40 }} />
            </View>

            <FlatList
                data={goals}
                keyExtractor={item => item.id.toString()}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                refreshControl={<RefreshControl refreshing={loading} onRefresh={loadGoals} />}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="trophy-outline" size={64} color="#ddd" />
                        <Text style={styles.emptyText}>No goals yet. Start saving today!</Text>
                    </View>
                }
            />

            <FAB
                icon="plus"
                style={styles.fab}
                color="#fff"
                onPress={() => (navigation as any).navigate('AddGoal')}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F7FA' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#F5F7FA',
    },
    backButton: { padding: 4 },
    title: { fontSize: 20, fontWeight: '700', color: '#1a1a1a' },
    listContent: { padding: 20, paddingBottom: 100 },

    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    headerInfo: { flex: 1 },
    goalName: { fontSize: 16, fontWeight: '700', color: '#333', marginBottom: 2 },
    deadline: { fontSize: 12, color: '#888' },
    amountText: { fontSize: 16, fontWeight: '700', color: AppColors.primary },

    progressContainer: {
        height: 8,
        backgroundColor: '#f0f0f0',
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 8,
    },
    progressBar: { height: '100%', borderRadius: 4 },

    progressLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    percentText: { fontSize: 12, fontWeight: '700', color: '#444' },
    targetText: { fontSize: 12, color: '#888' },

    fab: {
        position: 'absolute',
        margin: 20,
        right: 0,
        bottom: 0,
        backgroundColor: AppColors.primary,
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
    },
});

export default GoalsListScreen;
