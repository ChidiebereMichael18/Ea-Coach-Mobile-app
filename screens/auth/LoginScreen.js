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

const LoginScreen = () => {
  const navigation = useNavigation();
  const { login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [rememberMe, setRememberMe] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 700, useNativeDriver: true }),
    ]).start();
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;
    setErrors({});
    setIsLoading(true);

    try {
      const result = await login(email.trim(), password);
      if (!result.success) {
        setErrors({
          general: result.error || 'Invalid email or password. Please try again.',
        });
      }
    } catch (err) {
      setErrors({
        general: 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Top decoration with Gradient - Flush to top */}
          <LinearGradient
            colors={colors.gradients.primary}
            style={styles.topDecor}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <SafeAreaView edges={['top']} />
            <View style={styles.decorCircle1} />
            <View style={styles.decorCircle2} />
            
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <View style={styles.logoBg}>
                  <Icon name="truck" size={32} color={colors.primary} />
                </View>
              </View>
              <Text style={styles.brandName}>EA Coach</Text>
              <Text style={styles.tagline}>Travel around East Africa with ease</Text>
            </View>
          </LinearGradient>

          <Animated.View style={[styles.mainSection, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            {errors.general && (
              <View style={styles.errorBanner}>
                <Icon name="alert-circle" size={16} color={colors.danger} />
                <Text style={styles.errorText}>{errors.general}</Text>
              </View>
            )}

            {/* Form Card */}
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>Welcome Back</Text>
              <Text style={styles.formSub}>Sign in to continue your journey</Text>

              <Input
                label="Email Address"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
                }}
                placeholder="you@example.com"
                leftIcon="mail"
                keyboardType="email-address"
                autoCapitalize="none"
                error={errors.email}
              />

              <Input
                label="Password"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (errors.password) setErrors(prev => ({ ...prev, password: '' }));
                }}
                placeholder="••••••••"
                leftIcon="lock"
                secureTextEntry={!showPassword}
                rightIcon={showPassword ? "eye-off" : "eye"}
                onRightIconPress={() => setShowPassword(!showPassword)}
                error={errors.password}
              />

              <View style={styles.optionsRow}>
                <TouchableOpacity 
                  style={styles.rememberMe} 
                  onPress={() => setRememberMe(!rememberMe)}
                >
                  <View style={[styles.checkbox, rememberMe && styles.checkboxActive]}>
                    {rememberMe && <Icon name="check" size={12} color={colors.white} />}
                  </View>
                  <Text style={styles.rememberMeText}>Remember me</Text>
                </TouchableOpacity>
                
                <TouchableOpacity>
                  <Text style={styles.forgotPassword}>Forgot Password?</Text>
                </TouchableOpacity>
              </View>

              <Button
                title="Sign In"
                onPress={handleLogin}
                loading={isLoading}
                style={styles.loginButton}
              />
            </View>

            {/* Social divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Sign Up Link */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                <Text style={styles.signupText}>Create Account</Text>
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

  // Decorations
  topDecor: {
    paddingBottom: 40,
    position: 'relative',
    overflow: 'hidden',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
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
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.04)',
    top: -20,
    left: -40,
  },

  // Header
  header: {
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 24,
  },
  logoContainer: {
    marginBottom: 16,
  },
  logoBg: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.lg,
  },
  brandName: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
    fontWeight: '500',
  },

  mainSection: {
    marginTop: -32, // Pulled up into the header
  },

  // Error
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
    flex: 1,
    fontWeight: '500',
  },

  // Form Card
  formCard: {
    backgroundColor: colors.white,
    marginHorizontal: 20,
    borderRadius: 28,
    padding: 28,
    ...shadows.lg,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.gray[900],
    marginBottom: 4,
  },
  formSub: {
    fontSize: 14,
    color: colors.gray[400],
    marginBottom: 28,
    fontWeight: '500',
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 4,
  },
  rememberMe: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.gray[300],
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  rememberMeText: {
    fontSize: 13,
    color: colors.gray[500],
    marginLeft: 8,
    fontWeight: '500',
  },
  forgotPassword: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
  },
  loginButton: {
    height: 54,
    borderRadius: 16,
  },

  // Divider
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 40,
    marginVertical: 28,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.gray[200],
  },
  dividerText: {
    color: colors.gray[400],
    fontSize: 13,
    marginHorizontal: 16,
    fontWeight: '500',
  },

  // Footer
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: colors.gray[500],
  },
  signupText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '700',
  },
});

export default LoginScreen;
