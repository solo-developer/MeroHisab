import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, SectionList } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SettingsStackParamList } from '../navigation/SettingsStack';
import { AppColors } from '../constants/Styles';

type Props = NativeStackScreenProps<SettingsStackParamList, 'SettingsMain'>;

interface SettingItemProps {
  label: string;
  icon: string;
  iconColor: string;
  onPress: () => void;
  isLast?: boolean;
}

const SettingItem: React.FC<SettingItemProps> = ({ label, icon, iconColor, onPress, isLast }) => (
  <TouchableOpacity
    style={[styles.item, isLast && styles.itemLast]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={[styles.iconContainer, { backgroundColor: iconColor + '20' }]}>
      <Ionicons name={icon} size={20} color={iconColor} />
    </View>
    <Text style={styles.itemText}>{label}</Text>
    <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
  </TouchableOpacity>
);

const SettingsScreen: React.FC<Props> = ({ navigation }) => {
  const sections = [
    {
      title: 'Manage',
      data: [
        { label: 'Categories', icon: 'grid-outline', color: '#FF9800', route: 'ManageCategories' },
        { label: 'Wallets', icon: 'wallet-outline', color: '#4CAF50', route: 'ManageWallets' },
        { label: 'Meta Categories', icon: 'folder-open-outline', color: '#2196F3', route: 'ManageMetaCategories' },
        { label: 'Parties', icon: 'people-outline', color: '#9C27B0', route: 'ManageParties' },
      ],
    },
    {
      title: 'General',
      data: [
        { label: 'Budget Progress', icon: 'pie-chart-outline', color: '#E91E63', route: 'BudgetOverview' },
        { label: 'Reminders', icon: 'alarm-outline', color: '#607D8B', route: 'ReminderList' },
        { label: 'Backup & Sync', icon: 'cloud-upload-outline', color: '#3F51B5', route: 'BackupSync' },
      ],
    },
    {
      title: 'About',
      data: [
        { label: 'Help Center', icon: 'help-buoy-outline', color: '#00BCD4', route: 'HelpCentre' },
        { label: 'About Us', icon: 'information-circle-outline', color: '#795548', route: 'AboutUs' },
        { label: 'Terms of Use', icon: 'document-text-outline', color: '#607D8B', route: 'TermsOfUse' },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#F2F2F7" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {sections.map((section, sectionIndex) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionHeader}>{section.title.toUpperCase()}</Text>
            <View style={styles.sectionBody}>
              {section.data.map((item, index) => (
                <SettingItem
                  key={item.label}
                  label={item.label}
                  icon={item.icon}
                  iconColor={item.color}
                  onPress={() => navigation.navigate(item.route as any)}
                  isLast={index === section.data.length - 1}
                />
              ))}
            </View>
          </View>
        ))}

        <View style={styles.footer}>
          <Text style={styles.versionText}>Version 1.0.0</Text>
          <Text style={styles.copyrightText}>© 2025 MeroHisab</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F2F2F7' },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#F2F2F7',
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: '800',
    color: '#000',
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6e6e73',
    marginBottom: 8,
    marginLeft: 12,
    letterSpacing: 0.5,
  },
  sectionBody: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    borderCurve: 'continuous', // iOS 13+ style
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
  },
  itemLast: {
    borderBottomWidth: 0,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  itemText: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  versionText: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  copyrightText: {
    fontSize: 12,
    color: '#AEAEB2',
    marginTop: 4,
  },
});

export default SettingsScreen;
