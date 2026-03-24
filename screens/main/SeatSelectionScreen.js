import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather as Icon } from '@expo/vector-icons';
import { colors } from '../../styles/colors';
import Button from '../../components/common/Button';

const SeatSelectionScreen = ({ route, navigation }) => {
  const { bus, from, to, date } = route.params;
  const [selectedSeats, setSelectedSeats] = useState([]);

  const handleContinue = () => {
    if (selectedSeats.length === 0) {
      Alert.alert('No Seats Selected', 'Please select at least one seat to continue.');
      return;
    }
    navigation.navigate('PassengerDetails', {
      bus,
      selectedSeats,
      from,
      to,
      date
    });
  };

  const renderSeat = (seatNum) => {
    const isSelected = selectedSeats.includes(seatNum);
    // Dummy occupied seats for now (12, 15, 22)
    const isOccupied = [12, 15, 22].includes(seatNum);

    return (
      <TouchableOpacity
        key={seatNum}
        disabled={isOccupied}
        style={[
          styles.seat,
          isSelected && styles.seatSelected,
          isOccupied && styles.seatOccupied
        ]}
        onPress={() => {
          if (isSelected) {
            setSelectedSeats(prev => prev.filter(s => s !== seatNum));
          } else {
            if (selectedSeats.length >= 5) {
              Alert.alert('Limit Reached', 'You can select up to 5 seats per booking.');
              return;
            }
            setSelectedSeats(prev => [...prev, seatNum]);
          }
        }}
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={24} color={colors.gray[800]} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Select Seats</Text>
          <Text style={styles.headerSub}>{bus.operator?.name || 'Bus'} • {bus.route?.departureTime}</Text>
        </View>
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, { backgroundColor: colors.gray[100] }]} />
          <Text style={styles.legendText}>Available</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, { backgroundColor: colors.primary }]} />
          <Text style={styles.legendText}>Selected</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, { backgroundColor: colors.gray[300] }]} />
          <Text style={styles.legendText}>Occupied</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.busLayout}>
          <View style={styles.driverSection}>
            <View style={styles.steeringWheel}>
              <Icon name="circle" size={32} color={colors.gray[200]} />
            </View>
            <Text style={styles.driverLabel}>FRONT</Text>
          </View>

          <View style={styles.seatsGrid}>
            <View style={styles.seatColumn}>
              {Array.from({ length: 12 }, (_, i) => i * 4 + 1).map(n => renderSeat(n))}
            </View>
            <View style={styles.seatColumn}>
              {Array.from({ length: 12 }, (_, i) => i * 4 + 2).map(n => renderSeat(n))}
            </View>
            <View style={styles.aisle} />
            <View style={styles.seatColumn}>
              {Array.from({ length: 12 }, (_, i) => i * 4 + 3).map(n => renderSeat(n))}
            </View>
            <View style={styles.seatColumn}>
              {Array.from({ length: 12 }, (_, i) => i * 4 + 4).map(n => renderSeat(n))}
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View>
          <Text style={styles.footerLabel}>{selectedSeats.length} Seats Selected</Text>
          <Text style={styles.footerPrice}>UGX {(selectedSeats.length * (bus.route?.price || 0)).toLocaleString()}</Text>
        </View>
        <Button 
          title="Continue" 
          style={styles.continueBtn} 
          disabled={selectedSeats.length === 0}
          onPress={handleContinue}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
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
  headerSub: {
    fontSize: 12,
    color: colors.gray[500],
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 15,
    backgroundColor: colors.gray[50],
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 15,
  },
  legendBox: {
    width: 14,
    height: 14,
    borderRadius: 3,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: colors.gray[600],
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  busLayout: {
    backgroundColor: colors.gray[50],
    borderRadius: 40,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  driverSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 20,
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  steeringWheel: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: colors.gray[200],
    justifyContent: 'center',
    alignItems: 'center',
  },
  driverLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.gray[300],
    letterSpacing: 2,
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
  },
  seat: {
    aspectRatio: 1,
    backgroundColor: colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gray[200],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  seatSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  seatOccupied: {
    backgroundColor: colors.gray[200],
    borderColor: colors.gray[200],
  },
  seatText: {
    fontSize: 10,
    color: colors.gray[700],
    fontWeight: 'bold',
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
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  footerLabel: {
    fontSize: 12,
    color: colors.gray[500],
  },
  footerPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.gray[900],
  },
  continueBtn: {
    width: 150,
  },
});

export default SeatSelectionScreen;
