import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { GlobalStyles, AppColors } from '../constants/Styles';
import Icon from 'react-native-vector-icons/MaterialIcons';

const AboutUsScreen: React.FC = () => {
  return (
    <ScrollView style={[GlobalStyles.container, { backgroundColor: '#F8F9FA' }]}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>MH</Text>
          </View>
        </View>
        <Text style={styles.appName}>MeroHisab</Text>
        <View style={styles.versionBadge}>
          <Text style={styles.versionText}>v1.0.0</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>What is MeroHisab?</Text>
        <Text style={styles.description}>
          MeroHisab is a comprehensive financial management tool designed for individuals and small businesses.
          It simplifies how you track expenses, manage income, and monitor your cash flow across multiple wallets and accounts.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Our Mission</Text>
        <Text style={styles.description}>
          We aim to empower users by providing a clear, intuitive, and secure way to visualize their financial health,
          enabling better-informed decisions and long-term financial stability.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Contact & Social</Text>
        <View style={styles.contactItem}>
          <Icon name="email" size={20} color={AppColors.primary} />
          <Text style={styles.contactText}>support@merohisab.com</Text>
        </View>
        <View style={styles.contactItem}>
          <Icon name="language" size={20} color={AppColors.primary} />
          <Text style={styles.contactText}>www.merohisab.com</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Made with ❤️ for financial freedom</Text>
        <Text style={styles.copyrightText}>© 2025 MeroHisab. All rights reserved.</Text>
      </View>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 30,
  },
  logoContainer: {
    shadowColor: AppColors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  logoCircle: {
    width: 90,
    height: 90,
    backgroundColor: AppColors.primary,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    color: '#fff',
    fontSize: 36,
    fontWeight: '900',
  },
  appName: {
    fontSize: 26,
    fontWeight: '800',
    color: AppColors.text,
    marginTop: 16,
  },
  versionBadge: {
    backgroundColor: '#E9ECEF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 8,
  },
  versionText: {
    fontSize: 12,
    fontWeight: '700',
    color: AppColors.textSecondary,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: AppColors.text,
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
    color: AppColors.textSecondary,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  contactText: {
    fontSize: 15,
    color: AppColors.textSecondary,
    marginLeft: 12,
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 14,
    color: AppColors.textSecondary,
    fontStyle: 'italic',
  },
  copyrightText: {
    fontSize: 12,
    color: '#ADB5BD',
    marginTop: 4,
  },
});

export default AboutUsScreen;
