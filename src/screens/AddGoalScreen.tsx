import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { AppColors } from '../constants/Styles';
import { GoalRepository } from '../repositories/GoalRepository';

const PRESET_COLORS = ['#4CAF50', '#2196F3', '#9C27B0', '#FF9800', '#F44336', '#E91E63', '#009688', '#795548'];
const ICONS = ['flag', 'laptop-outline', 'car-sport-outline', 'home-outline', 'school-outline', 'airplane-outline', 'gift-outline', 'medkit-outline'];

const AddGoalScreen = () => {
    const navigation = useNavigation();
    const [name, setName] = useState('');
    const [targetAmount, setTargetAmount] = useState('');
    const [deadline, setDeadline] = useState(''); // Simple text for now (YYYY-MM-DD), or empty
    const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
    const [selectedIcon, setSelectedIcon] = useState(ICONS[0]);
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert('Error', 'Please enter a goal name');
            return;
        }
        if (!targetAmount || isNaN(Number(targetAmount)) || Number(targetAmount) <= 0) {
            Alert.alert('Error', 'Please enter a valid target amount');
            return;
        }

        setSaving(true);
        try {
            await GoalRepository.create(name, Number(targetAmount), deadline, selectedColor, selectedIcon);
            navigation.goBack();
        } catch (e) {
            console.error(e);
            Alert.alert('Error', 'Failed to create goal');
        } finally {
            setSaving(false);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.title}>New Saving Goal</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Goal Name</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. New Laptop"
                        value={name}
                        onChangeText={setName}
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Target Amount</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="0.00"
                        keyboardType="numeric"
                        value={targetAmount}
                        onChangeText={setTargetAmount}
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Target Date (Optional)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="YYYY-MM-DD"
                        value={deadline}
                        onChangeText={setDeadline}
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Color</Text>
                    <View style={styles.colorGrid}>
                        {PRESET_COLORS.map(c => (
                            <TouchableOpacity
                                key={c}
                                style={[styles.colorCircle, { backgroundColor: c }, selectedColor === c && styles.selectedColor]}
                                onPress={() => setSelectedColor(c)}
                            >
                                {selectedColor === c && <Ionicons name="checkmark" size={16} color="#fff" />}
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Icon</Text>
                    <View style={styles.iconGrid}>
                        {ICONS.map(icon => (
                            <TouchableOpacity
                                key={icon}
                                style={[styles.iconCircle, selectedIcon === icon && { backgroundColor: selectedColor }]}
                                onPress={() => setSelectedIcon(icon)}
                            >
                                <Ionicons name={icon} size={20} color={selectedIcon === icon ? '#fff' : '#666'} />
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity style={[styles.saveBtn, { backgroundColor: selectedColor }]} onPress={handleSave} disabled={saving}>
                    <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Create Goal'}</Text>
                </TouchableOpacity>
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
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    backButton: { padding: 4 },
    title: { fontSize: 18, fontWeight: '700', color: '#1a1a1a' },
    content: { padding: 20 },

    formGroup: { marginBottom: 24 },
    label: { fontSize: 14, fontWeight: '600', color: '#666', marginBottom: 8 },
    input: {
        backgroundColor: '#F5F7FA',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: '#333',
        borderWidth: 1,
        borderColor: '#E1E3E8',
    },

    colorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    colorCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    selectedColor: { borderWidth: 2, borderColor: '#333' },

    iconGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    iconCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5F7FA',
        borderWidth: 1,
        borderColor: '#eee',
    },

    footer: { padding: 20, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
    saveBtn: {
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
    },
    saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

export default AddGoalScreen;
