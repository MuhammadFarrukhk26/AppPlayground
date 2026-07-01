import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBooking } from '../../context/BookingContext';

export default function AuthScreen() {
  const { loginUser, registerUser, authError, isAuthLoading } = useBooking();

  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState('customer'); // 'customer' or 'worker'

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [specialty, setSpecialty] = useState('Electrician');

  // Quick fill preset credentials for rapid testing
  const handleQuickFill = (chosenRole) => {
    if (chosenRole === 'customer') {
      setName('Ayesha Khan');
      setEmail('ayesha@gmail.com');
      setPhone('+92 321 9876543');
      setPassword('password123');
      setRole('customer');
    } else {
      setName('Ahmed Kamal');
      setEmail('ahmed@gmail.com');
      setPhone('+92 300 1234567');
      setPassword('password123');
      setSpecialty('Electrician Specialist');
      setRole('worker');
    }
  };

  const handleSubmit = () => {
    if (isLogin) {
      if (!email.trim() || !password.trim()) {
        alert('Please fill in both Email and Password fields.');
        return;
      }
      loginUser(email.trim(), password);
    } else {
      if (!name.trim() || !email.trim() || !phone.trim() || !password.trim()) {
        alert('Please fill out all the configuration parameters.');
        return;
      }
      registerUser({ name: name.trim(), email: email.trim(), phone: phone.trim(), password, role, specialty });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          
          {/* Logo & Slogan Header */}
          <View style={styles.logoContainer}>
            <View style={styles.brandIcon}>
              <Text style={styles.brandLetter}>H</Text>
            </View>
            <Text style={styles.logoText}>haazir</Text>
            <Text style={styles.tagline}>On-Demand Electrical & Plumbing Services</Text>
          </View>

          {/* Login vs Register selector */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, isLogin && styles.tabActive]}
              onPress={() => setIsLogin(true)}
            >
              <Text style={[styles.tabText, isLogin && styles.tabTextActive]}>Sign In</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, !isLogin && styles.tabActive]}
              onPress={() => setIsLogin(false)}
            >
              <Text style={[styles.tabText, !isLogin && styles.tabTextActive]}>Register</Text>
            </TouchableOpacity>
          </View>

          {/* Role selector tabs */}
          <View style={styles.roleHeaderContainer}>
            <Text style={styles.inputLabelHeader}>Select Your Role</Text>
            <View style={styles.roleContainer}>
              <TouchableOpacity
                style={[styles.roleBtn, role === 'customer' && styles.roleBtnActive]}
                onPress={() => setRole('customer')}
              >
                <Ionicons 
                  name="people" 
                  size={18} 
                  color={role === 'customer' ? '#FFFFFF' : '#8E8E93'} 
                  style={{ marginRight: 6 }}
                />
                <Text style={[styles.roleBtnText, role === 'customer' && styles.roleBtnTextActive]}>
                  Customer
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.roleBtn, role === 'worker' && styles.roleBtnActive]}
                onPress={() => setRole('worker')}
              >
                <Ionicons 
                  name="hammer" 
                  size={16} 
                  color={role === 'worker' ? '#FFFFFF' : '#8E8E93'} 
                  style={{ marginRight: 6 }}
                />
                <Text style={[styles.roleBtnText, role === 'worker' && styles.roleBtnTextActive]}>
                  Technician
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Form Fields */}
          <View style={styles.formCard}>
            {!isLogin && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <View style={styles.inputRow}>
                  <Ionicons name="person-outline" size={18} color="#8E8E93" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. Ayesha Khan"
                    placeholderTextColor="#AEAEB2"
                    value={name}
                    onChangeText={setName}
                  />
                </View>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <View style={styles.inputRow}>
                <Ionicons name="mail-outline" size={18} color="#8E8E93" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. ayesha@gmail.com"
                  placeholderTextColor="#AEAEB2"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>

            {!isLogin && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Phone Number</Text>
                <View style={styles.inputRow}>
                  <Ionicons name="call-outline" size={18} color="#8E8E93" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. +92 321 9876543"
                    placeholderTextColor="#AEAEB2"
                    keyboardType="phone-pad"
                    value={phone}
                    onChangeText={setPhone}
                  />
                </View>
              </View>
            )}

            {!isLogin && role === 'worker' && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Specialization Core Trade</Text>
                <View style={styles.inputRow}>
                  <Ionicons name="construct-outline" size={18} color="#8E8E93" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. Electrician or Plumber Specialist"
                    placeholderTextColor="#AEAEB2"
                    value={specialty}
                    onChangeText={setSpecialty}
                  />
                </View>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Account Password</Text>
              <View style={styles.inputRow}>
                <Ionicons name="lock-closed-outline" size={18} color="#8E8E93" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter secret passcode"
                  placeholderTextColor="#AEAEB2"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />
              </View>
            </View>

            {/* Error message from a failed login/register attempt */}
            {authError ? (
              <Text style={styles.errorText}>{authError}</Text>
            ) : null}

            {/* Submit Action Button */}
            <TouchableOpacity
              style={[styles.submitBtn, isAuthLoading && { opacity: 0.6 }]}
              onPress={handleSubmit}
              disabled={isAuthLoading}
            >
              <Text style={styles.submitBtnText}>
                {isAuthLoading ? 'Please wait...' : isLogin ? 'Sign In Securely' : 'Create Active Account'}
              </Text>
              {!isAuthLoading && (
                <Ionicons name="arrow-forward" size={18} color="#FFFFFF" style={{ marginLeft: 6 }} />
              )}
            </TouchableOpacity>
          </View>

          {/* Quick-fill testing suggestions (Highly helpful on physical device test) */}
          <View style={styles.quickFillCard}>
            <Text style={styles.quickFillTitle}>Quick testing presets:</Text>
            <Text style={styles.quickFillDesc}>Tap below to preload credentials for easy device verification:</Text>
            <View style={styles.quickFillButtons}>
              <TouchableOpacity 
                style={[styles.quickFillBtn, { borderColor: '#007AFF' }]} 
                onPress={() => handleQuickFill('customer')}
              >
                <Text style={[styles.quickFillBtnText, { color: '#007AFF' }]}>Pre-fill Customer</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.quickFillBtn, { borderColor: '#34C759' }]} 
                onPress={() => handleQuickFill('worker')}
              >
                <Text style={[styles.quickFillBtnText, { color: '#34C759' }]}>Pre-fill Specialist</Text>
              </TouchableOpacity>
            </View>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFC',
  },
  scroll: {
    padding: 24,
    paddingTop: 48,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 28,
  },
  brandIcon: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: '#FF3B30',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  brandLetter: {
    fontSize: 34,
    color: '#FFFFFF',
    fontWeight: '900',
  },
  logoText: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1C1C1E',
    marginTop: 10,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#E5E5EA',
    borderRadius: 12,
    padding: 3,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 9,
  },
  tabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
  },
  tabTextActive: {
    color: '#1C1C1E',
    fontWeight: '700',
  },
  roleHeaderContainer: {
    marginBottom: 16,
  },
  inputLabelHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#636366',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  roleContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  roleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 10,
    paddingVertical: 12,
  },
  roleBtnActive: {
    backgroundColor: '#FF3B30',
    borderColor: '#FF3B30',
  },
  roleBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#636366',
  },
  roleBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    padding: 16,
    gap: 14,
    marginBottom: 24,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#636366',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFC',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1C1C1E',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center',
  },
  submitBtn: {
    backgroundColor: '#FF3B30',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 8,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  quickFillCard: {
    backgroundColor: '#F2F2F7',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
  },
  quickFillTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  quickFillDesc: {
    fontSize: 11,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 2,
    marginBottom: 10,
  },
  quickFillButtons: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  quickFillBtn: {
    flex: 1,
    borderWidth: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickFillBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
