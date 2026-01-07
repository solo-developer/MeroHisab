import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, StatusBar } from 'react-native';
import ReactNativeBiometrics from 'react-native-biometrics';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { usePreferences } from '../context/PreferencesContext';
import { AppColors } from '../constants/Styles';

interface AuthGateProps {
    children: React.ReactNode;
}

const AuthGate: React.FC<AuthGateProps> = ({ children }) => {
    const { isAuthEnabled, loading } = usePreferences();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isAuthenticating, setIsAuthenticating] = useState(false);

    const isAuthenticatingRef = useRef(false);

    const authenticate = useCallback(async () => {
        if (isAuthenticatingRef.current) return;

        isAuthenticatingRef.current = true;
        setIsAuthenticating(true);
        try {
            const rnBiometrics = new ReactNativeBiometrics();
            const { success } = await rnBiometrics.simplePrompt({
                promptMessage: 'Unlock PocketTracker',
                cancelButtonText: 'Cancel',
            });

            if (success) {
                setIsAuthenticated(true);
            }
        } catch (error) {
            console.error('Auth error:', error);
        } finally {
            isAuthenticatingRef.current = false;
            setIsAuthenticating(false);
        }
    }, []);

    useEffect(() => {
        if (!loading && isAuthEnabled && !isAuthenticated) {
            authenticate();
        } else if (!loading && !isAuthEnabled) {
            setIsAuthenticated(true);
        }
    }, [loading, isAuthEnabled, authenticate, isAuthenticated]);

    if (loading) return null;

    if (isAuthEnabled && !isAuthenticated) {
        return (
            <View style={styles.container}>
                <StatusBar barStyle="dark-content" backgroundColor="#fff" />
                <View style={styles.content}>
                    <View style={styles.logoContainer}>
                        <View style={styles.logoCircle}>
                            <Ionicons name="lock-closed" size={50} color={AppColors.primary} />
                        </View>
                        <Text style={styles.title}>PocketTracker Locked</Text>
                        <Text style={styles.subtitle}>Please authenticate to continue</Text>
                    </View>

                    <TouchableOpacity
                        style={styles.authButton}
                        onPress={authenticate}
                        disabled={isAuthenticating}
                    >
                        <Ionicons name="finger-print" size={24} color="#fff" />
                        <Text style={styles.authButtonText}>
                            {isAuthenticating ? 'Authenticating...' : 'Unlock Now'}
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Securely Protected</Text>
                </View>
            </View>
        );
    }

    return <>{children}</>;
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        alignItems: 'center',
        paddingHorizontal: 40,
        width: '100%',
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 60,
    },
    logoCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: AppColors.primary + '10',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        color: '#333',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
    authButton: {
        flexDirection: 'row',
        backgroundColor: AppColors.primary,
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 12,
        alignItems: 'center',
        gap: 12,
        elevation: 4,
        shadowColor: AppColors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    authButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    footer: {
        position: 'absolute',
        bottom: 40,
    },
    footerText: {
        fontSize: 12,
        color: '#AEAEB2',
        letterSpacing: 1,
        textTransform: 'uppercase',
        fontWeight: '600',
    },
});

export default AuthGate;
