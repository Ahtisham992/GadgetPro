import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Image,
  Modal, TextInput, ActivityIndicator, Alert
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, CheckCircle, Truck, Clock, Package, MapPin, CreditCard, Star, X } from 'lucide-react-native';
import client from '../api/client';
import useUserStore from '../store/userStore';
import { theme } from '../theme/colors';
import { resolveImageUrl } from '../config';

// ─── Review Modal ───────────────────────────────────────
const ReviewModal = ({ item, orderId, onClose, onSuccess }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const ratingLabels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

  const handleSubmit = async () => {
    if (rating === 0) return Alert.alert('Rating Required', 'Please select a star rating');
    if (!comment.trim()) return Alert.alert('Review Required', 'Please write a short review');
    setSubmitting(true);
    try {
      await client.post(`/products/${item.product}/reviews`, { rating, comment, orderId });
      onSuccess();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible animationType="slide" transparent>
      <View style={rm.overlay}>
        <View style={rm.sheet}>
          <View style={rm.sheetHeader}>
            <Text style={rm.sheetTitle}>Write a Review</Text>
            <TouchableOpacity onPress={onClose}><X size={22} color={theme.colors.textMuted} /></TouchableOpacity>
          </View>

          {/* Product */}
          <View style={rm.productRow}>
            <Image
              source={{ uri: resolveImageUrl(item.image) }}
              style={rm.productImg}
            />
            <Text style={rm.productName} numberOfLines={2}>{item.name}</Text>
          </View>

          {/* Stars */}
          <View style={rm.starsRow}>
            {[1,2,3,4,5].map(s => (
              <TouchableOpacity key={s} onPress={() => setRating(s)}>
                <Star size={36} fill={s <= rating ? '#FBBF24' : 'transparent'} color={s <= rating ? '#FBBF24' : theme.colors.border} />
              </TouchableOpacity>
            ))}
          </View>
          <Text style={rm.ratingLabel}>{ratingLabels[rating] || 'Tap to rate'}</Text>

          {/* Comment */}
          <Text style={rm.inputLabel}>Your Review</Text>
          <TextInput
            style={rm.textarea}
            multiline
            numberOfLines={4}
            placeholder="What did you like or dislike?"
            value={comment}
            onChangeText={setComment}
            textAlignVertical="top"
          />

          <View style={rm.btnRow}>
            <TouchableOpacity style={rm.cancelBtn} onPress={onClose}>
              <Text style={rm.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={rm.submitBtn} onPress={handleSubmit} disabled={submitting}>
              {submitting ? <ActivityIndicator color="#fff" /> : <Text style={rm.submitBtnText}>Submit Review</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const rm = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: theme.colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  sheetTitle: { fontSize: 20, fontWeight: '800', color: theme.colors.text },
  productRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: theme.colors.bgAlt, padding: 12, borderRadius: theme.radius.lg, marginBottom: 20 },
  productImg: { width: 48, height: 48, borderRadius: theme.radius.md, backgroundColor: theme.colors.bgAlt },
  productName: { flex: 1, fontSize: 14, fontWeight: '600', color: theme.colors.text },
  starsRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 8 },
  ratingLabel: { textAlign: 'center', fontSize: 14, color: theme.colors.textMuted, fontWeight: '600', marginBottom: 20 },
  inputLabel: { fontSize: 13, fontWeight: '700', color: theme.colors.textMuted, marginBottom: 8 },
  textarea: { backgroundColor: theme.colors.bgAlt, borderRadius: theme.radius.md, borderWidth: 1.5, borderColor: theme.colors.border, padding: 14, fontSize: 15, color: theme.colors.text, marginBottom: 20, minHeight: 100 },
  btnRow: { flexDirection: 'row', gap: 12 },
  cancelBtn: { flex: 1, paddingVertical: 16, borderRadius: theme.radius.lg, alignItems: 'center', borderWidth: 1.5, borderColor: theme.colors.border },
  cancelBtnText: { fontSize: 15, fontWeight: '700', color: theme.colors.text },
  submitBtn: { flex: 1, paddingVertical: 16, borderRadius: theme.radius.lg, alignItems: 'center', backgroundColor: theme.colors.primary },
  submitBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
});

// ─── Main Screen ─────────────────────────────────────────
const OrderDetailScreen = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const { order } = route.params;
  const { userInfo } = useUserStore();

  const [reviewTarget, setReviewTarget] = useState(null);
  const [reviewedProducts, setReviewedProducts] = useState(new Set());

  const getStatusInfo = () => {
    if (order.isDelivered) return { label: 'Delivered', color: '#059669', bg: '#ECFDF5', icon: <CheckCircle size={16} color="#059669" /> };
    if (order.isPaid) return { label: 'Processing / Shipped', color: '#2563EB', bg: '#EFF6FF', icon: <Truck size={16} color="#2563EB" /> };
    return { label: 'Pending Payment', color: '#D97706', bg: '#FFFBEB', icon: <Clock size={16} color="#D97706" /> };
  };

  const status = getStatusInfo();

  const handleReviewSuccess = (productId) => {
    setReviewTarget(null);
    setReviewedProducts(prev => new Set([...prev, productId]));
    Alert.alert('Thank You!', 'Your review has been submitted successfully.');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Order #{order._id.slice(-6).toUpperCase()}</Text>
          <Text style={styles.headerDate}>{new Date(order.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' })}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>

        {/* Status Banner */}
        <View style={[styles.statusBanner, { backgroundColor: status.bg }]}>
          {status.icon}
          <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
        </View>

        {/* Order Items */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Package size={18} color={theme.colors.primary} />
            <Text style={styles.sectionTitle}>Items Ordered</Text>
          </View>
          {order.orderItems.map((item, idx) => (
            <View key={idx} style={styles.itemRow}>
              <Image
                source={{ uri: resolveImageUrl(item.image) }}
                style={styles.itemImage}
              />
              <View style={styles.itemInfo}>
                <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
                <Text style={styles.itemQty}>Qty: {item.qty}</Text>
              </View>
              <Text style={styles.itemPrice}>PKR {(item.price * item.qty).toLocaleString()}</Text>
            </View>
          ))}
        </View>

        {/* Review Section — only for delivered orders */}
        {order.isDelivered && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Star size={18} color={theme.colors.warning} />
              <Text style={styles.sectionTitle}>Rate Your Items</Text>
            </View>
            <Text style={styles.reviewHint}>Share your experience to help other shoppers!</Text>
            {order.orderItems.map((item, idx) => {
              const reviewed = reviewedProducts.has(item.product);
              return (
                <View key={idx} style={[styles.reviewItemRow, reviewed && { borderColor: theme.colors.success }]}>
                  <Image
                    source={{ uri: resolveImageUrl(item.image) }}
                    style={styles.reviewItemImg}
                  />
                  <Text style={styles.reviewItemName} numberOfLines={1}>{item.name}</Text>
                  {reviewed ? (
                    <View style={styles.reviewedBadge}>
                      <CheckCircle size={12} color={theme.colors.success} />
                      <Text style={styles.reviewedText}>Reviewed</Text>
                    </View>
                  ) : (
                    <TouchableOpacity style={styles.writeReviewBtn} onPress={() => setReviewTarget(item)}>
                      <Star size={12} color="#fff" />
                      <Text style={styles.writeReviewText}>Review</Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* Shipping Address */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MapPin size={18} color={theme.colors.primary} />
            <Text style={styles.sectionTitle}>Shipping Address</Text>
          </View>
          <Text style={styles.addrText}>{order.shippingAddress?.address}</Text>
          <Text style={styles.addrText}>{order.shippingAddress?.city}, {order.shippingAddress?.postalCode}</Text>
          <Text style={styles.addrText}>{order.shippingAddress?.country}</Text>
          {order.shippingAddress?.phone && (
            <Text style={[styles.addrText, { color: theme.colors.primary, fontWeight: '700', marginTop: 4 }]}>
              📞 {order.shippingAddress.phone}
            </Text>
          )}
        </View>

        {/* Payment */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <CreditCard size={18} color={theme.colors.primary} />
            <Text style={styles.sectionTitle}>Payment Summary</Text>
          </View>
          <View style={styles.payMethodBadge}>
            <Text style={styles.payMethodText}>{order.paymentMethod}</Text>
          </View>
          <View style={styles.priceRow}><Text style={styles.priceLabel}>Items</Text><Text style={styles.priceVal}>PKR {order.itemsPrice?.toLocaleString()}</Text></View>
          <View style={styles.priceRow}><Text style={styles.priceLabel}>Shipping</Text><Text style={styles.priceVal}>{order.shippingPrice === 0 ? 'Free' : `PKR ${order.shippingPrice?.toLocaleString()}`}</Text></View>
          <View style={styles.priceRow}><Text style={styles.priceLabel}>Tax</Text><Text style={styles.priceVal}>PKR {order.taxPrice?.toLocaleString()}</Text></View>
          <View style={styles.divider} />
          <View style={styles.priceRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalVal}>PKR {order.totalPrice?.toLocaleString()}</Text>
          </View>
        </View>

      </ScrollView>

      {reviewTarget && (
        <ReviewModal
          item={reviewTarget}
          orderId={order._id}
          onClose={() => setReviewTarget(null)}
          onSuccess={() => handleReviewSuccess(reviewTarget.product)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: theme.colors.border, backgroundColor: theme.colors.surface, gap: 12 },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: theme.colors.text },
  headerDate: { fontSize: 13, color: theme.colors.textMuted, marginTop: 2 },
  body: { padding: 16 },
  statusBanner: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 16, borderRadius: theme.radius.xl, marginBottom: 16 },
  statusText: { fontSize: 15, fontWeight: '700' },
  section: { backgroundColor: theme.colors.surface, borderRadius: theme.radius.xl, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: theme.colors.border },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: theme.colors.text },
  itemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.colors.bgAlt },
  itemImage: { width: 56, height: 56, borderRadius: theme.radius.md, backgroundColor: theme.colors.bgAlt },
  itemInfo: { flex: 1, marginHorizontal: 12 },
  itemName: { fontSize: 14, fontWeight: '600', color: theme.colors.text, marginBottom: 4 },
  itemQty: { fontSize: 13, color: theme.colors.textMuted },
  itemPrice: { fontSize: 14, fontWeight: '800', color: theme.colors.primary },
  reviewHint: { fontSize: 13, color: theme.colors.textMuted, marginBottom: 16 },
  reviewItemRow: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: theme.radius.lg, borderWidth: 1.5, borderColor: theme.colors.border, marginBottom: 10, gap: 10 },
  reviewItemImg: { width: 40, height: 40, borderRadius: theme.radius.md, backgroundColor: theme.colors.bgAlt },
  reviewItemName: { flex: 1, fontSize: 13, fontWeight: '600', color: theme.colors.text },
  reviewedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: theme.colors.successBg, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  reviewedText: { fontSize: 11, fontWeight: '700', color: theme.colors.success },
  writeReviewBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: theme.colors.primary, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  writeReviewText: { fontSize: 11, fontWeight: '700', color: '#fff' },
  addrText: { fontSize: 14, color: theme.colors.textMuted, lineHeight: 22 },
  payMethodBadge: { alignSelf: 'flex-start', backgroundColor: theme.colors.primaryLight, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginBottom: 16 },
  payMethodText: { fontSize: 13, fontWeight: '700', color: theme.colors.primary },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  priceLabel: { fontSize: 14, color: theme.colors.textMuted },
  priceVal: { fontSize: 14, fontWeight: '600', color: theme.colors.text },
  divider: { height: 1, backgroundColor: theme.colors.border, marginVertical: 8 },
  totalLabel: { fontSize: 16, fontWeight: '700', color: theme.colors.text },
  totalVal: { fontSize: 18, fontWeight: '800', color: theme.colors.primary },
});

export default OrderDetailScreen;
