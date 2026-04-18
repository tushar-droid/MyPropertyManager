import React, { useContext, useState, useMemo } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, TextInput, Modal, Alert, ScrollView, Dimensions, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { PropertyContext } from '@/context/PropertyContext';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import * as Clipboard from 'expo-clipboard';

export default function ListScreen() {
  const propertyContext = useContext(PropertyContext);
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();

  const [isGridView, setIsGridView] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minSize, setMinSize] = useState('');
  const [maxSize, setMaxSize] = useState('');
  const [facingFilter, setFacingFilter] = useState('ALL');
  const [isFacingDropdownOpen, setFacingDropdownOpen] = useState(false);
  const [tagFilters, setTagFilters] = useState<string[]>([]);
  const [isTagDropdownOpen, setTagDropdownOpen] = useState(false);
  const [sectorFilter, setSectorFilter] = useState('ALL');
  const [isSectorDropdownOpen, setSectorDropdownOpen] = useState(false);

  const FACING_OPTIONS = ['ALL', 'NORTH', 'SOUTH', 'EAST', 'WEST', 'NORTH-EAST', 'NORTH-WEST', 'SOUTH-EAST', 'SOUTH-WEST'];

  // Modals State
  const [viewingProperty, setViewingProperty] = useState<any>(null);
  const [editingProperty, setEditingProperty] = useState<any>(null);
  const [editForm, setEditForm] = useState<{address: string, sector: string, size: string, price: string, notes: string, facing: string, contact: string, owner_name: string, tags: string[]}>({ address: '', sector: '', size: '', price: '', notes: '', facing: '', contact: '', owner_name: '', tags: [] });
  const [customTag, setCustomTag] = useState('');

  const DEFAULT_TAGS = ['PARK FACING', 'HIGHWAY FACING', 'CORNER', 'MAIN ROAD', 'GATED SOCIETY', 'BUILDER FLOOR'];

  const availableTags = useMemo(() => {
    if (!propertyContext) return DEFAULT_TAGS;
    const allCustomTags = propertyContext.properties.flatMap(p => p.tags || []);
    return Array.from(new Set([...DEFAULT_TAGS, ...allCustomTags, ...editForm.tags])).sort();
  }, [propertyContext?.properties, editForm.tags]);

  const handleAddCustomTag = () => {
    if (!customTag.trim()) return;
    const formattedTag = customTag.trim().toUpperCase();
    if (!editForm.tags.includes(formattedTag)) {
        setEditForm({...editForm, tags: [...editForm.tags, formattedTag]});
    }
    setCustomTag('');
  };

  const availableSectors = useMemo(() => {
    if (!propertyContext) return ['ALL'];
    const { properties } = propertyContext;
    const sectors = properties.map(p => p.sector).filter(Boolean);
    return ['ALL', ...Array.from(new Set(sectors)).sort()];
  }, [propertyContext?.properties]);

  const filteredProperties = useMemo(() => {
    if (!propertyContext) return [];
    const { properties } = propertyContext;
    return properties.filter((p) => {
      const pPrice = parseFloat(p.price);
      const pSize = parseFloat(p.size);

      if (minPrice && !isNaN(parseFloat(minPrice)) && pPrice < parseFloat(minPrice)) return false;
      if (maxPrice && !isNaN(parseFloat(maxPrice)) && pPrice > parseFloat(maxPrice)) return false;
      if (minSize && !isNaN(parseFloat(minSize)) && pSize < parseFloat(minSize)) return false;
      if (maxSize && !isNaN(parseFloat(maxSize)) && pSize > parseFloat(maxSize)) return false;
      if (facingFilter !== 'ALL' && p.facing !== facingFilter) return false;
      if (sectorFilter !== 'ALL' && p.sector !== sectorFilter) return false;
      
      if (tagFilters.length > 0) {
        if (!p.tags || p.tags.length === 0) return false;
        const hasAllTags = tagFilters.every(t => p.tags!.includes(t));
        if (!hasAllTags) return false;
      }

      return true;
    });
  }, [propertyContext?.properties, minPrice, maxPrice, minSize, maxSize, facingFilter, tagFilters, sectorFilter]);

  if (!propertyContext) return <View style={styles.loadingContainer}><Text style={styles.loadingText}>Loading...</Text></View>;
  const { deleteProperty, updateProperty, loading } = propertyContext;

  const handleDelete = async (id: number) => {
    Alert.alert("DELETE", "Permanent removal of this property?", [
      { text: "CANCEL", style: "cancel" },
      { 
        text: "DELETE", 
        style: "destructive", 
        onPress: async () => {
          try {
            await deleteProperty(id);
          } catch (error: any) {
            Alert.alert('Error', 'Failed to delete: ' + error.message);
          }
        } 
      }
    ]);
  };

  const openEdit = (property: any) => {
    setEditingProperty(property.id);
    setEditForm({
      address: property.address,
      sector: property.sector,
      size: property.size.toString(),
      price: property.price ? Number(property.price.toString().replace(/[^0-9]/g, '')).toLocaleString('en-IN') : '',
      notes: property.notes || '',
      facing: property.facing || '',
      contact: property.contact || '',
      owner_name: property.owner_name || '',
      tags: property.tags || []
    });
  };

  const handleSaveEdit = async () => {
    if (editingProperty) {
      try {
        await updateProperty({
          id: editingProperty,
          address: editForm.address.toUpperCase(),
          sector: editForm.sector.toUpperCase(),
          size: editForm.size,
          price: editForm.price.replace(/,/g, ''),
          notes: editForm.notes.toUpperCase(),
          facing: editForm.facing.toUpperCase(),
          contact: editForm.contact,
          owner_name: editForm.owner_name,
          tags: editForm.tags,
        });
        setEditingProperty(null);
      } catch (error: any) {
        Alert.alert('Error', 'Failed to update: ' + error.message);
      }
    }
  };

  const handleEditPriceChange = (text: string) => {
    const numericValue = text.replace(/[^0-9]/g, '');
    if (!numericValue) {
        setEditForm({...editForm, price: ''});
        return;
    }
    const number = parseInt(numericValue, 10);
    setEditForm({...editForm, price: number.toLocaleString('en-IN')});
  };

  const formatPrice = (p: string) => {
    const num = parseInt(p, 10);
    if (isNaN(num)) return p;
    if (num >= 10000000) return `₹ ${Number((num / 10000000).toFixed(2))} CR`;
    if (num >= 100000) return `₹ ${Number((num / 100000).toFixed(2))} LAC`;
    return `₹ ${num}`;
  };

  const getFacingStyle = (facing: string) => {
    switch (facing) {
      case 'NORTH': return { bg: '#F0F9FF', text: '#0369A1' };
      case 'SOUTH': return { bg: '#FEF2F2', text: '#B91C1C' };
      case 'EAST': return { bg: '#F0FDF4', text: '#15803D' };
      case 'WEST': return { bg: '#FFFBEB', text: '#B45309' };
      default: return { bg: '#F8FAFC', text: '#64748B' };
    }
  };

  const copyToClipboard = async (item?: any) => {
    const p = item || viewingProperty;
    if (!p) return;
    const text = `🏠 Address: ${p.address}
📍 Sector: ${p.sector}
📏 Size: ${p.size} m²
💎 Price: ${formatPrice(p.price)}
🧭 Facing: ${p.facing}
👤 Owner: ${p.owner_name || 'N/A'}
📞 Contact: ${p.contact || 'N/A'}
🏷️ Tags: ${(p.tags || []).join(', ')}
📝 Notes: ${p.notes || 'None'}`;
    
    await Clipboard.setStringAsync(text);
    Alert.alert('Copied!', 'Property details copied to clipboard.');
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      activeOpacity={0.9} 
      style={[styles.card, isGridView ? styles.gridCard : styles.listCard]} 
      onPress={() => setViewingProperty(item)}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.address} numberOfLines={1}>{item.address}</Text>
        <Text style={styles.price}>{formatPrice(item.price)}</Text>
      </View>

      <View style={styles.detailsContainer}>
        <Text style={styles.details}><Text style={styles.bold}>SECTOR:</Text> {item.sector}</Text>
        <Text style={styles.details}><Text style={styles.bold}>SIZE:</Text> {item.size}m²</Text>
        {item.owner_name ? (
          <Text style={styles.details}><Text style={styles.bold}>OWNER:</Text> {item.owner_name}</Text>
        ) : null}
        <View style={styles.facingContainer}>
            <Text style={styles.details}><Text style={styles.bold}>FACING:</Text></Text>
            <View style={[styles.facingBadge, { backgroundColor: getFacingStyle(item.facing).bg }]}>
                <Text style={[styles.facingBadgeText, { color: getFacingStyle(item.facing).text }]}>{item.facing}</Text>
            </View>
        </View>
      </View>
      
      {item.tags && item.tags.length > 0 && (
          <View style={styles.tagsContainer}>
              {item.tags.map((tag: string) => (
                  <View key={tag} style={styles.tagLabel}>
                      <Text style={styles.tagLabelText}>{tag}</Text>
                  </View>
              ))}
          </View>
      )}

      <View style={styles.actions}>
        <TouchableOpacity style={styles.editBtn} onPress={() => openEdit(item)}>
          <Text style={styles.editBtnText}>EDIT</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.editBtn, { backgroundColor: '#F0FDF4' }]} onPress={() => copyToClipboard(item)}>
          <Text style={[styles.editBtnText, { color: '#15803D' }]}>COPY DETAILS</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Properties</Text>
        <TouchableOpacity style={styles.toggleBtn} onPress={() => setIsGridView(!isGridView)}>
            <IconSymbol name={isGridView ? "list.bullet" : "square.grid.2x2.fill"} size={24} color="#4F46E5" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredProperties}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={isGridView ? 2 : 1}
        key={isGridView ? 'grid' : 'list'}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.filtersContainer}>
            <Text style={styles.filterTitle}>Price Range</Text>
            <View style={styles.filterRow}>
              <TextInput style={styles.filterInput} placeholder="Min Price" keyboardType="numeric" value={minPrice} onChangeText={setMinPrice} />
              <TextInput style={styles.filterInput} placeholder="Max Price" keyboardType="numeric" value={maxPrice} onChangeText={setMaxPrice} />
            </View>
            
            <Text style={styles.filterTitle}>Location & Facing</Text>
            <View style={styles.filterRow}>
                <TouchableOpacity style={[styles.dropdownButton, { width: '48%' }]} onPress={() => setSectorDropdownOpen(true)}>
                    <Text style={styles.dropdownButtonText}>{sectorFilter}</Text>
                    <IconSymbol name="chevron.down" size={20} color="#64748B" />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.dropdownButton, { width: '48%' }]} onPress={() => setFacingDropdownOpen(true)}>
                    <Text style={styles.dropdownButtonText}>{facingFilter}</Text>
                    <IconSymbol name="chevron.down" size={20} color="#64748B" />
                </TouchableOpacity>
            </View>

            <Text style={styles.filterTitle}>Features</Text>
            <TouchableOpacity style={[styles.dropdownButton, { marginBottom: 8 }]} onPress={() => setTagDropdownOpen(true)}>
                <Text style={styles.dropdownButtonText}>
                   {tagFilters.length === 0 ? "Select Tags" : `${tagFilters.length} Tags Selected`}
                </Text>
                <IconSymbol name="chevron.down" size={20} color="#64748B" />
            </TouchableOpacity>
            
            {tagFilters.length > 0 && (
                <TouchableOpacity onPress={() => setTagFilters([])}>
                    <Text style={{ color: '#EF4444', fontWeight: 'bold', marginTop: 8 }}>Clear all filters</Text>
                </TouchableOpacity>
            )}
          </View>
        }
        ListEmptyComponent={<Text style={styles.emptyText}>No properties found matching filters.</Text>}
      />

      {/* Viewing Modal */}
      <Modal 
        visible={viewingProperty !== null} 
        animationType="slide" 
        presentationStyle="pageSheet"
        onRequestClose={() => setViewingProperty(null)}
        onDismiss={() => setViewingProperty(null)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <ScrollView contentContainerStyle={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Details</Text>
              <TouchableOpacity onPress={() => { setViewingProperty(null); handleDelete(viewingProperty.id); }} style={{ padding: 8 }}>
                 <IconSymbol name="trash" size={24} color="#EF4444" />
              </TouchableOpacity>
            </View>

            {viewingProperty && (
               <View>
                  <Text style={styles.viewAddress}>{viewingProperty.address}</Text>
                  <Text style={styles.viewPrice}>{formatPrice(viewingProperty.price)}</Text>
                  
                  <View style={styles.viewGrid}>
                     <View style={styles.viewGridItem}>
                         <Text style={styles.viewLabel}>Sector</Text>
                         <Text style={styles.viewValue}>{viewingProperty.sector}</Text>
                     </View>
                     <View style={styles.viewGridItem}>
                         <Text style={styles.viewLabel}>Size</Text>
                         <Text style={styles.viewValue}>{viewingProperty.size} m²</Text>
                     </View>
                     <View style={styles.viewGridItem}>
                         <Text style={styles.viewLabel}>Facing</Text>
                         <Text style={styles.viewValue}>{viewingProperty.facing}</Text>
                     </View>
                     {viewingProperty.owner_name ? (
                       <View style={styles.viewGridItem}>
                           <Text style={styles.viewLabel}>Owner</Text>
                           <Text style={styles.viewValue}>{viewingProperty.owner_name}</Text>
                       </View>
                     ) : null}
                  </View>

                  {viewingProperty.tags && viewingProperty.tags.length > 0 && (
                     <View style={styles.viewSection}>
                         <Text style={styles.viewLabel}>Features</Text>
                         <View style={styles.tagsContainer}>
                             {viewingProperty.tags.map((tag: string) => (
                                 <View key={tag} style={styles.tagLabel}>
                                     <Text style={styles.tagLabelText}>{tag}</Text>
                                 </View>
                             ))}
                         </View>
                     </View>
                  )}

                  {viewingProperty.notes ? (
                      <View style={styles.viewSection}>
                          <Text style={styles.viewLabel}>Notes</Text>
                          <Text style={styles.viewNotes}>{viewingProperty.notes}</Text>
                      </View>
                  ) : null}

                  <View style={styles.actions}>
                    <TouchableOpacity style={styles.editBtn} onPress={() => { setViewingProperty(null); openEdit(viewingProperty); }}>
                      <Text style={styles.editBtnText}>EDIT</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.editBtn, { backgroundColor: '#F0FDF4' }]} onPress={() => copyToClipboard(viewingProperty)}>
                      <Text style={[styles.editBtnText, { color: '#15803D' }]}>COPY DETAILS</Text>
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity style={styles.closeBottomBtn} onPress={() => setViewingProperty(null)}>
                    <Text style={styles.closeBottomBtnText}>CLOSE</Text>
                  </TouchableOpacity>
               </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Edit Modal */}
      <Modal 
        visible={editingProperty !== null} 
        animationType="slide" 
        presentationStyle="pageSheet"
        onRequestClose={() => setEditingProperty(null)}
        onDismiss={() => setEditingProperty(null)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <ScrollView contentContainerStyle={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Listing</Text>
              <TouchableOpacity onPress={() => setEditingProperty(null)}>
                <Text style={styles.modalCloseText}>Cancel</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Address</Text>
              <TextInput style={styles.input} value={editForm.address} onChangeText={(text) => setEditForm({...editForm, address: text})} />
            </View>

            <View style={styles.row}>
              <View style={[styles.formGroup, styles.halfWidth]}>
                <Text style={styles.label}>Sector</Text>
                <TextInput style={styles.input} value={editForm.sector} onChangeText={(text) => setEditForm({...editForm, sector: text})} />
              </View>
              <View style={[styles.formGroup, styles.halfWidth]}>
                <Text style={styles.label}>Size (m²)</Text>
                <TextInput style={styles.input} value={editForm.size} keyboardType="numeric" onChangeText={(text) => setEditForm({...editForm, size: text})} />
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.formGroup, styles.halfWidth]}>
                <Text style={styles.label}>Price (₹)</Text>
                <TextInput style={styles.input} value={editForm.price} keyboardType="numeric" onChangeText={handleEditPriceChange} />
              </View>
              <View style={[styles.formGroup, styles.halfWidth]}>
                <Text style={styles.label}>Facing</Text>
                <TextInput style={styles.input} value={editForm.facing} onChangeText={(text) => setEditForm({...editForm, facing: text})} />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Contact</Text>
              <TextInput style={styles.input} value={editForm.contact} keyboardType="phone-pad" maxLength={10} onChangeText={(text) => setEditForm({...editForm, contact: text})} />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Owner Name</Text>
              <TextInput style={styles.input} value={editForm.owner_name} placeholder="Enter owner name" onChangeText={(text) => setEditForm({...editForm, owner_name: text})} />
            </View>

            <View style={styles.formGroup}>
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

              <View style={styles.formTagsContainer}>
                {availableTags.map((tag) => {
                  const isActive = editForm.tags.includes(tag);
                  return (
                    <TouchableOpacity 
                      key={tag} 
                      style={[styles.tagPill, isActive && styles.tagPillActive]} 
                      onPress={() => {
                        const newTags = isActive ? editForm.tags.filter(t => t !== tag) : [...editForm.tags, tag];
                        setEditForm({...editForm, tags: newTags});
                      }}
                    >
                      <Text style={[styles.tagPillText, isActive && styles.tagPillTextActive]}>{tag}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Notes</Text>
              <TextInput style={[styles.input, styles.textArea]} multiline numberOfLines={4} value={editForm.notes} onChangeText={(text) => setEditForm({...editForm, notes: text})} />
            </View>

            <TouchableOpacity style={styles.submitButton} onPress={handleSaveEdit}>
              <Text style={styles.submitButtonText}>{loading ? 'Saving...' : 'Update Property'}</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Dropdowns */}
      <Modal visible={isFacingDropdownOpen} transparent animationType="fade">
        <TouchableOpacity style={styles.dropdownOverlay} activeOpacity={1} onPress={() => setFacingDropdownOpen(false)}>
            <View style={styles.dropdownContent}>
                <Text style={styles.dropdownTitle}>Select Facing</Text>
                <ScrollView>
                    {FACING_OPTIONS.map((f) => (
                        <TouchableOpacity key={f} style={styles.dropdownOption} onPress={() => { setFacingFilter(f); setFacingDropdownOpen(false); }}>
                            <Text style={[styles.dropdownOptionText, facingFilter === f && styles.dropdownOptionTextActive]}>{f}</Text>
                            {facingFilter === f && <IconSymbol name="checkmark" size={20} color="#4F46E5" />}
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
        </TouchableOpacity>
      </Modal>

      <Modal visible={isSectorDropdownOpen} transparent animationType="fade">
        <TouchableOpacity style={styles.dropdownOverlay} activeOpacity={1} onPress={() => setSectorDropdownOpen(false)}>
            <View style={styles.dropdownContent}>
                <Text style={styles.dropdownTitle}>Select Sector</Text>
                <ScrollView>
                    {availableSectors.map((s) => (
                        <TouchableOpacity key={s} style={styles.dropdownOption} onPress={() => { setSectorFilter(s); setSectorDropdownOpen(false); }}>
                            <Text style={[styles.dropdownOptionText, sectorFilter === s && styles.dropdownOptionTextActive]}>{s}</Text>
                            {sectorFilter === s && <IconSymbol name="checkmark" size={20} color="#4F46E5" />}
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
        </TouchableOpacity>
      </Modal>

      <Modal visible={isTagDropdownOpen} transparent animationType="fade">
        <TouchableOpacity style={styles.dropdownOverlay} activeOpacity={1} onPress={() => setTagDropdownOpen(false)}>
            <View style={styles.dropdownContent}>
                <Text style={styles.dropdownTitle}>Select Tags</Text>
                <ScrollView>
                    {availableTags.map((t) => {
                        const isActive = tagFilters.includes(t);
                        return (
                          <TouchableOpacity key={t} style={styles.dropdownOption} onPress={() => setTagFilters(prev => isActive ? prev.filter(x => x !== t) : [...prev, t])}>
                              <Text style={[styles.dropdownOptionText, isActive && styles.dropdownOptionTextActive]}>{t}</Text>
                              {isActive && <IconSymbol name="checkmark" size={20} color="#4F46E5" />}
                          </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 24, paddingTop: Platform.OS === 'ios' ? 20 : 60, paddingBottom: 24, backgroundColor: '#FFFFFF',
    borderBottomWidth: 1, borderBottomColor: '#F1F5F9', zIndex: 10
  },
  title: { fontSize: 32, fontWeight: '900', color: '#0F172A', letterSpacing: -0.75 },
  toggleBtn: { padding: 12, backgroundColor: '#EEF2FF', borderRadius: 16 },
  filtersContainer: { marginBottom: 24, backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24, shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.04, shadowRadius: 16, elevation: 3, borderWidth: 1, borderColor: '#F8FAFC' },
  filterTitle: { fontSize: 12, fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, marginTop: 16 },
  filterRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  filterInput: {
    width: '48%', backgroundColor: '#F8FAFC', borderWidth: 1.5, borderColor: '#F1F5F9', borderRadius: 16,
    paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: '#0F172A', fontWeight: '500'
  },
  dropdownButton: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F8FAFC', borderWidth: 1.5, borderColor: '#F1F5F9', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14, marginTop: 4 },
  dropdownButtonText: { fontSize: 15, color: '#0F172A', fontWeight: '500' },
  dropdownOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.65)', justifyContent: 'flex-end', alignItems: 'center' },
  dropdownContent: { width: '100%', backgroundColor: '#FFFFFF', borderTopLeftRadius: 36, borderTopRightRadius: 36, padding: 32, maxHeight: Dimensions.get('window').height * 0.6 },
  dropdownTitle: { fontSize: 24, fontWeight: '900', color: '#0F172A', marginBottom: 24, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  dropdownOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F8FAFC' },
  dropdownOptionText: { fontSize: 18, color: '#64748B', fontWeight: '500' },
  dropdownOptionTextActive: { color: '#4F46E5', fontWeight: '900' },
  listContent: { padding: 24, paddingBottom: 100 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20, marginBottom: 24, shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.05, shadowRadius: 20, elevation: 5, borderWidth: 1, borderColor: '#F8FAFC' },
  listCard: { width: '100%' },
  gridCard: { width: (Dimensions.get('window').width - 60) / 2, marginHorizontal: 6, padding: 12 },
  cardHeader: { marginBottom: 16 },
  address: { fontSize: 18, fontWeight: '900', color: '#0F172A', marginBottom: 6, letterSpacing: -0.25 },
  price: { fontSize: 24, fontWeight: '900', color: '#047857', letterSpacing: -0.5 },
  detailsContainer: { marginBottom: 16, backgroundColor: '#F8FAFC', padding: 14, borderRadius: 16 },
  details: { fontSize: 14, color: '#475569', marginBottom: 6, fontWeight: '500' },
  facingContainer: { flexDirection: 'row', alignItems: 'center' },
  facingBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginLeft: 6 },
  facingBadgeText: { fontSize: 12, fontWeight: '800', letterSpacing: 0.5 },
  bold: { fontWeight: '800', color: '#0F172A' },
  actions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 'auto', paddingTop: 16, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  editBtn: { paddingVertical: 12, paddingHorizontal: 16, backgroundColor: '#EEF2FF', borderRadius: 14, width: '48%', alignItems: 'center' },
  editBtnText: { color: '#4F46E5', fontWeight: '800', fontSize: 14 },
  deleteBtn: { paddingVertical: 12, paddingHorizontal: 16, backgroundColor: '#FEF2F2', borderRadius: 14, width: '48%', alignItems: 'center' },
  deleteBtnText: { color: '#DC2626', fontWeight: '800', fontSize: 14 },
  emptyText: { textAlign: 'center', marginTop: 80, color: '#94A3B8', fontSize: 16, fontWeight: '600' },
  modalContainer: { flex: 1, backgroundColor: '#F8FAFC' },
  modalContent: { padding: 24, paddingBottom: 60, paddingTop: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 },
  modalTitle: { fontSize: 32, fontWeight: '900', color: '#0F172A', letterSpacing: -0.5 },
  modalCloseText: { fontSize: 16, color: '#EF4444', fontWeight: '800' },
  formGroup: { marginBottom: 24 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  halfWidth: { width: '48%' },
  label: { fontSize: 12, fontWeight: '800', color: '#475569', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10, marginLeft: 4 },
  input: { backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#F1F5F9', borderRadius: 20, paddingHorizontal: 20, paddingVertical: 18, fontSize: 16, color: '#0F172A', fontWeight: '500' },
  textArea: { height: 130, paddingTop: 18, textAlignVertical: 'top' },
  submitButton: { backgroundColor: '#4F46E5', borderRadius: 20, paddingVertical: 18, alignItems: 'center', marginTop: 24 },
  submitButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800', letterSpacing: 0.5 },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  tagLabel: { backgroundColor: '#F1F5F9', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  tagLabelText: { fontSize: 11, fontWeight: '800', color: '#475569', textTransform: 'uppercase' },
  formTagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 4 },
  tagPill: { backgroundColor: '#FFFFFF', borderRadius: 24, paddingVertical: 10, paddingHorizontal: 18, borderWidth: 1.5, borderColor: '#F1F5F9' },
  tagPillActive: { backgroundColor: '#4F46E5', borderColor: '#4F46E5' },
  tagPillText: { fontSize: 13, fontWeight: '700', color: '#64748B', letterSpacing: 0.3 },
  tagPillTextActive: { color: '#FFFFFF' },
  filterTagsScroll: { gap: 10, paddingBottom: 8, marginTop: 4 },
  viewAddress: { fontSize: 24, fontWeight: '900', color: '#0F172A', marginBottom: 8 },
  viewPrice: { fontSize: 32, fontWeight: '900', color: '#047857', marginBottom: 32 },
  viewGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginBottom: 32 },
  viewGridItem: { width: '45%', backgroundColor: '#FFFFFF', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 4, elevation: 1 },
  viewLabel: { fontSize: 12, fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  viewValue: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
  viewSection: { marginBottom: 32, backgroundColor: '#FFFFFF', padding: 20, borderRadius: 20, borderWidth: 1, borderColor: '#F1F5F9' },
  viewNotes: { fontSize: 16, color: '#475569', lineHeight: 24 },
  customTagRow: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  customTagInput: { flex: 1, paddingVertical: 14 },
  addTagBtn: { backgroundColor: '#4F46E5', borderRadius: 16, width: 54, justifyContent: 'center', alignItems: 'center' },
  closeBottomBtn: { backgroundColor: '#F1F5F9', paddingVertical: 18, borderRadius: 20, alignItems: 'center', marginTop: 16 },
  closeBottomBtnText: { color: '#0F172A', fontSize: 16, fontWeight: '800' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 16, color: '#4F46E5' },
});
