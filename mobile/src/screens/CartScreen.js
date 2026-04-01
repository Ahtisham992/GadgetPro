import React from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity, SafeAreaView } from 'react-native';
import useCartStore from '../store/cartStore';
import { theme } from '../theme/colors';
import { Trash2, ArrowRight } from 'lucide-react-native';

const CartScreen = ({ navigation }) => {
  const cartItems = useCartStore((state) => state.cartItems);
  const removeFromCart = useCartStore((state) => state.removeFromCart);

  const totalAmount = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);

  if (cartItems.length === 0) {
    return (
      <View style={styles.center}>
        <View style={styles.emptyIconWrap}><Text style={{fontSize: 32}}>🛒</Text></View>
        <Text style={styles.emptyTitle}>Your cart is empty</Text>
        <Text style={styles.emptyText}>Looks like you haven't added anything yet.</Text>
        <TouchableOpacity style={styles.shopButton} onPress={() => navigation.navigate('Home')}>
          <Text style={styles.shopButtonText}>Start Shopping</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Shopping Cart</Text>
        <Text style={styles.subtitle}>{cartItems.reduce((acc, item) => acc + item.qty, 0)} items inside</Text>
      </View>
      <FlatList 
        data={cartItems}
        keyExtractor={(item) => item.product.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <View style={styles.cartItem}>
             <Image source={{ uri: item.image.startsWith('http') ? item.image : `http://10.0.2.2:5000${item.image}` }} style={styles.image} />
             <View style={styles.details}>
                <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
                <Text style={styles.price}>PKR {item.price.toLocaleString()}</Text>
                <Text style={styles.qty}>Qty: {item.qty}</Text>
             </View>
             <TouchableOpacity style={styles.removeBtn} onPress={() => removeFromCart(item.product)}>
                <Trash2 color={theme.colors.danger} size={20} />
             </TouchableOpacity>
          </View>
        )}
      />
      <View style={styles.footer}>
         <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>PKR {totalAmount.toLocaleString()}</Text>
         </View>
         <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Shipping</Text>
            <Text style={[styles.summaryValue, { color: theme.colors.success }]}>Free</Text>
         </View>
         <View style={styles.divider} />
         <View style={styles.totalRow}>
           <Text style={styles.totalLabel}>Grand Total</Text>
           <Text style={styles.totalValue}>PKR {totalAmount.toLocaleString()}</Text>
         </View>
         <TouchableOpacity style={styles.checkoutBtn}>
           <Text style={styles.checkoutBtnText}>Proceed to Checkout</Text>
           <ArrowRight size={18} color="#fff" />
         </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyIconWrap: { width: 80, height: 80, borderRadius: 40, backgroundColor: theme.colors.surface, alignItems:'center', justifyContent:'center', marginBottom: 24, ...theme.shadows.card },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: theme.colors.text, marginBottom: 8 },
  emptyText: { fontSize: 14, color: theme.colors.textMuted, marginBottom: 32 },
  shopButton: { backgroundColor: theme.colors.text, paddingVertical: 14, paddingHorizontal: 32, borderRadius: theme.radius.lg },
  shopButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  
  header: { padding: 20, backgroundColor: theme.colors.surface, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  title: { fontSize: 24, fontWeight: '800', color: theme.colors.text },
  subtitle: { fontSize: 14, color: theme.colors.textMuted, marginTop: 4 },
  
  cartItem: { flexDirection: 'row', padding: 16, backgroundColor: theme.colors.surface, borderRadius: theme.radius.xl, marginBottom: 12, alignItems: 'center', borderWidth: 1, borderColor: theme.colors.border, ...theme.shadows.card },
  image: { width: 70, height: 70, borderRadius: theme.radius.md, backgroundColor: theme.colors.bgAlt },
  details: { flex: 1, marginLeft: 16 },
  name: { fontSize: 14, fontWeight: '600', color: theme.colors.text, marginBottom: 4 },
  price: { fontSize: 15, fontWeight: '800', color: theme.colors.primary },
  qty: { fontSize: 13, color: theme.colors.textMuted, marginTop: 4 },
  removeBtn: { padding: 8, backgroundColor: theme.colors.dangerBg, borderRadius: theme.radius.md },
  
  footer: { padding: 24, backgroundColor: theme.colors.surface, borderTopWidth: 1, borderTopColor: theme.colors.border },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  summaryLabel: { fontSize: 14, color: theme.colors.textMuted, fontWeight: '500' },
  summaryValue: { fontSize: 14, fontWeight: '600', color: theme.colors.text },
  divider: { height: 1, backgroundColor: theme.colors.border, marginVertical: 12 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, alignItems: 'center' },
  totalLabel: { fontSize: 16, color: theme.colors.text, fontWeight: '700' },
  totalValue: { fontSize: 22, fontWeight: '800', color: theme.colors.primary },
  
  checkoutBtn: { flexDirection: 'row', backgroundColor: theme.colors.primary, paddingVertical: 16, borderRadius: theme.radius.lg, alignItems: 'center', justifyContent: 'center', gap: 8 },
  checkoutBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' }
});

export default CartScreen;
