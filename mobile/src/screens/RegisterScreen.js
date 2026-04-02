import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import useUserStore from '../store/userStore';
import { theme } from '../theme/colors';
import { Eye, EyeOff, ArrowLeft, ShieldCheck } from 'lucide-react-native';
import client from '../api/client';

const RegisterScreen = ({ navigation }) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const { login } = useUserStore();

  const handleRegisterStep1 = async () => {
    setError(null);
    if (!name || !email || !password) return setError('All fields required');
    if (password !== confirmPassword) return setError('Passwords do not match');
    if (password.length < 6) return setError('Password must be at least 6 characters');

    setLoading(true);
    try {
      const { data } = await client.post('/users', { name, email, password });
      setSuccess('A 6-digit verification code has been sent to your inbox!');
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyStep2 = async () => {
    setError(null);
    if (otp.length !== 6) return setError('Please enter the full 6-digit code');

    setLoading(true);
    try {
      const { data } = await client.post('/users/verify-otp', { email, otp });
      // Proceed to login
      await login(email, password); 
      // Navigate to the Profile tab inside the Tabs navigator
      navigation.reset({
        index: 0,
        routes: [{ name: 'Root', params: { screen: 'Tabs', params: { screen: 'Profile' } } }],
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll}>
           
           {step === 1 ? (
              <View>
                  <View style={styles.header}>
                    <Text style={styles.authTitle}>Create account</Text>
                    <Text style={styles.authSubtitle}>Start shopping in under 2 minutes</Text>
                  </View>
                  
                  {error && <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View>}

                  <View style={styles.formGroup}>
                      <View style={styles.inputWrap}>
                          <Text style={styles.label}>Full Name</Text>
                          <TextInput 
                            style={styles.input} placeholder="John Smith" 
                            onChangeText={setName} value={name}
                          />
                      </View>
                      <View style={styles.inputWrap}>
                          <Text style={styles.label}>Email Address</Text>
                          <TextInput 
                            style={styles.input} placeholder="you@example.com" autoCapitalize="none" keyboardType="email-address"
                            onChangeText={setEmail} value={email}
                          />
                      </View>

                      <View style={styles.inputWrap}>
                          <Text style={styles.label}>Password</Text>
                          <View style={styles.pwdWrapper}>
                             <TextInput 
                               style={[styles.input, { flex: 1, borderWidth: 0 }]} placeholder="Min 6 characters" 
                               secureTextEntry={!showPassword} onChangeText={setPassword} value={password}
                             />
                             <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPassword(!showPassword)}>
                                 {showPassword ? <EyeOff size={20} color={theme.colors.textMuted}/> : <Eye size={20} color={theme.colors.textMuted}/>}
                             </TouchableOpacity>
                          </View>
                      </View>
                      
                      <View style={styles.inputWrap}>
                          <Text style={styles.label}>Confirm Password</Text>
                          <TextInput 
                            style={styles.input} placeholder="••••••••" secureTextEntry={!showPassword} 
                            onChangeText={setConfirmPassword} value={confirmPassword}
                          />
                      </View>

                      <TouchableOpacity style={styles.submitBtn} onPress={handleRegisterStep1} disabled={loading}>
                        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Continue</Text>}
                      </TouchableOpacity>
                  </View>

                  <View style={styles.authFooter}>
                      <Text style={styles.footerText}>Already have an account?</Text>
                      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                          <Text style={styles.footerLink}>Sign In</Text>
                      </TouchableOpacity>
                  </View>
              </View>
           ) : (
              <View style={styles.verifyContainer}>
                  <TouchableOpacity style={styles.backBtn} onPress={() => setStep(1)}>
                     <ArrowLeft size={16} color={theme.colors.textMuted} />
                     <Text style={styles.backBtnText}>Back to Edit Info</Text>
                  </TouchableOpacity>

                  <View style={styles.shieldWrap}>
                     <ShieldCheck size={32} color={theme.colors.primary} />
                  </View>
                  <Text style={styles.verifyTitle}>Verify your email</Text>
                  <Text style={styles.verifySubtitle}>We sent a 6-digit code to {email}</Text>

                  {error && <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View>}
                  {success && <View style={styles.successBox}><Text style={styles.successText}>{success}</Text></View>}

                  <View style={styles.inputWrap}>
                     <Text style={[styles.label, { textAlign: 'center' }]}>Verification code</Text>
                     <TextInput 
                       style={styles.otpInput} 
                       keyboardType="number-pad"
                       maxLength={6}
                       placeholder="123456"
                       onChangeText={setOtp}
                       value={otp}
                     />
                  </View>

                  <TouchableOpacity style={[styles.submitBtn, otp.length !== 6 && styles.submitBtnDisabled]} onPress={handleVerifyStep2} disabled={loading || otp.length !== 6}>
                     {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Verify & Create Account</Text>}
                  </TouchableOpacity>
              </View>
           )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.surface },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  
  header: { marginBottom: 32 },
  authTitle: { fontSize: 32, fontWeight: '800', color: theme.colors.text, letterSpacing: -1, marginBottom: 8 },
  authSubtitle: { fontSize: 16, color: theme.colors.textMuted },
  
  errorBox: { backgroundColor: theme.colors.dangerBg, padding: 16, borderRadius: theme.radius.md, marginBottom: 24 },
  errorText: { color: theme.colors.danger, fontWeight: '600', fontSize: 14, textAlign: 'center' },
  successBox: { backgroundColor: theme.colors.successBg, padding: 16, borderRadius: theme.radius.md, marginBottom: 24 },
  successText: { color: theme.colors.success, fontWeight: '600', fontSize: 14, textAlign: 'center' },
  
  formGroup: { marginBottom: 24 },
  inputWrap: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: theme.colors.text, marginBottom: 8 },
  input: { backgroundColor: theme.colors.surface, borderWidth: 1.5, borderColor: theme.colors.border, borderRadius: theme.radius.md, padding: 16, fontSize: 16, color: theme.colors.text },
  pwdWrapper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: theme.colors.border, borderRadius: theme.radius.md, backgroundColor: theme.colors.surface },
  eyeBtn: { padding: 16 },

  submitBtn: { backgroundColor: theme.colors.primary, paddingVertical: 18, borderRadius: theme.radius.lg, alignItems: 'center', marginTop: 12 },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  
  authFooter: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 12, gap: 6 },
  footerText: { color: theme.colors.textMuted, fontSize: 14 },
  footerLink: { color: theme.colors.primary, fontSize: 14, fontWeight: '700' },

  // Verification Step
  verifyContainer: { flex: 1, justifyContent: 'center' },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 32, alignSelf: 'flex-start' },
  backBtnText: { color: theme.colors.textMuted, fontSize: 14, fontWeight: '600' },
  shieldWrap: { width: 64, height: 64, borderRadius: 16, backgroundColor: theme.colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  verifyTitle: { fontSize: 24, fontWeight: '800', color: theme.colors.text, marginBottom: 8 },
  verifySubtitle: { fontSize: 15, color: theme.colors.textMuted, marginBottom: 32 },
  otpInput: { backgroundColor: theme.colors.bgAlt, borderWidth: 1.5, borderColor: theme.colors.border, borderRadius: theme.radius.md, padding: 16, fontSize: 28, color: theme.colors.text, textAlign: 'center', letterSpacing: 8, fontWeight: '800' }
});

export default RegisterScreen;
