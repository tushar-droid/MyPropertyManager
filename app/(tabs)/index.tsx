import React, { useState, useContext, useMemo } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PropertyContext } from '@/context/PropertyContext';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function AddProperty() {
  const propertyContext = useContext(PropertyContext);
  
  const [address, setAddress] = useState('');
  const [sector, setSector] = useState('');
  const [size, setSize] = useState('');
  const [price, setPrice] = useState('');
  const [notes, setNotes] = useState('');
  const [facing, setFacing] = useState('');
  const [contact, setContact] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState('');
  const [loading, setLoading] = useState(false);
  
  const DEFAULT_TAGS = ['PARK FACING', 'HIGHWAY FACING', 'CORNER', 'MAIN ROAD', 'GATED SOCIETY', 'BUILDER FLOOR'];

  const availableTags = useMemo(() => {
    const allCustomTags = propertyContext?.properties.flatMap(p => p.tags || []) || [];
    return Array.from(new Set([...DEFAULT_TAGS, ...allCustomTags, ...tags])).sort();
  }, [propertyContext?.properties, tags]);

  const handleAddCustomTag = () => {
    if (!customTag.trim()) return;
    const formattedTag = customTag.trim().toUpperCase();
    if (!tags.includes(formattedTag)) {
        setTags([...tags, formattedTag]);
    }
    setCustomTag('');
  };

  const handlePriceChange = (text: string) => {
    const numericValue = text.replace(/[^0-9]/g, '');
    if (!numericValue) {
        setPrice('');
        return;
    }
    const number = parseInt(numericValue, 10);
    setPrice(number.toLocaleString('en-IN'));
  };

  const handleAddProperty = async () => {
    if (!address || !sector || !size || !price) {
      Alert.alert('Error', 'Address, Sector, Size and Price are required');
      return;
    }

    setLoading(true);
    try {
      await propertyContext?.addProperty({
        address: address.toUpperCase(),
        sector: sector.toUpperCase(),
        size,
        price: price.replace(/,/g, ''),
        notes: notes.toUpperCase(),
        facing: facing.toUpperCase(),
        contact,
        owner_name: ownerName,
        tags
      });
      // Reset form
      setAddress('');
      setSector('');
      setSize('');
      setPrice('');
      setNotes('');
      setFacing('');
      setContact('');
      setOwnerName('');
      setTags([]);
      Alert.alert('Success', 'Property added successfully');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add property');
    } finally {
      setLoading(false);
    }
  };

  const toggleTag = (tag: string) => {
    setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>Add Property</Text>
          
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Address</Text>
              <TextInput style={styles.input} value={address} onChangeText={setAddress} placeholder="Enter full address" />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { width: '48%' }]}>
                <Text style={styles.label}>Sector</Text>
                <TextInput style={styles.input} value={sector} onChangeText={setSector} placeholder="e.g. 82" />
              </View>
              <View style={[styles.inputGroup, { width: '48%' }]}>
                <Text style={styles.label}>Size (m²)</Text>
                <TextInput style={styles.input} value={size} onChangeText={setSize} placeholder="250" keyboardType="numeric" />
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { width: '48%' }]}>
                <Text style={styles.label}>Price (₹)</Text>
                <TextInput style={styles.input} value={price} onChangeText={handlePriceChange} placeholder="Amount" keyboardType="numeric" />
              </View>
              <View style={[styles.inputGroup, { width: '48%' }]}>
                <Text style={styles.label}>Facing</Text>
                <TextInput style={styles.input} value={facing} onChangeText={setFacing} placeholder="NORTH" />
              </View>
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Contact</Text>
                <TextInput style={styles.input} value={contact} onChangeText={setContact} placeholder="Owner number" keyboardType="phone-pad" maxLength={10} />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Owner Name</Text>
                <TextInput style={styles.input} value={ownerName} onChangeText={setOwnerName} placeholder="Enter owner name" />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tags / Features</Text>
              
              <View style={styles.customTagRow}>
                  <TextInput 
                      style={[styles.input, styles.customTagInput]} 
                      value={customTag} 
                      onChangeText={setCustomTag} 
                      placeholder="Add custom..." 
                      onSubmitEditing={handleAddCustomTag}
                      returnKeyType="done"
                  />
                  <TouchableOpacity style={styles.addTagBtn} onPress={handleAddCustomTag}>
                      <IconSymbol name="plus" size={24} color="#FFFFFF" />
                  </TouchableOpacity>
              </View>

              <View style={styles.tagContainer}>
                {availableTags.map((tag) => {
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

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Internal Notes</Text>
              <TextInput style={[styles.input, styles.textArea]} multiline numberOfLines={4} value={notes} onChangeText={setNotes} placeholder="Additional details..." />
            </View>

            <TouchableOpacity 
              style={[styles.submitButton, loading && styles.submitButtonDisabled]} 
              onPress={handleAddProperty}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Publish Property</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: { padding: 24, paddingBottom: 100 },
  title: { fontSize: 32, fontWeight: '900', color: '#0F172A', marginBottom: 32, letterSpacing: -0.5 },
  form: { gap: 20 },
  inputGroup: { gap: 8 },
  label: { fontSize: 13, fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5, marginLeft: 4 },
  input: { 
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 18, 
    fontSize: 16, color: '#0F172A', borderWidth: 1.5, borderColor: '#F1F5F9'
  },
  textArea: { height: 120, textAlignVertical: 'top' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  customTagRow: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  customTagInput: { flex: 1, paddingVertical: 14 },
  addTagBtn: { backgroundColor: '#4F46E5', borderRadius: 16, width: 54, justifyContent: 'center', alignItems: 'center' },
  tagContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 4 },
  tagPill: { backgroundColor: '#FFFFFF', borderRadius: 24, paddingVertical: 10, paddingHorizontal: 16, borderWidth: 1.5, borderColor: '#F1F5F9' },
  tagPillActive: { backgroundColor: '#4F46E5', borderColor: '#4F46E5' },
  tagPillText: { fontSize: 13, fontWeight: '700', color: '#64748B' },
  tagPillTextActive: { color: '#FFFFFF' },
  submitButton: { backgroundColor: '#4F46E5', borderRadius: 20, paddingVertical: 20, alignItems: 'center', marginTop: 12, shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 15, elevation: 8 },
  submitButtonDisabled: { opacity: 0.7 },
  submitButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800', letterSpacing: 0.5 },
});