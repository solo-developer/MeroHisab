import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, LayoutAnimation, Platform, UIManager } from 'react-native';
import { GlobalStyles, AppColors } from '../constants/Styles';
import Icon from 'react-native-vector-icons/MaterialIcons';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const FAQItem = ({ question, answer }: { question: string; answer: string }) => {
    const [expanded, setExpanded] = useState(false);

    const toggleExpand = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpanded(!expanded);
    };

    return (
        <TouchableOpacity
            style={[styles.faqItem, expanded && styles.faqItemExpanded]}
            onPress={toggleExpand}
            activeOpacity={0.7}
        >
            <View style={styles.questionContainer}>
                <Text style={styles.question}>{question}</Text>
                <Icon
                    name={expanded ? "keyboard-arrow-up" : "keyboard-arrow-down"}
                    size={24}
                    color={AppColors.textSecondary}
                />
            </View>
            {expanded && (
                <Text style={styles.answer}>{answer}</Text>
            )}
        </TouchableOpacity>
    );
};

const HelpCentreScreen: React.FC = () => {
    const categories = [
        {
            title: "Common Questions",
            faqs: [
                {
                    question: "How do I add a new expense?",
                    answer: "Navigate to the Transactions tab and tap the 'Add Expense' button. Enter the amount, select a category and wallet, and save to record your spending."
                },
                {
                    question: "Can I sync my data across devices?",
                    answer: "Yes, you can enable backup and sync in Settings > General. This allows you to securely backup your data to your preferred cloud service and restore it on other devices."
                },
                {
                    question: "Is my data secure?",
                    answer: "MeroHisab prioritizes your privacy. Your data is stored locally on your device by default. Cloud backups are encrypted and stored in your private cloud account."
                }
            ]
        },
        {
            title: "Features & Terms",
            faqs: [
                {
                    question: "What is the purpose of a Transfer?",
                    answer: "Transfers are used to move funds between your own wallets (e.g., withdrawing cash from an ATM). Unlike expenses or income, transfers don't change your total net worth but keep your individual wallet balances accurate."
                },
                {
                    question: "What are 'Parties'?",
                    answer: "Parties are people or entities you have financial dealings with. Use Parties to track 'Lenden'—money you've lent to others or borrowed from them—making it easy to manage personal debts and credits."
                },
                {
                    question: "What is a Meta Category and why use it?",
                    answer: "Meta Categories are parent groups for your sub-categories. For instance, 'Rent' and 'Electricity' can both be under a 'Housing' Meta Category. This helps in generating high-level reports to see where your money goes at a glance."
                }
            ]
        }
    ];

    return (
        <ScrollView style={[GlobalStyles.container, { backgroundColor: '#F8F9FA' }]}>
            <View style={styles.headerCard}>
                <Text style={styles.title}>Help Centre</Text>
                <Text style={styles.subtitle}>Find answers to your questions or get in touch with our team.</Text>
            </View>

            {categories.map((category, catIndex) => (
                <View key={catIndex} style={styles.section}>
                    <Text style={styles.sectionHeader}>{category.title}</Text>
                    {category.faqs.map((faq, index) => (
                        <FAQItem key={index} question={faq.question} answer={faq.answer} />
                    ))}
                </View>
            ))}

            <View style={styles.contactCard}>
                <View style={styles.contactIconCircle}>
                    <Icon name="support-agent" size={32} color="#fff" />
                </View>
                <Text style={styles.contactTitle}>Still have questions?</Text>
                <Text style={styles.contactSubtitle}>We're here to help you get the most out of MeroHisab.</Text>
                <TouchableOpacity
                    style={styles.contactButton}
                    onPress={() => Linking.openURL('mailto:support@merohisab.com')}
                >
                    <Icon name="email" size={20} color="#fff" style={{ marginRight: 8 }} />
                    <Text style={styles.contactButtonText}>Email Support</Text>
                </TouchableOpacity>
            </View>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    headerCard: {
        backgroundColor: '#fff',
        padding: 24,
        borderRadius: 16,
        marginBottom: 24,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: AppColors.text,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: AppColors.textSecondary,
        lineHeight: 22,
    },
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        fontSize: 14,
        fontWeight: '700',
        color: AppColors.primary,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 12,
        marginLeft: 4,
    },
    faqItem: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E9ECEF',
    },
    faqItemExpanded: {
        borderColor: AppColors.primary,
        borderWidth: 1.5,
    },
    questionContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    question: {
        fontSize: 16,
        fontWeight: '600',
        color: AppColors.text,
        flex: 1,
        marginRight: 10,
    },
    answer: {
        fontSize: 15,
        color: AppColors.textSecondary,
        lineHeight: 22,
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F1F3F5',
    },
    contactCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        marginTop: 10,
        borderWidth: 1,
        borderColor: '#E9ECEF',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    contactIconCircle: {
        width: 64,
        height: 64,
        backgroundColor: AppColors.primary,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    contactTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: AppColors.text,
        marginBottom: 8,
    },
    contactSubtitle: {
        fontSize: 15,
        color: AppColors.textSecondary,
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 20,
    },
    contactButton: {
        backgroundColor: AppColors.primary,
        paddingHorizontal: 32,
        paddingVertical: 14,
        borderRadius: 30,
        flexDirection: 'row',
        alignItems: 'center',
    },
    contactButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default HelpCentreScreen;
