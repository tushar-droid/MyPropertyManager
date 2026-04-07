import React from 'react';
import { StyleSheet, View, Text, SafeAreaView } from 'react-native';

export default function SettingsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>More options coming soon.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { fontSize: 36, fontWeight: '900', color: '#0F172A', letterSpacing: -0.75, marginBottom: 12 },
  subtitle: { fontSize: 16, color: '#94A3B8', fontWeight: '500' },
});
