import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '@expo/vector-icons/Feather';
import { colors, shadows } from '../../styles/colors';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';

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
      Alert.alert('Missing Info', 'Please fill in all passenger details before continuing.');
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
    <View style={styles.container}>
      <StatusBar style="light" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <LinearGradient
          colors={colors.gradients.primary}
          style={styles.headerArea}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <SafeAreaView edges={['top']}>
            <View style={styles.header}>
              <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                <Icon name="chevron-left" size={24} color={colors.white} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Passenger Details</Text>
            </View>
          </SafeAreaView>
        </LinearGradient>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Summary Banner */}
          <View style={styles.summaryBar}>
            <View style={styles.summaryItem}>
               <Icon name="truck" size={14} color={colors.primary} />
               <Text style={styles.summaryText}>{bus.operator?.name || 'Bus Operator'}</Text>
            </View>
            <View style={styles.summaryDot} />
            <View style={styles.summaryItem}>
               <Icon name="users" size={14} color={colors.primary} />
               <Text style={styles.summaryText}>{selectedSeats.length} Seats ({selectedSeats.join(', ')})</Text>
            </View>
          </View>

          {passengers.map((p, i) => (
            <View key={i} style={styles.passengerCard}>
              <View style={styles.cardHeader}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{i + 1}</Text>
                </View>
                <View>
                  <Text style={styles.cardTitle}>Passenger {i + 1}</Text>
                  <Text style={styles.seatLabel}>Seat Number {p.seat}</Text>
                </View>
              </View>

              <Input
                label="Full Name"
                placeholder="As per ID"
                value={p.name}
                onChangeText={(txt) => handleUpdate(i, 'name', txt)}
                containerStyle={styles.inputSpacing}
              />

              <View style={styles.row}>
                <View style={{ flex: 1, marginRight: 16 }}>
                  <Input
                    label="Age"
                    placeholder="25"
                    keyboardType="numeric"
                    value={p.age}
                    onChangeText={(txt) => handleUpdate(i, 'age', txt)}
                  />
                </View>
                <View style={{ flex: 1.5 }}>
                  <Text style={styles.inputLabel}>Gender</Text>
                  <View style={styles.genderGrid}>
                    <TouchableOpacity 
                      style={[styles.genderBtn, p.gender === 'Male' && styles.genderBtnActive]}
                      onPress={() => handleUpdate(i, 'gender', 'Male')}
                    >
                      <Text style={[styles.genderBtnText, p.gender === 'Male' && styles.genderBtnTextActive]}>Male</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.genderBtn, p.gender === 'Female' && styles.genderBtnActive]}
                      onPress={() => handleUpdate(i, 'gender', 'Female')}
                    >
                      <Text style={[styles.genderBtnText, p.gender === 'Female' && styles.genderBtnTextActive]}>Female</Text>
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
            icon="credit-card"
          />
          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  headerArea: {
    paddingBottom: 24,
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
  scrollContent: {
    padding: 24,
  },
  summaryBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginBottom: 24,
    ...shadows.sm,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.gray[700],
    marginLeft: 6,
  },
  summaryDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.gray[300],
    marginHorizontal: 12,
  },
  passengerCard: {
    backgroundColor: colors.white,
    borderRadius: 28,
    padding: 24,
    marginBottom: 20,
    ...shadows.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: colors.primaryGhost,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primary,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.gray[800],
  },
  seatLabel: {
    fontSize: 12,
    color: colors.gray[400],
    fontWeight: '500',
    marginTop: 2,
  },
  inputSpacing: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.gray[700],
    marginBottom: 8,
    marginLeft: 4,
  },
  genderGrid: {
    flexDirection: 'row',
    backgroundColor: colors.gray[50],
    borderRadius: 12,
    padding: 4,
  },
  genderBtn: {
    flex: 1,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  genderBtnActive: {
    backgroundColor: colors.white,
    ...shadows.sm,
  },
  genderBtnText: {
    fontSize: 13,
    color: colors.gray[400],
    fontWeight: '700',
  },
  genderBtnTextActive: {
    color: colors.primary,
  },
  continueBtn: {
    marginTop: 10,
    height: 56,
  },
});

export default PassengerDetailsScreen;
