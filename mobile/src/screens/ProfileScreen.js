import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import useUserStore from '../store/userStore';
import { theme } from '../theme/colors';
import { User, LogOut, Package, ChevronRight, UserCircle2, MapPin } from 'lucide-react-native';

const ProfileScreen = ({ navigation }) => {
  const { userInfo, logout } = useUserStore();

  if (userInfo) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={{ padding: 24 }} showsVerticalScrollIndicator={false}>
          <Text style={styles.headerTitle}>My Account</Text>
          
          <View style={styles.profileCard}>
              <View style={styles.avatarWrap}>
                  <Text style={styles.avatarLetter}>{userInfo.name.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={styles.profileInfo}>
                  <Text style={styles.userName}>{userInfo.name}</Text>
                  <Text style={styles.userEmail}>{userInfo.email}</Text>
                  {userInfo.isAdmin && (
                      <View style={styles.adminBadge}><Text style={styles.adminBadgeText}>Admin</Text></View>
                  )}
              </View>
          </View>

          <Text style={styles.sectionTitle}>Account Settings</Text>

          <View style={styles.menuGroup}>
             <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('PersonalInfo')}>
                 <View style={styles.menuIconWrap}><User color={theme.colors.text} size={20} /></View>
                 <Text style={styles.menuText}>Personal Information</Text>
                 <ChevronRight color={theme.colors.textMuted} size={18} />
             </TouchableOpacity>
             <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('OrderHistory')}>
                 <View style={styles.menuIconWrap}><Package color={theme.colors.text} size={20} /></View>
                 <Text style={styles.menuText}>Order History</Text>
                 <ChevronRight color={theme.colors.textMuted} size={18} />
             </TouchableOpacity>
             <TouchableOpacity style={[styles.menuItem, { borderBottomWidth: 0 }]} onPress={() => navigation.navigate('Addresses')}>
                 <View style={styles.menuIconWrap}><MapPin color={theme.colors.text} size={20} /></View>
                 <Text style={styles.menuText}>Shipping Addresses</Text>
                 <ChevronRight color={theme.colors.textMuted} size={18} />
             </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
              <LogOut color={theme.colors.danger} size={20} />
              <Text style={styles.logoutBtnText}>Log Out</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.unauthContainer}>
        <UserCircle2 size={80} color={theme.colors.textLight} strokeWidth={1.5} />
        <Text style={styles.unauthTitle}>Join GadgetPro</Text>
        <Text style={styles.unauthSubtitle}>Sign in to track orders, manage your wishlist, and get exclusive tech deals.</Text>
        
        <TouchableOpacity style={styles.signInBtn} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.signInBtnText}>Sign In to Your Account</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.myOrdersBtn} onPress={() => navigation.navigate('Login')}>
          <Package size={16} color={theme.colors.primary} />
          <Text style={styles.myOrdersBtnText}>View My Orders</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.signUpBtn} onPress={() => navigation.navigate('Register')}>
          <Text style={styles.signUpBtnText}>New here? Create an account</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg },
  headerTitle: { fontSize: 28, fontWeight: '800', color: theme.colors.text, marginBottom: 24, paddingHorizontal: 4 },
  profileCard: { backgroundColor: theme.colors.surface, flexDirection: 'row', alignItems: 'center', padding: 20, borderRadius: theme.radius.xl, marginBottom: 32, ...theme.shadows.card, borderWidth: 1, borderColor: theme.colors.border },
  avatarWrap: { width: 64, height: 64, borderRadius: 32, backgroundColor: theme.colors.primaryLight, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  avatarLetter: { fontSize: 24, fontWeight: '800', color: theme.colors.primary },
  profileInfo: { flex: 1 },
  userName: { fontSize: 18, fontWeight: 'bold', color: theme.colors.text },
  userEmail: { fontSize: 14, color: theme.colors.textMuted, marginTop: 4 },
  adminBadge: { alignSelf: 'flex-start', backgroundColor: theme.colors.successBg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginTop: 8 },
  adminBadgeText: { color: theme.colors.success, fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: theme.colors.text, marginBottom: 12, paddingHorizontal: 4 },
  menuGroup: { backgroundColor: theme.colors.surface, borderRadius: theme.radius.xl, borderWidth: 1, borderColor: theme.colors.border, marginBottom: 32 },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: theme.colors.bgAlt },
  menuIconWrap: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.colors.bgAlt, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  menuText: { flex: 1, fontSize: 15, fontWeight: '600', color: theme.colors.text },
  logoutBtn: { flexDirection: 'row', backgroundColor: theme.colors.dangerBg, padding: 16, borderRadius: theme.radius.lg, justifyContent: 'center', alignItems: 'center', gap: 8 },
  logoutBtnText: { color: theme.colors.danger, fontSize: 16, fontWeight: '700' },
  unauthContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  unauthTitle: { fontSize: 24, fontWeight: '800', color: theme.colors.text, marginTop: 24, marginBottom: 12 },
  unauthSubtitle: { fontSize: 15, color: theme.colors.textMuted, textAlign: 'center', lineHeight: 22, marginBottom: 40 },
  signInBtn: { backgroundColor: theme.colors.primary, width: '100%', paddingVertical: 18, borderRadius: theme.radius.lg, alignItems: 'center', ...theme.shadows.button },
  signInBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  myOrdersBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, width: '100%', paddingVertical: 16, borderRadius: theme.radius.lg, justifyContent: 'center', borderWidth: 1.5, borderColor: theme.colors.primary, marginTop: 12 },
  myOrdersBtnText: { color: theme.colors.primary, fontSize: 15, fontWeight: '700' },
  signUpBtn: { width: '100%', paddingVertical: 18, alignItems: 'center', marginTop: 4 },
  signUpBtnText: { color: theme.colors.primary, fontSize: 15, fontWeight: '700' },
});

export default ProfileScreen;
