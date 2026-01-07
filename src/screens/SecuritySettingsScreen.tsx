import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ReactNativeBiometrics, { BiometryTypes } from 'react-native-biometrics';
import { usePreferences } from '../context/PreferencesContext';
import { AppColors } from '../constants/Styles';

const SecuritySettingsScreen: React.FC<any> = ({ navigation }) => {
    const { isAuthEnabled, setIsAuthEnabled } = usePreferences();
    const [biometryType, setBiometryType] = useState<string | null>(null);

    useEffect(() => {
        checkBiometrics();
    }, []);

    const checkBiometrics = async () => {
        try {
            const rnBiometrics = new ReactNativeBiometrics();
            const { available, biometryType } = await rnBiometrics.isSensorAvailable();

            if (available) {
                setBiometryType(biometryType || 'Biometrics');
            }
        } catch (error) {
            console.error('Error checking biometrics:', error);
        }
    };

    const handleToggleAuth = async (value: boolean) => {
        if (value) {
            // If enabling, test if the user can authenticate right now
            try {
                const rnBiometrics = new ReactNativeBiometrics();
                const { success } = await rnBiometrics.simplePrompt({
                    promptMessage: 'Confirm identity to enable lock',
                });

                if (success) {
                    await setIsAuthEnabled(true);
                } else {
                    Alert.alert('Authentication Failed', 'Identity could not be verified.');
                }
            } catch (error) {
                Alert.alert('Error', 'Device authentication is required to enable this feature.');
            }
        } else {
            // Confirm turning off
            Alert.alert(
                'Disable App Lock',
                'Are you sure you want to disable the security lock?',
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Disable',
                        style: 'destructive',
                        onPress: () => setIsAuthEnabled(false)
                    }
                ]
            );
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Security</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.content}>
                <View style={styles.section}>
                    <View style={styles.item}>
                        <View style={styles.itemInfo}>
                            <View style={[styles.iconContainer, { backgroundColor: AppColors.primary + '20' }]}>
                                <Ionicons name="lock-closed-outline" size={20} color={AppColors.primary} />
                            </View>
                            <View>
                                <Text style={styles.itemLabel}>App Lock</Text>
                                <Text style={styles.itemSubLabel}>Require authentication on startup</Text>
                            </View>
                        </View>
                        <Switch
                            value={isAuthEnabled}
                            onValueChange={handleToggleAuth}
                            trackColor={{ false: '#D1D1D6', true: AppColors.primary }}
                        />
                    </View>

                    {isAuthEnabled && (
                        <View style={styles.infoBox}>
                            <Ionicons name="shield-checkmark-outline" size={20} color="#666" />
                            <Text style={styles.infoText}>
                                {biometryType
                                    ? `When enabled, PocketTracker will use ${biometryType} or your device PIN to protect your data.`
                                    : 'When enabled, PocketTracker will use your device PIN/Pattern to protect your data.'
                                }
                            </Text>
                        </View>
                    )}
                </View>

                <View style={styles.noteContainer}>
                    <Text style={styles.noteTitle}>Note:</Text>
                    <Text style={styles.noteText}>
                        This feature uses your device's built-in security. PocketTracker does not store your biometric data or PIN.
                    </Text>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F2F2F7' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#F2F2F7',
    },
    backButton: { padding: 4 },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#333' },
    content: { padding: 16 },
    section: {
        backgroundColor: '#fff',
        borderRadius: 12,
        overflow: 'hidden',
        padding: 16,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    itemInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    itemLabel: { fontSize: 16, fontWeight: '600', color: '#000' },
    itemSubLabel: { fontSize: 13, color: '#666', marginTop: 2 },
    infoBox: {
        flexDirection: 'row',
        backgroundColor: '#F8F9FA',
        padding: 12,
        borderRadius: 8,
        marginTop: 16,
        gap: 10,
        alignItems: 'center',
    },
    infoText: {
        flex: 1,
        fontSize: 13,
        color: '#666',
        lineHeight: 18,
    },
    noteContainer: {
        marginTop: 24,
        paddingHorizontal: 8,
    },
    noteTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#333',
        marginBottom: 4,
    },
    noteText: {
        fontSize: 13,
        color: '#8E8E93',
        lineHeight: 18,
    },
});

export default SecuritySettingsScreen;
