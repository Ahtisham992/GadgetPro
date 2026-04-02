import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Image, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Package, ChevronRight, Clock, CheckCircle, Truck, XCircle } from 'lucide-react-native';
import client from '../api/client';
import { theme } from '../theme/colors';

const OrderHistoryScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = async () => {
    try {
      const { data } = await client.get('/orders/mine');
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getStatusBadge = (order) => {
    if (order.isDelivered) return { label: 'Delivered', color: '#059669', bg: '#ECFDF5', icon: <CheckCircle size={12} color="#059669" /> };
    if (order.isPaid) return { label: 'Processing', color: '#2563EB', bg: '#EFF6FF', icon: <Truck size={12} color="#2563EB" /> };
    return { label: 'Pending', color: '#D97706', bg: '#FFFBEB', icon: <Clock size={12} color="#D97706" /> };
  };

  const renderOrderItem = ({ item }) => {
    const status = getStatusBadge(item);
    return (
      <TouchableOpacity style={styles.orderCard} onPress={() => navigation.navigate('OrderDetail', { order: item })}>
        <View style={styles.orderHeader}>
          <View style={styles.orderInfo}>
            <Text style={styles.orderId}>Order #{item._id.slice(-6).toUpperCase()}</Text>
            <Text style={styles.orderDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
             {status.icon}
             <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
          </View>
        </View>

        <View style={styles.orderDetail}>
           <Text style={styles.itemsCount}>{item.orderItems.length} {item.orderItems.length === 1 ? 'item' : 'items'}</Text>
           <Text style={styles.orderTotal}>PKR {item.totalPrice.toLocaleString()}</Text>
        </View>

        <View style={styles.orderFooter}>
           <Text style={styles.viewDetails}>View Details</Text>
           <ChevronRight size={16} color={theme.colors.textMuted} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Orders</Text>
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={theme.colors.primary} /></View>
      ) : orders.length === 0 ? (
        <View style={styles.center}>
           <View style={styles.emptyIcon}><Package size={40} color={theme.colors.textLight} /></View>
           <Text style={styles.emptyTitle}>No orders yet</Text>
           <Text style={styles.emptySubtitle}>When you buy gadgets, your history will appear here.</Text>
           <TouchableOpacity style={styles.shopBtn} onPress={() => navigation.navigate('Root')}>
              <Text style={styles.shopBtnText}>Start Shopping</Text>
           </TouchableOpacity>
        </View>
      ) : (
        <FlatList 
          data={orders}
          keyExtractor={(item) => item._id}
          renderItem={renderOrderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchOrders(); }} colors={[theme.colors.primary]} />}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: theme.colors.border, backgroundColor: theme.colors.surface },
  backBtn: { padding: 4, marginRight: 12 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: theme.colors.text },

  list: { padding: 16 },
  orderCard: { backgroundColor: theme.colors.surface, borderRadius: theme.radius.xl, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: theme.colors.border, ...theme.shadows.card },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  orderInfo: { gap: 4 },
  orderId: { fontSize: 16, fontWeight: '800', color: theme.colors.text },
  orderDate: { fontSize: 13, color: theme.colors.textMuted },
  
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  statusText: { fontSize: 12, fontWeight: '700' },

  orderDetail: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderTopWidth: 1, borderTopColor: theme.colors.bgAlt, borderBottomWidth: 1, borderBottomColor: theme.colors.bgAlt },
  itemsCount: { fontSize: 14, color: theme.colors.textMuted, fontWeight: '500' },
  orderTotal: { fontSize: 16, fontWeight: '800', color: theme.colors.primary },

  orderFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  viewDetails: { fontSize: 13, fontWeight: '700', color: theme.colors.textMuted },

  emptyIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: theme.colors.surface, alignItems: 'center', justifyContent: 'center', marginBottom: 24, ...theme.shadows.card },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: theme.colors.text, marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: theme.colors.textMuted, textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  shopBtn: { backgroundColor: theme.colors.primary, paddingVertical: 14, paddingHorizontal: 32, borderRadius: theme.radius.lg },
  shopBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 }
});

export default OrderHistoryScreen;
