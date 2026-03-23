import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  ActivityIndicator,
  Modal,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import { getMyBookings } from '../../api/dashboardApi';
import { colors } from '../../styles/colors';
import Button from '../../components/common/Button';

const { width } = Dimensions.get('window');

const BookingHistoryScreen = ({ navigation }) => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Modal State
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [aiTip, setAiTip] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);

  // OpenAI Integration (Mocked or using VITE_ key approach)
  // Note: On mobile we don't use 'import.meta', but I'll use a placeholder for the key.
  const OPENAI_API_KEY = ""; // User should provide this or use env

  useEffect(() => {
    if (showModal && selectedBooking?.route?.to && OPENAI_API_KEY) {
      setAiTip('Loading personalized travel tip...');
      setLoadingAi(true);
      fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'You are EA Coach AI. Generate a very brief 1-sentence fun fact or travel tip about the destination.' },
            { role: 'user', content: `Destination: ${selectedBooking.route.to}` }
          ],
          max_tokens: 50
        })
      })
      .then(res => res.json())
      .then(data => {
        if (data.choices && data.choices[0]) {
          setAiTip(data.choices[0].message.content);
        } else {
          setAiTip('');
        }
      })
      .catch((e) => {
        console.error('AI Error:', e);
        setAiTip('');
      })
      .finally(() => setLoadingAi(false));
    }
  }, [showModal, selectedBooking]);

  const fetchBookings = useCallback(async () => {
    try {
      setError(null);
      const res = await getMyBookings();
      if (res.success && Array.isArray(res.data)) {
        setBookings(res.data);
      } else {
        setError(res.error || 'Failed to load bookings');
      }
    } catch (err) {
      setError('Connection error. Could not load bookings.');
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

  const statusForFilter = (b) => b.bookingStatus || b.paymentStatus || 'confirmed';

  const filteredBookings = bookings.filter((booking) => {
    if (activeFilter !== 'all' && statusForFilter(booking) !== activeFilter) return false;
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      const id = (booking.bookingId || booking._id || '').toString().toLowerCase();
      const from = (booking.route?.from || '').toLowerCase();
      const to = (booking.route?.to || '').toLowerCase();
      return id.includes(search) || from.includes(search) || to.includes(search);
    }
    return true;
  });

  const getStatusStyle = (status) => {
    switch(status) {
      case 'confirmed': return { bg: '#DCFCE7', text: '#166534' };
      case 'completed': return { bg: '#DBEAFE', text: '#1E40AF' };
      case 'cancelled': return { bg: '#FEE2E2', text: '#991B1B' };
      case 'pending': return { bg: '#FEF3C7', text: '#92400E' };
      default: return { bg: '#F3F4F6', text: '#374151' };
    }
  };

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setShowModal(true);
  };

  const renderBookingCard = (booking) => {
    const status = statusForFilter(booking);
    const styles_status = getStatusStyle(status);
    const date = booking.route?.departureDate ? new Date(booking.route.departureDate).toLocaleDateString() : '—';

    return (
      <TouchableOpacity 
        key={booking.bookingId || booking._id} 
        style={styles.card}
        onPress={() => handleViewDetails(booking)}
      >
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.cardIdLabel}>Booking ID</Text>
            <Text style={styles.cardId}>{booking.bookingId || booking._id?.slice(-8).toUpperCase()}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: styles_status.bg }]}>
            <Text style={[styles.statusText, { color: styles_status.text }]}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Text>
          </View>
        </View>

        <View style={styles.routeRow}>
          <View style={styles.routeItem}>
            <Text style={styles.routeLabel}>From</Text>
            <Text style={styles.routeCity}>{booking.route?.from || '—'}</Text>
          </View>
          <Icon name="arrow-right" size={16} color={colors.gray[300]} style={styles.arrowIcon} />
          <View style={styles.routeItem}>
            <Text style={styles.routeLabel}>To</Text>
            <Text style={styles.routeCity}>{booking.route?.to || '—'}</Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.footerItem}>
            <Icon name="calendar" size={14} color={colors.gray[400]} />
            <Text style={styles.footerText}>{date}</Text>
          </View>
          <View style={styles.footerItem}>
            <Icon name="credit-card" size={14} color={colors.gray[400]} />
            <Text style={styles.footerText}>UGX {booking.totalAmount?.toLocaleString()}</Text>
          </View>
          <View style={styles.viewBtn}>
            <Text style={styles.viewBtnText}>Details</Text>
            <Icon name="chevron-right" size={14} color={colors.primary} />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>History</Text>
        <Text style={styles.subtitle}>Check your past and upcoming travels</Text>
      </View>

      <View style={styles.controls}>
        <View style={styles.searchBar}>
          <Icon name="search" size={18} color={colors.gray[400]} style={styles.searchIcon} />
          <TextInput
            placeholder="Search bookings..."
            value={searchTerm}
            onChangeText={setSearchTerm}
            style={styles.searchInput}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterList}>
          {['all', 'confirmed', 'completed', 'pending', 'cancelled'].map(f => (
            <TouchableOpacity 
              key={f} 
              onPress={() => setActiveFilter(f)}
              style={[styles.filterChip, activeFilter === f && styles.activeChip]}
            >
              <Text style={[styles.filterTxt, activeFilter === f && styles.activeFilterTxt]}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView 
        style={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {filteredBookings.length > 0 ? (
          filteredBookings.map(renderBookingCard)
        ) : (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
              <Icon name="calendar" size={48} color={colors.gray[200]} />
            </View>
            <Text style={styles.emptyTitle}>No bookings found</Text>
            <Text style={styles.emptySub}>Try adjusting your filters or search term.</Text>
            <Button title="Book a Trip" onPress={() => navigation.navigate('Home')} style={styles.bookBtn} />
          </View>
        )}
      </ScrollView>

      {/* Ticket Modal */}
      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Travel Ticket</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Icon name="x" size={24} color={colors.gray[600]} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.ticketScroll} showsVerticalScrollIndicator={false}>
              <View style={styles.ticketCard}>
                <View style={styles.ticketBrand}>
                  <Text style={styles.brandName}>EA Coach</Text>
                  <View style={styles.ticketIdBlock}>
                    <Text style={styles.ticketIdLabel}>TICKET ID</Text>
                    <Text style={styles.ticketIdVal}>{selectedBooking?.bookingId || selectedBooking?._id?.toUpperCase()}</Text>
                  </View>
                </View>

                {/* Route Section */}
                <View style={styles.ticketRoute}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cityLabel}>FROM</Text>
                    <Text style={styles.cityName}>{selectedBooking?.route?.from}</Text>
                    <Text style={styles.timeVal}>{selectedBooking?.route?.departureTime}</Text>
                  </View>
                  <View style={styles.routeDecoration}>
                    <View style={styles.dashedLine} />
                    <Icon name="truck" size={20} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1, alignItems: 'flex-end' }}>
                    <Text style={styles.cityLabel}>TO</Text>
                    <Text style={styles.cityName}>{selectedBooking?.route?.to}</Text>
                    <Text style={styles.timeVal}>{selectedBooking?.route?.arrivalTime || '—'}</Text>
                  </View>
                </View>

                {/* AI Tip Integration */}
                {(loadingAi || aiTip) && (
                  <View style={styles.aiBox}>
                    <Text style={styles.aiHeading}>✨ EA AI TRAVEL TIP</Text>
                    {loadingAi ? (
                      <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: 8 }} />
                    ) : (
                      <Text style={styles.aiText}>“{aiTip}”</Text>
                    )}
                  </View>
                )}

                {/* Details Section */}
                <View style={styles.ticketDetails}>
                   <View style={styles.detailRow}>
                      <View style={styles.detailCell}>
                        <Text style={styles.tDetailLabel}>DATE</Text>
                        <Text style={styles.tDetailVal}>{selectedBooking?.route?.departureDate ? new Date(selectedBooking.route.departureDate).toDateString() : '—'}</Text>
                      </View>
                      <View style={styles.detailCell}>
                        <Text style={styles.tDetailLabel}>SEATS</Text>
                        <Text style={styles.tDetailValPrimary}>
                          {selectedBooking?.bookedSeats?.join(', ') || '—'}
                        </Text>
                      </View>
                   </View>
                   <View style={styles.detailRow}>
                      <View style={styles.detailCell}>
                        <Text style={styles.tDetailLabel}>BUS NUMBER</Text>
                        <Text style={styles.tDetailVal}>{selectedBooking?.bus?.busNumber || '—'}</Text>
                      </View>
                      <View style={styles.detailCell}>
                        <Text style={styles.tDetailLabel}>AMOUNT PAID</Text>
                        <Text style={styles.tDetailVal}>UGX {selectedBooking?.totalAmount?.toLocaleString()}</Text>
                      </View>
                   </View>
                </View>

                {/* Passengers */}
                <View style={styles.passengerListTicket}>
                   <Text style={styles.tDetailLabel}>PASSENGERS</Text>
                   {selectedBooking?.passengers?.map((p, i) => (
                      <View key={i} style={styles.pTag}>
                         <Icon name="user" size={12} color={colors.gray[400]} />
                         <Text style={styles.pTagName}>{p.name} ({p.gender})</Text>
                      </View>
                   ))}
                </View>

                <View style={styles.barcodeBox}>
                  <Icon name="maximize" size={40} color={colors.gray[200]} />
                  <Text style={styles.barcodeText}>Scan for check-in</Text>
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <Button title="Share Ticket" 
                variant="outline"
                onPress={() => Alert.alert('Share', 'Share functionality coming soon!')} 
                style={styles.modalBtn} 
              />
              <Button title="Download PDF" 
                onPress={() => Alert.alert('Download', 'PDF Generation requires expo-print.')} 
                style={styles.modalBtn} 
              />
            </View>
          </View>
        </View>
      </Modal>

      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 24,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.gray[900],
  },
  subtitle: {
    fontSize: 14,
    color: colors.gray[400],
    marginTop: 4,
  },
  controls: {
    padding: 16,
    backgroundColor: colors.white,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[50],
    paddingHorizontal: 16,
    borderRadius: 16,
    height: 52,
    borderWidth: 1,
    borderColor: colors.gray[100],
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.gray[800],
  },
  filterList: {
    marginTop: 16,
    flexDirection: 'row',
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.gray[50],
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  activeChip: {
    backgroundColor: colors.primary + '15',
    borderColor: colors.primary,
  },
  filterTxt: {
    fontSize: 13,
    color: colors.gray[500],
    fontWeight: '500',
  },
  activeFilterTxt: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  list: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  cardIdLabel: {
    fontSize: 10,
    color: colors.gray[400],
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  cardId: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.gray[900],
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.gray[50],
  },
  routeItem: {
    flex: 1,
  },
  routeLabel: {
    fontSize: 10,
    color: colors.gray[400],
    fontWeight: 'bold',
  },
  routeCity: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.gray[800],
    marginTop: 2,
  },
  arrowIcon: {
    marginHorizontal: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  footerText: {
    fontSize: 13,
    color: colors.gray[500],
    marginLeft: 6,
  },
  viewBtn: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewBtnText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: 'bold',
    marginRight: 4,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.gray[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.gray[800],
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 14,
    color: colors.gray[400],
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  bookBtn: {
    width: 200,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#F9FAFB',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    height: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    backgroundColor: colors.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.gray[900],
  },
  ticketScroll: {
    flex: 1,
    padding: 20,
  },
  ticketCard: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.gray[200],
    marginBottom: 40,
  },
  ticketBrand: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
    borderStyle: 'dashed',
    marginBottom: 20,
  },
  brandName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
  ticketIdBlock: {
    alignItems: 'flex-end',
  },
  ticketIdLabel: {
    fontSize: 10,
    color: colors.gray[400],
    fontWeight: 'bold',
  },
  ticketIdVal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.gray[800],
    fontFamily: 'monospace',
  },
  ticketRoute: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  cityLabel: {
    fontSize: 10,
    color: colors.primary,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cityName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.gray[900],
  },
  timeVal: {
    fontSize: 14,
    color: colors.gray[500],
    marginTop: 4,
  },
  routeDecoration: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  dashedLine: {
    width: '100%',
    height: 1,
    backgroundColor: colors.gray[200],
    position: 'absolute',
    top: 10,
  },
  aiBox: {
    backgroundColor: '#F0F9FF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  aiHeading: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#0369A1',
    letterSpacing: 1,
  },
  aiText: {
    fontSize: 13,
    color: colors.gray[700],
    lineHeight: 20,
    marginTop: 6,
    fontStyle: 'italic',
  },
  ticketDetails: {
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  detailCell: {
    flex: 1,
  },
  tDetailLabel: {
    fontSize: 10,
    color: colors.gray[400],
    fontWeight: 'bold',
    marginBottom: 6,
  },
  tDetailVal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.gray[800],
  },
  tDetailValPrimary: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  passengerListTicket: {
    marginBottom: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
  },
  pTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[50],
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 8,
  },
  pTagName: {
    fontSize: 13,
    color: colors.gray[800],
    marginLeft: 8,
    fontWeight: '500',
  },
  barcodeBox: {
    alignItems: 'center',
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
    borderStyle: 'dashed',
  },
  barcodeText: {
    fontSize: 12,
    color: colors.gray[300],
    marginTop: 10,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
    justifyContent: 'space-between',
  },
  modalBtn: {
    width: '48%',
  },
  errorBanner: {
    backgroundColor: colors.danger,
    padding: 16,
    margin: 16,
    borderRadius: 12,
  },
  errorText: {
    color: colors.white,
    textAlign: 'center',
    fontSize: 14,
  },
});

export default BookingHistoryScreen;
