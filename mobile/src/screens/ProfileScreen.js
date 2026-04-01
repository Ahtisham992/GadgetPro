import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import useUserStore from '../store/userStore';
import { theme } from '../theme/colors';
import { User, LogOut, Package, CreditCard, ChevronRight } from 'lucide-react-native';

const ProfileScreen = () => {
  const { userInfo, login, register, logout } = useUserStore();
  
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAuth = async () => {
    setLoading(true);
    setError(null);
    let result;
    if (isRegister) {
       if (!name || !email || !password) { setError('All fields required'); setLoading(false); return; }
       result = await register(name, email, password);
    } else {
       if (!email || !password) { setError('Email and password required'); setLoading(false); return; }
       result = await login(email, password);
    }
    
    if (!result.success) setError(result.error);
    setLoading(false);
  };

  const toggleMode = () => {
    setIsRegister(!isRegister);
    setError(null);
  };

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
             <TouchableOpacity style={styles.menuItem}>
                 <View style={styles.menuIconWrap}><User color={theme.colors.text} size={20} /></View>
                 <Text style={styles.menuText}>Personal Information</Text>
                 <ChevronRight color={theme.colors.textMuted} size={18} />
             </TouchableOpacity>
             <TouchableOpacity style={styles.menuItem}>
                 <View style={styles.menuIconWrap}><Package color={theme.colors.text} size={20} /></View>
                 <Text style={styles.menuText}>Order History</Text>
                 <ChevronRight color={theme.colors.textMuted} size={18} />
             </TouchableOpacity>
             <TouchableOpacity style={[styles.menuItem, { borderBottomWidth: 0 }]}>
                 <View style={styles.menuIconWrap}><CreditCard color={theme.colors.text} size={20} /></View>
                 <Text style={styles.menuText}>Payment Methods</Text>
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
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.authScroll}>
           <Text style={styles.authTag}>GadgetPro</Text>
           <Text style={styles.authTitle}>{isRegister ? 'Create Account' : 'Welcome Back'}</Text>
           <Text style={styles.authSubtitle}>{isRegister ? 'Sign up to shop premium gadgets.' : 'Sign in to access your dashboard.'}</Text>
           
           {error && <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View>}

           <View style={styles.formGroup}>
              {isRegister && (
                 <View style={styles.inputWrap}>
                    <Text style={styles.label}>Full Name</Text>
                    <TextInput 
                      style={styles.input} 
                      placeholder="John Doe" 
                      placeholderTextColor={theme.colors.textLight}
                      onChangeText={setName} 
                      value={name}
                    />
                 </View>
              )}
              
              <View style={styles.inputWrap}>
                  <Text style={styles.label}>Email Address</Text>
                  <TextInput 
                    style={styles.input} 
                    placeholder="name@example.com" 
                    placeholderTextColor={theme.colors.textLight}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    onChangeText={setEmail} 
                    value={email}
                  />
              </View>

              <View style={styles.inputWrap}>
                  <Text style={styles.label}>Password</Text>
                  <TextInput 
                    style={styles.input} 
                    placeholder="••••••••" 
                    placeholderTextColor={theme.colors.textLight}
                    secureTextEntry 
                    onChangeText={setPassword} 
                    value={password}
                  />
              </View>

              <TouchableOpacity style={styles.submitBtn} onPress={handleAuth} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>{isRegister ? 'Sign Up' : 'Sign In'}</Text>}
              </TouchableOpacity>
           </View>

           <View style={styles.authFooter}>
               <Text style={styles.footerText}>{isRegister ? 'Already have an account?' : 'New to GadgetPro?'}</Text>
               <TouchableOpacity onPress={toggleMode}>
                   <Text style={styles.footerLink}>{isRegister ? 'Sign In' : 'Create Account'}</Text>
               </TouchableOpacity>
           </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg },
  
  // Authenticated State Profile
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
  
  // Auth Form State
  authScroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  authTag: { fontSize: 14, color: theme.colors.primary, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
  authTitle: { fontSize: 36, fontWeight: '800', color: theme.colors.text, letterSpacing: -1, marginBottom: 8 },
  authSubtitle: { fontSize: 16, color: theme.colors.textMuted, marginBottom: 32 },
  
  errorBox: { backgroundColor: theme.colors.dangerBg, padding: 16, borderRadius: theme.radius.md, marginBottom: 24 },
  errorText: { color: theme.colors.danger, fontWeight: '600', textAlign: 'center' },
  
  formGroup: { marginBottom: 32 },
  inputWrap: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: theme.colors.text, marginBottom: 8 },
  input: { backgroundColor: theme.colors.surface, borderWidth: 1.5, borderColor: theme.colors.border, borderRadius: theme.radius.md, padding: 16, fontSize: 16, color: theme.colors.text },
  
  submitBtn: { backgroundColor: theme.colors.primary, paddingVertical: 18, borderRadius: theme.radius.lg, alignItems: 'center', marginTop: 12, ...theme.shadows.button },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  
  authFooter: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 },
  footerText: { color: theme.colors.textMuted, fontSize: 15 },
  footerLink: { color: theme.colors.primary, fontSize: 15, fontWeight: '700' }
});

export default ProfileScreen;
