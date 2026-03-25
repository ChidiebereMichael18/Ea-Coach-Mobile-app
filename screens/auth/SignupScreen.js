import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from '@expo/vector-icons/Feather';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { colors, shadows } from '../../styles/colors';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

const SignupScreen = () => {
  const navigation = useNavigation();
  const { signup } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });
  
  const [errors, setErrors] = useState({});
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 700, useNativeDriver: true }),
    ]).start();
  }, [currentStep]);

  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.fullName) newErrors.fullName = 'Full name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.phone) newErrors.phone = 'Phone number is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) newErrors.password = 'Min 8 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (!formData.agreeToTerms) newErrors.agreeToTerms = 'Agree to terms to continue';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    if (!validateStep2()) return;
    setErrors({});
    setIsLoading(true);
    try {
      const result = await signup({
        name: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        password: formData.password,
      });
      if (!result.success) {
        setErrors({ general: result.error || 'Registration failed.' });
        if (result.error?.toLowerCase().includes('email')) setCurrentStep(1);
      }
    } catch (err) {
      setErrors({ general: 'Connection error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const getStrengthInfo = () => {
    const len = formData.password.length;
    if (len === 0) return null;
    if (len < 6) return { text: 'Weak', color: colors.danger, width: '33%' };
    if (len < 10) return { text: 'Fair', color: colors.warning, width: '66%' };
    return { text: 'Strong', color: colors.success, width: '100%' };
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <LinearGradient
            colors={colors.gradients.primary}
            style={styles.topDecor}
          >
            <SafeAreaView edges={['top']} />
            <View style={styles.decorCircle1} />
            <View style={styles.decorCircle2} />
            
            <View style={styles.header}>
              <Text style={styles.brandName}>Join EA Coach</Text>
              <Text style={styles.tagline}>Start your premium journey today</Text>
              
              <View style={styles.progressContainer}>
                <View style={[styles.progressStep, currentStep === 1 ? styles.stepActive : styles.stepDone]}>
                  <Text style={styles.stepNum}>{currentStep > 1 ? '✓' : '1'}</Text>
                </View>
                <View style={styles.progressLine} />
                <View style={[styles.progressStep, currentStep === 2 ? styles.stepActive : styles.stepWaiting]}>
                  <Text style={styles.stepNum}>2</Text>
                </View>
              </View>
            </View>
          </LinearGradient>

          <Animated.View style={[styles.mainSection, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            {errors.general && (
              <View style={styles.errorBanner}>
                <Icon name="alert-circle" size={16} color={colors.danger} />
                <Text style={styles.errorText}>{errors.general}</Text>
              </View>
            )}

            <View style={styles.formCard}>
              {currentStep === 1 ? (
                <View>
                  <Text style={styles.formTitle}>Your Details</Text>
                  <Input
                    label="Full Name"
                    value={formData.fullName}
                    onChangeText={(txt) => setFormData({ ...formData, fullName: txt })}
                    placeholder="Enter your name"
                    leftIcon="user"
                    error={errors.fullName}
                  />
                  <Input
                    label="Email Address"
                    value={formData.email}
                    onChangeText={(txt) => setFormData({ ...formData, email: txt })}
                    placeholder="you@example.com"
                    leftIcon="mail"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    error={errors.email}
                  />
                  <Input
                    label="Phone Number"
                    value={formData.phone}
                    onChangeText={(txt) => setFormData({ ...formData, phone: txt })}
                    placeholder="+256 7xx xxx xxx"
                    leftIcon="phone"
                    keyboardType="phone-pad"
                    error={errors.phone}
                  />
                  <Button
                    title="Continue"
                    onPress={() => validateStep1() && setCurrentStep(2)}
                    style={styles.actionBtn}
                    rightIcon="arrow-right"
                  />
                </View>
              ) : (
                <View>
                  <Text style={styles.formTitle}>Secure Account</Text>
                  <Input
                    label="Password"
                    value={formData.password}
                    onChangeText={(txt) => setFormData({ ...formData, password: txt })}
                    placeholder="••••••••"
                    leftIcon="lock"
                    secureTextEntry={!showPassword}
                    rightIcon={showPassword ? "eye-off" : "eye"}
                    onRightIconPress={() => setShowPassword(!showPassword)}
                    error={errors.password}
                  />
                  
                  {getStrengthInfo() && (
                    <View style={styles.strengthBox}>
                       <View style={styles.strengthBarBg}>
                         <Animated.View style={[styles.strengthBar, { width: getStrengthInfo().width, backgroundColor: getStrengthInfo().color }]} />
                       </View>
                       <Text style={[styles.strengthText, { color: getStrengthInfo().color }]}>{getStrengthInfo().text}</Text>
                    </View>
                  )}

                  <Input
                    label="Confirm Password"
                    value={formData.confirmPassword}
                    onChangeText={(txt) => setFormData({ ...formData, confirmPassword: txt })}
                    placeholder="••••••••"
                    leftIcon="lock"
                    secureTextEntry={!showConfirmPassword}
                    rightIcon={showConfirmPassword ? "eye-off" : "eye"}
                    onRightIconPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    error={errors.confirmPassword}
                  />

                  <TouchableOpacity 
                    style={styles.termsRow}
                    onPress={() => setFormData({ ...formData, agreeToTerms: !formData.agreeToTerms })}
                  >
                    <View style={[styles.checkbox, formData.agreeToTerms && styles.checkboxActive]}>
                      {formData.agreeToTerms && <Icon name="check" size={12} color={colors.white} />}
                    </View>
                    <Text style={styles.termsText}>I agree to the Terms & Privacy Policy</Text>
                  </TouchableOpacity>
                  {errors.agreeToTerms && <Text style={styles.fieldError}>{errors.agreeToTerms}</Text>}

                  <View style={styles.btnRow}>
                    <Button
                      title="Back"
                      variant="outline"
                      onPress={() => setCurrentStep(1)}
                      style={styles.halfBtn}
                    />
                    <Button
                      title="Create Account"
                      onPress={handleSignup}
                      loading={isLoading}
                      style={styles.halfBtn}
                    />
                  </View>
                </View>
              )}
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.loginText}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  topDecor: {
    paddingBottom: 60,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
  },
  decorCircle1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.06)',
    top: -80,
    right: -40,
  },
  decorCircle2: {
    position: 'absolute',
    top: -20,
    left: -40,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 24,
  },
  brandName: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.white,
  },
  tagline: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 6,
    fontWeight: '500',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
  },
  progressStep: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  stepActive: {
    backgroundColor: colors.white,
    borderColor: colors.white,
  },
  stepDone: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderColor: 'transparent',
  },
  stepWaiting: {
    backgroundColor: 'transparent',
    borderColor: 'rgba(255,255,255,0.3)',
  },
  stepNum: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primary,
  },
  progressLine: {
    width: 40,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: 12,
  },
  mainSection: {
    marginTop: -32,
  },
  formCard: {
    backgroundColor: colors.white,
    marginHorizontal: 20,
    borderRadius: 28,
    padding: 24,
    ...shadows.lg,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.gray[800],
    marginBottom: 20,
  },
  actionBtn: {
    height: 54,
    marginTop: 8,
  },
  btnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  halfBtn: {
    width: '48%',
  },
  strengthBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -10,
    marginBottom: 16,
  },
  strengthBarBg: {
    flex: 1,
    height: 4,
    backgroundColor: colors.gray[100],
    borderRadius: 2,
    marginRight: 10,
    overflow: 'hidden',
  },
  strengthBar: {
    height: '100%',
  },
  strengthText: {
    fontSize: 11,
    fontWeight: '700',
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.gray[200],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkboxActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  termsText: {
    fontSize: 13,
    color: colors.gray[500],
    fontWeight: '500',
  },
  fieldError: {
    color: colors.danger,
    fontSize: 12,
    marginBottom: 12,
    marginTop: -12,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dangerLight,
    padding: 14,
    marginHorizontal: 24,
    borderRadius: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorText: {
    color: colors.danger,
    fontSize: 13,
    marginLeft: 10,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
  },
  footerText: {
    color: colors.gray[500],
  },
  loginText: {
    color: colors.primary,
    fontWeight: '700',
  },
});

export default SignupScreen;
