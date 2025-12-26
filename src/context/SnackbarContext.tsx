import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Snackbar, Portal } from 'react-native-paper';
import { StyleSheet } from 'react-native';

interface SnackbarContextType {
    showSnackbar: (message: string, duration?: number, type?: 'success' | 'error' | 'default') => void;
}

const SnackbarContext = createContext<SnackbarContextType | undefined>(undefined);

export const SnackbarProvider = ({ children }: { children: ReactNode }) => {
    const [visible, setVisible] = useState(false);
    const [message, setMessage] = useState('');
    const [type, setType] = useState<'success' | 'error' | 'default'>('default');

    const showSnackbar = useCallback((msg: string, duration = 3000, msgType: 'success' | 'error' | 'default' = 'default') => {
        setMessage(msg);
        setType(msgType);
        setVisible(true);
    }, []);

    const onDismissSnackbar = () => setVisible(false);

    const getBackgroundColor = () => {
        switch (type) {
            case 'success':
                return '#4CAF50';
            case 'error':
                return '#F44336';
            default:
                return '#333';
        }
    };

    return (
        <SnackbarContext.Provider value={{ showSnackbar }}>
            {children}
            <Portal>
                <Snackbar
                    visible={visible}
                    onDismiss={onDismissSnackbar}
                    duration={3000}
                    style={[styles.snackbar, { backgroundColor: getBackgroundColor() }]}
                    action={{
                        label: 'Close',
                        onPress: onDismissSnackbar,
                        textColor: '#fff'
                    }}
                >
                    {message}
                </Snackbar>
            </Portal>
        </SnackbarContext.Provider>
    );
};

export const useSnackbar = () => {
    const context = useContext(SnackbarContext);
    if (!context) {
        throw new Error('useSnackbar must be used within a SnackbarProvider');
    }
    return context;
};

const styles = StyleSheet.create({
    snackbar: {
        marginBottom: 20,
    },
});
