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
import Input from '../../components/common/Input';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';

const PAYMENT_METHODS = [
  { id: 'mtn', name: 'MTN Mobile Money', icon: 'smartphone', color: '#F59E0B', bgColor: '#FEF3C7', sub: 'Instant via MoMo prompt' },
  { id: 'airtel', name: 'Airtel Money', icon: 'smartphone', color: '#EF4444', bgColor: '#FEE2E2', sub: 'Instant via Airtel prompt' },
  { id: 'card', name: 'Debit/Credit Card', icon: 'credit-card', color: colors.primary, bgColor: colors.primaryGhost, sub: 'Visa or Mastercard' },
  { id: 'bank', name: 'Bank Transfer', icon: 'landmark', color: colors.success, bgColor: '#D1FAE5', sub: '1-2 hours processing' },
];

const PaymentScreen = ({ route, navigation }) => {
  const { bus, selectedSeats, passengers, from, to, date } = route.params;
  const [loading, setLoading] = useState(false);
  const [expandedMethod, setExpandedMethod] = useState(null);
  const [mobileNumber, setMobileNumber] = useState('');
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '', name: '' });

  const totalAmount = selectedSeats.length * (bus.route?.price || 0);

  const handlePay = async (methodId) => {
    if (methodId === 'mtn' || methodId === 'airtel') {
      if (!mobileNumber) {
        Alert.alert('Missing Field', 'Please enter your mobile money number.');
        return;
      }
    }
    if (methodId === 'card') {
      if (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvv || !cardDetails.name) {
        Alert.alert('Missing Fields', 'Please complete all card details before paying.');
        return;
      }
    }

    setLoading(true);
    try {
      const passengerList = passengers.map(p => ({
        name: p.name.trim(),
        age: parseInt(p.age),
        gender: p.gender,
        phone: p.phone.trim(),
        idNumber: p.idNumber?.trim() || 'N/A',
        seatNumber: p.seat.toString()
      }));

      let mappedMethod = methodId;
      if (methodId === 'mtn' || methodId === 'airtel') mappedMethod = 'mobile_money';
      if (methodId === 'bank') mappedMethod = 'cash';

      const res = await createBooking({
        busId: bus._id || bus.id,
        from,
        to,
        departureDate: date ? new Date(date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        departureTime: bus.route?.departureTime || '—',
        passengers: passengerList,
        totalSeats: selectedSeats.length,
        totalAmount,
        paymentMethod: mappedMethod
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
        Alert.alert('Booking Failed', res.error || 'The server could not initialize your booking. Please check your connection.');
      }
    } catch (err) {
      console.error('Payment handlePay error:', err);
      Alert.alert('Network Error', 'The booking service is currently unreachable. Please try again in a few moments.');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (methodId) => {
    if (expandedMethod === methodId) {
      setExpandedMethod(null);
    } else {
      setExpandedMethod(methodId);
    }
  };

  const renderPaymentForm = (method) => {
    switch (method.id) {
      case 'mtn':
      case 'airtel':
        return (
          <View style={styles.formContainer}>
            <Input 
              label="Mobile Money Number" 
              placeholder="07XXXXXXXX" 
              keyboardType="phone-pad" 
              value={mobileNumber}
              onChangeText={setMobileNumber}
              leftIcon="smartphone"
              containerStyle={styles.inputSpacing}
            />
            <View style={styles.infoBox}>
              <Icon name="info" size={16} color={method.color} />
              <Text style={[styles.infoText, { color: method.color }]}>
                You will receive a prompt to authorize UGX {totalAmount.toLocaleString()}
              </Text>
            </View>
            <Button 
              title={`Pay UGX ${totalAmount.toLocaleString()}`} 
              onPress={() => handlePay(method.id)} 
              style={styles.payButton}
              icon="lock"
            />
          </View>
        );
      
      case 'card':
        return (
          <View style={styles.formContainer}>
            <Input 
              label="Card Number" 
              placeholder="1234 5678 9012 3456" 
              keyboardType="numeric"
              maxLength={19}
              value={cardDetails.number}
              onChangeText={val => setCardDetails({...cardDetails, number: val})}
              leftIcon="credit-card"
              containerStyle={styles.inputSpacing}
            />
            <View style={styles.rowContainer}>
              <View style={styles.halfWidth}>
                <Input 
                  label="Expiry Date" 
                  placeholder="MM/YY" 
                  maxLength={5}
                  value={cardDetails.expiry}
                  onChangeText={val => setCardDetails({...cardDetails, expiry: val})}
                />
              </View>
              <View style={styles.halfWidth}>
                <Input 
                  label="CVV" 
                  placeholder="123" 
                  secureTextEntry
                  maxLength={3}
                  keyboardType="numeric"
                  value={cardDetails.cvv}
                  onChangeText={val => setCardDetails({...cardDetails, cvv: val})}
                />
              </View>
            </View>
            <Input 
              label="Cardholder Name" 
              placeholder="Name on card" 
              value={cardDetails.name}
              onChangeText={val => setCardDetails({...cardDetails, name: val})}
              leftIcon="user"
              containerStyle={styles.inputSpacing}
            />
            <Button 
              title={`Pay UGX ${totalAmount.toLocaleString()}`} 
              onPress={() => handlePay(method.id)} 
              style={styles.payButton}
              icon="lock"
            />
          </View>
        );
      
      case 'bank':
        return (
          <View style={styles.formContainer}>
            <View style={styles.bankDetails}>
              <View style={styles.bankHeader}>
                <Icon name="building" size={20} color={colors.success} />
                <Text style={styles.bankTitle}>Bank Transfer Details</Text>
              </View>
              <View style={styles.bankRow}>
                <Text style={styles.bankLabel}>Bank Name</Text>
                <Text style={styles.bankValue}>Centenary Bank</Text>
              </View>
              <View style={styles.bankRow}>
                <Text style={styles.bankLabel}>Account Name</Text>
                <Text style={styles.bankValue}>EA Coach Ltd</Text>
              </View>
              <View style={styles.bankRow}>
                <Text style={styles.bankLabel}>Account Number</Text>
                <Text style={styles.bankValue}>1234567890</Text>
              </View>
              <View style={styles.bankRow}>
                <Text style={styles.bankLabel}>Amount</Text>
                <Text style={[styles.bankValue, styles.bankAmount]}>UGX {totalAmount.toLocaleString()}</Text>
              </View>
              <View style={styles.bankNote}>
                <Icon name="info" size={12} color={colors.gray[500]} />
                <Text style={styles.bankNoteText}>Use your phone number as payment reference</Text>
              </View>
            </View>
            <Button 
              title={`Confirm Payment`} 
              onPress={() => handlePay(method.id)} 
              style={styles.payButton}
              icon="check-circle"
            />
          </View>
        );
      
      default:
        return null;
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
            <View style={{ width: 40 }} />
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
            <View style={styles.routeVisual}>
              <View style={styles.dash} />
              <Icon name="truck" size={16} color={colors.primary} />
            </View>
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
        <View style={styles.methodsList}>
          {PAYMENT_METHODS.map((method) => (
            <View key={method.id} style={styles.methodWrapper}>
              <TouchableOpacity 
                style={[
                  styles.methodCard,
                  { backgroundColor: method.bgColor },
                  expandedMethod === method.id && styles.methodCardExpanded
                ]}
                activeOpacity={0.8}
                onPress={() => toggleExpand(method.id)}
              >
                <View style={[styles.methodIcon, { backgroundColor: method.color + '20' }]}>
                  <Icon name={method.icon} size={24} color={method.color} />
                </View>
                <View style={styles.methodInfo}>
                  <Text style={[styles.methodName, { color: method.color }]}>{method.name}</Text>
                  <Text style={styles.methodSub}>{method.sub}</Text>
                </View>
                <Icon 
                  name={expandedMethod === method.id ? "chevron-up" : "chevron-down"} 
                  size={20} 
                  color={method.color} 
                />
              </TouchableOpacity>
              
              {expandedMethod === method.id && (
                <View style={[styles.expandedForm, { backgroundColor: method.bgColor }]}>
                  {renderPaymentForm(method)}
                </View>
              )}
            </View>
          ))}
        </View>

        <View style={styles.securityNote}>
          <Icon name="shield" size={16} color={colors.success} />
          <Text style={styles.securityText}>Secure SSL checkout powered by EA Pay</Text>
        </View>
        <View style={{ height: 60 }} />
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
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    zIndex: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayText: {
    color: colors.white,
    marginTop: 20,
    fontWeight: '800',
    fontSize: 16,
    letterSpacing: 1.5,
  },
  headerArea: {
    paddingBottom: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    ...shadows.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    borderRadius: 32,
    padding: 24,
    marginBottom: 32,
    ...shadows.lg,
  },
  summaryTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: colors.gray[400],
    letterSpacing: 2,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
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
  routeVisual: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dash: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: colors.gray[100],
  },
  label: {
    fontSize: 10,
    color: colors.gray[400],
    textTransform: 'uppercase',
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 6,
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
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: colors.gray[50],
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
    fontSize: 17,
    fontWeight: '900',
    color: colors.gray[800],
    marginBottom: 20,
    marginLeft: 4,
  },
  methodsList: {
    marginBottom: 20,
  },
  methodWrapper: {
    marginBottom: 16,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 28,
    ...shadows.md,
  },
  methodCardExpanded: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  methodIcon: {
    width: 60,
    height: 60,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  methodInfo: {
    flex: 1,
  },
  methodName: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  methodSub: {
    fontSize: 12,
    color: colors.gray[500],
    fontWeight: '500',
  },
  expandedForm: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    ...shadows.md,
  },
  formContainer: {
    marginTop: 8,
  },
  inputSpacing: {
    marginBottom: 16,
  },
  rowContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  halfWidth: {
    flex: 1,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.7)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  payButton: {
    marginTop: 8,
  },
  bankDetails: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
  },
  bankHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  bankTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.gray[700],
  },
  bankRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  bankLabel: {
    fontSize: 12,
    color: colors.gray[600],
  },
  bankValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.gray[800],
  },
  bankAmount: {
    color: colors.success,
    fontWeight: 'bold',
  },
  bankNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  bankNoteText: {
    fontSize: 10,
    color: colors.gray[500],
    fontStyle: 'italic',
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  securityText: {
    fontSize: 12,
    color: colors.gray[400],
    marginLeft: 10,
    fontWeight: '600',
  },
});

export default PaymentScreen;