import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  ScrollView,
  BackHandler,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '@expo/vector-icons/Feather';
import { colors, shadows } from '../../styles/colors';
import Button from '../../components/common/Button';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';

const BookingConfirmationScreen = ({ route, navigation }) => {
  const { bookingId, bus, selectedSeats, passengers, from, to, date, totalAmount } = route.params || {};
  const checkAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const cardSlide = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(checkAnim, { toValue: 1, tension: 20, friction: 6, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(cardSlide, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
    ]).start();

    const handler = BackHandler.addEventListener('hardwareBackPress', () => {
      navigation.navigate('MainTabs');
      return true;
    });
    return () => handler.remove();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient
        colors={colors.gradients.primary}
        style={styles.headerBG}
      >
        <SafeAreaView edges={['top']}>
            <View style={styles.topInfo}>
                <Animated.View style={[styles.successBadge, { transform: [{ scale: checkAnim }] }]}>
                    <Icon name="check" size={32} color={colors.white} />
                </Animated.View>
                <Text style={styles.mainTitle}>Booking Confirmed!</Text>
                <Text style={styles.subTitle}>Your premium trip is now secured</Text>
            </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.ticketCard, { opacity: fadeAnim, transform: [{ translateY: cardSlide }] }]}>
          <View style={styles.ticketHeader}>
            <View>
              <Text style={styles.ticketBrand}>EA Coach</Text>
              <Text style={styles.ticketSerial}>#{bookingId?.slice(-8).toUpperCase() || 'TRIP'}</Text>
            </View>
            <View style={styles.statusPill}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>OFFICIAL</Text>
            </View>
          </View>

          <View style={styles.routeSection}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cityLabel}>DEPARTURE</Text>
              <Text style={styles.cityName}>{from}</Text>
              <Text style={styles.routeTime}>{bus?.route?.departureTime}</Text>
            </View>
            <View style={styles.routeIconBox}>
                <View style={styles.routeDash} />
                <View style={styles.busCircle}>
                    <Icon name="truck" size={18} color={colors.primary} />
                </View>
                <View style={[styles.routeDash, { backgroundColor: colors.gray[100] }]} />
            </View>
            <View style={{ flex: 1, alignItems: 'flex-end' }}>
              <Text style={styles.cityLabel}>ARRIVAL</Text>
              <Text style={styles.cityName}>{to}</Text>
              <Text style={styles.routeTime}>{bus?.route?.arrivalTime || '—'}</Text>
            </View>
          </View>

          <View style={styles.ticketDivider}>
              <View style={styles.cutoutLeft} />
              <View style={styles.dashedLine} />
              <View style={styles.cutoutRight} />
          </View>

          <View style={styles.detailsGrid}>
            <View style={styles.detailBox}>
              <Text style={styles.detailLabel}>TRAVEL DATE</Text>
              <Text style={styles.detailVal}>
                {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </Text>
            </View>
            <View style={styles.detailBox}>
              <Text style={styles.detailLabel}>SEAT NUMBERS</Text>
              <Text style={styles.detailValPrimary}>{selectedSeats?.join(', ') || '—'}</Text>
            </View>
            <View style={styles.detailBox}>
              <Text style={styles.detailLabel}>TOTAL PAID</Text>
              <Text style={styles.detailVal}>UGX {totalAmount?.toLocaleString()}</Text>
            </View>
            <View style={styles.detailBox}>
              <Text style={styles.detailLabel}>OPERATOR</Text>
              <Text style={styles.detailVal}>{bus?.operator?.name || 'Bus'}</Text>
            </View>
          </View>

          {passengers?.length > 0 && (
            <View style={styles.passengerArea}>
              <Text style={styles.detailLabel}>TRAVELERS</Text>
              <View style={styles.pList}>
                {passengers.map((p, i) => (
                  <View key={i} style={styles.pChip}>
                     <Text style={styles.pChipText}>{p.name}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          <View style={styles.barcodeArea}>
             <Icon name="maximize" size={50} color={colors.gray[100]} />
             <Text style={styles.scanText}>SCAN FOR ENTRY</Text>
             <Text style={styles.idText}>{bookingId}</Text>
          </View>
        </Animated.View>

        <View style={styles.actionSection}>
           <Button
             title="Download PDF Ticket"
             variant="outline"
             icon="download"
             onPress={() => {}}
             style={styles.actionBtn}
           />
           <Button
             title="Back to Dashboard"
             onPress={() => navigation.navigate('MainTabs')}
             style={[styles.actionBtn, { marginTop: 12 }]}
             icon="home"
           />
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  headerBG: {
    paddingBottom: 80,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  topInfo: {
    alignItems: 'center',
    paddingTop: 20,
  },
  successBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  mainTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: colors.white,
    letterSpacing: 0.5,
  },
  subTitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 6,
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: 24,
    marginTop: -60,
  },
  ticketCard: {
    backgroundColor: colors.white,
    borderRadius: 32,
    padding: 24,
    ...shadows.lg,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  ticketBrand: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.primary,
  },
  ticketSerial: {
    fontSize: 12,
    color: colors.gray[400],
    fontWeight: '700',
    marginTop: 2,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[50],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray[100],
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
    marginRight: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.gray[600],
  },
  routeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  cityLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.gray[400],
    letterSpacing: 1,
    marginBottom: 4,
  },
  cityName: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.gray[800],
  },
  routeTime: {
    fontSize: 13,
    color: colors.gray[500],
    marginTop: 4,
    fontWeight: '600',
  },
  routeIconBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  busCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryGhost,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  routeDash: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: colors.primaryGhost,
  },
  ticketDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: -24,
    marginBottom: 24,
  },
  cutoutLeft: {
    width: 20,
    height: 25,
    backgroundColor: colors.gray[50],
    borderTopRightRadius: 15,
    borderBottomRightRadius: 15,
  },
  cutoutRight: {
    width: 20,
    height: 25,
    backgroundColor: colors.gray[50],
    borderTopLeftRadius: 15,
    borderBottomLeftRadius: 15,
  },
  dashedLine: {
    flex: 1,
    height: 1,
    borderWidth: 1,
    borderColor: colors.gray[100],
    borderStyle: 'dashed',
    borderRadius: 1,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  detailBox: {
    width: '50%',
    marginBottom: 20,
  },
  detailLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.gray[400],
    marginBottom: 6,
  },
  detailVal: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.gray[800],
  },
  detailValPrimary: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.primary,
  },
  passengerArea: {
    marginTop: 4,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: colors.gray[50],
  },
  pList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  pChip: {
    backgroundColor: colors.gray[50],
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginRight: 8,
    marginBottom: 8,
  },
  pChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.gray[700],
  },
  barcodeArea: {
    alignItems: 'center',
    marginTop: 20,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: colors.gray[50],
    borderStyle: 'dashed',
  },
  scanText: {
    fontSize: 10,
    color: colors.gray[300],
    fontWeight: '800',
    letterSpacing: 4,
    marginTop: 12,
  },
  idText: {
    fontSize: 11,
    color: colors.gray[400],
    fontWeight: '600',
    marginTop: 4,
  },
  actionSection: {
    marginTop: 24,
  },
  actionBtn: {
    height: 56,
  },
});

export default BookingConfirmationScreen;
