import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, SafeAreaView } from 'react-native';
import client from '../api/client';
import useCartStore from '../store/cartStore';
import { theme } from '../theme/colors';
import { ShoppingCart, Star, ChevronRight, Minus, Plus, ArrowLeft, MessageSquare, ShieldCheck, Box } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { resolveImageUrl } from '../config';

const ProductScreen = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
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
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header Bar */}
      <View style={styles.header}>
         <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ArrowLeft size={24} color={theme.colors.text} />
         </TouchableOpacity>
         <View style={styles.headerInfo}>
            <Text style={styles.headerTitle} numberOfLines={1}>{product.name}</Text>
            <Text style={styles.headerSub}>{product.category}</Text>
         </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
         {/* Image Gallery Mock */}
         <View style={styles.imageBlock}>
             <Image 
                source={{ uri: resolveImageUrl(product.image) }} 
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
                  <View>
                     <View style={styles.specRow}><Text style={styles.specLabel}>Brand</Text><Text style={styles.specValue}>{product.brand}</Text></View>
                     <View style={styles.specRow}><Text style={styles.specLabel}>Category</Text><Text style={styles.specValue}>{product.category}</Text></View>
                     <View style={styles.specRow}><Text style={styles.specLabel}>Rating</Text><Text style={styles.specValue}>{product.rating} / 5</Text></View>
                     <View style={styles.specRow}><Text style={styles.specLabel}>Reviews</Text><Text style={styles.specValue}>{product.numReviews}</Text></View>
                     <View style={styles.specRow}><Text style={styles.specLabel}>Availability</Text><Text style={styles.specValue}>{product.countInStock > 0 ? 'In Stock' : 'Out of Stock'}</Text></View>
                  </View>
               )}
               {activeTab === 'reviews' && (
                  <View>
                     {product.reviews && product.reviews.length > 0 ? (
                        product.reviews.map((review, idx) => (
                           <View key={idx} style={styles.reviewItem}>
                              <View style={styles.reviewHeader}>
                                 <Text style={styles.reviewUser}>{review.name}</Text>
                                 <View style={styles.reviewStars}>
                                    {[...Array(5)].map((_, i) => (
                                       <Star key={i} size={12} fill={i < review.rating ? theme.colors.warning : 'transparent'} color={theme.colors.warning} />
                                    ))}
                                 </View>
                              </View>
                              <Text style={styles.reviewComment}>{review.comment}</Text>
                              <Text style={styles.reviewDate}>{new Date(review.createdAt).toLocaleDateString()}</Text>
                           </View>
                        ))
                     ) : (
                        <View style={styles.emptyReviews}>
                           <MessageSquare size={32} color={theme.colors.textLight} />
                           <Text style={styles.descText}>No reviews for this product yet.</Text>
                        </View>
                     )}
                  </View>
               )}
            </View>
         </View>
      </ScrollView>

      {/* Footer Add to Cart */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
         <TouchableOpacity 
            style={[styles.btnPrimary, isOutOfStock && styles.btnDisabled]} 
            onPress={handleAddToCart}
            disabled={isOutOfStock}
         >
             <ShoppingCart size={20} color="#fff" style={{ marginRight: 8 }} />
             <Text style={styles.btnPrimaryText}>Add to Cart</Text>
         </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, backgroundColor: theme.colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, backgroundColor: theme.colors.surface, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  backBtn: { padding: 4, marginRight: 12 },
  headerInfo: { flex: 1 },
  headerTitle: { fontSize: 16, fontWeight: '700', color: theme.colors.text },
  headerSub: { fontSize: 12, color: theme.colors.textMuted },
  
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
  
  specRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.colors.bgAlt },
  specLabel: { fontSize: 14, color: theme.colors.textMuted, fontWeight: '500' },
  specValue: { fontSize: 14, color: theme.colors.text, fontWeight: '700' },

  reviewItem: { marginBottom: 24, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: theme.colors.bgAlt },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  reviewUser: { fontSize: 15, fontWeight: '700', color: theme.colors.text },
  reviewStars: { flexDirection: 'row', gap: 2 },
  reviewComment: { fontSize: 14, color: theme.colors.textMuted, lineHeight: 22, marginBottom: 8 },
  reviewDate: { fontSize: 12, color: theme.colors.textLight },
  emptyReviews: { alignItems: 'center', gap: 12, paddingVertical: 20 },
  
  footer: { padding: 16, backgroundColor: theme.colors.surface, borderTopWidth: 1, borderTopColor: theme.colors.border },
  btnPrimary: { flexDirection: 'row', backgroundColor: theme.colors.primary, paddingVertical: 16, borderRadius: theme.radius.lg, alignItems: 'center', justifyContent: 'center' },
  btnDisabled: { backgroundColor: theme.colors.textLight },
  btnPrimaryText: { color: '#fff', fontSize: 16, fontWeight: '700' }
});

export default ProductScreen;
