import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, SafeAreaView, RefreshControl, TouchableOpacity, Modal, ScrollView, TextInput, CheckBox } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import client from '../api/client';
import ProductCard from '../components/ProductCard';
import { theme } from '../theme/colors';
import { Truck, ShieldCheck, RefreshCw, Headphones, Filter, X, Menu, ChevronDown, Trash2 } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const CATEGORIES = ['All', 'Laptops', 'Smartphones', 'Audio', 'Wearables', 'Accessories'];
const BRANDS = ['Apple', 'Samsung', 'Dell', 'HP', 'Sony', 'Asus', 'Microsoft'];
const RAM_OPTIONS = ['4GB', '8GB', '16GB', '32GB', '64GB'];
const PROCESSORS = ['Intel i5', 'Intel i7', 'Intel i9', 'AMD Ryzen 5', 'AMD Ryzen 7', 'Apple M1', 'Apple M2', 'Apple M3'];

const HomeScreen = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  
  // Pagination & Filters State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeCategory, setActiveCategory] = useState('All');
  const [keyword, setKeyword] = useState('');
  
  // Advanced Filters State
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedRam, setSelectedRam] = useState([]);
  const [selectedProcessors, setSelectedProcessors] = useState([]);
  
  // When category changes from Drawer or internal
  useEffect(() => {
    if (route.params?.category) {
      setActiveCategory(route.params.category);
    }
  }, [route.params?.category]);

  const fetchProducts = async (pageNum = 1, shouldAppend = false) => {
    try {
      let queryUrl = `/products?page=${pageNum}`;
      if (activeCategory !== 'All') queryUrl += `&category=${encodeURIComponent(activeCategory)}`;
      if (keyword) queryUrl += `&keyword=${encodeURIComponent(keyword)}`;
      if (minPrice) queryUrl += `&minPrice=${minPrice}`;
      if (maxPrice) queryUrl += `&maxPrice=${maxPrice}`;
      if (selectedBrands.length > 0) queryUrl += `&brand=${encodeURIComponent(selectedBrands.join(','))}`;
      if (selectedRam.length > 0) queryUrl += `&ram=${encodeURIComponent(selectedRam.join(','))}`;
      if (selectedProcessors.length > 0) queryUrl += `&processor=${encodeURIComponent(selectedProcessors.join(','))}`;

      const { data } = await client.get(queryUrl);
      
      const newProducts = data.products || data;
      setProducts(prev => {
        const combined = shouldAppend ? [...prev, ...newProducts] : newProducts;
        // Filter out duplicates in case Page 2 data overlaps with Page 1
        return combined.filter((item, index, self) =>
          index === self.findIndex((t) => t._id === item._id)
        );
      });
      setTotalPages(data.pages || 1);
      setPage(data.page || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchProducts(1, false);
  }, [activeCategory, selectedBrands, selectedRam, selectedProcessors, keyword]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProducts(1, false);
  };

  const handleLoadMore = () => {
    if (!loadingMore && page < totalPages) {
      setLoadingMore(true);
      fetchProducts(page + 1, true);
    }
  };

  const toggleFilterItem = (item, list, setList) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const clearFilters = () => {
    setActiveCategory('All');
    setMinPrice('');
    setMaxPrice('');
    setSelectedBrands([]);
    setSelectedRam([]);
    setSelectedProcessors([]);
    setIsFilterOpen(false);
    setLoading(true);
    fetchProducts(1, false);
  };

  const FilterSection = ({ title, options, selectedList, setSelectedList }) => (
    <View style={styles.filterGroup}>
      <Text style={styles.filterGroupTitle}>{title}</Text>
      <View style={styles.catChipsWrapper}>
        {options.map(opt => (
          <TouchableOpacity 
            key={opt} 
            style={[styles.catChip, selectedList.includes(opt) && styles.catChipActive]}
            onPress={() => toggleFilterItem(opt, selectedList, setSelectedList)}
          >
            <Text style={[styles.catChipText, selectedList.includes(opt) && styles.catChipTextActive]}>{opt}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderHeroSection = () => (
    <View>
      <LinearGradient 
        colors={[theme.colors.heroStart, '#162032', theme.colors.heroEnd]} 
        start={{x: 0, y: 0}} end={{x: 1, y: 1}}
        style={[styles.hero, { paddingTop: insets.top + 20 }]}
      >
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.menuIcon}>
              <Menu size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.searchBarWrap}>
             <TextInput 
                style={styles.searchInput} 
                placeholder="Search gadgets..." 
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={keyword}
                onChangeText={setKeyword}
             />
          </View>
        </View>

        <Text style={styles.heroTitle}>The Future of {'\n'}<Text style={{ color: theme.colors.primary }}>Tech</Text>, Today.</Text>
        <Text style={styles.heroDesc}>Discover Pakistan's most premium collection of cutting-edge gadgets.</Text>
        
        <View style={styles.heroBtnRow}>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.navigate('OrderHistory')}>
            <Text style={styles.primaryBtnText}>My Orders</Text>
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
          {activeCategory !== 'All' && <Text style={styles.activeCatText}>{activeCategory}</Text>}
        </View>
        <TouchableOpacity style={styles.filterBtn} onPress={() => setIsFilterOpen(true)}>
          <Filter size={16} color={theme.colors.text} />
          <Text style={styles.filterBtnText}>Filters</Text>
          {(selectedBrands.length > 0 || selectedRam.length > 0 || selectedProcessors.length > 0 || maxPrice || minPrice) && (
            <View style={styles.filterBadge} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
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
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={() => loadingMore ? <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginVertical: 20 }} /> : null}
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

      {/* Advanced Filter Modal */}
      <Modal visible={isFilterOpen} animationType="slide" transparent={true}>
         <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
               <View style={styles.modalHeader}>
                 <Text style={styles.modalTitle}>Advanced Filters</Text>
                 <TouchableOpacity onPress={() => setIsFilterOpen(false)} style={styles.closeBtn}>
                   <X size={24} color={theme.colors.textMuted} />
                 </TouchableOpacity>
               </View>
               
               <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                 <Text style={styles.filterGroupTitle}>Price Range (PKR)</Text>
                 <View style={styles.priceRow}>
                    <TextInput 
                       style={styles.priceInput} 
                       placeholder="Min" 
                       keyboardType="numeric"
                       value={minPrice}
                       onChangeText={setMinPrice}
                    />
                    <Text style={{ marginHorizontal: 8, color: theme.colors.textMuted }}>-</Text>
                    <TextInput 
                       style={styles.priceInput} 
                       placeholder="Max" 
                       keyboardType="numeric"
                       value={maxPrice}
                       onChangeText={setMaxPrice}
                    />
                 </View>

                 <FilterSection title="Brands" options={BRANDS} selectedList={selectedBrands} setSelectedList={setSelectedBrands} />
                 <FilterSection title="RAM Size" options={RAM_OPTIONS} selectedList={selectedRam} setSelectedList={setSelectedRam} />
                 <FilterSection title="Processor" options={PROCESSORS} selectedList={selectedProcessors} setSelectedList={setSelectedProcessors} />
                 
               </ScrollView>

               <View style={styles.filterFooter}>
                   <TouchableOpacity style={styles.clearBtn} onPress={clearFilters}>
                       <Text style={styles.clearBtnText}>Clear All</Text>
                   </TouchableOpacity>
                   <TouchableOpacity style={styles.applyBtn} onPress={() => setIsFilterOpen(false)}>
                       <Text style={styles.applyBtnText}>Apply Filters</Text>
                   </TouchableOpacity>
               </View>
            </View>
         </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg },
  rowWrapper: { justifyContent: 'space-between', paddingHorizontal: 16 },
  
  hero: { paddingHorizontal: 24, paddingBottom: 40, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  topBar: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  menuIcon: { marginRight: 16, padding: 4 },
  searchBarWrap: { flex: 1, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, paddingHorizontal: 12 },
  searchInput: { color: '#fff', fontSize: 14, height: 44, fontWeight: '500' },
  heroBadge: { backgroundColor: 'rgba(249,115,22,0.15)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(249,115,22,0.3)' },
  heroBadgeText: { color: theme.colors.primary, fontSize: 12, fontWeight: '700' },
  heroTitle: { color: '#fff', fontSize: 36, fontWeight: '800', lineHeight: 42, marginBottom: 16 },
  heroDesc: { color: '#94A3B8', fontSize: 15, lineHeight: 24, marginBottom: 24, maxWidth: '90%' },
  heroBtnRow: { flexDirection: 'row', gap: 12 },
  primaryBtn: { backgroundColor: theme.colors.primary, paddingHorizontal: 24, paddingVertical: 14, borderRadius: theme.radius.md },
  primaryBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  
  featuresScroll: { flexDirection: 'row', flexWrap: 'wrap', padding: 16, backgroundColor: theme.colors.surface, marginHorizontal: 16, borderRadius: theme.radius.xl, marginTop: -20, elevation: 4, shadowColor: '#000', shadowOffset:{width:0, height:4}, shadowOpacity:0.05, shadowRadius:10, marginBottom: 24 },
  featureItem: { width: '50%', flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 8, gap: 10 },
  featureIconWrap: { width: 36, height: 36, borderRadius: 18, backgroundColor: theme.colors.bgAlt, alignItems: 'center', justifyContent: 'center' },
  featureText: { fontSize: 13, fontWeight: '600', color: theme.colors.text },

  sectionHeader: { paddingHorizontal: 16, paddingBottom: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: theme.colors.text },
  activeCatText: { fontSize: 13, color: theme.colors.primary, marginTop: 4, fontWeight: '600' },
  filterBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, paddingHorizontal: 12, paddingVertical: 8, borderRadius: theme.radius.lg, gap: 6 },
  filterBtnText: { fontSize: 13, fontWeight: '600', color: theme.colors.text },
  filterBadge: { width: 8, height: 8, borderRadius: 4, backgroundColor: theme.colors.primary, position: 'absolute', top: -2, right: -2 },
  
  emptyWrap: { alignItems: 'center', padding: 40, marginTop: 20 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.text, marginTop: 16, marginBottom: 8 },
  emptyText: { color: theme.colors.textMuted, fontSize: 14 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: theme.colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, height: '80%', padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.text },
  closeBtn: { padding: 4 },
  modalBody: { flex: 1 },
  
  filterGroup: { marginBottom: 24 },
  filterGroupTitle: { fontSize: 15, fontWeight: '700', color: theme.colors.text, marginBottom: 12 },
  priceRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  priceInput: { flex: 1, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radius.md, padding: 12, fontSize: 15, backgroundColor: theme.colors.bgAlt },
  
  catChipsWrapper: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface },
  catChipActive: { backgroundColor: theme.colors.primaryLight, borderColor: theme.colors.primary },
  catChipText: { fontSize: 13, color: theme.colors.textMuted, fontWeight: '500' },
  catChipTextActive: { color: theme.colors.primary, fontWeight: '700' },
  
  filterFooter: { flexDirection: 'row', marginTop: 16, borderTopWidth: 1, borderTopColor: theme.colors.border, paddingTop: 16, gap: 12 },
  clearBtn: { flex: 1, paddingVertical: 16, borderRadius: theme.radius.lg, alignItems: 'center', backgroundColor: theme.colors.bgAlt },
  clearBtnText: { color: theme.colors.text, fontWeight: '700', fontSize: 15 },
  applyBtn: { flex: 1, paddingVertical: 16, borderRadius: theme.radius.lg, alignItems: 'center', backgroundColor: theme.colors.primary },
  applyBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 }
});

export default HomeScreen;
