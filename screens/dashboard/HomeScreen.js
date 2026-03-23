import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import { useAuth } from '../../context/AuthContext';
import { getTotalBookingAmount, getMyBookings } from '../../api/dashboardApi';
import { colors } from '../../styles/colors';
import Button from '../../components/common/Button';

const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalAmount: 0, totalBookings: 0 });
  const [upcomingTrips, setUpcomingTrips] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const [amountRes, bookingsRes] = await Promise.all([
        getTotalBookingAmount(),
        getMyBookings()
      ]);

      if (amountRes.success && amountRes.data) {
        setStats({
          totalAmount: amountRes.data.totalAmount ?? 0,
          totalBookings: amountRes.data.totalBookings ?? 0,
        });
      }

      if (bookingsRes.success && Array.isArray(bookingsRes.data)) {
        const bookings = bookingsRes.data;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Upcoming trips
        const upcoming = bookings
          .filter(b => b.bookingStatus === 'confirmed' && new Date(b.route?.departureDate) >= today)
          .slice(0, 3);
        setUpcomingTrips(upcoming);

        // Recent activity logic
        const activity = bookings.slice(0, 3).map(b => ({
          id: b._id,
          title: `Ticket to ${b.route?.to || 'destination'}`,
          time: b.createdAt ? formatTimeDiff(new Date(b.createdAt)) : '—',
          icon: 'calendar'
        }));
        setRecentActivity(activity);
      } else if (!bookingsRes.success) {
        setError(bookingsRes.error || 'Failed to load bookings');
      }
    } catch (err) {
      setError('Failed to refresh data. Check your connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const formatTimeDiff = (date) => {
    const diff = (Date.now() - date.getTime()) / 3600000;
    if (diff < 1) return 'Just now';
    if (diff < 24) return `${Math.floor(diff)} hours ago`;
    return `${Math.floor(diff / 24)} days ago`;
  };

  const formatAmount = (n) => (n != null ? `UGX ${Number(n).toLocaleString()}` : '—');

  const statCards = [
    { label: 'Total Trips', value: String(stats.totalBookings), icon: 'trending-up', color: colors.primary },
    { label: 'Total Spent', value: formatAmount(stats.totalAmount), icon: 'award', color: colors.success },
    { label: 'Upcoming', value: String(upcomingTrips.length), icon: 'calendar', color: colors.secondary },
  ];

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      >
        {/* Welcome Block */}
        <View style={styles.welcomeBanner}>
          <View>
            <Text style={styles.welcomeTitle}>Welcome back,</Text>
            <Text style={styles.userName}>{user?.name?.split(' ')[0] || 'Traveler'}!</Text>
            <Text style={styles.welcomeSub}>Ready for your next journey?</Text>
          </View>
          <TouchableOpacity 
            style={styles.avatar}
            onPress={() => navigation.navigate('Profile')}
          >
            <Icon name="user" size={24} color={colors.white} />
          </TouchableOpacity>
        </View>

        {error && (
          <View style={styles.errorBanner}>
            <Icon name="alert-circle" size={18} color={colors.danger} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Stats Grid */}
        <View style={styles.section}>
          <View style={styles.statsGrid}>
            {statCards.map((stat, index) => (
              <View key={index} style={styles.statCard}>
                <View style={[styles.statIconBg, { backgroundColor: stat.color + '15' }]}>
                  <Icon name={stat.icon} size={20} color={stat.color} />
                </View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Upcoming Trips */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Trips</Text>
            <TouchableOpacity onPress={() => navigation.navigate('History')}>
              <Text style={styles.viewAll}>View All</Text>
            </TouchableOpacity>
          </View>

          {upcomingTrips.length === 0 ? (
            <View style={styles.emptyCard}>
              <Icon name="calendar" size={32} color={colors.gray[300]} />
              <Text style={styles.emptyText}>No upcoming trips found.</Text>
              <Button 
                title="Book a Trip" 
                variant="outline"
                size="small"
                onPress={() => navigation.navigate('Booking')} 
              />
            </View>
          ) : (
            upcomingTrips.map((trip) => (
              <View key={trip._id} style={styles.tripCard}>
                <View style={styles.tripHeader}>
                  <View style={styles.locationContainer}>
                    <Icon name="map-pin" size={16} color={colors.primary} />
                    <Text style={styles.locationText}>{trip.route?.from} → {trip.route?.to}</Text>
                  </View>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>{trip.bookingStatus}</Text>
                  </View>
                </View>
                <View style={styles.tripDetails}>
                  <View style={styles.detailItem}>
                    <Icon name="calendar" size={14} color={colors.gray[400]} />
                    <Text style={styles.detailText}>{new Date(trip.route?.departureDate).toLocaleDateString()}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Icon name="clock" size={14} color={colors.gray[400]} />
                    <Text style={styles.detailText}>{trip.route?.departureTime}</Text>
                  </View>
                </View>
                <View style={styles.busInfo}>
                  <Text style={styles.busText}>Bus: {trip.bus?.busNumber}</Text>
                  <Text style={styles.seatText}>Seat {trip.bookedSeats?.[0]}</Text>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionGrid}>
            <TouchableOpacity 
              style={styles.actionItem}
              onPress={() => navigation.navigate('Booking')}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#DBEAFE' }]}>
                <Icon name="plus" size={24} color="#2563EB" />
              </View>
              <Text style={styles.actionLabel}>New Booking</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionItem}
              onPress={() => navigation.navigate('History')}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#DCFCE7' }]}>
                <Icon name="list" size={24} color="#10B981" />
              </View>
              <Text style={styles.actionLabel}>History</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionItem}
              onPress={() => navigation.navigate('ChatSupport')}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#FEF3C7' }]}>
                <Icon name="message-circle" size={24} color="#F59E0B" />
              </View>
              <Text style={styles.actionLabel}>Support</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeBanner: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  welcomeTitle: {
    fontSize: 16,
    color: colors.white,
    opacity: 0.9,
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.white,
    marginVertical: 4,
  },
  welcomeSub: {
    fontSize: 14,
    color: colors.white,
    opacity: 0.8,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    padding: 12,
    marginHorizontal: 24,
    marginTop: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  errorText: {
    color: colors.danger,
    fontSize: 13,
    marginLeft: 8,
    flex: 1,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.gray[800],
  },
  viewAll: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '31%',
    backgroundColor: colors.white,
    padding: 12,
    borderRadius: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  statIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.gray[900],
  },
  statLabel: {
    fontSize: 11,
    color: colors.gray[500],
    marginTop: 2,
  },
  tripCard: {
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.gray[900],
    marginLeft: 6,
  },
  statusBadge: {
    backgroundColor: colors.success + '15',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 11,
    color: colors.success,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  tripDetails: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  detailText: {
    fontSize: 13,
    color: colors.gray[500],
    marginLeft: 6,
  },
  busInfo: {
    flexDirection: 'row',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
  },
  busText: {
    fontSize: 12,
    color: colors.gray[400],
    marginRight: 16,
  },
  seatText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
  emptyCard: {
    backgroundColor: colors.white,
    padding: 32,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: colors.gray[400],
    marginTop: 12,
    marginBottom: 16,
  },
  actionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  actionItem: {
    width: '30%',
    alignItems: 'center',
  },
  actionIcon: {
    width: 60,
    height: 60,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 12,
    color: colors.gray[700],
    fontWeight: '500',
  },
});

export default HomeScreen;
