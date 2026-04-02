import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { theme } from '../theme/colors';
import { resolveImageUrl } from '../config';

// Get screen width to calculate card sizes for grid
const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // 2 columns with 16px padding everywhere

const ProductCard = ({ product, onPress }) => {
  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.imageWrap}>
        <Image 
          source={{ uri: resolveImageUrl(product.image) }} 
          style={styles.image} 
          resizeMode="contain" 
        />
      </View>
      
      <View style={styles.body}>
        <Text style={styles.brand}>{product.brand}</Text>
        <Text style={styles.title} numberOfLines={2}>{product.name}</Text>
        
        <View style={styles.footer}>
          <Text style={styles.price}>PKR {product.price?.toLocaleString()}</Text>
          <View style={styles.ratingBadge}>
            <Text style={styles.ratingText}>★ {product.rating?.toFixed(1) || '0.0'}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 16,
    overflow: 'hidden',
    ...theme.shadows.card,
  },
  imageWrap: {
    width: '100%',
    height: CARD_WIDTH, // Aspect ratio 1:1 mimicking web
    backgroundColor: theme.colors.bgAlt,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  body: {
    padding: 14,
  },
  brand: {
    fontSize: 10,
    fontWeight: '600',
    color: theme.colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text,
    lineHeight: 18,
    marginBottom: 8,
    height: 36, // Force max 2 lines height mathematically
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  price: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.bgAlt,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: theme.radius.sm,
  },
  ratingText: {
    fontSize: 10,
    color: theme.colors.textMuted,
    fontWeight: '600',
  }
});

export default ProductCard;
