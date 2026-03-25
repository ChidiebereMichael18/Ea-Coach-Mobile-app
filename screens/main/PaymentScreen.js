import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '@expo/vector-icons/Feather';
import { colors, shadows } from '../../styles/colors';
import { createBooking } from '../../api/dashboardApi';
import Button from '../../components/common/Button';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';

const PAYMENT_METHODS = [
  { id: 'mobile_money', name: 'Mobile Money', icon: 'smartphone', color: '#F59E0B', sub: 'MTN or Airtel Money' },
  { id: 'card', name: 'Debit/Credit Card', icon: 'credit-card', color: colors.primary, sub: 'Visa or Mastercard' },
  { id: 'cash', name: 'Pay at Counter', icon: 'dollar-sign', color: colors.success, sub: 'Confirm & pay later' },
];

const PaymentScreen = ({ route, navigation }) => {
  const { bus, selectedSeats, passengers, from, to, date } = route.params;
  const [loading, setLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState(null);

  const totalAmount = selectedSeats.length * (bus.route?.price || 0);

  const handlePay = async (methodId) => {
    setSelectedMethod(methodId);
    setLoading(true);
    try {
      const passengerList = passengers.map(p => ({
        name: p.name.trim(),
        age: parseInt(p.age),
        gender: p.gender,
        seatNumber: p.seat.toString()
      }));

      const res = await createBooking({
        busId: bus._id || bus.id,
        from,
        to,
        departureDate: date ? new Date(date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        departureTime: bus.route?.departureTime || '—',
        passengers: passengerList,
        totalSeats: selectedSeats.length,
        totalAmount,
        paymentMethod: methodId
      });

      if (res.success && res.data) {
        navigation.navigate('BookingConfirmation', {
            bookingId: res.data.bookingId || res.data._id,
            bus,
            selectedSeats,
            passengers,
            from,
            to,
            date,
            totalAmount,
            paymentMethod: methodId
        });
      } else {
        Alert.alert('Booking Error', res.error || 'System could not finalize booking.');
      }
    } catch (err) {
      Alert.alert('Network Error', 'Connection issue. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      {loading && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color={colors.white} />
          <Text style={styles.overlayText}>Finalizing Booking...</Text>
        </View>
      )}

      <LinearGradient
        colors={colors.gradients.primary}
        style={styles.headerArea}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <SafeAreaView edges={['top']}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
              <Icon name="chevron-left" size={24} color={colors.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Review & Pay</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.summaryCard}>
            <View style={styles.summaryTop}>
                <Text style={styles.summaryTitle}>ITINERARY SUMMARY</Text>
                <View style={[styles.badge, { backgroundColor: colors.primaryGhost }]}>
                    <Text style={[styles.badgeText, { color: colors.primary }]}>{selectedSeats.length} Seats</Text>
                </View>
            </View>
            
            <View style={styles.routeRow}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.label}>Departure</Text>
                    <Text style={styles.val}>{from}</Text>
                </View>
                <Icon name="arrow-right" size={16} color={colors.gray[300]} style={{ marginHorizontal: 20 }} />
                <View style={{ flex: 1, alignItems: 'flex-end' }}>
                    <Text style={styles.label}>Arrival</Text>
                    <Text style={styles.val}>{to}</Text>
                </View>
            </View>

            <View style={styles.detailsGrid}>
                <View style={styles.detailItem}>
                    <Text style={styles.label}>OPERATOR</Text>
                    <Text style={styles.valSmall}>{bus.operator?.name}</Text>
                </View>
                <View style={styles.detailItem}>
                    <Text style={styles.label}>TIME</Text>
                    <Text style={styles.valSmall}>{bus.route?.departureTime}</Text>
                </View>
                <View style={styles.detailItem}>
                    <Text style={styles.label}>DATE</Text>
                    <Text style={styles.valSmall}>{new Date(date).toLocaleDateString()}</Text>
                </View>
            </View>

            <View style={styles.summaryFooter}>
                <Text style={styles.totalLabel}>Total Payable</Text>
                <Text style={styles.totalVal}>UGX {totalAmount.toLocaleString()}</Text>
            </View>
        </View>

        <Text style={styles.sectionTitle}>Choose Payment Method</Text>
        {PAYMENT_METHODS.map((method) => (
          <TouchableOpacity 
            key={method.id} 
            style={[styles.methodCard, selectedMethod === method.id && styles.methodCardActive]}
            activeOpacity={0.8}
            onPress={() => handlePay(method.id)}
          >
            <View style={[styles.methodIcon, { backgroundColor: method.color + '15' }]}>
              <Icon name={method.icon} size={24} color={method.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.methodName}>{method.name}</Text>
              <Text style={styles.methodSub}>{method.sub}</Text>
            </View>
            <Icon name="chevron-right" size={18} color={colors.gray[300]} />
          </TouchableOpacity>
        ))}

        <View style={styles.securityNote}>
            <Icon name="lock" size={14} color={colors.success} />
            <Text style={styles.securityText}>AES-256 Bit Secured Transaction</Text>
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
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    zIndex: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayText: {
    color: colors.white,
    marginTop: 20,
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 1,
  },
  headerArea: {
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    ...shadows.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.white,
  },
  scrollContent: {
    padding: 24,
  },
  summaryCard: {
    backgroundColor: colors.white,
    borderRadius: 28,
    padding: 24,
    marginBottom: 32,
    ...shadows.lg,
  },
  summaryTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: colors.gray[400],
    letterSpacing: 1.5,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  label: {
    fontSize: 10,
    color: colors.gray[400],
    textTransform: 'uppercase',
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  val: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.gray[800],
  },
  detailsGrid: {
    flexDirection: 'row',
    backgroundColor: colors.gray[50],
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
  },
  detailItem: {
    flex: 1,
  },
  valSmall: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.gray[800],
    marginTop: 2,
  },
  summaryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
  },
  totalLabel: {
    fontSize: 15,
    color: colors.gray[800],
    fontWeight: '800',
  },
  totalVal: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.primary,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.gray[800],
    marginBottom: 16,
    marginLeft: 4,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: 18,
    borderRadius: 24,
    marginBottom: 14,
    ...shadows.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  methodCardActive: {
    borderColor: colors.primary,
  },
  methodIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  methodName: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.gray[800],
  },
  methodSub: {
    fontSize: 12,
    color: colors.gray[400],
    marginTop: 2,
    fontWeight: '500',
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  securityText: {
    fontSize: 11,
    color: colors.success,
    marginLeft: 8,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

export default PaymentScreen;
