// src/screens/DashboardScreen.tsx
import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

const DashboardScreen: React.FC = () => {
  useEffect(() => {
  
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard Content</Text>
      <Text>Load heavy widgets here only when user lands on this tab.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 80 },
  title: { fontSize: 20, marginBottom: 8 },
});

export default DashboardScreen;
