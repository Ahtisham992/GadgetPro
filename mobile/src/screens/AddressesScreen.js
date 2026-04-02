import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, TextInput, ScrollView, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, MapPin, Trash2, Plus, Home, Briefcase, PlusCircle } from 'lucide-react-native';
import client from '../api/client';
import { theme } from '../theme/colors';

const AddressesScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAddr, setNewAddr] = useState({ label: 'Home', address: '', city: '', postalCode: '', country: 'Pakistan', phone: '' });
  const [saving, setSaving] = useState(false);

  const fetchAddresses = async () => {
    try {
      const { data } = await client.get('/users/addresses');
      setAddresses(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleDelete = async (id) => {
    Alert.alert('Delete Address', 'Are you sure you want to remove this address?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: async () => {
            try {
                await client.delete(`/users/addresses/${id}`);
                setAddresses(prev => prev.filter(a => a._id !== id));
            } catch (err) {
                Alert.alert('Error', 'Could not delete address');
            }
        }}
    ]);
  };

  const handleAddAddress = async () => {
     if (!newAddr.address || !newAddr.city) return Alert.alert('Error', 'Address and City are required');
     setSaving(true);
     try {
        await client.post('/users/addresses', newAddr);
        setShowAddModal(false);
        setNewAddr({ label: 'Home', address: '', city: '', postalCode: '', country: 'Pakistan', phone: '' });
        fetchAddresses();
     } catch (err) {
        Alert.alert('Error', 'Could not save address');
     } finally {
        setSaving(false);
     }
  };

  const renderAddressItem = ({ item }) => (
    <View style={styles.addrCard}>
      <View style={styles.addrHeader}>
        <View style={styles.labelRow}>
           {item.label === 'Home' ? <Home size={16} color={theme.colors.primary} /> : <Briefcase size={16} color={theme.colors.primary} />}
           <Text style={styles.addrLabelText}>{item.label}</Text>
        </View>
        <TouchableOpacity onPress={() => handleDelete(item._id)}>
          <Trash2 size={18} color={theme.colors.danger} />
        </TouchableOpacity>
      </View>
      <Text style={styles.addrText}>{item.address}</Text>
      <Text style={styles.addrText}>{item.city}, {item.postalCode}</Text>
      <Text style={styles.addrText}>{item.country}</Text>
      {item.phone && <Text style={styles.addrPhone}>📞 {item.phone}</Text>}
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Address Book</Text>
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={theme.colors.primary} /></View>
      ) : (
        <FlatList 
          data={addresses}
          keyExtractor={(item) => item._id}
          renderItem={renderAddressItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <MapPin size={48} color={theme.colors.textLight} />
              <Text style={styles.emptyTitle}>No addresses saved</Text>
              <Text style={styles.emptySubtitle}>Save your delivery locations for faster checkout.</Text>
            </View>
          }
        />
      )}

      <TouchableOpacity style={[styles.addFloatBtn, { bottom: insets.bottom + 20 }]} onPress={() => setShowAddModal(true)}>
          <Plus size={24} color="#fff" />
          <Text style={styles.addFloatText}>Add New Address</Text>
      </TouchableOpacity>

      {/* Add Address Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent={true}>
         <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
               <View style={styles.modalHeader}>
                  <Text style={styles.modalHeaderTitle}>Add New Address</Text>
                  <TouchableOpacity onPress={() => setShowAddModal(false)}><ArrowLeft size={24} color={theme.colors.text} /></TouchableOpacity>
               </View>
               <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                  <Text style={styles.inputLabel}>Label (e.g. Home, Work)</Text>
                  <TextInput style={styles.input} value={newAddr.label} onChangeText={t => setNewAddr({...newAddr, label: t})} placeholder="Home" />
                  
                  <Text style={styles.inputLabel}>Street Address</Text>
                  <TextInput style={styles.input} value={newAddr.address} onChangeText={t => setNewAddr({...newAddr, address: t})} placeholder="123 Street..." />
                  
                  <View style={styles.row}>
                     <View style={{ flex: 1, marginRight: 10 }}>
                        <Text style={styles.inputLabel}>City</Text>
                        <TextInput style={styles.input} value={newAddr.city} onChangeText={t => setNewAddr({...newAddr, city: t})} placeholder="Karachi" />
                     </View>
                     <View style={{ flex: 1 }}>
                        <Text style={styles.inputLabel}>Postal Code</Text>
                        <TextInput style={styles.input} value={newAddr.postalCode} onChangeText={t => setNewAddr({...newAddr, postalCode: t})} placeholder="75300" />
                     </View>
                  </View>

                  <Text style={styles.inputLabel}>Phone (with country code)</Text>
                  <TextInput style={styles.input} value={newAddr.phone} onChangeText={t => setNewAddr({...newAddr, phone: t})} placeholder="+92 3XX XXXXXXX" keyboardType="phone-pad" />

                  <TouchableOpacity style={styles.saveBtn} onPress={handleAddAddress} disabled={saving}>
                     {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Save Address</Text>}
                  </TouchableOpacity>
               </ScrollView>
            </View>
         </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: theme.colors.border, backgroundColor: theme.colors.surface },
  backBtn: { padding: 4, marginRight: 12 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: theme.colors.text },

  list: { padding: 16, paddingBottom: 100 },
  addrCard: { backgroundColor: theme.colors.surface, borderRadius: theme.radius.xl, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: theme.colors.border, ...theme.shadows.card },
  addrHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  addrLabelText: { fontSize: 15, fontWeight: '800', color: theme.colors.text },
  addrText: { fontSize: 14, color: theme.colors.textMuted, lineHeight: 20 },
  addrPhone: { fontSize: 13, color: theme.colors.primary, fontWeight: '700', marginTop: 8 },

  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 60 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.text, marginTop: 16 },
  emptySubtitle: { fontSize: 14, color: theme.colors.textMuted, textAlign: 'center', marginTop: 8 },

  addFloatBtn: { position: 'absolute', right: 16, left: 16, flexDirection: 'row', backgroundColor: theme.colors.text, paddingVertical: 16, borderRadius: theme.radius.lg, alignItems: 'center', justifyContent: 'center', gap: 10, elevation: 5, shadowColor: '#000', shadowOffset:{width:0, height:4}, shadowOpacity:0.3, shadowRadius:8 },
  addFloatText: { color: '#fff', fontWeight: '700', fontSize: 16 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: theme.colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, height: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalHeaderTitle: { fontSize: 20, fontWeight: '800', color: theme.colors.text },
  
  inputLabel: { fontSize: 13, fontWeight: '700', color: theme.colors.textMuted, marginBottom: 8, marginTop: 16 },
  input: { backgroundColor: theme.colors.bgAlt, borderRadius: theme.radius.md, padding: 16, fontSize: 15, color: theme.colors.text, borderWidth: 1, borderColor: theme.colors.border },
  row: { flexDirection: 'row' },
  saveBtn: { backgroundColor: theme.colors.primary, paddingVertical: 18, borderRadius: theme.radius.lg, alignItems: 'center', marginTop: 32 },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 }
});

export default AddressesScreen;
