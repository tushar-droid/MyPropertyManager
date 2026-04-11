import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/utils/supabase';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function SettingsScreen() {
  const handleLogout = async () => {
    Alert.alert(
      "Confirm Logout",
      "Are you sure you want to log out of your account?",
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
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Settings</Text>
        
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Account</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.settingItem} onPress={handleLogout}>
              <View style={[styles.iconContainer, { backgroundColor: '#FEE2E2' }]}>
                <IconSymbol name="list.bullet" size={20} color="#DC2626" />
              </View>
              <View style={styles.settingTextContainer}>
                <Text style={[styles.settingLabel, { color: '#DC2626' }]}>Sign Out</Text>
                <Text style={styles.settingSublabel}>Log out of your account securely</Text>
              </View>
              <IconSymbol name="chevron.right" size={16} color="#CBD5E1" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>App Information</Text>
          <View style={styles.card}>
            <View style={styles.settingItem}>
              <View style={[styles.iconContainer, { backgroundColor: '#EEF2FF' }]}>
                <IconSymbol name="house.fill" size={20} color="#4F46E5" />
              </View>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingLabel}>Version</Text>
                <Text style={styles.settingSublabel}>1.0.0 (Build 42)</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
            <Text style={styles.footerText}>My Property Manager</Text>
            <Text style={styles.footerSubtext}>Surgical Theme Revert Completed</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { padding: 24, paddingBottom: 100 },
  title: { fontSize: 32, fontWeight: '900', color: '#0F172A', marginBottom: 32, letterSpacing: -0.5 },
  section: { marginBottom: 32 },
  sectionLabel: { fontSize: 13, fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12, marginLeft: 4 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 8, shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 10, elevation: 2, borderWidth: 1, borderColor: '#F1F5F9' },
  settingItem: { flexDirection: 'row', alignItems: 'center', padding: 12 },
  iconContainer: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  settingTextContainer: { flex: 1 },
  settingLabel: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  settingSublabel: { fontSize: 13, color: '#94A3B8', marginTop: 2 },
  footer: { marginTop: 40, alignItems: 'center' },
  footerText: { fontSize: 16, fontWeight: '800', color: '#64748B' },
  footerSubtext: { fontSize: 12, color: '#94A3B8', marginTop: 4 },
});
