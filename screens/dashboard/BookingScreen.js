import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather as Icon } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '../../context/AuthContext';
import { getBuses } from '../../api/busApi';
import { createBooking } from '../../api/dashboardApi';
import { colors } from '../../styles/colors';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

const LOCATIONS = [
  "Kampala", "Jinja", "Mbarara", "Gulu", "Lira", "Arua", "Masaka", "Mbale",
  "Fort Portal", "Kabale", "Kasese", "Soroti", "Kitgum", "Hoima",
  "Nairobi", "Kigali", "Dar es Salaam", "Dodoma", "Bujumbura", "Arusha", "Mombasa", "Kisumu"
];

const BookingScreen = ({ route, navigation }) => {
  const { user } = useAuth();
  
  // 1: Search, 2: Seats, 3: Passengers, 4: Payment, 5: Confirmation
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Search Data
  const [searchData, setSearchData] = useState({
    from: route.params?.from || 'Kampala',
    to: route.params?.to || 'Nairobi',
    date: route.params?.date ? new Date(route.params.date) : new Date(),
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [availableBuses, setAvailableBuses] = useState([]);

  // Selections
  const [selectedBus, setSelectedBus] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [passengers, setPassengers] = useState([]);
  const [bookingId, setBookingId] = useState(null);

  // --- Logic ---

  const handleSearch = async () => {
    if (!searchData.from || !searchData.to) {
      setError('Please select both origin and destination.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await getBuses({ from: searchData.from, to: searchData.to });
      if (res.success) {
        setAvailableBuses(res.data);
      } else {
        setError(res.error || 'Failed to search buses');
      }
    } catch (err) {
      setError('An error occurred during search.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBooking = async (method) => {
    setLoading(true);
    try {
      const totalAmount = selectedSeats.length * selectedBus.route.price;
      const passengerList = passengers.map((p, i) => ({
        name: p.name.trim(),
        age: parseInt(p.age),
        gender: p.gender,
        seatNumber: selectedSeats[i].toString()
      }));

      const res = await createBooking({
        busId: selectedBus._id,
        from: searchData.from,
        to: searchData.to,
        departureDate: searchData.date.toISOString().split('T')[0],
        departureTime: selectedBus.route.departureTime,
        passengers: passengerList,
        totalSeats: selectedSeats.length,
        totalAmount,
        paymentMethod: method
      });

      if (res.success && res.data) {
        setBookingId(res.data.bookingId || res.data._id);
        setCurrentStep(5);
      } else {
        setError(res.error || 'Booking failed');
      }
    } catch (err) {
      setError('Failed to finalize booking');
    } finally {
      setLoading(false);
    }
  };

  // --- Step Components ---

  const renderSearchStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.searchBox}>
        <Text style={styles.searchLabel}>From</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.locationList}>
          {LOCATIONS.map(loc => (
            <TouchableOpacity 
              key={loc} 
              style={[styles.locationChip, searchData.from === loc && styles.activeChip]}
              onPress={() => setSearchData(prev => ({ ...prev, from: loc }))}
            >
              <Text style={[styles.chipText, searchData.from === loc && styles.activeChipText]}>{loc}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.searchLabel}>To</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.locationList}>
          {LOCATIONS.map(loc => (
            <TouchableOpacity 
              key={loc} 
              style={[styles.locationChip, searchData.to === loc && styles.activeChip]}
              onPress={() => setSearchData(prev => ({ ...prev, to: loc }))}
            >
              <Text style={[styles.chipText, searchData.to === loc && styles.activeChipText]}>{loc}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity style={styles.dateSelector} onPress={() => setShowDatePicker(true)}>
          <View style={styles.dateRow}>
            <Icon name="calendar" size={20} color={colors.primary} />
            <Text style={styles.dateText}>{searchData.date.toDateString()}</Text>
          </View>
          <Text style={styles.changeText}>Change</Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={searchData.date}
            mode="date"
            minimumDate={new Date()}
            onChange={(e, date) => {
              setShowDatePicker(false);
              if (date) setSearchData(prev => ({ ...prev, date }));
            }}
          />
        )}

        <Button title="Search Buses" onPress={handleSearch} loading={loading} style={styles.searchBtn} />
      </View>

      {availableBuses.length > 0 && (
        <View style={styles.resultsContainer}>
          <Text style={styles.sectionTitle}>Available Buses ({availableBuses.length})</Text>
          {availableBuses.map(bus => (
            <TouchableOpacity 
              key={bus._id} 
              style={styles.busCard}
              onPress={() => {
                navigation.navigate('SeatSelection', {
                  bus,
                  from: searchData.from,
                  to: searchData.to,
                  date: searchData.date.toISOString(),
                });
              }}
            >
              <View style={styles.busHeader}>
                <View style={styles.companyInfo}>
                  <View style={styles.busIcon}>
                    <Icon name="truck" size={24} color={colors.primary} />
                  </View>
                  <View>
                    <Text style={styles.companyName}>{bus.operator?.name || 'Bus'}</Text>
                    <Text style={styles.busType}>{bus.busType}</Text>
                  </View>
                </View>
                <Text style={styles.priceText}>UGX {bus.route.price.toLocaleString()}</Text>
              </View>
              <View style={styles.busSchedule}>
                <View style={styles.timePoint}>
                  <Text style={styles.timeText}>{bus.route.departureTime}</Text>
                  <Text style={styles.locationTitle}>{bus.route.from}</Text>
                </View>
                <View style={styles.routeLine}>
                  <View style={styles.dot} />
                  <View style={styles.dashLine} />
                  <View style={styles.dot} />
                </View>
                <View style={styles.timePoint}>
                  <Text style={styles.timeText}>{bus.route.arrivalTime}</Text>
                  <Text style={styles.locationTitle}>{bus.route.to}</Text>
                </View>
              </View>
              <View style={styles.busFooter}>
                <View style={styles.seatsInfo}>
                  <Icon name="users" size={14} color={colors.gray[400]} />
                  <Text style={styles.seatsText}>{bus.availableSeats ?? bus.totalSeats} seats left</Text>
                </View>
                <View style={styles.amenities}>
                  {bus.amenities?.wifi && <Icon name="wifi" size={14} color={colors.gray[400]} style={styles.amenityIcon} />}
                  {bus.amenities?.usbCharging && <Icon name="zap" size={14} color={colors.gray[400]} style={styles.amenityIcon} />}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  const renderSeatStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <TouchableOpacity onPress={() => setCurrentStep(1)} style={styles.backBtn}>
          <Icon name="chevron-left" size={24} color={colors.gray[600]} />
        </TouchableOpacity>
        <Text style={styles.stepHeaderTitle}>Select Seats</Text>
      </View>

      <View style={styles.summaryTop}>
        <Text style={styles.summaryDetails}>{selectedBus?.operator?.name} • {selectedBus?.route?.departureTime}</Text>
        <Text style={styles.summaryPrice}>UGX {selectedBus?.route?.price.toLocaleString()} per seat</Text>
      </View>

      <View style={styles.seatContainer}>
        <View style={styles.driverSection}>
          <Icon name="circle" size={32} color={colors.gray[200]} />
          <Text style={styles.driverText}>Driver</Text>
        </View>

        <View style={styles.seatsGrid}>
          {Array(48).fill(0).map((_, i) => {
            const seatNum = i + 1;
            const isSelected = selectedSeats.includes(seatNum);
            return (
              <TouchableOpacity
                key={i}
                style={[styles.seat, isSelected && styles.seatSelected]}
                onPress={() => {
                  if (isSelected) setSelectedSeats(prev => prev.filter(s => s !== seatNum));
                  else if (selectedSeats.length < 5) setSelectedSeats(prev => [...prev, seatNum]);
                  else Alert.alert('Maximum 5 seats');
                }}
              >
                <Text style={[styles.seatTextUI, isSelected && styles.seatTextUIActive]}>{seatNum}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.footerStick}>
        <View>
          <Text style={styles.footerLabel}>{selectedSeats.length} Seats Selected</Text>
          <Text style={styles.footerVal}>UGX {(selectedSeats.length * selectedBus?.route?.price).toLocaleString()}</Text>
        </View>
        <Button 
          title="Continue" 
          disabled={selectedSeats.length === 0} 
          onPress={() => {
            setPassengers(selectedSeats.map(() => ({ name: '', age: '', gender: 'Male' })));
            setCurrentStep(3);
          }} 
          style={styles.footerBtn}
        />
      </View>
    </View>
  );

  const renderPassengerStep = () => (
    <ScrollView style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <TouchableOpacity onPress={() => setCurrentStep(2)} style={styles.backBtn}>
          <Icon name="chevron-left" size={24} color={colors.gray[600]} />
        </TouchableOpacity>
        <Text style={styles.stepHeaderTitle}>Passenger Info</Text>
      </View>

      {passengers.map((p, i) => (
        <View key={i} style={styles.passengerCard}>
          <Text style={styles.pLabel}>Passenger {i + 1} (Seat {selectedSeats[i]})</Text>
          <Input 
            label="Full Name" 
            value={p.name} 
            onChangeText={txt => {
              const newP = [...passengers];
              newP[i].name = txt;
              setPassengers(newP);
            }} 
            placeholder="Enter name"
          />
          <View style={styles.pRow}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Input 
                label="Age" 
                value={p.age} 
                onChangeText={txt => {
                  const newP = [...passengers];
                  newP[i].age = txt;
                  setPassengers(newP);
                }} 
                keyboardType="numeric" 
                placeholder="Years"
              />
            </View>
            <View style={{ flex: 1 }}>
               <Text style={styles.labelFlat}>Gender</Text>
               <View style={styles.genderSelect}>
                 {['Male', 'Female'].map(g => (
                   <TouchableOpacity 
                    key={g} 
                    onPress={() => {
                      const newP = [...passengers];
                      newP[i].gender = g;
                      setPassengers(newP);
                    }}
                    style={[styles.genderBtn, p.gender === g && styles.genderBtnActive]}
                   >
                     <Text style={[styles.genderTxt, p.gender === g && styles.genderTxtActive]}>{g}</Text>
                   </TouchableOpacity>
                 ))}
               </View>
            </View>
          </View>
        </View>
      ))}

      <Button 
        title="Go to Payment" 
        onPress={() => setCurrentStep(4)} 
        disabled={passengers.some(p => !p.name || !p.age)}
        style={styles.nextBtn}
      />
    </ScrollView>
  );

  const renderPaymentStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <TouchableOpacity onPress={() => setCurrentStep(3)} style={styles.backBtn}>
          <Icon name="chevron-left" size={24} color={colors.gray[600]} />
        </TouchableOpacity>
        <Text style={styles.stepHeaderTitle}>Payment</Text>
      </View>

      <View style={styles.paymentMethods}>
        <Text style={styles.payInstructions}>Choose your payment method</Text>
        {[
          { id: 'mobile_money', name: 'Mobile Money', icon: 'smartphone', color: '#F59E0B' },
          { id: 'card', name: 'Credit/Debit Card', icon: 'credit-card', color: colors.primary },
          { id: 'cash', name: 'Pay at Counter', icon: 'dollar-sign', color: colors.success },
        ].map(m => (
          <TouchableOpacity 
            key={m.id} 
            style={styles.methodCard}
            onPress={() => handleCreateBooking(m.id)}
          >
            <View style={[styles.methodIcon, { backgroundColor: m.color + '15' }]}>
              <Icon name={m.icon} size={24} color={m.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.methodName}>{m.name}</Text>
              <Text style={styles.methodSub}>Safe & instant booking</Text>
            </View>
            <Icon name="chevron-right" size={20} color={colors.gray[400]} />
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.totalSummary}>
        <Text style={styles.totalLabel}>Total Payable</Text>
        <Text style={styles.totalAmount}>UGX {(selectedSeats.length * selectedBus?.route?.price).toLocaleString()}</Text>
      </View>
    </View>
  );

  const renderConfirmation = () => (
    <View style={styles.confirmContainer}>
      <View style={styles.successIcon}>
        <Icon name="check" size={48} color={colors.white} />
      </View>
      <Text style={styles.confirmTitle}>Booking Successful!</Text>
      <Text style={styles.confirmSub}>Your ticket has been booked and a confirmation code has been sent to your phone.</Text>
      
      <View style={styles.ticketStub}>
        <View style={styles.stubMain}>
          <Text style={styles.stubBookingId}># {bookingId}</Text>
          <Text style={styles.stubRoute}>{searchData.from} to {searchData.to}</Text>
          <View style={styles.stubDetails}>
            <View>
              <Text style={styles.stubLabel}>DATE</Text>
              <Text style={styles.stubVal}>{searchData.date.toDateString()}</Text>
            </View>
            <View>
              <Text style={styles.stubLabel}>TIME</Text>
              <Text style={styles.stubVal}>{selectedBus?.route?.departureTime}</Text>
            </View>
          </View>
          <View style={styles.stubDetails}>
            <View>
              <Text style={styles.stubLabel}>BUS</Text>
              <Text style={styles.stubVal}>{selectedBus?.operator?.name}</Text>
            </View>
            <View>
              <Text style={styles.stubLabel}>SEATS</Text>
              <Text style={styles.stubVal}>{selectedSeats.join(', ')}</Text>
            </View>
          </View>
        </View>
      </View>

      <Button title="Back to Home" onPress={() => navigation.navigate('Home')} style={styles.homeBtn} />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
        {currentStep === 1 && renderSearchStep()}
        {currentStep === 2 && renderSeatStep()}
        {currentStep === 3 && renderPassengerStep()}
        {currentStep === 4 && renderPaymentStep()}
        {currentStep === 5 && renderConfirmation()}

        {error && (
          <View style={styles.errorToast}>
            <Text style={styles.errorToastText}>{error}</Text>
            <TouchableOpacity onPress={() => setError(null)}>
              <Icon name="x" size={16} color={colors.white} />
            </TouchableOpacity>
          </View>
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
  stepContainer: {
    padding: 20,
    flex: 1,
  },
  searchBox: {
    backgroundColor: colors.white,
    padding: 20,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 24,
  },
  searchLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.gray[800],
    marginBottom: 10,
  },
  locationList: {
    marginBottom: 20,
  },
  locationChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.gray[100],
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  activeChip: {
    backgroundColor: colors.primary + '15',
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 13,
    color: colors.gray[600],
  },
  activeChipText: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  dateSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.gray[50],
    borderRadius: 16,
    marginBottom: 20,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[800],
    marginLeft: 10,
  },
  changeText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  searchBtn: {
    height: 56,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.gray[900],
    marginBottom: 16,
  },
  busCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  busHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  companyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  busIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  companyName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.gray[900],
  },
  busType: {
    fontSize: 12,
    color: colors.gray[500],
  },
  priceText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  busSchedule: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  timePoint: {
    alignItems: 'center',
  },
  timeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.gray[800],
  },
  locationTitle: {
    fontSize: 12,
    color: colors.gray[500],
    marginTop: 4,
  },
  routeLine: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.gray[300],
  },
  dashLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.gray[300],
    borderStyle: 'dashed',
    marginHorizontal: 4,
  },
  busFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
    paddingTop: 12,
  },
  seatsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seatsText: {
    fontSize: 12,
    color: colors.success,
    marginLeft: 6,
    fontWeight: '600',
  },
  amenities: {
    flexDirection: 'row',
  },
  amenityIcon: {
    marginLeft: 8,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    elevation: 2,
  },
  stepHeaderTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.gray[900],
  },
  summaryTop: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 20,
    marginBottom: 24,
  },
  summaryDetails: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  summaryPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.white,
    marginTop: 4,
  },
  seatContainer: {
    backgroundColor: colors.white,
    padding: 20,
    borderRadius: 24,
    alignItems: 'center',
  },
  driverSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
    width: '100%',
  },
  driverText: {
    marginLeft: 12,
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray[400],
  },
  seatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  seat: {
    width: '22%',
    height: 40,
    backgroundColor: colors.gray[100],
    borderRadius: 8,
    marginBottom: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  seatSelected: {
    backgroundColor: colors.primary,
  },
  seatTextUI: {
    fontSize: 12,
    color: colors.gray[800],
  },
  seatTextUIActive: {
    color: colors.white,
    fontWeight: 'bold',
  },
  footerStick: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    backgroundColor: colors.white,
    padding: 20,
    borderRadius: 24,
    elevation: 8,
  },
  footerLabel: {
    fontSize: 12,
    color: colors.gray[400],
  },
  footerVal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.gray[900],
  },
  footerBtn: {
    width: 140,
  },
  passengerCard: {
    backgroundColor: colors.white,
    padding: 20,
    borderRadius: 24,
    marginBottom: 16,
    elevation: 2,
  },
  pLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 16,
  },
  pRow: {
    flexDirection: 'row',
  },
  labelFlat: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray[700],
    marginBottom: 8,
  },
  genderSelect: {
    flexDirection: 'row',
    backgroundColor: colors.gray[100],
    borderRadius: 12,
    padding: 4,
    height: 48,
  },
  genderBtn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  genderBtnActive: {
    backgroundColor: colors.white,
    elevation: 2,
  },
  genderTxt: {
    fontSize: 13,
    color: colors.gray[500],
  },
  genderTxtActive: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  nextBtn: {
    marginTop: 10,
    marginBottom: 30,
  },
  paymentMethods: {
    flex: 1,
  },
  payInstructions: {
    fontSize: 16,
    color: colors.gray[500],
    marginBottom: 20,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 20,
    marginBottom: 16,
    elevation: 2,
  },
  methodIcon: {
    width: 50,
    height: 50,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  methodName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.gray[900],
  },
  methodSub: {
    fontSize: 12,
    color: colors.gray[400],
    marginTop: 2,
  },
  totalSummary: {
    backgroundColor: colors.white,
    padding: 20,
    borderRadius: 24,
    alignItems: 'center',
    elevation: 4,
  },
  totalLabel: {
    fontSize: 14,
    color: colors.gray[500],
    marginBottom: 4,
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
  confirmContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    paddingTop: 60,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  confirmTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: colors.gray[900],
    marginBottom: 12,
  },
  confirmSub: {
    fontSize: 16,
    color: colors.gray[500],
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  ticketStub: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderStyle: 'dashed',
    marginBottom: 32,
  },
  stubMain: {
    padding: 24,
  },
  stubBookingId: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
  },
  stubRoute: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.gray[900],
    marginBottom: 20,
  },
  stubDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  stubLabel: {
    fontSize: 10,
    color: colors.gray[400],
    fontWeight: 'bold',
  },
  stubVal: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray[800],
    marginTop: 2,
  },
  homeBtn: {
    width: '100%',
  },
  errorToast: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: colors.danger,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorToastText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '500',
  },
  resultsContainer: {
    marginTop: 24,
  },
});

export default BookingScreen;
