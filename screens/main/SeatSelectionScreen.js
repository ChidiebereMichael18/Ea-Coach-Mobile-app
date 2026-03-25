import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '@expo/vector-icons/Feather';
import { colors, shadows } from '../../styles/colors';
import Button from '../../components/common/Button';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';

const SeatSelectionScreen = ({ route, navigation }) => {
  const { bus, from, to, date } = route.params;
  const [selectedSeats, setSelectedSeats] = useState([]);
  const occupiedSeats = [12, 15, 22, 7, 33]; // Placeholder for real data

  const handleContinue = () => {
    if (selectedSeats.length === 0) {
      Alert.alert('No Seats Selected', 'Please select at least one seat.');
      return;
    }
    navigation.navigate('PassengerDetails', { bus, selectedSeats, from, to, date });
  };

  const toggleSeat = (seatNum) => {
    if (occupiedSeats.includes(seatNum)) return;
    if (selectedSeats.includes(seatNum)) {
      setSelectedSeats(prev => prev.filter(s => s !== seatNum));
    } else {
      if (selectedSeats.length >= 5) {
        Alert.alert('Limit', 'Max 5 seats per booking.');
        return;
      }
      setSelectedSeats(prev => [...prev, seatNum]);
    }
  };

  const renderSeat = (seatNum) => {
    const isSelected = selectedSeats.includes(seatNum);
    const isOccupied = occupiedSeats.includes(seatNum);

    return (
      <TouchableOpacity
        key={seatNum}
        disabled={isOccupied}
        style={[
          styles.seat,
          isSelected && styles.seatSelected,
          isOccupied && styles.seatOccupied
        ]}
        onPress={() => toggleSeat(seatNum)}
        activeOpacity={0.7}
      >
        <Text style={[
          styles.seatText,
          isSelected && styles.seatTextActive,
          isOccupied && styles.seatTextOccupied
        ]}>
          {seatNum}
        </Text>
      </TouchableOpacity>
    );
  };

  const totalPrice = selectedSeats.length * (bus.route?.price || 0);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      {/* Header - Flush with top */}
      <LinearGradient
        colors={colors.gradients.primary}
        style={styles.headerArea}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <SafeAreaView edges={['top']}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
              <Icon name="arrow-left" size={24} color={colors.white} />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={styles.headerTitle}>Choose Seats</Text>
              <Text style={styles.headerSub}>{from} → {to}</Text>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.gray[200] }]} />
          <Text style={styles.legendText}>Available</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, { backgroundColor: colors.primary }]} />
          <Text style={styles.legendText}>Selected</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, { backgroundColor: colors.gray[200] }]} />
          <Text style={styles.legendText}>Taken</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Bus visual */}
        <View style={styles.busBody}>
          <View style={styles.driverRow}>
            <View style={styles.steeringIcon}>
              <Icon name="disc" size={24} color={colors.gray[300]} />
            </View>
            <Text style={styles.frontLabel}>FRONT</Text>
          </View>

          <View style={styles.seatsGrid}>
            <View style={styles.seatColumn}>
              {Array.from({ length: 12 }, (_, i) => i * 4 + 1).map(n => renderSeat(n))}
            </View>
            <View style={styles.seatColumn}>
              {Array.from({ length: 12 }, (_, i) => i * 4 + 2).map(n => renderSeat(n))}
            </View>
            <View style={styles.aisle}>
              <View style={styles.aisleLineDash} />
            </View>
            <View style={styles.seatColumn}>
              {Array.from({ length: 12 }, (_, i) => i * 4 + 3).map(n => renderSeat(n))}
            </View>
            <View style={styles.seatColumn}>
              {Array.from({ length: 12 }, (_, i) => i * 4 + 4).map(n => renderSeat(n))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <View>
          <Text style={styles.footerLabel}>
            {selectedSeats.length > 0 ? `${selectedSeats.length} seat${selectedSeats.length > 1 ? 's' : ''} selected` : 'Select seats'}
          </Text>
          <Text style={styles.footerPrice}>UGX {totalPrice.toLocaleString()}</Text>
        </View>
        <Button 
          title="Continue" 
          style={styles.continueBtn} 
          disabled={selectedSeats.length === 0}
          onPress={handleContinue}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  headerArea: {
    paddingBottom: 20,
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
  headerSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
    marginTop: 2,
  },

  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 14,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[50],
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  legendBox: {
    width: 14,
    height: 14,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    fontSize: 11,
    color: colors.gray[500],
    fontWeight: '600',
  },

  scrollContent: {
    padding: 24,
    paddingBottom: 140,
  },

  busBody: {
    backgroundColor: colors.white,
    borderRadius: 32,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.gray[100],
    ...shadows.lg,
  },
  driverRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 24,
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[50],
  },
  steeringIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  frontLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.gray[300],
    letterSpacing: 4,
  },

  seatsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  seatColumn: {
    width: '22%',
  },
  aisle: {
    width: '8%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aisleLineDash: {
    width: 2,
    height: '100%',
    backgroundColor: colors.gray[100],
    borderWidth: 1,
    borderColor: colors.gray[50],
    borderStyle: 'dashed',
  },

  seat: {
    aspectRatio: 1,
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  seatSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    ...shadows.primary,
  },
  seatOccupied: {
    backgroundColor: colors.gray[100],
    borderColor: colors.gray[100],
  },
  seatText: {
    fontSize: 11,
    color: colors.gray[600],
    fontWeight: '800',
  },
  seatTextActive: {
    color: colors.white,
  },
  seatTextOccupied: {
    color: colors.gray[400],
  },

  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    paddingHorizontal: 24,
    paddingVertical: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.gray[50],
    ...shadows.lg,
  },
  footerLabel: {
    fontSize: 13,
    color: colors.gray[400],
    fontWeight: '600',
  },
  footerPrice: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.gray[900],
    marginTop: 2,
  },
  continueBtn: {
    width: 140,
    height: 52,
    borderRadius: 16,
  },
});

export default SeatSelectionScreen;
