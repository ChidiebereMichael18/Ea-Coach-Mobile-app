import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Animated,
  Dimensions,
  Modal,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from '@expo/vector-icons/Feather';
import { getMyBookings, cancelBooking } from '../../api/dashboardApi';
import { colors, shadows } from '../../styles/colors';
import Button from '../../components/common/Button';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

const BookingHistoryScreen = () => {
  const navigation = useNavigation();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [error, setError] = useState(null);

  const fetchBookings = useCallback(async () => {
    try {
      setError(null);
      const res = await getMyBookings();
      if (res.success && Array.isArray(res.data)) {
        setBookings(res.data);
      } else {
        setError(res.error || 'Failed to fetch bookings');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBookings();
  };

  const handleCancel = async (id) => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: async () => {
            const res = await cancelBooking(id);
            if (res.success) {
              setModalVisible(false);
              fetchBookings();
              Alert.alert('Success', 'Booking cancelled successfully');
            } else {
              Alert.alert('Error', res.error || 'Failed to cancel booking');
            }
          }
        }
      ]
    );
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed': return colors.success;
      case 'pending': return colors.warning;
      case 'cancelled': return colors.danger;
      default: return colors.gray[500];
    }
  };

  const getTotalPrice = (booking) => {
    // Try different possible field names for total price
    if (booking.totalPrice) return booking.totalPrice;
    if (booking.totalAmount) return booking.totalAmount;
    if (booking.amount) return booking.amount;
    if (booking.price) return booking.price;
    
    // Calculate from seats and route price if available
    if (booking.bookedSeats && booking.route?.price) {
      return booking.bookedSeats.length * booking.route.price;
    }
    
    return 0;
  };

  const getPassengerName = (booking) => {
    // Try different possible field names for passenger name
    if (booking.passengerName) return booking.passengerName;
    if (booking.passengers && booking.passengers.length > 0) {
      return booking.passengers[0].name;
    }
    if (booking.user?.name) return booking.user.name;
    return 'Traveler';
  };

  const getSeats = (booking) => {
    // Try different possible field names for seats
    if (booking.bookedSeats) return booking.bookedSeats;
    if (booking.seats) return booking.seats;
    if (booking.selectedSeats) return booking.selectedSeats;
    if (booking.passengers) {
      return booking.passengers.map(p => p.seatNumber || p.seat);
    }
    return [];
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient
        colors={colors.gradients.primary}
        style={styles.headerArea}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <SafeAreaView edges={['top']}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>My Trips</Text>
            <View style={styles.headerBadge}>
               <Text style={styles.headerBadgeText}>{bookings.length}</Text>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} tintColor={colors.primary} />
        }
      >
        {bookings.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconWrap}>
              <Icon name="briefcase" size={40} color={colors.gray[300]} />
            </View>
            <Text style={styles.emptyTitle}>No bookings yet</Text>
            <Text style={styles.emptyDesc}>Your travel history will appear here once you book a trip.</Text>
            <Button 
                title="Book Your First Trip" 
                onPress={() => navigation.navigate('Routes')} 
                style={styles.bookNowBtn}
            />
          </View>
        ) : (
          bookings.map((booking) => (
            <TouchableOpacity
              key={booking._id}
              style={styles.bookingCard}
              onPress={() => {
                setSelectedBooking(booking);
                setModalVisible(true);
              }}
              activeOpacity={0.8}
            >
              <View style={styles.cardHeader}>
                <View style={styles.routeMain}>
                  <View>
                    <Text style={styles.cityText}>{booking.route?.from || '—'}</Text>
                    <Text style={styles.timeText}>{booking.route?.departureTime || '—'}</Text>
                  </View>
                  <View style={styles.routeVisual}>
                    <View style={styles.routeDot} />
                    <View style={styles.routeLine} />
                    <Icon name="truck" size={16} color={colors.primary} />
                    <View style={styles.routeLine} />
                    <View style={[styles.routeDot, { backgroundColor: colors.primary }]} />
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.cityText}>{booking.route?.to || '—'}</Text>
                    <Text style={styles.timeText}>{booking.route?.arrivalTime || '—'}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.cardFooter}>
                <View style={styles.footerInfo}>
                  <Text style={styles.dateLabel}>DEPARTURE</Text>
                  <Text style={styles.dateValue}>
                    {booking.route?.departureDate ? new Date(booking.route.departureDate).toLocaleDateString() : '—'}
                  </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.bookingStatus) + '20' }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(booking.bookingStatus) }]}>
                    {booking.bookingStatus?.toUpperCase() || 'PENDING'}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Booking Details Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Ticket Details</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Icon name="x" size={24} color={colors.gray[400]} />
              </TouchableOpacity>
            </View>

            {selectedBooking && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.ticketSection}>
                   <View style={styles.ticketMain}>
                      <View style={styles.ticketRow}>
                         <View style={{ flex: 1 }}>
                            <Text style={styles.ticketLabel}>FROM</Text>
                            <Text style={styles.ticketVal}>{selectedBooking.route?.from || '—'}</Text>
                         </View>
                         <View style={{ flex: 1, alignItems: 'flex-end' }}>
                            <Text style={styles.ticketLabel}>TO</Text>
                            <Text style={styles.ticketVal}>{selectedBooking.route?.to || '—'}</Text>
                         </View>
                      </View>

                      <View style={styles.ticketDivider}>
                         <View style={styles.halfCircleLeft} />
                         <View style={styles.dashLine} />
                         <View style={styles.halfCircleRight} />
                      </View>

                      <View style={styles.ticketRow}>
                         <View style={{ flex: 1 }}>
                            <Text style={styles.ticketLabel}>PASSENGER</Text>
                            <Text style={styles.ticketVal}>{getPassengerName(selectedBooking)}</Text>
                         </View>
                         <View style={{ flex: 1, alignItems: 'flex-end' }}>
                            <Text style={styles.ticketLabel}>SEAT</Text>
                            <Text style={styles.ticketVal}>
                              {getSeats(selectedBooking).length > 0 
                                ? getSeats(selectedBooking).join(', ') 
                                : '—'}
                            </Text>
                         </View>
                      </View>

                      <View style={styles.ticketRow}>
                         <View style={{ flex: 1 }}>
                            <Text style={styles.ticketLabel}>BUS NUMBER</Text>
                            <Text style={styles.ticketVal}>{selectedBooking.bus?.busNumber || selectedBooking.busNumber || '—'}</Text>
                         </View>
                         <View style={{ flex: 1, alignItems: 'flex-end' }}>
                            <Text style={styles.ticketLabel}>TOTAL PRICE</Text>
                            <Text style={[styles.ticketVal, { color: colors.primary }]}>
                              UGX {getTotalPrice(selectedBooking).toLocaleString()}
                            </Text>
                         </View>
                      </View>

                      {selectedBooking.bookingStatus && (
                        <View style={[styles.statusContainer, { backgroundColor: getStatusColor(selectedBooking.bookingStatus) + '10' }]}>
                          <Text style={[styles.statusTextLarge, { color: getStatusColor(selectedBooking.bookingStatus) }]}>
                            {selectedBooking.bookingStatus.toUpperCase()}
                          </Text>
                        </View>
                      )}
                   </View>
                </View>

                <View style={styles.modalActions}>
                  <Button
                    title="Download Ticket"
                    variant="primary"
                    icon="download"
                    style={styles.modalBtn}
                    onPress={() => {
                      Alert.alert('Coming Soon', 'Ticket download feature will be available soon on mobile!');
                    }}
                  />
                  {selectedBooking.bookingStatus?.toLowerCase() === 'pending' && (
                    <Button
                      title="Cancel Booking"
                      variant="danger"
                      onPress={() => handleCancel(selectedBooking._id)}
                      style={[styles.modalBtn, { marginTop: 12 }]}
                    />
                  )}
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
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
    paddingHorizontal: 24,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.white,
  },
  headerBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 12,
  },
  headerBadgeText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
  scrollContent: {
    padding: 20,
  },
  bookingCard: {
    backgroundColor: colors.white,
    borderRadius: 24,
    marginBottom: 20,
    ...shadows.md,
    overflow: 'hidden',
  },
  cardHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[50],
  },
  routeMain: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cityText: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.gray[800],
    letterSpacing: 0.2,
  },
  timeText: {
    fontSize: 12,
    color: colors.gray[400],
    marginTop: 2,
    fontWeight: '500',
  },
  routeVisual: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 16,
  },
  routeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.gray[200],
  },
  routeLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.gray[100],
    marginHorizontal: 4,
  },
  cardFooter: {
    backgroundColor: colors.gray[50],
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerInfo: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 9,
    color: colors.gray[400],
    fontWeight: '700',
    letterSpacing: 1,
  },
  dateValue: {
    fontSize: 13,
    color: colors.gray[600],
    fontWeight: '600',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  statusContainer: {
    marginTop: 20,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  statusTextLarge: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  // Empty State
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 30,
    backgroundColor: colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.gray[800],
  },
  emptyDesc: {
    fontSize: 14,
    color: colors.gray[400],
    textAlign: 'center',
    marginHorizontal: 40,
    marginTop: 8,
    lineHeight: 20,
  },
  bookNowBtn: {
    marginTop: 24,
    width: 200,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.gray[900],
  },
  ticketSection: {
    marginBottom: 24,
  },
  ticketMain: {
    padding: 24,
    backgroundColor: colors.gray[50],
    borderRadius: 24,
  },
  ticketRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  ticketLabel: {
    fontSize: 10,
    color: colors.gray[400],
    fontWeight: 'bold',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  ticketVal: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.gray[800],
  },
  ticketDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    marginHorizontal: -24,
  },
  halfCircleLeft: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.white,
    marginLeft: -12,
  },
  halfCircleRight: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.white,
    marginRight: -12,
  },
  dashLine: {
    flex: 1,
    height: 1,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderStyle: 'dashed',
    borderRadius: 1,
  },
  modalActions: {
    paddingBottom: 20,
  },
  modalBtn: {
    height: 56,
  },
});

export default BookingHistoryScreen;