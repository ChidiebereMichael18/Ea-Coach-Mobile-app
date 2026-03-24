import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import { Feather as Icon } from '@expo/vector-icons';
import { colors } from '../../styles/colors';

const { width, height } = Dimensions.get('window');

const SplashScreen = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const loadingAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Logo sequence
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 10,
        useNativeDriver: true,
      }),
    ]).start();

    // Infinite loading line
    Animated.loop(
      Animated.sequence([
        Animated.timing(loadingAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(loadingAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [fadeAnim, slideAnim, scaleAnim, loadingAnim]);

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Background Decor */}
      <View style={styles.circle1} />
      <View style={styles.circle2} />

      <Animated.View style={[
        styles.logoContainer,
        {
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim }
          ]
        }
      ]}>
        <View style={styles.iconCircle}>
          <Icon name="truck" size={60} color={colors.white} />
        </View>
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
                  outputRange: [-100, width - 40]
                })
              }]
            }
          ]} />
        </View>
        <Text style={styles.footerText}>Securely connecting your journey...</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circle1: {
    position: 'absolute',
    width: width * 1.5,
    height: width * 1.5,
    borderRadius: (width * 1.5) / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    top: -height * 0.2,
    left: -width * 0.5,
  },
  circle2: {
    position: 'absolute',
    width: width,
    height: width,
    borderRadius: width / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    bottom: -height * 0.1,
    right: -width * 0.3,
  },
  logoContainer: {
    alignItems: 'center',
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  appName: {
    fontSize: 42,
    fontWeight: 'bold',
    color: colors.white,
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 8,
    fontWeight: '500',
  },
  footer: {
    position: 'absolute',
    bottom: 60,
    width: '100%',
    paddingHorizontal: 40,
    alignItems: 'center',
  },
  loadingTrack: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 16,
  },
  loadingBar: {
    width: 100,
    height: '100%',
    backgroundColor: colors.white,
    borderRadius: 2,
  },
  footerText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});

export default SplashScreen;
