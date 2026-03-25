import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import Icon from '@expo/vector-icons/Feather';
import { colors } from '../../styles/colors';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';

const { width, height } = Dimensions.get('window');

const SplashScreen = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const textFade = useRef(new Animated.Value(0)).current;
  const loadingAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Logo entrance
    Animated.sequence([
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, tension: 20, friction: 7, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
      Animated.timing(textFade, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();

    // Pulse animation for logo
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ])
    ).start();

    // Loading bar
    Animated.loop(
      Animated.sequence([
        Animated.timing(loadingAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(loadingAnim, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <LinearGradient
      colors={colors.gradients.primary}
      style={styles.container}
    >
      <StatusBar style="light" />
      
      {/* Background orbs */}
      <View style={styles.orb1} />
      <View style={styles.orb2} />
      <View style={styles.orb3} />

      <Animated.View style={[styles.logoArea, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <Animated.View style={[styles.iconCircle, { transform: [{ scale: pulseAnim }] }]}>
          <View style={styles.iconInner}>
            <Icon name="truck" size={48} color={colors.white} />
          </View>
        </Animated.View>
      </Animated.View>

      <Animated.View style={[styles.textArea, { opacity: textFade }]}>
        <Text style={styles.appName}>EA Coach</Text>
        <Text style={styles.tagline}>Premium Travel Made Simple</Text>
      </Animated.View>

      <View style={styles.footer}>
        <View style={styles.loadingTrack}>
          <Animated.View style={[
            styles.loadingBar,
            {
              transform: [{
                translateX: loadingAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-120, width - 40]
                })
              }]
            }
          ]} />
        </View>
        <Text style={styles.footerText}>Secure Connection</Text>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Background orbs
  orb1: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(255,255,255,0.06)',
    top: -50,
    right: -100,
  },
  orb2: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(255,255,255,0.03)',
    bottom: 100,
    left: -60,
  },
  orb3: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.04)',
    top: height * 0.35,
    right: -40,
  },

  logoArea: {
    alignItems: 'center',
  },
  iconCircle: {
    width: 130,
    height: 130,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  iconInner: {
    width: 90,
    height: 90,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.white,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },

  textArea: {
    alignItems: 'center',
    marginTop: 32,
  },
  appName: {
    fontSize: 42,
    fontWeight: '900',
    color: colors.white,
    letterSpacing: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 8,
    fontWeight: '600',
    letterSpacing: 1,
  },

  footer: {
    position: 'absolute',
    bottom: 80,
    width: '100%',
    paddingHorizontal: 60,
    alignItems: 'center',
  },
  loadingTrack: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 16,
  },
  loadingBar: {
    width: 100,
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 2,
  },
  footerText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 2,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
});

export default SplashScreen;
