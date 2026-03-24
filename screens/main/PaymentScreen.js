import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather as Icon } from '@expo/vector-icons';
import { colors } from '../../styles/colors';
import { createBooking } from '../../api/dashboardApi';
import Button from '../../components/common/Button';

const PAYMENT_METHODS = [
  { id: 'mobile_money', name: 'Mobile Money', icon: 'smartphone', color: '#F59E0B', sub: 'MTN or Airtel Money' },
  { id: 'card', name: 'Credit/Debit Card', icon: 'credit-card', color: colors.primary, sub: 'Visa or Mastercard' },
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
        Alert.alert('Booking Error', res.error || 'The system could not finalize your booking. Please try again.');
      }
    } catch (err) {
      Alert.alert('Network Error', 'A connection issue occurred. Please check your network and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {loading && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color={colors.white} />
          <Text style={styles.overlayText}>Processing Booking...</Text>
        </View>
      )}

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={24} color={colors.gray[800]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Review & Pay</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Booking Summary</Text>
            <View style={styles.summaryRow}>
                <View>
                    <Text style={styles.label}>Route</Text>
                    <Text style={styles.val}>{from} → {to}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.label}>Seats</Text>
                    <Text style={styles.val}>{selectedSeats.join(', ')}</Text>
                </View>
            </View>
            <View style={styles.summaryRow}>
                <View>
                    <Text style={styles.label}>Departure</Text>
                    <Text style={styles.val}>{new Date(date).toLocaleDateString()} • {bus.route?.departureTime}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.label}>Bus</Text>
                    <Text style={styles.val}>{bus.operator?.name}</Text>
                </View>
            </View>
            <View style={[styles.summaryFooter, { borderTopWidth: 1, borderTopColor: colors.gray[100], paddingTop: 12, marginTop: 12 }]}>
                <Text style={styles.totalLabel}>Total Payable</Text>
                <Text style={styles.totalVal}>UGX {totalAmount.toLocaleString()}</Text>
            </View>
        </View>

        <Text style={styles.sectionTitle}>Select Payment Method</Text>
        {PAYMENT_METHODS.map((method) => (
          <TouchableOpacity 
            key={method.id} 
            style={[styles.methodCard, selectedMethod === method.id && styles.methodCardActive]}
            onPress={() => handlePay(method.id)}
          >
            <View style={[styles.methodIcon, { backgroundColor: method.color + '15' }]}>
              <Icon name={method.icon} size={24} color={method.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.methodName}>{method.name}</Text>
              <Text style={styles.methodSub}>{method.sub}</Text>
            </View>
            <Icon name="chevron-right" size={20} color={colors.gray[300]} />
          </TouchableOpacity>
        ))}

        <View style={styles.securityNote}>
            <Icon name="shield" size={16} color={colors.success} />
            <Text style={styles.securityText}>Secure 256-bit encrypted checkout</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(37, 99, 235, 0.8)',
    zIndex: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayText: {
    color: colors.white,
    marginTop: 15,
    fontWeight: '600',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.gray[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.gray[900],
  },
  scrollContent: {
    padding: 20,
  },
  summaryCard: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 20,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.gray[400],
    marginBottom: 20,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    color: colors.gray[400],
    marginBottom: 4,
  },
  val: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.gray[800],
  },
  summaryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    color: colors.gray[800],
    fontWeight: 'bold',
  },
  totalVal: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.gray[800],
    marginBottom: 15,
    marginLeft: 4,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  methodCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '05',
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
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.gray[800],
  },
  methodSub: {
    fontSize: 12,
    color: colors.gray[500],
    marginTop: 2,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    opacity: 0.6,
  },
  securityText: {
    fontSize: 12,
    color: colors.success,
    marginLeft: 8,
    fontWeight: '600',
  },
});

export default PaymentScreen;
