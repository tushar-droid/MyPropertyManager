import React, { useContext, useState, useMemo } from 'react';
import { StyleSheet, View, Text, FlatList, SafeAreaView, TouchableOpacity, TextInput, Modal, Alert, ScrollView, Dimensions } from 'react-native';
import { PropertyContext } from '../context/PropertyContext';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function ListScreen() {
  const propertyContext = useContext(PropertyContext);

  const [isGridView, setIsGridView] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minSize, setMinSize] = useState('');
  const [maxSize, setMaxSize] = useState('');
  const [facingFilter, setFacingFilter] = useState('ALL');
  const [isFacingDropdownOpen, setFacingDropdownOpen] = useState(false);
  const [tagFilters, setTagFilters] = useState<string[]>([]);
  const [sectorFilter, setSectorFilter] = useState('ALL');
  const [isSectorDropdownOpen, setSectorDropdownOpen] = useState(false);

  const FACING_OPTIONS = ['ALL', 'NORTH', 'SOUTH', 'EAST', 'WEST', 'NORTH-EAST', 'NORTH-WEST', 'SOUTH-EAST', 'SOUTH-WEST'];

  // Modals State
  const [viewingProperty, setViewingProperty] = useState<any>(null);
  const [editingProperty, setEditingProperty] = useState<any>(null);
  const [editForm, setEditForm] = useState<{address: string, sector: string, size: string, price: string, notes: string, facing: string, contact: string, tags: string[]}>({ address: '', sector: '', size: '', price: '', notes: '', facing: '', contact: '', tags: [] });

  const AVAILABLE_TAGS = ['PARK FACING', 'HIGHWAY FACING', 'CORNER', 'MAIN ROAD', 'GATED SOCIETY', 'BUILDER FLOOR'];

  if (!propertyContext) return <View><Text>Loading...</Text></View>;
  const { properties, deleteProperty, updateProperty } = propertyContext;

  const availableSectors = useMemo(() => {
    const sectors = properties.map(p => p.sector).filter(Boolean);
    return ['ALL', ...Array.from(new Set(sectors)).sort()];
  }, [properties]);

  const filteredProperties = useMemo(() => {
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
        // Strict match: must contain ALL selected tag filters
        const hasAllTags = tagFilters.every(t => p.tags!.includes(t));
        if (!hasAllTags) return false;
      }

      return true;
    });
  }, [properties, minPrice, maxPrice, minSize, maxSize, facingFilter, tagFilters, sectorFilter]);

  const handleDelete = (id: string) => {
    Alert.alert("Delete", "Are you sure you want to delete this property?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteProperty(id) }
    ]);
  };

  const openEdit = (property: any) => {
    setEditingProperty(property.id);
    setEditForm({
      address: property.address,
      sector: property.sector,
      size: property.size,
      price: property.price,
      notes: property.notes || '',
      facing: property.facing || '',
      contact: property.contact || '',
      tags: property.tags || []
    });
  };

  const handleSaveEdit = () => {
    if (editingProperty) {
      updateProperty({
        id: editingProperty,
        address: editForm.address.toUpperCase(),
        sector: editForm.sector.toUpperCase(),
        size: editForm.size.toUpperCase(),
        price: editForm.price.toUpperCase(),
        notes: editForm.notes.toUpperCase(),
        facing: editForm.facing.toUpperCase(),
        contact: editForm.contact,
        tags: editForm.tags,
      });
      setEditingProperty(null);
    }
  };

  const formatPrice = (p: string) => {
    const num = parseInt(p, 10);
    if (isNaN(num)) return p;
    if (num >= 10000000) return `₹ ${Number((num / 10000000).toFixed(2))} Cr`;
    if (num >= 100000) return `₹ ${Number((num / 100000).toFixed(2))} Lac`;
    if (num >= 1000) return `₹ ${Number((num / 1000).toFixed(2))} K`;
    return `₹ ${num}`;
  };

  const getFacingStyle = (facing: string) => {
    switch (facing) {
      case 'NORTH': return { bg: '#DBEAFE', text: '#1E40AF' };
      case 'SOUTH': return { bg: '#FEE2E2', text: '#991B1B' };
      case 'EAST': return { bg: '#D1FAE5', text: '#065F46' };
      case 'WEST': return { bg: '#FEF3C7', text: '#92400E' };
      case 'NORTH-EAST':
      case 'NORTH-WEST':
      case 'SOUTH-EAST':
      case 'SOUTH-WEST': return { bg: '#F3E8FF', text: '#6B21A8' };
      default: return { bg: '#F1F5F9', text: '#475569' };
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity activeOpacity={0.7} style={[styles.card, isGridView ? styles.gridCard : styles.listCard]} onPress={() => setViewingProperty(item)}>
      <View style={styles.cardHeader}>
        <Text style={styles.address} numberOfLines={isGridView ? 1 : undefined}>{item.address}</Text>
        <Text style={styles.price}>{formatPrice(item.price)}</Text>
      </View>
      <View style={styles.detailsContainer}>
        <Text style={styles.details}>Sector: <Text style={styles.bold}>{item.sector}</Text></Text>
        <Text style={styles.details}>Size: <Text style={styles.bold}>{item.size} sq m</Text></Text>
        <View style={styles.facingContainer}>
          <Text style={styles.details}>Facing: </Text>
          <View style={[styles.facingBadge, { backgroundColor: getFacingStyle(item.facing).bg }]}>
            <Text style={[styles.facingBadgeText, { color: getFacingStyle(item.facing).text }]}>{item.facing}</Text>
          </View>
        </View>
      </View>
      {!isGridView && item.notes ? <Text style={styles.notes}>Notes: {item.notes}</Text> : null}
      {item.tags && item.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {item.tags.map((t: string) => <View key={t} style={styles.tagLabel}><Text style={styles.tagLabelText}>{t}</Text></View>)}
        </View>
      )}
      
      <View style={styles.actions}>
        <TouchableOpacity style={styles.editBtn} onPress={() => openEdit(item)}>
          <Text style={styles.editBtnText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id)}>
          <Text style={styles.deleteBtnText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderFilters = () => (
    <View style={styles.filtersContainer}>
      <Text style={styles.filterTitle}>Filters</Text>
      <View style={styles.filterRow}>
        <TextInput style={styles.filterInput} placeholder="Min Price (₹)" keyboardType="numeric" value={minPrice} onChangeText={setMinPrice} />
        <TextInput style={styles.filterInput} placeholder="Max Price (₹)" keyboardType="numeric" value={maxPrice} onChangeText={setMaxPrice} />
      </View>
      <View style={styles.filterRow}>
        <TextInput style={styles.filterInput} placeholder="Min Size (sq m)" keyboardType="numeric" value={minSize} onChangeText={setMinSize} />
        <TextInput style={styles.filterInput} placeholder="Max Size (sq m)" keyboardType="numeric" value={maxSize} onChangeText={setMaxSize} />
      </View>
      <TouchableOpacity style={styles.dropdownButton} onPress={() => setFacingDropdownOpen(true)}>
        <Text style={styles.dropdownButtonText}>Facing: <Text style={styles.bold}>{facingFilter}</Text></Text>
        <IconSymbol name="chevron.down" size={16} color="#475569" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.dropdownButton} onPress={() => setSectorDropdownOpen(true)}>
        <Text style={styles.dropdownButtonText}>Sector: <Text style={styles.bold}>{sectorFilter}</Text></Text>
        <IconSymbol name="chevron.down" size={16} color="#475569" />
      </TouchableOpacity>
      
      <Text style={[styles.filterTitle, { marginTop: 16 }]}>Tags</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterTagsScroll}>
        {AVAILABLE_TAGS.map((tag) => {
          const isActive = tagFilters.includes(tag);
          return (
            <TouchableOpacity 
              key={tag} 
              style={[styles.tagPill, isActive && styles.tagPillActive]} 
              onPress={() => setTagFilters(prev => isActive ? prev.filter(t => t !== tag) : [...prev, tag])}
            >
              <Text style={[styles.tagPillText, isActive && styles.tagPillTextActive]}>{tag}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
        <TouchableOpacity style={styles.toggleBtn} onPress={() => setIsGridView(!isGridView)}>
          <IconSymbol name={isGridView ? "list.bullet" : "square.grid.2x2.fill"} size={24} color="#3B82F6" />
        </TouchableOpacity>
      </View>

      <FlatList
        key={isGridView ? 'grid' : 'list'}
        data={filteredProperties}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={renderFilters()}
        contentContainerStyle={styles.listContent}
        numColumns={isGridView ? 2 : 1}
        ListEmptyComponent={<Text style={styles.emptyText}>No properties match your filters.</Text>}
      />

      <Modal visible={!!viewingProperty} animationType="slide" presentationStyle="pageSheet">
        {viewingProperty && (
          <SafeAreaView style={styles.modalContainer}>
            <ScrollView contentContainerStyle={[styles.modalContent, { backgroundColor: '#F8FAFC' }]}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Property Details</Text>
                <TouchableOpacity onPress={() => setViewingProperty(null)}>
                  <Text style={[styles.modalCloseText, { color: '#4F46E5' }]}>Done</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.viewAddress}>{viewingProperty.address}</Text>
              <Text style={styles.viewPrice}>{formatPrice(viewingProperty.price)}</Text>
              
              <View style={styles.viewGrid}>
                <View style={styles.viewGridItem}><Text style={styles.viewLabel}>Sector</Text><Text style={styles.viewValue}>{viewingProperty.sector}</Text></View>
                <View style={styles.viewGridItem}><Text style={styles.viewLabel}>Size</Text><Text style={styles.viewValue}>{viewingProperty.size} sq m</Text></View>
                <View style={styles.viewGridItem}>
                  <Text style={styles.viewLabel}>Facing</Text>
                  <View style={[styles.facingBadge, { backgroundColor: getFacingStyle(viewingProperty.facing).bg, marginTop: 4, alignSelf: 'flex-start', marginLeft: 0 }]}>
                    <Text style={[styles.facingBadgeText, { color: getFacingStyle(viewingProperty.facing).text }]}>{viewingProperty.facing}</Text>
                  </View>
                </View>
                <View style={styles.viewGridItem}>
                  <Text style={styles.viewLabel}>Contact</Text>
                  <Text style={styles.viewValue}>{viewingProperty.contact || 'N/A'}</Text>
                </View>
              </View>

              {viewingProperty.tags && viewingProperty.tags.length > 0 && (
                <View style={styles.viewSection}>
                  <Text style={styles.viewLabel}>Tags</Text>
                  <View style={styles.tagsContainer}>
                    {viewingProperty.tags.map((t: string) => <View key={t} style={styles.tagLabel}><Text style={styles.tagLabelText}>{t}</Text></View>)}
                  </View>
                </View>
              )}

              {viewingProperty.notes ? (
                <View style={styles.viewSection}>
                  <Text style={styles.viewLabel}>Notes</Text>
                  <Text style={styles.viewNotes}>{viewingProperty.notes}</Text>
                </View>
              ) : null}

              <TouchableOpacity style={styles.closeBottomBtn} onPress={() => setViewingProperty(null)}>
                <Text style={styles.closeBottomBtnText}>Close Details</Text>
              </TouchableOpacity>
            </ScrollView>
          </SafeAreaView>
        )}
      </Modal>

      <Modal visible={!!editingProperty} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <ScrollView contentContainerStyle={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Property</Text>
              <TouchableOpacity onPress={() => setEditingProperty(null)}>
                <Text style={styles.modalCloseText}>Cancel</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.formGroup}><Text style={styles.label}>Address</Text><TextInput style={styles.input} value={editForm.address} onChangeText={t => setEditForm({...editForm, address: t})} /></View>
            <View style={styles.formGroup}><Text style={styles.label}>Sector</Text><TextInput style={styles.input} value={editForm.sector} onChangeText={t => setEditForm({...editForm, sector: t})} /></View>
            <View style={styles.row}>
              <View style={[styles.formGroup, styles.halfWidth]}><Text style={styles.label}>Size (sq m)</Text><TextInput style={styles.input} value={editForm.size} keyboardType="numeric" onChangeText={t => setEditForm({...editForm, size: t})} /></View>
              <View style={[styles.formGroup, styles.halfWidth]}><Text style={styles.label}>Price (₹)</Text><TextInput style={styles.input} value={editForm.price} keyboardType="numeric" onChangeText={t => setEditForm({...editForm, price: t})} /></View>
            </View>
            <View style={styles.formGroup}><Text style={styles.label}>Facing</Text><TextInput style={styles.input} value={editForm.facing} onChangeText={t => setEditForm({...editForm, facing: t})} /></View>
            <View style={styles.formGroup}><Text style={styles.label}>Contact Number</Text><TextInput style={styles.input} value={editForm.contact} keyboardType="phone-pad" onChangeText={t => setEditForm({...editForm, contact: t})} /></View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Tags</Text>
              <View style={styles.formTagsContainer}>
                {AVAILABLE_TAGS.map((tag) => {
                  const isActive = editForm.tags.includes(tag);
                  return (
                    <TouchableOpacity key={tag} style={[styles.tagPill, isActive && styles.tagPillActive]} onPress={() => setEditForm({...editForm, tags: isActive ? editForm.tags.filter(t => t !== tag) : [...editForm.tags, tag]})}>
                      <Text style={[styles.tagPillText, isActive && styles.tagPillTextActive]}>{tag}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
            <View style={styles.formGroup}><Text style={styles.label}>Notes</Text><TextInput style={[styles.input, styles.textArea]} value={editForm.notes} multiline numberOfLines={4} onChangeText={t => setEditForm({...editForm, notes: t})} /></View>
            <TouchableOpacity style={styles.submitButton} onPress={handleSaveEdit}><Text style={styles.submitButtonText}>Save Changes</Text></TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
      
      <Modal visible={isFacingDropdownOpen} transparent animationType="fade">
        <TouchableOpacity style={styles.dropdownOverlay} onPress={() => setFacingDropdownOpen(false)} activeOpacity={1}>
          <View style={styles.dropdownContent}>
            <Text style={styles.dropdownTitle}>Select Facing</Text>
            <ScrollView>
              {FACING_OPTIONS.map((f) => (
                <TouchableOpacity key={f} style={styles.dropdownOption} onPress={() => { setFacingFilter(f); setFacingDropdownOpen(false); }}>
                  <Text style={[styles.dropdownOptionText, facingFilter === f && styles.dropdownOptionTextActive]}>{f}</Text>
                  {facingFilter === f && <IconSymbol name="checkmark" size={16} color="#4F46E5" />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal visible={isSectorDropdownOpen} transparent animationType="fade">
        <TouchableOpacity style={styles.dropdownOverlay} onPress={() => setSectorDropdownOpen(false)} activeOpacity={1}>
          <View style={styles.dropdownContent}>
            <Text style={styles.dropdownTitle}>Select Sector</Text>
            <ScrollView>
              {availableSectors.map((s) => (
                <TouchableOpacity key={s} style={styles.dropdownOption} onPress={() => { setSectorFilter(s); setSectorDropdownOpen(false); }}>
                  <Text style={[styles.dropdownOptionText, sectorFilter === s && styles.dropdownOptionTextActive]}>{s}</Text>
                  {sectorFilter === s && <IconSymbol name="checkmark" size={16} color="#4F46E5" />}
                </TouchableOpacity>
              ))}
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
    paddingHorizontal: 24, paddingTop: 80, paddingBottom: 24, backgroundColor: '#FFFFFF',
    borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
    shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 2, zIndex: 10
  },
  title: { fontSize: 36, fontWeight: '900', color: '#0F172A', letterSpacing: -0.75 },
  toggleBtn: { padding: 12, backgroundColor: '#EEF2FF', borderRadius: 16 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  syncBadge: { fontSize: 11, fontWeight: '700', color: '#059669', marginTop: 2 },
  localBadge: { fontSize: 11, fontWeight: '700', color: '#94A3B8', marginTop: 2 },
  refreshBtn: { padding: 10, backgroundColor: '#EEF2FF', borderRadius: 14 },
  filtersContainer: { marginBottom: 24, backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24, shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.04, shadowRadius: 16, elevation: 3, borderWidth: 1, borderColor: '#F8FAFC' },
  filterTitle: { fontSize: 12, fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
  filterRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  filterInput: {
    width: '48%', backgroundColor: '#F8FAFC', borderWidth: 1.5, borderColor: '#F1F5F9', borderRadius: 16,
    paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: '#0F172A', fontWeight: '500'
  },
  dropdownButton: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F8FAFC', borderWidth: 1.5, borderColor: '#F1F5F9', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14, marginTop: 4 },
  dropdownButtonText: { fontSize: 15, color: '#0F172A', fontWeight: '500' },
  dropdownOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.65)', justifyContent: 'flex-end', alignItems: 'center' },
  dropdownContent: { width: '100%', backgroundColor: '#FFFFFF', borderTopLeftRadius: 36, borderTopRightRadius: 36, padding: 32, maxHeight: Dimensions.get('window').height * 0.6, shadowColor: '#000', shadowOffset: { width: 0, height: -10 }, shadowOpacity: 0.1, shadowRadius: 30 },
  dropdownTitle: { fontSize: 24, fontWeight: '900', color: '#0F172A', marginBottom: 24, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  dropdownOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F8FAFC' },
  dropdownOptionText: { fontSize: 18, color: '#64748B', fontWeight: '500' },
  dropdownOptionTextActive: { color: '#4F46E5', fontWeight: '900' },
  listContent: { padding: 24 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20, marginBottom: 24, shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.05, shadowRadius: 20, elevation: 5, borderWidth: 1, borderColor: '#F8FAFC' },
  listCard: { width: '100%' },
  gridCard: { width: Dimensions.get('window').width / 2 - 30, marginHorizontal: 6, padding: 16 },
  cardHeader: { marginBottom: 16 },
  address: { fontSize: 18, fontWeight: '900', color: '#0F172A', marginBottom: 6, letterSpacing: -0.25 },
  price: { fontSize: 24, fontWeight: '900', color: '#047857', letterSpacing: -0.5 },
  detailsContainer: { marginBottom: 16, backgroundColor: '#F8FAFC', padding: 14, borderRadius: 16 },
  details: { fontSize: 14, color: '#475569', marginBottom: 6, fontWeight: '500' },
  facingContainer: { flexDirection: 'row', alignItems: 'center' },
  facingBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginLeft: 6 },
  facingBadgeText: { fontSize: 12, fontWeight: '800', letterSpacing: 0.5 },
  bold: { fontWeight: '800', color: '#0F172A' },
  notes: { fontSize: 14, color: '#64748B', fontStyle: 'italic', marginBottom: 16, lineHeight: 22 },
  actions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 'auto', paddingTop: 16, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  editBtn: { paddingVertical: 12, paddingHorizontal: 16, backgroundColor: '#EEF2FF', borderRadius: 14, width: '48%', alignItems: 'center' },
  editBtnText: { color: '#4F46E5', fontWeight: '800', fontSize: 14 },
  deleteBtn: { paddingVertical: 12, paddingHorizontal: 16, backgroundColor: '#FEF2F2', borderRadius: 14, width: '48%', alignItems: 'center' },
  deleteBtnText: { color: '#DC2626', fontWeight: '800', fontSize: 14 },
  emptyText: { textAlign: 'center', marginTop: 80, color: '#94A3B8', fontSize: 16, fontWeight: '600' },
  
  // Modal styles
  modalContainer: { flex: 1, backgroundColor: '#F8FAFC' },
  modalContent: { padding: 24, paddingBottom: 60, paddingTop: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 },
  modalTitle: { fontSize: 32, fontWeight: '900', color: '#0F172A', letterSpacing: -0.5 },
  modalCloseText: { fontSize: 16, color: '#EF4444', fontWeight: '800' },
  formGroup: { marginBottom: 24 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  halfWidth: { width: '48%' },
  label: { fontSize: 12, fontWeight: '800', color: '#475569', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10, marginLeft: 4 },
  input: { backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#F1F5F9', borderRadius: 20, paddingHorizontal: 20, paddingVertical: 18, fontSize: 16, color: '#0F172A', fontWeight: '500', shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.02, shadowRadius: 10, elevation: 2 },
  textArea: { height: 130, paddingTop: 18, textAlignVertical: 'top' },
  submitButton: { backgroundColor: '#4F46E5', borderRadius: 20, paddingVertical: 18, alignItems: 'center', marginTop: 24, shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 8 },
  submitButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800', letterSpacing: 0.5 },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  tagLabel: { backgroundColor: '#F1F5F9', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  tagLabelText: { fontSize: 11, fontWeight: '800', color: '#475569', textTransform: 'uppercase' },
  formTagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 4 },
  tagPill: { backgroundColor: '#FFFFFF', borderRadius: 24, paddingVertical: 10, paddingHorizontal: 18, borderWidth: 1.5, borderColor: '#F1F5F9', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 4, elevation: 1 },
  tagPillActive: { backgroundColor: '#4F46E5', borderColor: '#4F46E5', shadowColor: '#4F46E5', shadowOpacity: 0.2, shadowOffset: { width: 0, height: 4 } },
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
  closeBottomBtn: { backgroundColor: '#F1F5F9', paddingVertical: 18, borderRadius: 20, alignItems: 'center', marginTop: 12 },
  closeBottomBtnText: { color: '#0F172A', fontSize: 16, fontWeight: '800' },
});
