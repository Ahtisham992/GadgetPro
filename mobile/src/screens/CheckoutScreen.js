import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MapPin, CreditCard, ChevronRight, CheckCircle, ArrowLeft, Truck, Info } from 'lucide-react-native';
import client from '../api/client';
import useCartStore from '../store/cartStore';
import useUserStore from '../store/userStore';
import { theme } from '../theme/colors';

const CheckoutScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { cartItems, clearCart } = useCartStore();
  const { userInfo } = useUserStore();

  const [shippingAddress, setShippingAddress] = useState({
    address: '', city: '', postalCode: '', country: 'Pakistan', phone: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('Cash On Delivery');
  const [cardInfo, setCardInfo] = useState({ number: '', expiry: '', cvc: '' });
  
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [saveThisAddress, setSaveThisAddress] = useState(false);
  const [addressLabel, setAddressLabel] = useState('Home');

  const [loading, setLoading] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  // Totals Calculation (Sync with web frontend logic)
  const itemsPrice = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  const discountAmount = appliedCoupon ? Math.round((itemsPrice * appliedCoupon.discountPercent) / 100) : 0;
  const discountedItemsPrice = itemsPrice - discountAmount;
  const shippingPrice = discountedItemsPrice > 100000 ? 0 : 1500;
  const taxPrice = Math.round(discountedItemsPrice * 0.15);
  const totalPrice = discountedItemsPrice + shippingPrice + taxPrice;

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const { data } = await client.get('/users/addresses');
        setSavedAddresses(data);
      } catch (err) {
        console.warn('Could not fetch addresses');
      }
    };
    fetchAddresses();
  }, []);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setApplyingCoupon(true);
    setCouponError('');
    try {
      const { data } = await client.post('/coupons/apply', { code: couponCode });
      setAppliedCoupon(data);
      setCouponCode('');
    } catch (err) {
      setCouponError(err.response?.data?.message || 'Invalid coupon code');
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!shippingAddress.address || !shippingAddress.city || !shippingAddress.phone) {
      return Alert.alert('Missing Info', 'Please provide a valid shipping address and phone number.');
    }

    if (paymentMethod === 'Credit Card' && (!cardInfo.number || !cardInfo.expiry || !cardInfo.cvc)) {
      return Alert.alert('Payment Info', 'Please provide complete credit card details.');
    }

    setPlacingOrder(true);
    try {
      // 1. Save address if requested
      if (saveThisAddress) {
        await client.post('/users/addresses', { ...shippingAddress, label: addressLabel });
      }

      // 2. Create Order
      const { data: createdOrder } = await client.post('/orders', {
        orderItems: cartItems,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        shippingPrice,
        taxPrice,
        totalPrice,
        discountAmount,
        couponCode: appliedCoupon?.code,
      });

      // 3. Mark as Paid if Credit Card (Mock)
      if (paymentMethod === 'Credit Card') {
        await client.put(`/orders/${createdOrder._id}/pay`, {
          id: 'mock_mobile_pay_' + Date.now(),
          status: 'COMPLETED',
          update_time: new Date().toISOString(),
          email_address: userInfo.email,
        });
      }

      setOrderSuccess(true);
      clearCart();
    } catch (err) {
      Alert.alert('Order Failed', err.response?.data?.message || 'Could not place order. Please try again.');
    } finally {
      setPlacingOrder(false);
    }
  };

  if (orderSuccess) {
    return (
      <View style={[styles.container, styles.center, { paddingTop: insets.top }]}>
        <View style={styles.successCircle}>
          <CheckCircle size={60} color={theme.colors.success} />
        </View>
        <Text style={styles.successTitle}>Order Confirmed!</Text>
        <Text style={styles.successText}>Thank you for choosing GadgetPro. Your premium tech is on its way.</Text>
        <TouchableOpacity style={styles.doneBtn} onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Root' }] })}>
          <Text style={styles.doneBtnText}>Back to Shopping</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
        
        {/* Step 1: Shipping */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.iconWrap, { backgroundColor: theme.colors.primaryLight }]}><MapPin size={18} color={theme.colors.primary} /></View>
            <Text style={styles.sectionTitle}>Shipping Address</Text>
          </View>

          {savedAddresses.length > 0 && (
            <TouchableOpacity style={styles.savedAddrBtn} onPress={() => setShowAddressModal(true)}>
              <Text style={styles.savedAddrBtnText}>Choose from Saved Addresses</Text>
              <ChevronRight size={16} color={theme.colors.primary} />
            </TouchableOpacity>
          )}

          <TextInput 
            style={styles.input} placeholder="Street Address" 
            value={shippingAddress.address} onChangeText={(t) => setShippingAddress({...shippingAddress, address: t})}
          />
          <TextInput 
            style={styles.input} placeholder="Phone Number" keyboardType="phone-pad"
            value={shippingAddress.phone} onChangeText={(t) => setShippingAddress({...shippingAddress, phone: t})}
          />
          <View style={styles.inputRow}>
            <TextInput 
              style={[styles.input, { flex: 1, marginRight: 10 }]} placeholder="City" 
              value={shippingAddress.city} onChangeText={(t) => setShippingAddress({...shippingAddress, city: t})}
            />
            <TextInput 
              style={[styles.input, { flex: 1 }]} placeholder="Postal Code" 
              value={shippingAddress.postalCode} onChangeText={(t) => setShippingAddress({...shippingAddress, postalCode: t})}
            />
          </View>

          <View style={styles.checkboxRow}>
             <TouchableOpacity style={[styles.checkbox, saveThisAddress && styles.checkboxActive]} onPress={() => setSaveThisAddress(!saveThisAddress)}>
                {saveThisAddress && <View style={styles.checkboxInner} />}
             </TouchableOpacity>
             <Text style={styles.checkboxLabel}>Save this address for future</Text>
          </View>
          
          {saveThisAddress && (
            <TextInput 
               style={[styles.input, { marginTop: 10 }]} placeholder="Label (e.g. Home, Office)" 
               value={addressLabel} onChangeText={setAddressLabel}
            />
          )}
        </View>

        {/* Step 2: Payment */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.iconWrap, { backgroundColor: theme.colors.primaryLight }]}><CreditCard size={18} color={theme.colors.primary} /></View>
            <Text style={styles.sectionTitle}>Payment Method</Text>
          </View>

          <View style={styles.methodRow}>
            {['Cash On Delivery', 'Credit Card'].map(m => (
              <TouchableOpacity 
                key={m} 
                style={[styles.methodBtn, paymentMethod === m && styles.methodBtnActive]}
                onPress={() => setPaymentMethod(m)}
              >
                <Text style={[styles.methodText, paymentMethod === m && styles.methodTextActive]}>{m}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {paymentMethod === 'Credit Card' && (
            <View style={styles.cardForm}>
                <TextInput 
                  style={styles.input} placeholder="Card Number" keyboardType="number-pad"
                  value={cardInfo.number} onChangeText={(t) => setCardInfo({...cardInfo, number: t})}
                />
                <View style={styles.inputRow}>
                  <TextInput style={[styles.input, { flex: 1, marginRight: 10 }]} placeholder="MM/YY" value={cardInfo.expiry} onChangeText={(t) => setCardInfo({...cardInfo, expiry: t})} />
                  <TextInput style={[styles.input, { flex: 1 }]} placeholder="CVC" keyboardType="number-pad" value={cardInfo.cvc} onChangeText={(t) => setCardInfo({...cardInfo, cvc: t})} />
                </View>
            </View>
          )}
        </View>

        {/* Step 3: Summary */}
        <View style={styles.summaryBox}>
           <Text style={styles.summaryTitle}>Order Summary</Text>
           <View style={styles.summaryRow}><Text style={styles.sLabel}>Subtotal</Text><Text style={styles.sVal}>PKR {itemsPrice.toLocaleString()}</Text></View>
           <View style={styles.summaryRow}><Text style={styles.sLabel}>Shipping</Text><Text style={[styles.sVal, shippingPrice === 0 && { color: theme.colors.success }]}>{shippingPrice === 0 ? 'Free' : `PKR ${shippingPrice.toLocaleString()}`}</Text></View>
           <View style={styles.summaryRow}><Text style={styles.sLabel}>Tax (15%)</Text><Text style={styles.sVal}>PKR {taxPrice.toLocaleString()}</Text></View>
           <View style={styles.divider} />
           {appliedCoupon && (
             <View style={styles.summaryRow}>
               <Text style={[styles.sLabel, { color: theme.colors.success }]}>Discount ({appliedCoupon.discountPercent}%)</Text>
               <Text style={[styles.sVal, { color: theme.colors.success }]}>-PKR {discountAmount.toLocaleString()}</Text>
             </View>
           )}
           <View style={styles.totalRow}><Text style={styles.tLabel}>Total</Text><Text style={styles.tVal}>PKR {totalPrice.toLocaleString()}</Text></View>

           {/* Coupon Code */}
           <View style={styles.couponSection}>
             <Text style={styles.couponTitle}>Have a coupon code?</Text>
             {appliedCoupon ? (
               <View style={styles.couponApplied}>
                 <Text style={styles.couponAppliedText}>✓ Applied: {appliedCoupon.code}</Text>
                 <TouchableOpacity onPress={() => setAppliedCoupon(null)}>
                   <Text style={styles.couponRemoveText}>Remove</Text>
                 </TouchableOpacity>
               </View>
             ) : (
               <>
                 <View style={styles.couponRow}>
                   <TextInput
                     style={styles.couponInput}
                     placeholder="Enter code"
                     value={couponCode}
                     onChangeText={setCouponCode}
                     autoCapitalize="characters"
                   />
                   <TouchableOpacity
                     style={[styles.couponBtn, (!couponCode || applyingCoupon) && { opacity: 0.5 }]}
                     onPress={handleApplyCoupon}
                     disabled={!couponCode || applyingCoupon}
                   >
                     <Text style={styles.couponBtnText}>{applyingCoupon ? '...' : 'Apply'}</Text>
                   </TouchableOpacity>
                 </View>
                 {couponError ? <Text style={styles.couponError}>{couponError}</Text> : null}
               </>
             )}
           </View>
        </View>

        {shippingPrice === 0 && (
          <View style={styles.freeShippingBanner}>
             <Truck size={14} color="#065F46" />
             <Text style={styles.freeShippingText}>You saved PKR 1,500 with free shipping!</Text>
          </View>
        )}
      </ScrollView>

      {/* Footer CTA */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity style={styles.placeOrderBtn} onPress={handlePlaceOrder} disabled={placingOrder}>
          {placingOrder ? <ActivityIndicator color="#fff" /> : (
            <>
              <Text style={styles.placeOrderBtnText}>{paymentMethod === 'Credit Card' ? 'Pay & Place Order' : 'Place Order'}</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Address Selection Modal */}
      <Modal visible={showAddressModal} animationType="slide" transparent={true}>
         <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
               <Text style={styles.modalTitle}>Saved Addresses</Text>
               <ScrollView style={{ marginBottom: 20 }}>
                  {savedAddresses.map(addr => (
                    <TouchableOpacity 
                      key={addr._id} 
                      style={styles.addrCard}
                      onPress={() => {
                        setShippingAddress({ address: addr.address, city: addr.city, postalCode: addr.postalCode, country: addr.country, phone: addr.phone || '' });
                        setShowAddressModal(false);
                      }}
                    >
                      <Text style={styles.addrLabel}>{addr.label}</Text>
                      <Text style={styles.addrText}>{addr.address}, {addr.city}</Text>
                    </TouchableOpacity>
                  ))}
               </ScrollView>
               <TouchableOpacity style={styles.closeBtn} onPress={() => setShowAddressModal(false)}>
                  <Text style={styles.closeBtnText}>Close</Text>
               </TouchableOpacity>
            </View>
         </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg },
  center: { justifyContent: 'center', alignItems: 'center', padding: 32 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: theme.colors.border, backgroundColor: theme.colors.surface },
  backBtn: { padding: 4, marginRight: 12 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: theme.colors.text },
  
  scrollBody: { padding: 16 },
  section: { backgroundColor: theme.colors.surface, borderRadius: theme.radius.xl, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: theme.colors.border, ...theme.shadows.card },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 10 },
  iconWrap: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: theme.colors.text },
  
  savedAddrBtn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: theme.colors.primaryLight, padding: 12, borderRadius: theme.radius.md, marginBottom: 16 },
  savedAddrBtnText: { color: theme.colors.primary, fontWeight: '700', fontSize: 13 },

  input: { backgroundColor: theme.colors.bgAlt, borderRadius: theme.radius.md, padding: 14, fontSize: 15, marginBottom: 12, color: theme.colors.text, borderWidth: 1, borderColor: theme.colors.border },
  inputRow: { flexDirection: 'row' },
  
  checkboxRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  checkbox: { width: 18, height: 18, borderRadius: 4, borderWidth: 2, borderColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center' },
  checkboxActive: { backgroundColor: theme.colors.primary },
  checkboxInner: { width: 8, height: 8, borderRadius: 2, backgroundColor: '#fff' },
  checkboxLabel: { fontSize: 14, color: theme.colors.text, fontWeight: '600' },

  methodRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  methodBtn: { flex: 1, padding: 14, borderRadius: theme.radius.md, borderWidth: 2, borderColor: theme.colors.border, alignItems: 'center' },
  methodBtnActive: { borderColor: theme.colors.primary, backgroundColor: theme.colors.primaryLight },
  methodText: { fontSize: 13, fontWeight: '700', color: theme.colors.textMuted },
  methodTextActive: { color: theme.colors.primary },
  cardForm: { borderTopWidth: 1, borderTopColor: theme.colors.border, paddingTop: 16 },

  summaryBox: { backgroundColor: theme.colors.surface, borderRadius: theme.radius.xl, padding: 20, borderWidth: 1, borderColor: theme.colors.border, ...theme.shadows.card },
  summaryTitle: { fontSize: 16, fontWeight: '800', color: theme.colors.text, marginBottom: 16 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  sLabel: { fontSize: 14, color: theme.colors.textMuted },
  sVal: { fontSize: 14, fontWeight: '600', color: theme.colors.text },
  divider: { height: 1, backgroundColor: theme.colors.border, marginVertical: 8 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  tLabel: { fontSize: 16, fontWeight: '700', color: theme.colors.text },
  tVal: { fontSize: 20, fontWeight: '800', color: theme.colors.primary },
  
  freeShippingBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#ECFDF5', padding: 12, borderRadius: theme.radius.md, marginTop: 16 },
  freeShippingText: { fontSize: 12, color: '#065F46', fontWeight: '700' },

  footer: { padding: 16, backgroundColor: theme.colors.surface, borderTopWidth: 1, borderTopColor: theme.colors.border },
  placeOrderBtn: { backgroundColor: theme.colors.primary, paddingVertical: 18, borderRadius: theme.radius.lg, alignItems: 'center', justifyContent: 'center' },
  placeOrderBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  successCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: theme.colors.successBg, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  successTitle: { fontSize: 28, fontWeight: '800', color: theme.colors.text, marginBottom: 12 },
  successText: { fontSize: 15, color: theme.colors.textMuted, textAlign: 'center', lineHeight: 24, marginBottom: 32 },
  doneBtn: { backgroundColor: theme.colors.text, paddingVertical: 16, paddingHorizontal: 40, borderRadius: theme.radius.lg },
  doneBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: theme.colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '60%' },
  modalTitle: { fontSize: 18, fontWeight: '800', color: theme.colors.text, marginBottom: 20 },
  addrCard: { padding: 16, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  addrLabel: { fontSize: 14, fontWeight: '700', color: theme.colors.text, marginBottom: 4 },
  addrText: { fontSize: 13, color: theme.colors.textMuted },
  closeBtn: { paddingVertical: 16, alignItems: 'center', backgroundColor: theme.colors.bgAlt, borderRadius: theme.radius.md },
  closeBtnText: { fontWeight: '700', color: theme.colors.text },

  // Coupon
  couponSection: { marginTop: 16, borderTopWidth: 1, borderTopColor: theme.colors.border, paddingTop: 16 },
  couponTitle: { fontSize: 13, fontWeight: '700', color: theme.colors.text, marginBottom: 10 },
  couponRow: { flexDirection: 'row', gap: 10 },
  couponInput: { flex: 1, backgroundColor: theme.colors.bgAlt, borderRadius: theme.radius.md, padding: 12, fontSize: 14, color: theme.colors.text, borderWidth: 1, borderColor: theme.colors.border },
  couponBtn: { backgroundColor: theme.colors.text, paddingHorizontal: 16, borderRadius: theme.radius.md, justifyContent: 'center' },
  couponBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  couponError: { fontSize: 12, color: theme.colors.danger, marginTop: 6, fontWeight: '600' },
  couponApplied: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: theme.colors.successBg, padding: 12, borderRadius: theme.radius.md, borderWidth: 1, borderColor: theme.colors.success },
  couponAppliedText: { fontSize: 13, fontWeight: '700', color: theme.colors.success },
  couponRemoveText: { fontSize: 12, color: theme.colors.textMuted, textDecorationLine: 'underline' },
});

export default CheckoutScreen;
