import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Modal, Alert } from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import useUserStore from '../store/userStore';
import { theme } from '../theme/colors';
import { Eye, EyeOff } from 'lucide-react-native';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Forgot Password state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);

  const { login } = useUserStore();

  useEffect(() => {
    // Note: User needs to configure VITE_GOOGLE_CLIENT_ID in an env plugin, 
    // but we setup the exact wrapper here for the Google API functionality.
    GoogleSignin.configure({
      webClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com', 
      offlineAccess: true,
    });
  }, []);

  const submitHandler = async () => {
    setLoading(true);
    setError(null);
    if (!email || !password) { setError('Email and password required'); setLoading(false); return; }
    
    const result = await login(email, password);
    if (!result.success) {
      setError(result.error);
    } else {
      // Navigate to the main app (Root contains the Drawer and Tabs)
      navigation.reset({
        index: 0,
        routes: [{ name: 'Root' }],
      });
    }
    setLoading(false);
  };

  const handleForgotPassword = async () => {
    if (!forgotEmail.trim()) return Alert.alert('Email Required', 'Please enter your email address');
    setForgotLoading(true);
    try {
      await import('../api/client').then(({ default: c }) => c.post('/users/forgot-password', { email: forgotEmail }));
      setForgotSuccess(true);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Could not send reset email');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      // Normally, extract ID token and send to backend /api/users/google
      // For now, this mimics the exact frontend structure.
      console.log('Google Auth Payload:', userInfo);
    } catch (err) {
      setError('Google Sign-In failed or cancelled.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll}>
           
           <View style={styles.header}>
              <Text style={styles.authTitle}>Welcome back</Text>
              <Text style={styles.authSubtitle}>Sign in to your GadgetPro account</Text>
           </View>
           
           {error && <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View>}

           <View style={styles.formGroup}>
              <View style={styles.inputWrap}>
                  <Text style={styles.label}>Email address</Text>
                  <TextInput 
                    style={styles.input} 
                    placeholder="you@example.com" 
                    placeholderTextColor={theme.colors.textLight}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    onChangeText={setEmail} 
                    value={email}
                  />
              </View>

              <View style={styles.inputWrap}>
                  <View style={styles.labelRow}>
                      <Text style={styles.label}>Password</Text>
                      <TouchableOpacity onPress={() => { setShowForgotModal(true); setForgotSuccess(false); setForgotEmail(''); }}>
                        <Text style={styles.forgotText}>Forgot password?</Text>
                      </TouchableOpacity>
                  </View>
                  <View style={styles.pwdWrapper}>
                     <TextInput 
                       style={[styles.input, { flex: 1, borderWidth: 0 }]} 
                       placeholder="••••••••" 
                       placeholderTextColor={theme.colors.textLight}
                       secureTextEntry={!showPassword} 
                       onChangeText={setPassword} 
                       value={password}
                     />
                     <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPassword(!showPassword)}>
                         {showPassword ? <EyeOff size={20} color={theme.colors.textMuted}/> : <Eye size={20} color={theme.colors.textMuted}/>}
                     </TouchableOpacity>
                  </View>
              </View>

              <TouchableOpacity style={styles.submitBtn} onPress={submitHandler} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Sign In</Text>}
              </TouchableOpacity>
           </View>

           {/* Google Auth Exact Implementation logic structure */}
           <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or continue with</Text>
              <View style={styles.dividerLine} />
           </View>

           <TouchableOpacity style={styles.googleBtn} onPress={handleGoogleLogin}>
              <Text style={styles.googleBtnIcon}>G</Text>
              <Text style={styles.googleBtnText}>Sign in with Google</Text>
           </TouchableOpacity>

           <View style={styles.authFooter}>
               <Text style={styles.footerText}>Don't have an account?</Text>
               <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                   <Text style={styles.footerLink}>Create one free</Text>
               </TouchableOpacity>
           </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Forgot Password Modal */}
      <Modal visible={showForgotModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Reset Password</Text>
            {forgotSuccess ? (
              <>
                <View style={styles.successIcon}><Text style={{ fontSize: 32 }}>📧</Text></View>
                <Text style={styles.modalSuccess}>Reset link sent! Check your email inbox.</Text>
                <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setShowForgotModal(false)}>
                  <Text style={styles.modalCloseBtnText}>Done</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.modalSubtitle}>Enter your email and we'll send you a reset link.</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="you@example.com"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={forgotEmail}
                  onChangeText={setForgotEmail}
                />
                <TouchableOpacity style={styles.modalBtn} onPress={handleForgotPassword} disabled={forgotLoading}>
                  {forgotLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.modalBtnText}>Send Reset Link</Text>}
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowForgotModal(false)}>
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.surface },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  
  header: { marginBottom: 32 },
  authTitle: { fontSize: 32, fontWeight: '800', color: theme.colors.text, letterSpacing: -1, marginBottom: 8 },
  authSubtitle: { fontSize: 16, color: theme.colors.textMuted },
  
  errorBox: { backgroundColor: theme.colors.dangerBg, padding: 16, borderRadius: theme.radius.md, marginBottom: 24, borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)' },
  errorText: { color: theme.colors.danger, fontWeight: '600', fontSize: 14 },
  
  formGroup: { marginBottom: 24 },
  inputWrap: { marginBottom: 20 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  label: { fontSize: 14, fontWeight: '600', color: theme.colors.text, marginBottom: 8 },
  forgotText: { fontSize: 13, fontWeight: '700', color: theme.colors.primary },
  input: { backgroundColor: theme.colors.surface, borderWidth: 1.5, borderColor: theme.colors.border, borderRadius: theme.radius.md, padding: 16, fontSize: 16, color: theme.colors.text },
  pwdWrapper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: theme.colors.border, borderRadius: theme.radius.md, backgroundColor: theme.colors.surface },
  eyeBtn: { padding: 16 },

  submitBtn: { backgroundColor: theme.colors.primary, paddingVertical: 18, borderRadius: theme.radius.lg, alignItems: 'center', marginTop: 12 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 24 },
  dividerLine: { flex: 1, height: 1, backgroundColor: theme.colors.border },
  dividerText: { marginHorizontal: 12, fontSize: 13, color: theme.colors.textMuted, fontWeight: '500' },
  
  googleBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: theme.radius.md, borderWidth: 1.5, borderColor: theme.colors.border, backgroundColor: theme.colors.surface },
  googleBtnIcon: { fontSize: 20, fontWeight: '800', color: '#4285F4', marginRight: 12 },
  googleBtnText: { fontSize: 15, fontWeight: '700', color: theme.colors.text },

  authFooter: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 32, gap: 6 },
  footerText: { color: theme.colors.textMuted, fontSize: 14 },
  footerLink: { color: theme.colors.primary, fontSize: 14, fontWeight: '700' },

  // Forgot Password Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: theme.colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 28 },
  modalTitle: { fontSize: 22, fontWeight: '800', color: theme.colors.text, marginBottom: 8 },
  modalSubtitle: { fontSize: 14, color: theme.colors.textMuted, marginBottom: 20, lineHeight: 22 },
  modalInput: { backgroundColor: theme.colors.bgAlt, borderRadius: theme.radius.md, borderWidth: 1.5, borderColor: theme.colors.border, padding: 16, fontSize: 16, color: theme.colors.text, marginBottom: 16 },
  modalBtn: { backgroundColor: theme.colors.primary, paddingVertical: 16, borderRadius: theme.radius.lg, alignItems: 'center', marginBottom: 12 },
  modalBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  modalCancelBtn: { paddingVertical: 12, alignItems: 'center' },
  modalCancelText: { color: theme.colors.textMuted, fontSize: 15, fontWeight: '600' },
  successIcon: { alignItems: 'center', marginVertical: 20 },
  modalSuccess: { fontSize: 15, color: theme.colors.success, fontWeight: '600', textAlign: 'center', marginBottom: 24 },
  modalCloseBtn: { backgroundColor: theme.colors.text, paddingVertical: 16, borderRadius: theme.radius.lg, alignItems: 'center' },
  modalCloseBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

export default LoginScreen;
