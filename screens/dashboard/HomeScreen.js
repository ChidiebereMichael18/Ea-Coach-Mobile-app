import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '@expo/vector-icons/Feather';
import { useAuth } from '../../context/AuthContext';
import { getTotalBookingAmount, getMyBookings } from '../../api/dashboardApi';
import { colors, shadows } from '../../styles/colors';
import Button from '../../components/common/Button';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalAmount: 0, totalBookings: 0 });
  const [upcomingTrips, setUpcomingTrips] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const fadeAnim = useState(new Animated.Value(0))[0];

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

        const upcoming = bookings
          .filter(b => b.bookingStatus === 'confirmed' && new Date(b.route?.departureDate) >= today)
          .slice(0, 3);
        setUpcomingTrips(upcoming);

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
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
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
    if (diff < 24) return `${Math.floor(diff)}h ago`;
    return `${Math.floor(diff / 24)}d ago`;
  };

  const formatAmount = (n) => (n != null ? `UGX ${Number(n).toLocaleString()}` : '—');

  const quickActions = [
    { label: 'Book Trip', icon: 'plus-circle', color: colors.primary, bg: colors.primaryGhost, nav: 'Booking' },
    { label: 'My Trips', icon: 'briefcase', color: '#059669', bg: '#D1FAE5', nav: 'BookingHistory' },
    { label: 'Explore', icon: 'compass', color: '#0EA5E9', bg: '#E0F2FE', nav: 'Routes' },
    { label: 'Support', icon: 'headphones', color: '#F59E0B', bg: '#FEF3C7', nav: 'ChatSupport' },
  ];

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        style={{ opacity: fadeAnim }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.white]} tintColor={colors.white} />
        }
      >
        {/* Hero Header with LinearGradient */}
        <LinearGradient
          colors={colors.gradients.primary}
          style={styles.hero}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <SafeAreaView edges={['top']}>
            <View style={styles.heroDecor1} />
            <View style={styles.heroDecor2} />
            <View style={styles.heroContent}>
              <View style={{ flex: 1 }}>
                <Text style={styles.greeting}>Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'},</Text>
                <Text style={styles.userName}>{user?.name?.split(' ')[0] || 'Traveler'} 👋</Text>
              </View>
              <TouchableOpacity 
                style={styles.avatarBtn}
                onPress={() => navigation.navigate('Profile')}
              >
                <Text style={styles.avatarInitial}>{user?.name?.charAt(0)?.toUpperCase() || 'T'}</Text>
              </TouchableOpacity>
            </View>

            {/* Stats row inside hero */}
            <View style={styles.statsRow}>
              <View style={styles.statPill}>
                <Icon name="navigation" size={14} color={colors.white} />
                <Text style={styles.statPillVal}>{stats.totalBookings}</Text>
                <Text style={styles.statPillLabel}>Trips</Text>
              </View>
              <View style={[styles.statPill, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                <Icon name="credit-card" size={14} color={colors.white} />
                <Text style={styles.statPillVal}>{formatAmount(stats.totalAmount)}</Text>
                <Text style={styles.statPillLabel}>Spent</Text>
              </View>
              <View style={[styles.statPill, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                <Icon name="clock" size={14} color={colors.white} />
                <Text style={styles.statPillVal}>{upcomingTrips.length}</Text>
                <Text style={styles.statPillLabel}>Upcoming</Text>
              </View>
            </View>
          </SafeAreaView>
        </LinearGradient>

        <View style={styles.contentWrap}>
          {error && (
            <View style={styles.errorBanner}>
              <Icon name="wifi-off" size={16} color={colors.danger} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Quick Actions Grid */}
          <View style={styles.section}>
            {/* <Text style={styles.sectionTitle}>Quick Actions</Text> */}
            <View style={styles.actionGrid}>
              {quickActions.map((action, idx) => (
                <TouchableOpacity 
                  key={idx} 
                  style={styles.actionCard}
                  onPress={() => navigation.navigate(action.nav)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.actionIconWrap, { backgroundColor: action.bg }]}>
                    <Icon name={action.icon} size={24} color={action.color} />
                  </View>
                  <Text style={styles.actionLabel}>{action.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Upcoming Trips */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Upcoming Trips</Text>
              <TouchableOpacity onPress={() => navigation.navigate('BookingHistory')}>
                <Text style={styles.seeAllBtn}>See All</Text>
              </TouchableOpacity>
            </View>

            {upcomingTrips.length === 0 ? (
              <View style={styles.emptyCard}>
                <View style={styles.emptyIconWrap}>
                  <Icon name="map" size={28} color={colors.gray[300]} />
                </View>
                <Text style={styles.emptyTitle}>No upcoming trips</Text>
                <Text style={styles.emptyDesc}>Book your next adventure now!</Text>
                <TouchableOpacity 
                  style={styles.emptyBookBtn}
                  onPress={() => navigation.navigate('Booking')}
                >
                  <Text style={styles.emptyBookBtnText}>Book a Trip</Text>
                  <Icon name="arrow-right" size={16} color={colors.primary} />
                </TouchableOpacity>
              </View>
            ) : (
              upcomingTrips.map((trip) => (
                <TouchableOpacity 
                  key={trip._id} 
                  style={styles.tripCard}
                  onPress={() => navigation.navigate('BookingHistory')}
                >
                  <View style={styles.tripBadgeRow}>
                    <View style={styles.tripBadge}>
                      <View style={styles.tripBadgeDot} />
                      <Text style={styles.tripBadgeText}>Confirmed</Text>
                    </View>
                    <Text style={styles.tripDate}>
                      {trip.route?.departureDate ? new Date(trip.route.departureDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                    </Text>
                  </View>
                  <View style={styles.tripRoute}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.tripCity}>{trip.route?.from}</Text>
                      <Text style={styles.tripTime}>{trip.route?.departureTime}</Text>
                    </View>
                    <View style={styles.routeVisual}>
                      <View style={styles.routeDot} />
                      <View style={styles.routeDash} />
                      <Icon name="truck" size={16} color={colors.primary} />
                      <View style={styles.routeDash} />
                      <View style={[styles.routeDot, { backgroundColor: colors.primary }]} />
                    </View>
                    <View style={{ flex: 1, alignItems: 'flex-end' }}>
                      <Text style={styles.tripCity}>{trip.route?.to}</Text>
                      <Text style={styles.tripTime}>{trip.route?.arrivalTime || '—'}</Text>
                    </View>
                  </View>
                  <View style={styles.tripFooter}>
                    <View style={styles.tripMeta}>
                      <Icon name="hash" size={12} color={colors.gray[400]} />
                      <Text style={styles.tripMetaText}>{trip.bus?.busNumber || '—'}</Text>
                    </View>
                    <View style={styles.tripMeta}>
                      <Icon name="grid" size={12} color={colors.gray[400]} />
                      <Text style={styles.tripMetaText}>Seat {trip.bookedSeats?.[0] || '—'}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>

          {/* Recent Activity */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <View style={styles.activityList}>
              {recentActivity.map((activity) => (
                <View key={activity.id} style={styles.activityItem}>
                  <View style={styles.activityIconWrap}>
                    <Icon name={activity.icon} size={14} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.activityTitle}>{activity.title}</Text>
                    <Text style={styles.activityTime}>{activity.time}</Text>
                  </View>
                  <Icon name="chevron-right" size={16} color={colors.gray[300]} />
                </View>
              ))}
            </View>
          </View>
          
          {/* Bottom spacing for tab bar */}
          <View style={{ height: 100 }} />
        </View>
      </Animated.ScrollView>
    </View>
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
    backgroundColor: colors.gray[50],
  },
  contentWrap: {
    marginTop: -28, // Pull up to overlap hero slightly
  },

  // Hero
  hero: {
    paddingBottom: 48,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
  },
  heroDecor1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.06)',
    top: -60,
    right: -40,
  },
  heroDecor2: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.04)',
    bottom: -30,
    left: -20,
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
    marginBottom: 24,
  },
  greeting: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
  },
  userName: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.white,
    marginTop: 4,
  },
  avatarBtn: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  avatarInitial: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statPill: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    padding: 12,
    borderRadius: 16,
    marginRight: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  statPillVal: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.white,
    marginVertical: 4,
  },
  statPillLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Sections
  section: {
    marginBottom: 28,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.gray[800],
    marginBottom: 16,
  },
  seeAllBtn: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '700',
  },

  // Action Grid
  actionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    padding: 20,
    borderRadius: 24,
    ...shadows.md,
  },
  actionCard: {
    alignItems: 'center',
    width: '22%',
  },
  actionIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.gray[600],
    textAlign: 'center',
  },

  // Trip Cards
  tripCard: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    ...shadows.md,
  },
  tripBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  tripBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  tripBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#059669',
    marginRight: 6,
  },
  tripBadgeText: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '700',
  },
  tripDate: {
    fontSize: 12,
    color: colors.gray[400],
    fontWeight: '600',
  },
  tripRoute: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  tripCity: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.gray[800],
  },
  tripTime: {
    fontSize: 13,
    color: colors.gray[400],
    marginTop: 4,
    fontWeight: '500',
  },
  routeVisual: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
  },
  routeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.gray[200],
  },
  routeDash: {
    width: 16,
    height: 2,
    backgroundColor: colors.gray[100],
    marginHorizontal: 2,
  },
  tripFooter: {
    flexDirection: 'row',
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: colors.gray[50],
  },
  tripMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  tripMetaText: {
    fontSize: 12,
    color: colors.gray[500],
    marginLeft: 6,
    fontWeight: '600',
  },

  // Activity
  activityList: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 12,
    ...shadows.md,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[50],
  },
  activityIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.primaryGhost,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray[800],
  },
  activityTime: {
    fontSize: 12,
    color: colors.gray[400],
    marginTop: 2,
  },

  // Empty
  emptyCard: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.gray[100],
  },
  emptyIconWrap: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.gray[800],
  },
  emptyDesc: {
    fontSize: 14,
    color: colors.gray[400],
    marginTop: 4,
    textAlign: 'center',
  },
  emptyBookBtn: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryGhost,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  emptyBookBtnText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 14,
    marginRight: 8,
  },
  
  // Error
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dangerLight,
    padding: 14,
    marginHorizontal: 20,
    borderRadius: 16,
    marginBottom: 20,
  },
  errorText: {
    color: colors.danger,
    fontSize: 13,
    marginLeft: 10,
    fontWeight: '500',
  },
});

export default HomeScreen;
