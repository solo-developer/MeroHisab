import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AppColors, GlobalStyles } from '../constants/Styles';
import { BackupService, BackupData } from '../services/BackupService';
import Share from 'react-native-share';
import DocumentPicker from 'react-native-document-picker';
import RNFS from 'react-native-fs';
import ReactNativeRestart from 'react-native-restart';

type Step = 'ACTION' | 'TARGET' | 'PROCESS' | 'SUCCESS';
type Action = 'BACKUP' | 'RESTORE';
type Target = 'LOCAL' | 'GOOGLE_DRIVE' | 'ONEDRIVE';

const BackupSyncScreen = ({ navigation }: any) => {
    const [step, setStep] = useState<Step>('ACTION');
    const [action, setAction] = useState<Action>('BACKUP');
    const [target, setTarget] = useState<Target>('LOCAL');
    const [loading, setLoading] = useState(false);
    const [statusText, setStatusText] = useState('');

    const handleActionSelect = (act: Action) => {
        setAction(act);
        setStep('TARGET');
    };

    const handleTargetSelect = async (tgt: Target) => {
        setTarget(tgt);
        if (tgt === 'LOCAL') {
            if (action === 'BACKUP') {
                await executeLocalBackup();
            } else {
                await executeLocalRestore();
            }
        } else {
            Alert.alert(
                'Coming Soon',
                `${tgt.replace('_', ' ')} integration requires additional setup. Would you like to use Local Device for now?`,
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Use Local', onPress: () => handleTargetSelect('LOCAL') }
                ]
            );
        }
    };

    const executeLocalBackup = async () => {
        setStep('PROCESS');
        setLoading(true);
        setStatusText('Preparing your financial data...');

        try {
            const data = await BackupService.createBackup();
            setStatusText('Creating backup file...');
            const path = await BackupService.saveToTempFile(data);

            const shareOptions = {
                title: 'Mero Hisab Backup',
                url: Platform.OS === 'android' ? `file://${path}` : path,
                type: 'application/octet-stream',
                filename: `MeroHisab_Backup_${new Date().toISOString().split('T')[0]}.mhb`,
                saveToFiles: true,
            };

            await Share.open(shareOptions);
            setStep('SUCCESS');
        } catch (error: any) {
            console.error('Backup failed:', error);
            if (error.message?.includes('User did not share')) {
                setStep('ACTION');
            } else {
                Alert.alert('Backup Failed', 'An error occurred while creating backup.');
                setStep('ACTION');
            }
        } finally {
            setLoading(false);
        }
    };

    const executeLocalRestore = async () => {
        try {
            const res = await DocumentPicker.pick({
                type: [DocumentPicker.types.allFiles],
            });

            const pickedFile = res[0];

            // Basic validation
            if (!pickedFile.name?.endsWith('.mhb') && !pickedFile.name?.endsWith('.json')) {
                Alert.alert('Invalid File', 'Please select a valid .mhb backup file.');
                return;
            }

            Alert.alert(
                'Restore Data',
                'Importing this backup will OVERWRITE all your current data. This cannot be undone. Are you sure?',
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Yes, Restore',
                        style: 'destructive',
                        onPress: async () => {
                            setStep('PROCESS');
                            setLoading(true);
                            setStatusText('Reading backup file...');
                            try {
                                const content = await RNFS.readFile(pickedFile.uri, 'utf8');
                                const backupData: BackupData = JSON.parse(content);
                                setStatusText('Overwriting database...');
                                await BackupService.restoreBackup(backupData);
                                setStep('SUCCESS');
                            } catch (err) {
                                console.error('Restore failed:', err);
                                Alert.alert('Restore Failed', 'The file might be corrupted or invalid.');
                                setStep('ACTION');
                            } finally {
                                setLoading(false);
                            }
                        }
                    }
                ]
            );

        } catch (err) {
            if (DocumentPicker.isCancel(err)) {
                // Ignore
            } else {
                console.error('Picker error:', err);
            }
        }
    };

    const renderActionStep = () => (
        <View style={styles.stepContainer}>
            <Text style={styles.title}>What would you like to do?</Text>
            <Text style={styles.subtitle}>Keep your financial records safe and synchronized across devices.</Text>

            <TouchableOpacity style={styles.mainCard} onPress={() => handleActionSelect('BACKUP')}>
                <View style={[styles.iconCircle, { backgroundColor: '#E8F5E9' }]}>
                    <MaterialIcons name="cloud-upload" size={32} color="#4CAF50" />
                </View>
                <View style={styles.cardContent}>
                    <Text style={styles.cardTitle}>Backup Data</Text>
                    <Text style={styles.cardDesc}>Save your current transactions and settings to a safe location.</Text>
                </View>
                <MaterialIcons name="chevron-right" size={24} color="#CCC" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.mainCard} onPress={() => handleActionSelect('RESTORE')}>
                <View style={[styles.iconCircle, { backgroundColor: '#E3F2FD' }]}>
                    <MaterialIcons name="cloud-download" size={32} color="#2196F3" />
                </View>
                <View style={styles.cardContent}>
                    <Text style={styles.cardTitle}>Restore Data</Text>
                    <Text style={styles.cardDesc}>Recover your data from a previously created backup file.</Text>
                </View>
                <MaterialIcons name="chevron-right" size={24} color="#CCC" />
            </TouchableOpacity>
        </View>
    );

    const renderTargetStep = () => (
        <View style={styles.stepContainer}>
            <TouchableOpacity onPress={() => setStep('ACTION')} style={styles.backLink}>
                <MaterialIcons name="arrow-back" size={20} color={AppColors.primary} />
                <Text style={styles.backLinkText}>Back to options</Text>
            </TouchableOpacity>

            <Text style={styles.title}>Select Destination</Text>
            <Text style={styles.subtitle}>Where should we {action === 'BACKUP' ? 'save' : 'load'} your data?</Text>

            <View style={styles.grid}>
                <TargetCard
                    title="Local Device"
                    icon="phone-android"
                    color="#607D8B"
                    onPress={() => handleTargetSelect('LOCAL')}
                />
                <TargetCard
                    title="Google Drive"
                    icon="add-to-drive"
                    color="#EA4335"
                    onPress={() => handleTargetSelect('GOOGLE_DRIVE')}
                />
                <TargetCard
                    title="OneDrive"
                    icon="cloud-queue"
                    color="#0067B8"
                    onPress={() => handleTargetSelect('ONEDRIVE')}
                />
            </View>
        </View>
    );

    const renderProcessStep = () => (
        <View style={styles.centerStep}>
            <ActivityIndicator size="large" color={AppColors.primary} />
            <Text style={styles.processTitle}>{action === 'BACKUP' ? 'Backing Up...' : 'Restoring...'}</Text>
            <Text style={styles.statusText}>{statusText}</Text>
        </View>
    );

    const renderSuccessStep = () => (
        <View style={styles.centerStep}>
            <View style={styles.successCircle}>
                <Ionicons name="checkmark-circle" size={80} color={AppColors.success} />
            </View>
            <Text style={styles.processTitle}>{action === 'BACKUP' ? 'Backup Complete!' : 'Restore Success!'}</Text>
            <Text style={styles.statusText}>
                {action === 'BACKUP'
                    ? 'Your data has been safely exported. Keep this file in a secure place.'
                    : 'The database has been updated. The app may need to reload or you can continue.'}
            </Text>
            <TouchableOpacity
                style={styles.doneBtn}
                onPress={() => {
                    if (action === 'RESTORE') {
                        ReactNativeRestart.Restart();
                    } else {
                        navigation.goBack();
                    }
                }}
            >
                <Text style={styles.doneBtnText}>{action === 'RESTORE' ? 'Restart App' : 'Finish'}</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.headerBar}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerBarTitle}>Backup & Sync</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scroll}>
                {step === 'ACTION' && renderActionStep()}
                {step === 'TARGET' && renderTargetStep()}
                {step === 'PROCESS' && renderProcessStep()}
                {step === 'SUCCESS' && renderSuccessStep()}
            </ScrollView>
        </SafeAreaView>
    );
};

