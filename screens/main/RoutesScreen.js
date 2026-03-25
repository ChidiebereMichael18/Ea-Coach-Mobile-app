import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  RefreshControl,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '@expo/vector-icons/Feather';
import { getBuses } from '../../api/busApi';
import { colors, shadows } from '../../styles/colors';
import Button from '../../components/common/Button';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';

const IMAGE_POOL = [
    'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80',
    'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800&q=80',
    'https://images.unsplash.com/photo-1557223562-6c77ef16210f?w=800&q=80',
];

const RoutesScreen = ({ navigation }) => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchRoutes = async () => {
    try {
      setError(null);
      const res = await getBuses();
      if (res.success && Array.isArray(res.data)) {
        setRoutes(res.data);
      } else {
        setError(res.error || 'Failed to load routes');
      }
    } catch (err) {
      setError('Connection issue. Check your network.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchRoutes(); }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchRoutes();
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <View style={styles.loadingIcon}>
          <Icon name="compass" size={32} color={colors.primary} />
        </View>
        <Text style={styles.loadingText}>Discovering routes...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      {/* Header - Flush with top */}
      <LinearGradient
        colors={colors.gradients.primary}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <SafeAreaView edges={['top']}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.headerTitle}>Explore</Text>
              <Text style={styles.headerSub}>{routes.length} routes available</Text>
            </View>
            <TouchableOpacity style={styles.filterBtn}>
              <Icon name="sliders" size={20} color={colors.white} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} tintColor={colors.primary} />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {error ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconWrap}>
              <Icon name="wifi-off" size={32} color={colors.danger} />
            </View>
            <Text style={styles.emptyTitle}>Connection Issue</Text>
            <Text style={styles.emptyDesc}>{error}</Text>
            <Button title="Retry" onPress={fetchRoutes} size="small" style={{ width: 140, marginTop: 12 }} />
          </View>
        ) : routes.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconWrap}>
              <Icon name="map" size={32} color={colors.gray[300]} />
            </View>
            <Text style={styles.emptyTitle}>No routes yet</Text>
            <Text style={styles.emptyDesc}>Check back later for new routes.</Text>
          </View>
        ) : (
          routes.map((route, index) => (
            <TouchableOpacity
              key={route._id}
              style={styles.routeCard}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('Booking', {
                from: route.route?.from,
                to: route.route?.to,
                date: new Date().toISOString()
              })}
            >
              <Image 
                source={{ uri: IMAGE_POOL[index % IMAGE_POOL.length] }} 
                style={styles.cardImage}
              />
              {/* Gradient overlay on image */}
              <View style={styles.imageOverlay} />
              
              {/* Price tag */}
              <View style={styles.priceTag}>
                <Text style={styles.priceTagCurrency}>UGX</Text>
                <Text style={styles.priceTagAmount}>{(route.route?.price || 0).toLocaleString()}</Text>
              </View>

              <View style={styles.cardBody}>
                <View style={styles.routeRow}>
                  <Text style={styles.cityName}>{(route.route?.from || 'Origin').toUpperCase()}</Text>
                  <View style={styles.routeVisual}>
                    <View style={styles.routeDot} />
                    <View style={styles.routeLine} />
                    <Icon name="truck" size={14} color={colors.primary} />
                    <View style={styles.routeLine} />
                    <View style={[styles.routeDot, { backgroundColor: colors.primary }]} />
                  </View>
                  <Text style={styles.cityName}>{(route.route?.to || 'Destination').toUpperCase()}</Text>
                </View>
                
                <View style={styles.tagRow}>
                  <View style={[styles.tag, { backgroundColor: colors.primaryGhost }]}>
                    <Icon name="clock" size={12} color={colors.primary} />
                    <Text style={[styles.tagText, { color: colors.primary }]}>{route.route?.departureTime || '—'}</Text>
                  </View>
                  <View style={styles.tag}>
                    <Icon name="shield" size={12} color={colors.gray[500]} />
                    <Text style={styles.tagText}>{route.busType || 'Standard'}</Text>
                  </View>
                  <View style={styles.tag}>
                    <Icon name="users" size={12} color={colors.gray[500]} />
                    <Text style={styles.tagText}>{route.totalSeats || 48} seats</Text>
                  </View>
                </View>

                <View style={styles.cardAction}>
                  <Text style={styles.operatorName}>{route.operator?.name || 'Bus Operator'}</Text>
                  <View style={styles.bookPill}>
                    <Text style={styles.bookPillText}>Book Now</Text>
                    <Icon name="arrow-right" size={14} color={colors.white} />
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
        <View style={{ height: 100 }} />
      </ScrollView>
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
    backgroundColor: colors.gray[50],
  },
  loadingIcon: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: colors.primaryGhost,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  loadingText: {
    color: colors.gray[500],
    fontSize: 15,
    fontWeight: '500',
  },

  // Header
  header: {
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    ...shadows.md,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.white,
  },
  headerSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
    fontWeight: '500',
  },
  filterBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  scrollContent: {
    padding: 20,
  },

  // Route Card
  routeCard: {
    backgroundColor: colors.white,
    borderRadius: 24,
    marginBottom: 20,
    overflow: 'hidden',
    ...shadows.lg,
  },
  cardImage: {
    width: '100%',
    height: 160,
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    height: 160,
    backgroundColor: 'rgba(15, 23, 42, 0.15)',
  },
  priceTag: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceTagCurrency: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '700',
    marginRight: 4,
  },
  priceTagAmount: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.white,
  },

  cardBody: {
    padding: 20,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  cityName: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.gray[800],
    flex: 1,
    letterSpacing: 0.5,
  },
  routeVisual: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  routeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.gray[300],
  },
  routeLine: {
    width: 14,
    height: 2,
    backgroundColor: colors.gray[200],
    marginHorizontal: 2,
  },
  tagRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[50],
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    marginRight: 8,
  },
  tagText: {
    fontSize: 11,
    color: colors.gray[600],
    marginLeft: 5,
    fontWeight: '500',
  },
  cardAction: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
  },
  operatorName: {
    fontSize: 13,
    color: colors.gray[400],
    fontWeight: '600',
  },
  bookPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 14,
    ...shadows.primary,
  },
  bookPillText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 13,
    marginRight: 6,
  },

  // Empty
  emptyCard: {
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.gray[800],
  },
  emptyDesc: {
    fontSize: 14,
    color: colors.gray[400],
    marginTop: 4,
    textAlign: 'center',
  },
});

export default RoutesScreen;
