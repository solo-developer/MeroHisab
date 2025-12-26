import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { GlobalStyles, AppColors } from '../constants/Styles';
import Icon from 'react-native-vector-icons/MaterialIcons';

const TermsOfUseScreen: React.FC = () => {
    const sections = [
        {
            title: "1. Acceptance of Terms",
            content: "By downloading, installing, or using the MeroHisab application, you agree to be bound by these Terms of Use. If you do not agree to these terms, you must not use the application."
        },
        {
            title: "2. License & Usage",
            content: "MeroHisab grants you a personal, non-exclusive, non-transferable license to use the app for personal financial tracking. You agree not to misuse the app or help anyone else do so."
        },
        {
            title: "3. Privacy & Data Storage",
            content: "Your data is stored locally on your device. We do not have access to your financial records unless you choose to use third-party cloud backup services. You are responsible for maintaining the security of your device and backups."
        },
        {
            title: "4. Disclaimers",
            content: "MeroHisab is provided 'as is' without any warranties. While we strive for accuracy, we are not responsible for any financial decisions made based on the data within the app. Always consult with a financial professional for critical matters."
        },
        {
            title: "5. Modifications",
            content: "We reserve the right to modify these terms at any time. Continued use of the app after changes constitutes acceptance of the new terms."
        }
    ];

    return (
        <ScrollView style={[GlobalStyles.container, { backgroundColor: '#F8F9FA' }]}>
            <View style={styles.header}>
                <View style={styles.iconCircle}>
                    <Icon name="description" size={32} color="#fff" />
                </View>
                <Text style={styles.title}>Terms of Use</Text>
                <Text style={styles.lastUpdated}>Version 1.0 • Last Updated Dec 2025</Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.introText}>
                    Please read these terms carefully before using MeroHisab. These terms govern your access to and use of our services.
                </Text>
            </View>

            {sections.map((section, index) => (
                <View key={index} style={styles.card}>
                    <Text style={styles.sectionTitle}>{section.title}</Text>
                    <Text style={styles.sectionContent}>{section.content}</Text>
                </View>
            ))}

            <View style={styles.footer}>
                <Text style={styles.footerText}>For legal inquiries, contact legal@merohisab.com</Text>
            </View>
            <View style={{ height: 40 }} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    header: {
        alignItems: 'center',
        marginVertical: 30,
    },
    iconCircle: {
        width: 64,
        height: 64,
        backgroundColor: AppColors.primary,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        elevation: 4,
        shadowColor: AppColors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        color: AppColors.text,
    },
    lastUpdated: {
        fontSize: 13,
        color: AppColors.textSecondary,
        marginTop: 4,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E9ECEF',
    },
    introText: {
        fontSize: 15,
        color: AppColors.textSecondary,
        lineHeight: 22,
        fontStyle: 'italic',
    },
    sectionTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: AppColors.text,
        marginBottom: 10,
    },
    sectionContent: {
        fontSize: 15,
        color: AppColors.textSecondary,
        lineHeight: 24,
    },
    footer: {
        alignItems: 'center',
        marginTop: 10,
        paddingBottom: 20,
    },
    footerText: {
        fontSize: 13,
        color: '#ADB5BD',
    },
});

export default TermsOfUseScreen;
