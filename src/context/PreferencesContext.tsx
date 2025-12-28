import React, { createContext, useContext, useState, useEffect } from 'react';
import UserPreferencesRepository from '../repositories/UserPreferencesRepository';

interface PreferencesContextType {
    visibleAnalysis: string[];
    visibleReports: string[];
    quickAddActions: string[];
    currency: { code: string; symbol: string };
    togglePreference: (type: 'analysis' | 'reports' | 'quickAdd', key: string) => Promise<void>;
    updateCurrency: (code: string, symbol: string) => Promise<void>;
    loading: boolean;
}

const PreferencesContext = createContext<PreferencesContextType>({
    visibleAnalysis: [],
    visibleReports: [],
    quickAddActions: [],
    currency: { code: 'NPR', symbol: 'Rs.' },
    togglePreference: async () => { },
    updateCurrency: async () => { },
    loading: true,
});

export const PreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Default values
    const DEFAULT_ANALYSIS = ['trend', 'category-breakdown', 'meta-breakdown'];
    const DEFAULT_REPORTS = ['wallet-balance', 'income', 'expense', 'transactions', 'transfer', 'ledger', 'meta-category', 'party', 'payment', 'receipt'];
    const DEFAULT_QUICK_ADD = ['income', 'expense', 'transfer', 'receipt', 'payment'];

    const [visibleAnalysis, setVisibleAnalysis] = useState<string[]>(DEFAULT_ANALYSIS);
    const [visibleReports, setVisibleReports] = useState<string[]>(DEFAULT_REPORTS);
    const [quickAddActions, setQuickAddActions] = useState<string[]>(DEFAULT_QUICK_ADD);
    const [currency, setCurrency] = useState({ code: 'NPR', symbol: 'Rs.' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadPreferences();
    }, []);

    const loadPreferences = async () => {
        try {
            const analysis = await UserPreferencesRepository.get('visible_analysis');
            if (analysis) setVisibleAnalysis(JSON.parse(analysis));

            const reports = await UserPreferencesRepository.get('visible_reports');
            if (reports) setVisibleReports(JSON.parse(reports));

            const quickAdd = await UserPreferencesRepository.get('quick_add_actions');
            if (quickAdd) setQuickAddActions(JSON.parse(quickAdd));

            const savedCurrency = await UserPreferencesRepository.get('currency');
            if (savedCurrency) setCurrency(JSON.parse(savedCurrency));
        } catch (e) {
            console.error('Failed to load preferences', e);
        } finally {
            setLoading(false);
        }
    };

    const togglePreference = async (type: 'analysis' | 'reports' | 'quickAdd', key: string) => {
        let currentList: string[] = [];
        let dbKey = '';
        let setter: any;

        if (type === 'analysis') {
            currentList = visibleAnalysis;
            dbKey = 'visible_analysis';
            setter = setVisibleAnalysis;
        } else if (type === 'reports') {
            currentList = visibleReports;
            dbKey = 'visible_reports';
            setter = setVisibleReports;
        } else {
            currentList = quickAddActions;
            dbKey = 'quick_add_actions';
            setter = setQuickAddActions;
        }

        const newList = currentList.includes(key)
            ? currentList.filter(k => k !== key)
            : [...currentList, key];

        setter(newList);
        await UserPreferencesRepository.set(dbKey, JSON.stringify(newList));
    };

    const updateCurrency = async (code: string, symbol: string) => {
        const newCurrency = { code, symbol };
        setCurrency(newCurrency);
        await UserPreferencesRepository.set('currency', JSON.stringify(newCurrency));
    };

    return (
        <PreferencesContext.Provider value={{
            visibleAnalysis,
            visibleReports,
            quickAddActions,
            currency,
            togglePreference,
            updateCurrency,
            loading
        }}>
            {children}
        </PreferencesContext.Provider>
    );
};

export const usePreferences = () => useContext(PreferencesContext);