const TargetCard = ({ title, icon, color, onPress }: any) => (
    <TouchableOpacity style={styles.targetCard} onPress={onPress}>
        <View style={[styles.targetIcon, { backgroundColor: color + '15' }]}>
            <MaterialIcons name={icon} size={32} color={color} />
        </View>
        <Text style={styles.targetLabel}>{title}</Text>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    headerBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 20,
    },
    backButton: {
        padding: 4,
    },
    headerBarTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#333',
    },
    scroll: {
        flexGrow: 1,
        padding: 24,
    },
    stepContainer: {
        flex: 1,
    },
    centerStep: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
    },
    title: {
        fontSize: 22,
        fontWeight: '800',
        color: '#1A1C1E',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
        marginBottom: 32,
    },
    mainCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E1E3E8',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
    },
    iconCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardContent: {
        flex: 1,
        marginLeft: 16,
    },
    cardTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#1A1C1E',
        marginBottom: 4,
    },
    cardDesc: {
        fontSize: 13,
        color: '#666',
        lineHeight: 18,
    },
    backLink: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    backLinkText: {
        marginLeft: 8,
        fontSize: 14,
        fontWeight: '600',
        color: AppColors.primary,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    targetCard: {
        width: '48%',
        aspectRatio: 1,
        backgroundColor: '#fff',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E1E3E8',
    },
    targetIcon: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    targetLabel: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1A1C1E',
    },
    processTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1A1C1E',
        marginTop: 24,
        marginBottom: 8,
    },
    statusText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        paddingHorizontal: 40,
    },
    successCircle: {
        marginBottom: 10,
    },
    doneBtn: {
        backgroundColor: AppColors.primary,
        paddingHorizontal: 40,
        paddingVertical: 14,
        borderRadius: 30,
        marginTop: 32,
    },
    doneBtnText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 15,
    },
});

export default BackupSyncScreen;
