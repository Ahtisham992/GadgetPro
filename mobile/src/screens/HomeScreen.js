import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, SafeAreaView, RefreshControl, TouchableOpacity, Modal, ScrollView } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import client from '../api/client';
import ProductCard from '../components/ProductCard';
import { theme } from '../theme/colors';
import { Truck, ShieldCheck, RefreshCw, Headphones, Filter, X } from 'lucide-react-native';

const CATEGORIES = ['All', 'Laptops', 'Smartphones', 'Audio', 'Wearables', 'Accessories'];

const HomeScreen = ({ navigation }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const fetchProducts = async () => {
    try {
      const categoryQuery = activeCategory !== 'All' ? `?category=${encodeURIComponent(activeCategory)}` : '';
      const { data } = await client.get(`/products${categoryQuery}`);
      setProducts(data.products || data); 
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchProducts();
  }, [activeCategory]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProducts();
  };

  const renderHeroSection = () => (
    <View>
      <LinearGradient 
        colors={[theme.colors.heroStart, '#162032', theme.colors.heroEnd]} 
        start={{x: 0, y: 0}} end={{x: 1, y: 1}}
        style={styles.hero}
      >
        <View style={styles.heroBadge}>
          <Text style={styles.heroBadgeText}>⚡ New 2026 Collection</Text>
        </View>
        <Text style={styles.heroTitle}>The Future of {'\n'}<Text style={{ color: theme.colors.primary }}>Tech</Text>, Today.</Text>
        <Text style={styles.heroDesc}>Discover Pakistan's most premium collection of cutting-edge gadgets.</Text>
        
        <View style={styles.heroBtnRow}>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => {}}>
            <Text style={styles.primaryBtnText}>Shop Now</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.navigate('Profile')}>
            <Text style={styles.secondaryBtnText}>My Orders</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Features Bar */}
      <View style={styles.featuresScroll}>
         {[
           { icon: <Truck size={20} color={theme.colors.textMuted}/>, title: 'Free Shipping' },
           { icon: <ShieldCheck size={20} color={theme.colors.textMuted}/>, title: 'Secure Pay' },
           { icon: <RefreshCw size={20} color={theme.colors.textMuted}/>, title: 'Easy Returns' },
           { icon: <Headphones size={20} color={theme.colors.textMuted}/>, title: '24/7 Support' },
         ].map((f, i) => (
           <View key={i} style={styles.featureItem}>
             <View style={styles.featureIconWrap}>{f.icon}</View>
             <Text style={styles.featureText}>{f.title}</Text>
           </View>
         ))}
      </View>

      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>Explore Premium Tech</Text>
          <Text style={styles.sectionSubtitle}>Precision-engineered gadgets</Text>
        </View>
        <TouchableOpacity style={styles.filterBtn} onPress={() => setIsFilterOpen(true)}>
          <Filter size={16} color={theme.colors.text} />
          <Text style={styles.filterBtnText}>Filters</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList 
        data={products}
        keyExtractor={(item) => item._id}
        numColumns={2}
        columnWrapperStyle={styles.rowWrapper}
        ListHeaderComponent={renderHeroSection}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <ProductCard 
            product={item} 
            onPress={() => navigation.navigate('Product', { id: item._id, name: item.name })}
          />
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />}
        contentContainerStyle={{ paddingBottom: 40 }}
        ListEmptyComponent={!loading ? (
             <View style={styles.emptyWrap}>
                <Filter size={32} color={theme.colors.textMuted} />
                <Text style={styles.emptyTitle}>No Products Found</Text>
                <Text style={styles.emptyText}>Adjust your filters to see more.</Text>
             </View>
        ) : (
            <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 40 }} />
        )}
      />

      {/* Mobile Bottom Filter Sheet Modal */}
      <Modal visible={isFilterOpen} animationType="slide" transparent={true}>
         <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
               <View style={styles.modalHeader}>
                 <Text style={styles.modalTitle}>Categories</Text>
                 <TouchableOpacity onPress={() => setIsFilterOpen(false)} style={styles.closeBtn}>
                   <X size={24} color={theme.colors.textMuted} />
                 </TouchableOpacity>
               </View>
               <ScrollView style={styles.modalBody}>
                 {CATEGORIES.map(cat => (
                   <TouchableOpacity 
                      key={cat} 
                      style={[styles.catRow, activeCategory === cat && styles.catRowActive]}
                      onPress={() => { setActiveCategory(cat); setIsFilterOpen(false); }}
                   >
                     <Text style={[styles.catText, activeCategory === cat && styles.catTextActive]}>{cat}</Text>
                   </TouchableOpacity>
                 ))}
               </ScrollView>
            </View>
         </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg },
  rowWrapper: { justifyContent: 'space-between', paddingHorizontal: 16 },
  
  hero: { padding: 24, paddingVertical: 40, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  heroBadge: { backgroundColor: 'rgba(249,115,22,0.15)', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(249,115,22,0.3)', marginBottom: 16 },
  heroBadgeText: { color: theme.colors.primary, fontSize: 12, fontWeight: '700' },
  heroTitle: { color: '#fff', fontSize: 36, fontWeight: '800', lineHeight: 42, marginBottom: 16 },
  heroDesc: { color: '#94A3B8', fontSize: 15, lineHeight: 24, marginBottom: 24, maxWidth: '90%' },
  heroBtnRow: { flexDirection: 'row', gap: 12 },
  primaryBtn: { backgroundColor: theme.colors.primary, paddingHorizontal: 24, paddingVertical: 14, borderRadius: theme.radius.md },
  primaryBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  secondaryBtn: { backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 24, paddingVertical: 14, borderRadius: theme.radius.md },
  secondaryBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  
  featuresScroll: { flexDirection: 'row', flexWrap: 'wrap', padding: 16, backgroundColor: theme.colors.surface, marginHorizontal: 16, borderRadius: theme.radius.xl, marginTop: -20, elevation: 4, shadowColor: '#000', shadowOffset:{width:0, height:4}, shadowOpacity:0.05, shadowRadius:10, marginBottom: 24 },
  featureItem: { width: '50%', flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 8, gap: 10 },
  featureIconWrap: { width: 36, height: 36, borderRadius: 18, backgroundColor: theme.colors.bgAlt, alignItems: 'center', justifyContent: 'center' },
  featureText: { fontSize: 13, fontWeight: '600', color: theme.colors.text },

  sectionHeader: { paddingHorizontal: 16, paddingBottom: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: theme.colors.text },
  sectionSubtitle: { fontSize: 13, color: theme.colors.textMuted, marginTop: 4 },
  filterBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, paddingHorizontal: 12, paddingVertical: 8, borderRadius: theme.radius.lg, gap: 6 },
  filterBtnText: { fontSize: 13, fontWeight: '600', color: theme.colors.text },
  
  emptyWrap: { alignItems: 'center', padding: 40, marginTop: 20 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.text, marginTop: 16, marginBottom: 8 },
  emptyText: { color: theme.colors.textMuted, fontSize: 14 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: theme.colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, height: '50%', padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.text },
  closeBtn: { padding: 4 },
  modalBody: { flex: 1 },
  catRow: { paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: theme.colors.bgAlt },
  catRowActive: { },
  catText: { fontSize: 16, color: theme.colors.text },
  catTextActive: { color: theme.colors.primary, fontWeight: 'bold' }
});

export default HomeScreen;
