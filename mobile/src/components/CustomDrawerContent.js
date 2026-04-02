import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import useUserStore from '../store/userStore';
import { theme } from '../theme/colors';
import { Package, User, LogOut, Heart, Smartphone, MonitorSmartphone, Headphones } from 'lucide-react-native';

const CATEGORIES = [
  { name: 'Smartphones', icon: <Smartphone size={20} color={theme.colors.textMuted} /> },
  { name: 'Laptops', icon: <MonitorSmartphone size={20} color={theme.colors.textMuted} /> },
  { name: 'Audio', icon: <Headphones size={20} color={theme.colors.textMuted} /> },
  { name: 'Wearables', icon: <Package size={20} color={theme.colors.textMuted} /> },
  { name: 'Accessories', icon: <Package size={20} color={theme.colors.textMuted} /> }
];

const CustomDrawerContent = (props) => {
  const { userInfo, logout } = useUserStore();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.surface }}>
      {/* Header Logo */}
      <View style={styles.header}>
        <Text style={styles.logoText}>Gadget<Text style={{ color: theme.colors.primary }}>Pro</Text></Text>
      </View>

      <DrawerContentScrollView {...props} showsVerticalScrollIndicator={false}>
        {/* Categories Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CATEGORIES</Text>
          {CATEGORIES.map((cat, idx) => (
             <TouchableOpacity 
                key={idx} 
                style={styles.drawerItem}
                onPress={() => {
                  props.navigation.closeDrawer();
                  props.navigation.navigate('Category', { category: cat.name });
                }}
             >
                <View style={styles.iconWrap}>{cat.icon}</View>
                <Text style={styles.itemText}>{cat.name}</Text>
             </TouchableOpacity>
          ))}
        </View>

      </DrawerContentScrollView>

      {/* Footer User Section */}
      <View style={styles.footer}>
        {userInfo ? (
          <>
            <View style={styles.userInfoBlock}>
              <View style={styles.avatarWrap}>
                <Text style={styles.avatarText}>{userInfo.name.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={styles.userDetails}>
                <Text style={styles.userName} numberOfLines={1}>{userInfo.name}</Text>
                <Text style={styles.userEmail} numberOfLines={1}>{userInfo.email}</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.footerItem} onPress={() => {
               props.navigation.navigate('Tabs', { screen: 'Profile' });
               props.navigation.closeDrawer();
            }}>
               <User size={18} color={theme.colors.text} />
               <Text style={styles.footerItemText}>My Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.footerItem, { marginTop: 8 }]} onPress={() => { logout(); props.navigation.closeDrawer(); }}>
               <LogOut size={18} color={theme.colors.danger} />
               <Text style={[styles.footerItemText, { color: theme.colors.danger }]}>Sign Out</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={{ gap: 12 }}>
            <TouchableOpacity style={styles.btnPrimary} onPress={() => { 
              props.navigation.navigate('Tabs', { screen: 'Profile' }); 
              props.navigation.closeDrawer(); 
            }}>
               <Text style={styles.btnPrimaryText}>Sign In / Register</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: { padding: 20, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  logoText: { fontSize: 24, fontWeight: '800', color: theme.colors.text },
  
  section: { padding: 16 },
  sectionTitle: { fontSize: 11, fontWeight: '700', color: theme.colors.textLight, letterSpacing: 1.5, marginBottom: 12 },
  drawerItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.colors.bgAlt },
  iconWrap: { width: 32, alignItems: 'center' },
  itemText: { fontSize: 15, fontWeight: '500', color: theme.colors.text },
  
  footer: { padding: 20, borderTopWidth: 1, borderTopColor: theme.colors.border },
  userInfoBlock: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.bgAlt, padding: 12, borderRadius: theme.radius.lg, marginBottom: 16 },
  avatarWrap: { width: 36, height: 36, borderRadius: 18, backgroundColor: theme.colors.primary, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  userDetails: { marginLeft: 12, flex: 1 },
  userName: { fontSize: 14, fontWeight: 'bold', color: theme.colors.text },
  userEmail: { fontSize: 12, color: theme.colors.textMuted },
  footerItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: 12 },
  footerItemText: { fontSize: 15, fontWeight: '500', color: theme.colors.text },
  
  btnPrimary: { backgroundColor: theme.colors.primary, paddingVertical: 14, borderRadius: theme.radius.md, alignItems: 'center' },
  btnPrimaryText: { color: '#fff', fontSize: 15, fontWeight: '700' }
});

export default CustomDrawerContent;
