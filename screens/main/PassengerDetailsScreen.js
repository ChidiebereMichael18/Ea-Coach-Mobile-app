import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather as Icon } from '@expo/vector-icons';
import { colors } from '../../styles/colors';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

const PassengerDetailsScreen = ({ route, navigation }) => {
  const { bus, selectedSeats, from, to, date } = route.params;
  const [passengers, setPassengers] = useState(
    selectedSeats.map(seat => ({ name: '', age: '', gender: 'Male', seat }))
  );

  const handleUpdate = (index, field, value) => {
    const updated = [...passengers];
    updated[index][field] = value;
    setPassengers(updated);
  };

  const handleContinue = () => {
    const isInvalid = passengers.some(p => !p.name.trim() || !p.age);
    if (isInvalid) {
      alert('Missing Info', 'Please fill in all passenger details before continuing.');
      return;
    }
    navigation.navigate('Payment', {
      bus,
      selectedSeats,
      passengers,
      from,
      to,
      date
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Icon name="chevron-left" size={24} color={colors.gray[800]} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Passenger Details</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.summaryCard}>
            <View style={styles.summaryItem}>
              <Icon name="bus" size={16} color={colors.primary} />
              <Text style={styles.summaryText}>{bus.operator?.name}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Icon name="users" size={16} color={colors.primary} />
              <Text style={styles.summaryText}>{selectedSeats.length} Seats: {selectedSeats.join(', ')}</Text>
            </View>
          </View>

          {passengers.map((p, i) => (
            <View key={i} style={styles.passengerCard}>
              <View style={styles.cardHeader}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{i + 1}</Text>
                </View>
                <Text style={styles.cardTitle}>Passenger {i + 1} (Seat {p.seat})</Text>
              </View>

              <Input
                label="Full Name"
                placeholder="Enter traveler's name"
                value={p.name}
                onChangeText={(txt) => handleUpdate(i, 'name', txt)}
              />

              <View style={styles.row}>
                <View style={{ flex: 1, marginRight: 15 }}>
                  <Input
                    label="Age"
                    placeholder="e.g. 25"
                    keyboardType="numeric"
                    value={p.age}
                    onChangeText={(txt) => handleUpdate(i, 'age', txt)}
                  />
                </View>
                <View style={{ flex: 1.5 }}>
                  <Text style={styles.label}>Gender</Text>
                  <View style={styles.genderSelect}>
                    <TouchableOpacity 
                      style={[styles.genderBtn, p.gender === 'Male' && styles.genderBtnActive]}
                      onPress={() => handleUpdate(i, 'gender', 'Male')}
                    >
                      <Text style={[styles.genderText, p.gender === 'Male' && styles.genderTextActive]}>Male</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.genderBtn, p.gender === 'Female' && styles.genderBtnActive]}
                      onPress={() => handleUpdate(i, 'gender', 'Female')}
                    >
                      <Text style={[styles.genderText, p.gender === 'Female' && styles.genderTextActive]}>Female</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          ))}
          
          <Button 
            title="Continue to Payment" 
            onPress={handleContinue}
            style={styles.continueBtn}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
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
    paddingBottom: 40,
  },
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    padding: 15,
    borderRadius: 16,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.gray[100],
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryText: {
    fontSize: 14,
    color: colors.gray[700],
    fontWeight: '600',
    marginLeft: 8,
  },
  summaryDivider: {
    width: 1,
    height: 20,
    backgroundColor: colors.gray[200],
    marginHorizontal: 15,
  },
  passengerCard: {
    backgroundColor: colors.white,
    padding: 20,
    borderRadius: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.primary,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.gray[800],
  },
  row: {
    flexDirection: 'row',
    marginTop: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray[700],
    marginBottom: 8,
  },
  genderSelect: {
    flexDirection: 'row',
    backgroundColor: colors.gray[50],
    borderRadius: 12,
    padding: 4,
    height: 52,
  },
  genderBtn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  genderBtnActive: {
    backgroundColor: colors.white,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  genderText: {
    fontSize: 13,
    color: colors.gray[400],
    fontWeight: '600',
  },
  genderTextActive: {
    color: colors.primary,
  },
  continueBtn: {
    marginTop: 10,
    height: 56,
  },
});

export default PassengerDetailsScreen;
