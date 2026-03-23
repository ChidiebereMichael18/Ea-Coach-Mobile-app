import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { colors } from '../../styles/colors';

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

  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.fullName) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.length < 3) {
      newErrors.fullName = 'Name must be at least 3 characters';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[0-9+\-\s()]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'Invalid phone number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Needs uppercase, lowercase and number';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep1()) {
      setCurrentStep(2);
    }
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
        setErrors({
          general: result.error || 'Registration failed. Please try again.',
        });
        // If error is about email, move back to step 1
        if (result.error?.toLowerCase().includes('email')) {
          setCurrentStep(1);
        }
      }
    } catch (err) {
      setErrors({
        general: 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = () => {
    const password = formData.password;
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/(?=.*[a-z])/.test(password)) strength++;
    if (/(?=.*[A-Z])/.test(password)) strength++;
    if (/(?=.*\d)/.test(password)) strength++;
    if (/(?=.*[!@#$%^&*])/.test(password)) strength++;
    return strength;
  };

  const getStrengthInfo = () => {
    const strength = passwordStrength();
    if (strength <= 2) return { text: 'Weak', color: colors.danger, width: '33%' };
    if (strength <= 4) return { text: 'Medium', color: colors.warning, width: '66%' };
    return { text: 'Strong', color: colors.success, width: '100%' };
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join EA Coach for easy bus bookings</Text>
          </View>

          {/* Progress Steps */}
          <View style={styles.progressContainer}>
            <View style={styles.progressStep}>
              <View style={[styles.stepCircle, currentStep >= 1 && styles.activeCircle]}>
                <Text style={[styles.stepText, currentStep >= 1 && styles.activeStepText]}>1</Text>
              </View>
              <Text style={styles.stepLabel}>Personal</Text>
            </View>
            <View style={[styles.progressLine, currentStep >= 2 && styles.activeLine]} />
            <View style={styles.progressStep}>
              <View style={[styles.stepCircle, currentStep >= 2 && styles.activeCircle]}>
                <Text style={[styles.stepText, currentStep >= 2 && styles.activeStepText]}>2</Text>
              </View>
              <Text style={styles.stepLabel}>Security</Text>
            </View>
          </View>

          {errors.general && (
            <View style={styles.errorBanner}>
              <Icon name="alert-circle" size={18} color={colors.danger} />
              <Text style={styles.errorText}>{errors.general}</Text>
            </View>
          )}

          {currentStep === 1 ? (
            <View style={styles.form}>
              <Input
                label="Full Name"
                value={formData.fullName}
                onChangeText={(text) => setFormData(prev => ({ ...prev, fullName: text }))}
                placeholder="John Doe"
                leftIcon="user"
                error={errors.fullName}
              />
              <Input
                label="Email Address"
                value={formData.email}
                onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
                placeholder="you@example.com"
                leftIcon="mail"
                keyboardType="email-address"
                autoCapitalize="none"
                error={errors.email}
              />
              <Input
                label="Phone Number"
                value={formData.phone}
                onChangeText={(text) => setFormData(prev => ({ ...prev, phone: text }))}
                placeholder="+256 700 123 456"
                leftIcon="phone"
                keyboardType="phone-pad"
                error={errors.phone}
              />
              <Button
                title="Continue"
                onPress={handleNextStep}
                style={styles.actionButton}
                rightIcon="chevron-right"
              />
            </View>
          ) : (
            <View style={styles.form}>
              <Input
                label="Password"
                value={formData.password}
                onChangeText={(text) => setFormData(prev => ({ ...prev, password: text }))}
                placeholder="Create a strong password"
                leftIcon="lock"
                secureTextEntry={!showPassword}
                rightIcon={showPassword ? "eye-off" : "eye"}
                onRightIconPress={() => setShowPassword(!showPassword)}
                error={errors.password}
              />

              {formData.password.length > 0 && (
                <View style={styles.strengthContainer}>
                  <View style={styles.strengthBarBg}>
                    <View style={[
                      styles.strengthBar, 
                      { width: getStrengthInfo().width, backgroundColor: getStrengthInfo().color }
                    ]} />
                  </View>
                  <Text style={[styles.strengthText, { color: getStrengthInfo().color }]}>
                    {getStrengthInfo().text}
                  </Text>
                </View>
              )}

              <Input
                label="Confirm Password"
                value={formData.confirmPassword}
                onChangeText={(text) => setFormData(prev => ({ ...prev, confirmPassword: text }))}
                placeholder="Confirm your password"
                leftIcon="lock"
                secureTextEntry={!showConfirmPassword}
                rightIcon={showConfirmPassword ? "eye-off" : "eye"}
                onRightIconPress={() => setShowConfirmPassword(!showConfirmPassword)}
                error={errors.confirmPassword}
              />

              <TouchableOpacity 
                style={styles.termsContainer}
                onPress={() => setFormData(prev => ({ ...prev, agreeToTerms: !prev.agreeToTerms }))}
              >
                <Icon 
                  name={formData.agreeToTerms ? "check-square" : "square"} 
                  size={20} 
                  color={formData.agreeToTerms ? colors.primary : colors.gray[400]} 
                />
                <Text style={styles.termsText}>
                  I agree to the <Text style={styles.linkText}>Terms</Text> and <Text style={styles.linkText}>Privacy Policy</Text>
                </Text>
              </TouchableOpacity>
              {errors.agreeToTerms && (
                <Text style={styles.fieldError}>{errors.agreeToTerms}</Text>
              )}

              <View style={styles.buttonRow}>
                <Button
                  title="Back"
                  onPress={() => setCurrentStep(1)}
                  variant="outline"
                  style={styles.halfButton}
                />
                <Button
                  title="Sign Up"
                  onPress={handleSignup}
                  loading={isLoading}
                  style={styles.halfButton}
                />
              </View>
            </View>
          )}

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.gray[900],
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.gray[500],
    textAlign: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  progressStep: {
    alignItems: 'center',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.gray[200],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  activeCircle: {
    backgroundColor: colors.primary,
  },
  stepText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.gray[600],
  },
  activeStepText: {
    color: colors.white,
  },
  stepLabel: {
    fontSize: 12,
    color: colors.gray[500],
    fontWeight: '500',
  },
  progressLine: {
    width: 40,
    height: 2,
    backgroundColor: colors.gray[200],
    marginHorizontal: 12,
    marginTop: -16,
  },
  activeLine: {
    backgroundColor: colors.primary,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  errorText: {
    color: colors.danger,
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  form: {
    flex: 1,
  },
  actionButton: {
    marginTop: 16,
    height: 56,
  },
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: -8,
  },
  strengthBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: colors.gray[100],
    borderRadius: 3,
    marginRight: 10,
    overflow: 'hidden',
  },
  strengthBar: {
    height: '100%',
    borderRadius: 3,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: '600',
    width: 50,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 8,
    marginBottom: 8,
  },
  termsText: {
    fontSize: 14,
    color: colors.gray[600],
    marginLeft: 10,
    flex: 1,
    lineHeight: 20,
  },
  linkText: {
    color: colors.primary,
    fontWeight: '600',
  },
  fieldError: {
    color: colors.danger,
    fontSize: 12,
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  halfButton: {
    width: '48%',
    height: 56,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
  },
  footerText: {
    fontSize: 14,
    color: colors.gray[600],
  },
  loginText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: 'bold',
  },
});

export default SignupScreen;
