import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, ActivityIndicator,
  TouchableOpacity, RefreshControl, TextInput
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Search, SlidersHorizontal } from 'lucide-react-native';
import client from '../api/client';
import ProductCard from '../components/ProductCard';
import { theme } from '../theme/colors';

const CategoryScreen = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const { category } = route.params;

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchProducts = useCallback(async (pageNum = 1, shouldAppend = false) => {
    try {
      let url = `/products?pageNumber=${pageNum}`;
      if (category && category !== 'All') url += `&category=${encodeURIComponent(category)}`;
      if (keyword) url += `&keyword=${encodeURIComponent(keyword)}`;

      const { data } = await client.get(url);
      const newProducts = data.products || data;

      setProducts(prev => {
        const combined = shouldAppend ? [...prev, ...newProducts] : newProducts;
        return combined.filter((item, index, self) =>
          index === self.findIndex(t => t._id === item._id)
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
  }, [category, keyword]);

  useEffect(() => {
    setLoading(true);
    setProducts([]);
    fetchProducts(1, false);
  }, [category, keyword]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProducts(1, false);
  };

  const onLoadMore = () => {
    if (!loadingMore && page < totalPages) {
      setLoadingMore(true);
      fetchProducts(page + 1, true);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{category}</Text>
          {!loading && (
            <Text style={styles.headerCount}>{products.length} products</Text>
          )}
        </View>
      </View>

      {/* Search bar */}
      <View style={styles.searchBar}>
        <Search size={16} color={theme.colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder={`Search in ${category}...`}
          value={keyword}
          onChangeText={setKeyword}
          returnKeyType="search"
        />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : products.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyIcon}>📦</Text>
          <Text style={styles.emptyTitle}>No products found</Text>
          <Text style={styles.emptySubtitle}>No items in {category} match your search.</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          numColumns={2}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
          onEndReached={onLoadMore}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
            />
          }
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              onPress={() => navigation.navigate('Product', { productId: item._id })}
            />
          )}
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 12,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    gap: 12,
  },
  backBtn: { padding: 4 },
  headerCenter: { flex: 1 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: theme.colors.text },
  headerCount: { fontSize: 13, color: theme.colors.textMuted, marginTop: 2 },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 10,
  },
  searchInput: { flex: 1, fontSize: 14, color: theme.colors.text },

  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: theme.colors.text, marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: theme.colors.textMuted, textAlign: 'center' },

  grid: { padding: 12 },
  row: { justifyContent: 'space-between' },
  footerLoader: { paddingVertical: 20, alignItems: 'center' },
});

export default CategoryScreen;
