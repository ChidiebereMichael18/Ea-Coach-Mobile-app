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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather as Icon } from '@expo/vector-icons';
import { getBuses } from '../../api/busApi';
import { colors } from '../../styles/colors';
import Button from '../../components/common/Button';

const IMAGE_POOL = [
    'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80',
    'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800&q=80',
    'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80',
];

const RoutesScreen = ({ navigation }) => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchRoutes = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getBuses();
      if (res.success && Array.isArray(res.data)) {
        setRoutes(res.data);
      } else {
        setError(res.error || 'Failed to load routes');
      }
    } catch (err) {
      setError('An error occurred. Check your connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchRoutes();
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Searching East African Routes...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={24} color={colors.gray[800]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Available Routes</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {error ? (
          <View style={styles.emptyCard}>
            <Icon name="alert-triangle" size={48} color={colors.danger} />
            <Text style={styles.errorText}>{error}</Text>
            <Button title="Try Again" onPress={fetchRoutes} size="small" />
          </View>
        ) : routes.length === 0 ? (
          <View style={styles.emptyCard}>
            <Icon name="truck" size={48} color={colors.gray[300]} />
            <Text style={styles.emptyText}>No routes currently available.</Text>
          </View>
        ) : (
          routes.map((route, index) => (
            <TouchableOpacity
              key={route._id}
              style={styles.routeCard}
              onPress={() => navigation.navigate('Booking', {
                from: route.route?.from,
                to: route.route?.to,
                date: new Date().toISOString()
              })}
            >
              <Image 
                source={{ uri: IMAGE_POOL[index % IMAGE_POOL.length] }} 
                style={styles.cardCover} 
              />
              <View style={styles.cardContent}>
                <View style={styles.routeRow}>
                  <Text style={styles.cityName}>{route.route?.from || 'Origin'}</Text>
                  <Icon name="arrow-right" size={16} color={colors.primary} style={styles.arrow} />
                  <Text style={styles.cityName}>{route.route?.to || 'Destination'}</Text>
                </View>
                
                <View style={styles.infoRow}>
                  <View style={styles.infoTag}>
                    <Icon name="clock" size={14} color={colors.gray[500]} />
                    <Text style={styles.tagText}>{route.route?.departureTime || '—'}</Text>
                  </View>
                  <View style={styles.infoTag}>
                    <Icon name="shield" size={14} color={colors.gray[500]} />
                    <Text style={styles.tagText}>{route.busType || 'Standard'}</Text>
                  </View>
                </View>

                <View style={styles.cardFooter}>
                  <View>
                    <Text style={styles.companyName}>{route.operator?.name || 'Bus'}</Text>
                    <Text style={styles.priceText}>UGX {(route.route?.price || 0).toLocaleString()}</Text>
                  </View>
                  <View style={styles.bookBtn}>
                    <Text style={styles.bookBtnText}>Book Now</Text>
                    <Icon name="chevron-right" size={16} color={colors.white} />
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
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
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    color: colors.gray[500],
    fontSize: 14,
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
  routeCard: {
    backgroundColor: colors.white,
    borderRadius: 24,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  cardCover: {
    width: '100%',
    height: 160,
  },
  cardContent: {
    padding: 16,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cityName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.gray[800],
  },
  arrow: {
    marginHorizontal: 10,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  infoTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[50],
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 12,
  },
  tagText: {
    fontSize: 12,
    color: colors.gray[600],
    marginLeft: 6,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.gray[50],
    paddingTop: 12,
  },
  companyName: {
    fontSize: 12,
    color: colors.gray[500],
  },
  priceText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    marginTop: 2,
  },
  bookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  bookBtnText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 14,
    marginRight: 6,
  },
  emptyCard: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    marginTop: 16,
    color: colors.gray[400],
    fontSize: 16,
  },
  errorText: {
    marginTop: 12,
    color: colors.danger,
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
});

export default RoutesScreen;
