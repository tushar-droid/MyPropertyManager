import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/utils/supabase';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function SettingsScreen() {
  
  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Logout", 
          style: "destructive", 
          onPress: async () => {
            const { error } = await supabase.auth.signOut();
            if (error) {
              Alert.alert('Error', error.message);
            }
          } 
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>Manage your account and app preferences.</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <View style={styles.logoutContent}>
                <View style={[styles.iconContainer, { backgroundColor: '#FEE2E2' }]}>
                  <IconSymbol name="rectangle.portrait.and.arrow.right" size={20} color="#DC2626" />
                </View>
                <Text style={styles.logoutText}>Log Out</Text>
              </View>
              <IconSymbol name="chevron.right" size={16} color="#CBD5E1" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.version}>Version 1.0.0</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { flex: 1, padding: 24, paddingTop: 40 },
  header: { marginBottom: 40 },
  title: { fontSize: 36, fontWeight: '900', color: '#0F172A', letterSpacing: -0.75, marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#64748B', fontWeight: '500', lineHeight: 24 },
  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 16, marginLeft: 4 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 24, paddingVertical: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.02, shadowRadius: 10, elevation: 2, borderWidth: 1, borderColor: '#F1F5F9' },
  logoutButton: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  logoutContent: { flexDirection: 'row', alignItems: 'center' },
  iconContainer: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  logoutText: { fontSize: 17, fontWeight: '600', color: '#0F172A' },
  footer: { marginTop: 'auto', alignItems: 'center', paddingBottom: 20 },
  version: { fontSize: 14, color: '#CBD5E1', fontWeight: '500' },
});
