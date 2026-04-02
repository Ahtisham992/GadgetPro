import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Eye, EyeOff, Lock, User, CheckCircle } from 'lucide-react-native';
import client from '../api/client';
import useUserStore from '../store/userStore';
import { theme } from '../theme/colors';

const PersonalInfoScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { userInfo, updateUserInfo } = useUserStore();

  // Personal Info state
  const [name, setName] = useState(userInfo?.name || '');
  const [email] = useState(userInfo?.email || ''); // email is read-only
  const [savingInfo, setSavingInfo] = useState(false);

  // Change Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);

  const strengthChecks = [
    { label: 'At least 8 characters', pass: newPassword.length >= 8 },
    { label: 'Contains a number', pass: /\d/.test(newPassword) },
    { label: 'Contains uppercase', pass: /[A-Z]/.test(newPassword) },
  ];
  const strengthScore = strengthChecks.filter(c => c.pass).length;
  const strengthColor = ['#EF4444', '#F59E0B', '#10B981'][strengthScore - 1] || theme.colors.border;

  const handleSaveInfo = async () => {
    if (!name.trim()) return Alert.alert('Error', 'Name cannot be empty');
    setSavingInfo(true);
    try {
      const { data } = await client.put('/users/profile', { name });
      updateUserInfo({ ...userInfo, name: data.name });
      Alert.alert('Success', 'Your name has been updated!');
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSavingInfo(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) return Alert.alert('Error', 'All fields are required');
    if (newPassword !== confirmPassword) return Alert.alert('Error', 'New passwords do not match');
    if (newPassword.length < 6) return Alert.alert('Error', 'Password must be at least 6 characters');
    setSavingPwd(true);
    try {
      await client.put('/users/change-password', { currentPassword, newPassword });
      Alert.alert('Success', 'Password changed successfully!');
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to change password');
    } finally {
      setSavingPwd(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Personal Information</Text>
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>

        {/* Profile Info */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <User size={18} color={theme.colors.primary} />
            <Text style={styles.sectionTitle}>Profile Details</Text>
          </View>

          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Your full name"
          />

          <Text style={styles.label}>Email Address</Text>
          <View style={[styles.input, styles.readOnlyInput]}>
            <Text style={styles.readOnlyText}>{email}</Text>
          </View>
          <Text style={styles.hintText}>Email cannot be changed. Contact support if needed.</Text>

          <TouchableOpacity style={styles.saveBtn} onPress={handleSaveInfo} disabled={savingInfo}>
            {savingInfo ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Save Changes</Text>}
          </TouchableOpacity>
        </View>

        {/* Change Password */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Lock size={18} color={theme.colors.primary} />
            <Text style={styles.sectionTitle}>Change Password</Text>
          </View>

          <Text style={styles.label}>Current Password</Text>
          <View style={styles.pwdRow}>
            <TextInput
              style={[styles.input, { flex: 1, borderWidth: 0 }]}
              secureTextEntry={!showCurrent}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="Your current password"
            />
            <TouchableOpacity onPress={() => setShowCurrent(!showCurrent)} style={styles.eyeBtn}>
              {showCurrent ? <EyeOff size={18} color={theme.colors.textMuted} /> : <Eye size={18} color={theme.colors.textMuted} />}
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          <Text style={styles.label}>New Password</Text>
          <View style={styles.pwdRow}>
            <TextInput
              style={[styles.input, { flex: 1, borderWidth: 0 }]}
              secureTextEntry={!showNew}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Min 6 characters"
            />
            <TouchableOpacity onPress={() => setShowNew(!showNew)} style={styles.eyeBtn}>
              {showNew ? <EyeOff size={18} color={theme.colors.textMuted} /> : <Eye size={18} color={theme.colors.textMuted} />}
            </TouchableOpacity>
          </View>

          {newPassword.length > 0 && (
            <View style={styles.strengthWrap}>
              <View style={styles.strengthBars}>
                {[1, 2, 3].map(i => (
                  <View key={i} style={[styles.strengthBar, { backgroundColor: i <= strengthScore ? strengthColor : theme.colors.border }]} />
                ))}
              </View>
              {strengthChecks.map(({ label, pass }) => (
                <View key={label} style={styles.strengthCheck}>
                  <CheckCircle size={12} color={pass ? theme.colors.success : theme.colors.border} />
                  <Text style={[styles.strengthCheckText, { color: pass ? theme.colors.success : theme.colors.textLight }]}>{label}</Text>
                </View>
              ))}
            </View>
          )}

          <Text style={styles.label}>Confirm New Password</Text>
          <TextInput
            style={[styles.input, confirmPassword && confirmPassword !== newPassword && { borderColor: theme.colors.danger }]}
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="••••••••"
          />
          {confirmPassword && confirmPassword !== newPassword && (
            <Text style={styles.errorText}>Passwords don't match</Text>
          )}

          <TouchableOpacity
            style={[styles.saveBtn, !!(confirmPassword && confirmPassword !== newPassword) && { opacity: 0.5 }]}
            onPress={handleChangePassword}
            disabled={!!(savingPwd || (confirmPassword && confirmPassword !== newPassword))}
          >
            {savingPwd ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Update Password</Text>}
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: theme.colors.border, backgroundColor: theme.colors.surface },
  backBtn: { padding: 4, marginRight: 12 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: theme.colors.text },

  body: { padding: 16 },
  section: { backgroundColor: theme.colors.surface, borderRadius: theme.radius.xl, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: theme.colors.border, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: theme.colors.text },

  label: { fontSize: 13, fontWeight: '700', color: theme.colors.textMuted, marginBottom: 8, marginTop: 4 },
  input: { backgroundColor: theme.colors.bgAlt, borderRadius: theme.radius.md, padding: 14, fontSize: 15, color: theme.colors.text, borderWidth: 1.5, borderColor: theme.colors.border, marginBottom: 4 },
  readOnlyInput: { justifyContent: 'center', backgroundColor: theme.colors.bgAlt },
  readOnlyText: { fontSize: 15, color: theme.colors.textMuted },
  hintText: { fontSize: 12, color: theme.colors.textLight, marginBottom: 16 },

  pwdRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: theme.colors.border, borderRadius: theme.radius.md, marginBottom: 4, backgroundColor: theme.colors.bgAlt },
  eyeBtn: { padding: 14 },
  divider: { height: 1, backgroundColor: theme.colors.border, marginVertical: 16 },

  strengthWrap: { marginBottom: 16, gap: 6 },
  strengthBars: { flexDirection: 'row', gap: 6, marginBottom: 8 },
  strengthBar: { flex: 1, height: 4, borderRadius: 2 },
  strengthCheck: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  strengthCheckText: { fontSize: 12 },

  errorText: { fontSize: 12, color: theme.colors.danger, marginBottom: 12, fontWeight: '600' },

  saveBtn: { backgroundColor: theme.colors.primary, paddingVertical: 16, borderRadius: theme.radius.lg, alignItems: 'center', marginTop: 16 },
  saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});

export default PersonalInfoScreen;
