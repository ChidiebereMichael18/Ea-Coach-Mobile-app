import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather as Icon } from '@expo/vector-icons';
import { colors } from '../../styles/colors';
import Button from '../../components/common/Button';

const BookingConfirmationScreen = ({ route, navigation }) => {
  const { bookingId, bus, from, to, date, totalAmount, paymentMethod, selectedSeats } = route.params;

  // Prevent going back to payment
  React.useEffect(() => {
    const handleBack = () => {
        navigation.navigate('MainTabs', { screen: 'Bookings' });
        return true;
    };
    BackHandler.addEventListener('hardwareBackPress', handleBack);
    return () => BackHandler.removeEventListener('hardwareBackPress', handleBack);
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.successArea}>
          <View style={styles.successIcon}>
            <Icon name="check" size={56} color={colors.white} />
          </View>
          <Text style={styles.successTitle}>Booking Successful!</Text>
          <Text style={styles.successDesc}>
            Your seats are reserved. A confirmation message was sent to your phone.
          </Text>
        </View>

        <View style={styles.ticketCard}>
          <View style={styles.ticketHeader}>
            <Text style={styles.bookingNumber}># {bookingId}</Text>
            <View style={[styles.statusBadge, { backgroundColor: colors.success + '15' }]}>
                <Text style={styles.statusText}>CONFIRMED</Text>
            </View>
          </View>

          <View style={styles.routeBox}>
            <View style={styles.point}>
              <Text style={styles.city}>{from}</Text>
              <Text style={styles.time}>{bus.route?.departureTime}</Text>
            </View>
            <Icon name="arrow-right" size={24} color={colors.primary} />
            <View style={[styles.point, { alignItems: 'flex-end' }]}>
              <Text style={styles.city}>{to}</Text>
              <Text style={styles.time}>{bus.route?.arrivalTime}</Text>
            </View>
          </View>

          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
                <Text style={styles.label}>DATE</Text>
                <Text style={styles.val}>{new Date(date).toDateString()}</Text>
            </View>
            <View style={styles.detailItem}>
                <Text style={styles.label}>OPERATOR</Text>
                <Text style={styles.val}>{bus.operator?.name}</Text>
            </View>
            <View style={styles.detailItem}>
                <Text style={styles.label}>TOTAL PRICE</Text>
                <Text style={styles.val}>UGX {totalAmount.toLocaleString()}</Text>
            </View>
            <View style={styles.detailItem}>
                <Text style={styles.label}>SEATS</Text>
                <Text style={styles.val}>{selectedSeats.join(', ')}</Text>
            </View>
          </View>

          <View style={styles.qrPlaceholder}>
            <Icon name="grid" size={120} color={colors.gray[100]} />
            <Text style={styles.qrText}>PRESENT AT BOARDING</Text>
          </View>
        </View>

        <Button 
            title="Go to My Bookings" 
            onPress={() => navigation.navigate('MainTabs', { screen: 'Bookings' })} 
            style={styles.actionBtn}
        />
        <Button 
            title="Book Another Trip" 
            variant="outline"
            onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })} 
            style={[styles.actionBtn, { marginTop: 12 }]}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  successArea: {
    backgroundColor: colors.primary,
    paddingTop: 60,
    paddingBottom: 80,
    paddingHorizontal: 30,
    alignItems: 'center',
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
  },
  successIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 12,
  },
  successDesc: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 24,
  },
  ticketCard: {
    backgroundColor: colors.white,
    marginHorizontal: 20,
    marginTop: -40,
    borderRadius: 32,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  bookingNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.gray[800],
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.success,
  },
  routeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[50],
    marginBottom: 24,
  },
  point: {
    flex: 1,
  },
  city: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.gray[900],
  },
  time: {
    fontSize: 14,
    color: colors.gray[400],
    marginTop: 4,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  detailItem: {
    width: '50%',
    marginBottom: 20,
  },
  label: {
    fontSize: 11,
    color: colors.gray[400],
    letterSpacing: 1,
    marginBottom: 4,
  },
  val: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.gray[800],
  },
  qrPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: colors.gray[50],
    borderStyle: 'dashed',
  },
  qrText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.gray[200],
    marginTop: -20,
    letterSpacing: 2,
  },
  actionBtn: {
    marginHorizontal: 20,
    marginTop: 30,
    height: 56,
  },
});

export default BookingConfirmationScreen;
