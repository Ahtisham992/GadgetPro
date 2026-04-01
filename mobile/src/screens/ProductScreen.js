import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, SafeAreaView } from 'react-native';
import client from '../api/client';
import useCartStore from '../store/cartStore';
import { theme } from '../theme/colors';
import { ShoppingCart, Star, ChevronRight, Minus, Plus } from 'lucide-react-native';

const ProductScreen = ({ route, navigation }) => {
  const { id } = route.params;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  
  const addToCart = useCartStore((state) => state.addToCart);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await client.get(`/products/${id}`);
        setProduct(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (product) {
       addToCart(product, qty);
       navigation.goBack(); 
    }
  };

  if (loading || !product) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  const isOutOfStock = product.countInStock === 0;
  const maxQty = Math.min(product.countInStock || 0, 10);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Breadcrumb */}
      <View style={styles.header}>
         <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.breadcrumbText}>Home</Text>
         </TouchableOpacity>
         <ChevronRight size={14} color={theme.colors.textMuted} />
         <Text style={styles.breadcrumbText}>{product.category}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
         {/* Image Gallery Mock */}
         <View style={styles.imageBlock}>
             <Image 
                source={{ uri: product.image.startsWith('http') ? product.image : `http://10.0.2.2:5000${product.image}` }} 
                style={styles.image} 
                resizeMode="contain" 
             />
         </View>

         {/* Info Block */}
         <View style={styles.infoBlock}>
             <View style={styles.badgesRow}>
                <View style={styles.badgePrimary}><Text style={styles.badgePrimaryText}>{product.brand}</Text></View>
                <View style={styles.badgeNeutral}><Text style={styles.badgeNeutralText}>{product.category}</Text></View>
             </View>

             <Text style={styles.title}>{product.name}</Text>
             
             <View style={styles.ratingRow}>
                 <Star fill={theme.colors.warning} color={theme.colors.warning} size={16} />
                 <Text style={styles.ratingText}>{product.rating?.toFixed(1) || '0.0'} ({product.numReviews || 0} reviews)</Text>
             </View>

             <Text style={styles.price}>PKR {product.price?.toLocaleString()}</Text>

             {isOutOfStock ? (
                 <View style={styles.stockBadgeDanger}><Text style={styles.stockTextDanger}>Out of Stock</Text></View>
             ) : (
                 <View style={styles.stockBadgeSuccess}><Text style={styles.stockTextSuccess}>In Stock</Text></View>
             )}

             {/* Quantity Selector */}
             {!isOutOfStock && (
                 <View style={styles.qtyBlock}>
                     <Text style={styles.qtyLabel}>Quantity</Text>
                     <View style={styles.qtyControls}>
                         <TouchableOpacity style={styles.qtyBtn} onPress={() => setQty(q => Math.max(1, q-1))}>
                             <Minus size={16} color={theme.colors.textMuted} />
                         </TouchableOpacity>
                         <Text style={styles.qtyValue}>{qty}</Text>
                         <TouchableOpacity style={styles.qtyBtn} onPress={() => setQty(q => Math.min(maxQty, q+1))}>
                             <Plus size={16} color={theme.colors.textMuted} />
                         </TouchableOpacity>
                     </View>
                 </View>
             )}
         </View>

         {/* Tabs System */}
         <View style={styles.tabsBlock}>
            <View style={styles.tabsHeader}>
                {['description', 'specs', 'reviews'].map(tab => (
                   <TouchableOpacity 
                      key={tab} 
                      style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]}
                      onPress={() => setActiveTab(tab)}
                   >
                       <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                           {tab.charAt(0).toUpperCase() + tab.slice(1)}
                       </Text>
                   </TouchableOpacity>
                ))}
            </View>
            <View style={styles.tabContent}>
               {activeTab === 'description' && (
                  <Text style={styles.descText}>{product.description}</Text>
               )}
               {activeTab === 'specs' && (
                  <Text style={styles.descText}>Detailed tech specifications are not mapped yet.</Text>
               )}
               {activeTab === 'reviews' && (
                  <Text style={styles.descText}>No reviews available right now.</Text>
               )}
            </View>
         </View>
      </ScrollView>

      {/* Footer Add to Cart */}
      <View style={styles.footer}>
         <TouchableOpacity 
            style={[styles.btnPrimary, isOutOfStock && styles.btnDisabled]} 
            onPress={handleAddToCart}
            disabled={isOutOfStock}
         >
             <ShoppingCart size={20} color="#fff" style={{ marginRight: 8 }} />
             <Text style={styles.btnPrimaryText}>Add to Cart</Text>
         </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, backgroundColor: theme.colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: theme.colors.surface, gap: 6, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  breadcrumbText: { fontSize: 13, color: theme.colors.textMuted, fontWeight: '500' },
  
  imageBlock: { backgroundColor: theme.colors.bgAlt, padding: 32, aspectRatio: 1, alignItems: 'center', justifyContent: 'center' },
  image: { width: '100%', height: '100%' },
  
  infoBlock: { padding: 24, backgroundColor: theme.colors.surface },
  badgesRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  badgePrimary: { backgroundColor: theme.colors.primaryLight, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgePrimaryText: { color: theme.colors.primary, fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  badgeNeutral: { backgroundColor: theme.colors.bgAlt, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeNeutralText: { color: theme.colors.textMuted, fontSize: 11, fontWeight: '600', textTransform: 'uppercase' },
  
  title: { fontSize: 24, fontWeight: '800', color: theme.colors.text, lineHeight: 32, marginBottom: 12 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16 },
  ratingText: { fontSize: 13, color: theme.colors.textMuted, fontWeight: '500' },
  
  price: { fontSize: 28, fontWeight: '800', color: theme.colors.primary, marginBottom: 16, letterSpacing: -0.5 },
  
  stockBadgeDanger: { alignSelf: 'flex-start', backgroundColor: theme.colors.dangerBg, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginBottom: 24 },
  stockTextDanger: { color: theme.colors.danger, fontSize: 12, fontWeight: '700' },
  stockBadgeSuccess: { alignSelf: 'flex-start', backgroundColor: theme.colors.successBg, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginBottom: 24 },
  stockTextSuccess: { color: theme.colors.success, fontSize: 12, fontWeight: '700' },
  
  qtyBlock: { marginBottom: 10 },
  qtyLabel: { fontSize: 13, fontWeight: '600', color: theme.colors.text, marginBottom: 8 },
  qtyControls: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radius.md, alignSelf: 'flex-start' },
  qtyBtn: { padding: 12, backgroundColor: theme.colors.bgAlt },
  qtyValue: { paddingHorizontal: 20, fontSize: 16, fontWeight: '700', color: theme.colors.text },
  
  tabsBlock: { margin: 16, backgroundColor: theme.colors.surface, borderRadius: theme.radius.xl, borderWidth: 1, borderColor: theme.colors.border, overflow: 'hidden', ...theme.shadows.card },
  tabsHeader: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  tabBtn: { flex: 1, paddingVertical: 14, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabBtnActive: { borderBottomColor: theme.colors.primary },
  tabText: { fontSize: 13, fontWeight: '600', color: theme.colors.textMuted },
  tabTextActive: { color: theme.colors.primary },
  tabContent: { padding: 20 },
  descText: { fontSize: 14, lineHeight: 24, color: theme.colors.textMuted },
  
  footer: { padding: 16, backgroundColor: theme.colors.surface, borderTopWidth: 1, borderTopColor: theme.colors.border },
  btnPrimary: { flexDirection: 'row', backgroundColor: theme.colors.primary, paddingVertical: 16, borderRadius: theme.radius.lg, alignItems: 'center', justifyContent: 'center' },
  btnDisabled: { backgroundColor: theme.colors.textLight },
  btnPrimaryText: { color: '#fff', fontSize: 16, fontWeight: '700' }
});

export default ProductScreen;
