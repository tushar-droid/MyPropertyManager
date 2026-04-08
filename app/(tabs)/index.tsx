import React, { useContext, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { PropertyContext } from '@/context/PropertyContext';

export default function AddPropertyScreen() {
  const propertyContext = useContext(PropertyContext);

  const [address, setAddress] = useState('');
  const [sector, setSector] = useState('');
  const [size, setSize] = useState('');
  const [price, setPrice] = useState('');
  const [notes, setNotes] = useState('');
  const [facing, setFacing] = useState('');
  const [contact, setContact] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  const AVAILABLE_TAGS = ['PARK FACING', 'HIGHWAY FACING', 'CORNER', 'MAIN ROAD', 'GATED SOCIETY', 'BUILDER FLOOR'];

  const toggleTag = (tag: string) => {
    setTags((prev) => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const handleSubmit = () => {
    if (!address || !sector || !size || !price) {
      Alert.alert('Error', 'Please fill in the required fields (Address, Sector, Size, Price)');
      return;
    }

    if (propertyContext) {
      propertyContext.addProperty({
        address,
        sector,
        size,
        price,
        notes,
        facing,
        contact,
        tags,
      });

      // Reset form
      setAddress('');
      setSector('');
      setSize('');
      setPrice('');
      setNotes('');
      setFacing('');
      setContact('');
      setTags([]);

      Alert.alert('Success', 'Property added successfully!');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Add New Property</Text>
          <Text style={styles.subtitle}>Enter the details below to add a property.</Text>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Address *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 123 Main St"
            placeholderTextColor="#888"
            value={address}
            onChangeText={setAddress}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Sector *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Sector 15"
            placeholderTextColor="#888"
            value={sector}
            onChangeText={setSector}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.formGroup, styles.halfWidth]}>
            <Text style={styles.label}>Size (sq m) *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 1500"
              placeholderTextColor="#888"
              keyboardType="numeric"
              value={size}
              onChangeText={setSize}
            />
          </View>

          <View style={[styles.formGroup, styles.halfWidth]}>
            <Text style={styles.label}>Price *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 500000"
              placeholderTextColor="#888"
              keyboardType="numeric"
              value={price}
              onChangeText={setPrice}
            />
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Facing</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. North, East"
            placeholderTextColor="#888"
            value={facing}
            onChangeText={setFacing}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Contact Number</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 9876543210"
            placeholderTextColor="#888"
            keyboardType="phone-pad"
            value={contact}
            onChangeText={setContact}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Tags</Text>
          <View style={styles.tagsContainer}>
            {AVAILABLE_TAGS.map((tag) => {
              const isActive = tags.includes(tag);
              return (
                <TouchableOpacity
                  key={tag}
                  style={[styles.tagPill, isActive && styles.tagPillActive]}
                  onPress={() => toggleTag(tag)}
                >
                  <Text style={[styles.tagPillText, isActive && styles.tagPillTextActive]}>{tag}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Additional details..."
            placeholderTextColor="#888"
            multiline
            numberOfLines={4}
            value={notes}
            onChangeText={setNotes}
          />
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Save Property</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: { padding: 24, paddingTop: 80, paddingBottom: 60 },
  headerContainer: { marginBottom: 40 },
  title: { fontSize: 36, fontWeight: '900', color: '#0F172A', letterSpacing: -0.75, marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#64748B', lineHeight: 24, fontWeight: '500' },
  formGroup: { marginBottom: 24 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  halfWidth: { width: '48%' },
  label: { fontSize: 12, fontWeight: '800', color: '#475569', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10, marginLeft: 4 },
  input: {
    backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#F1F5F9', borderRadius: 20,
    paddingHorizontal: 20, paddingVertical: 18, fontSize: 16, color: '#0F172A', fontWeight: '500',
    shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.02, shadowRadius: 10, elevation: 2,
  },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 4 },
  tagPill: { backgroundColor: '#FFFFFF', borderRadius: 24, paddingVertical: 10, paddingHorizontal: 18, borderWidth: 1.5, borderColor: '#F1F5F9', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 4, elevation: 1 },
  tagPillActive: { backgroundColor: '#4F46E5', borderColor: '#4F46E5', shadowColor: '#4F46E5', shadowOpacity: 0.2, shadowOffset: { width: 0, height: 4 } },
  tagPillText: { fontSize: 13, fontWeight: '700', color: '#64748B', letterSpacing: 0.3 },
  tagPillTextActive: { color: '#FFFFFF' },
  textArea: { height: 130, paddingTop: 18, textAlignVertical: 'top' },
  submitButton: {
    backgroundColor: '#4F46E5', borderRadius: 20, paddingVertical: 18, alignItems: 'center', marginTop: 24,
    shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 8,
  },
  submitButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800', letterSpacing: 0.5 },
});



// const { data: todos, error } = await supabase.from('todos').select('*');