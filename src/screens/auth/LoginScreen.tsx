import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../../store/slices/authSlice';
import { StorageService } from '../../utils/storage';
import { validateUsername, validatePassword } from '../../utils/validators';

export default function LoginScreen() {
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    const uErr = validateUsername(username) || '';
    const pErr = validatePassword(password) || '';
    setUsernameError(uErr);
    setPasswordError(pErr);
    if (uErr || pErr) return;

    setIsLoading(true);
    try {
      await StorageService.saveAuth(username);
      dispatch(loginSuccess(username));
    } catch (e) {
      setUsernameError('Login failed. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 24 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>

        {/* Logo area */}
        <View style={styles.logoArea}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoIcon}>✓</Text>
          </View>
          <Text style={styles.appName}>TaskManager</Text>
          <Text style={styles.tagline}>Stay organized, stay productive</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Sign in to your account</Text>

          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Username</Text>
            <TextInput
              style={[styles.input, usernameError ? styles.inputError : null]}
              placeholder="Enter your username"
              value={username}
              onChangeText={text => {
                setUsername(text);
                setUsernameError('');
              }}
              autoCapitalize="none"
              placeholderTextColor="#94A3B8"
            />
            {usernameError ? (
              <Text style={styles.errorText}>⚠ {usernameError}</Text>
            ) : null}
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.passwordRow}>
              <TextInput
                style={[styles.input, styles.passwordInput, passwordError ? styles.inputError : null]}
                placeholder="Enter your password"
                value={password}
                onChangeText={text => {
                  setPassword(text);
                  setPasswordError('');
                }}
                secureTextEntry={!showPassword}
                placeholderTextColor="#94A3B8"
              />
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setShowPassword(v => !v)}>
                <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁'}</Text>
              </TouchableOpacity>
            </View>
            {passwordError ? (
              <Text style={styles.errorText}>⚠ {passwordError}</Text>
            ) : null}
          </View>

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.85}>
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Sign In →</Text>
            )}
          </TouchableOpacity>

          <View style={styles.hintBox}>
            <Text style={styles.hintTitle}>Demo credentials</Text>
            <Text style={styles.hintText}>Username: any (3+ characters)</Text>
            <Text style={styles.hintText}>Password: any (6+ characters)</Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FF' },
  scroll: { paddingHorizontal: 24 },
  logoArea: { alignItems: 'center', marginBottom: 32 },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  logoIcon: { color: '#fff', fontSize: 32, fontWeight: '700' },
  appName: { fontSize: 26, fontWeight: '700', color: '#0F172A' },
  tagline: { fontSize: 14, color: '#64748B', marginTop: 4 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
  },
  title: { fontSize: 22, fontWeight: '700', color: '#0F172A', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#64748B', marginBottom: 24 },
  inputWrapper: { marginBottom: 16 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 },
  input: {
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
  },
  inputError: { borderColor: '#EF4444', backgroundColor: '#FFF5F5' },
  passwordRow: { position: 'relative' },
  passwordInput: { paddingRight: 48 },
  eyeBtn: {
    position: 'absolute',
    right: 14,
    top: 14,
  },
  eyeIcon: { fontSize: 18 },
  errorText: { color: '#EF4444', fontSize: 12, marginTop: 5 },
  button: {
    backgroundColor: '#6366F1',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  hintBox: {
    marginTop: 20,
    padding: 14,
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    gap: 3,
  },
  hintTitle: { fontSize: 12, fontWeight: '700', color: '#475569', marginBottom: 4 },
  hintText: { fontSize: 12, color: '#64748B' },
});