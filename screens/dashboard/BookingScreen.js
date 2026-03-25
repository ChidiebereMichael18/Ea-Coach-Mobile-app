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
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '@expo/vector-icons/Feather';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '../../context/AuthContext';
import { getBuses } from '../../api/busApi';
import { createBooking } from '../../api/dashboardApi';
import { colors, shadows } from '../../styles/colors';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

const LOCATIONS = [
  "Kampala", "Jinja", "Mbarara", "Gulu", "Lira", "Arua", "Masaka", "Mbale",
  "Fort Portal", "Kabale", "Kasese", "Soroti", "Kitgum", "Hoima",
  "Nairobi", "Kigali", "Dar es Salaam", "Dodoma", "Bujumbura", "Arusha", "Mombasa", "Kisumu"
];

const BookingScreen = ({ route, navigation }) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Search data
  const [searchData, setSearchData] = useState({
    from: route?.params?.from || 'Kampala',
    to: route?.params?.to || 'Nairobi',
    date: route?.params?.date ? new Date(route.params.date) : new Date(),
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  // Selection
  const [selectedBus, setSelectedBus] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [passengers, setPassengers] = useState([]);
  const [bookingId, setBookingId] = useState(null);

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getBuses({ from: searchData.from, to: searchData.to });
      if (res.success && res.data && res.data.length > 0) {
        setSearchResults(res.data);
        setCurrentStep(2);
      } else {
        setError(res.error || 'No buses found for this route');
      }
    } catch (err) {
      setError('An error occurred during search.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBooking = async (method) => {
    setLoading(true);
    setError(null);
    try {
      const totalAmount = selectedSeats.length * selectedBus.route.price;
      const passengerList = passengers.map((p, i) => ({
        name: p.name.trim(),
        age: parseInt(p.age),
        gender: p.gender,
        phone: p.phone.trim(),
        idNumber: p.idNumber?.trim() || 'N/A',
        seatNumber: selectedSeats[i].toString()
      }));

      let mappedMethod = method;
      if (method === 'mtn' || method === 'airtel') mappedMethod = 'mobile_money';
      if (method === 'card') mappedMethod = 'card';
      if (method === 'cash') mappedMethod = 'cash';

      const res = await createBooking({
        busId: selectedBus._id,
        from: searchData.from,
        to: searchData.to,
        departureDate: searchData.date.toISOString().split('T')[0],
        departureTime: selectedBus.route.departureTime,
        passengers: passengerList,
        totalSeats: selectedSeats.length,
        totalAmount,
        paymentMethod: mappedMethod
      });

      if (res.success && res.data) {
        setBookingId(res.data.bookingId || res.data._id);
        setCurrentStep(6);
      } else {
        setError(res.error || 'Booking failed');
      }
    } catch (err) {
      console.error('Wizard handleCreateBooking error:', err);
      setError('Failed to finalize booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderHeader = (title, sub) => (
    <LinearGradient
      colors={colors.gradients.primary}
      style={styles.headerArea}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
    >
      <SafeAreaView edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backBtn} 
            onPress={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : navigation.goBack()}
          >
            <Icon name="chevron-left" size={24} color={colors.white} />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>{title}</Text>
            {sub && <Text style={styles.headerSub}>{sub}</Text>}
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );

  const renderSearchStep = () => (
    <View style={{ flex: 1 }}>
      {renderHeader("Find a Trip", "Select your route and date")}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.searchCard}>
          <Text style={styles.searchLabel}>From</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.locationScroll}>
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
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.locationScroll}>
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

          <Text style={styles.searchLabel}>Travel Date</Text>
          <TouchableOpacity style={styles.datePickerBtn} onPress={() => setShowDatePicker(true)}>
            <View style={styles.dateIconWrap}>
                <Icon name="calendar" size={20} color={colors.primary} />
            </View>
            <View>
                <Text style={styles.dateLabel}>Departure Date</Text>
                <Text style={styles.dateVal}>{searchData.date.toDateString()}</Text>
            </View>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={searchData.date}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) setSearchData(prev => ({ ...prev, date: selectedDate }));
              }}
              minimumDate={new Date()}
            />
          )}

          <Button 
            title="Search Buses" 
            onPress={handleSearch} 
            loading={loading} 
            style={styles.searchActionBtn}
            icon="search"
          />
        </View>

        {error && <Text style={styles.errorText}>{error}</Text>}
      </ScrollView>
    </View>
  );

  const renderResultsStep = () => (
    <View style={{ flex: 1 }}>
      {renderHeader("Select Bus", `${searchResults.length} buses available`)}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {searchResults.map((bus) => (
          <TouchableOpacity 
            key={bus._id} 
            style={styles.busCard}
            onPress={() => {
              setSelectedBus(bus);
              setCurrentStep(3);
            }}
          >
            <View style={styles.busCardTop}>
                <View style={styles.operatorInfo}>
                    <Text style={styles.operatorName}>{bus.operator?.name || 'Bus'}</Text>
                    <Text style={styles.busType}>{bus.busType}</Text>
                </View>
                <Text style={styles.busPrice}>UGX {bus.route.price.toLocaleString()}</Text>
            </View>
            <View style={styles.busDivider} />
            <View style={styles.busCardBottom}>
                <View style={styles.timeInfo}>
                    <Icon name="clock" size={14} color={colors.primary} />
                    <Text style={styles.timeVal}>{bus.route.departureTime}</Text>
                </View>
                <View style={styles.seatInfo}>
                    <Icon name="users" size={14} color={colors.gray[400]} />
                    <Text style={styles.seatVal}>{bus.availableSeats ?? bus.totalSeats ?? 48} seats left</Text>
                </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const toggleSeat = (seatNum) => {
    const occupiedSeats = [5, 12, 18];
    if (occupiedSeats.includes(seatNum)) return;
    if (selectedSeats.includes(seatNum)) {
      setSelectedSeats(prev => prev.filter(s => s !== seatNum));
    } else {
      if (selectedSeats.length >= 5) {
        Alert.alert('Limit Reached', 'Maximum 5 seats allowed per booking.');
        return;
      }
      setSelectedSeats(prev => [...prev, seatNum]);
    }
  };

  const renderSeatItem = (seatNum) => {
    const isSelected = selectedSeats.includes(seatNum);
    const isOccupied = [5, 12, 18].includes(seatNum);

    return (
      <TouchableOpacity
        key={seatNum}
        disabled={isOccupied}
        style={[
          styles.seatPill,
          isSelected && styles.seatPillActive,
          isOccupied && styles.seatPillOccupied
        ]}
        onPress={() => toggleSeat(seatNum)}
        activeOpacity={0.7}
      >
        <Text style={[
          styles.seatPillText,
          isSelected && styles.seatPillTextActive,
          isOccupied && styles.seatPillTextOccupied
        ]}>
          {seatNum}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderSeatStep = () => (
    <View style={{ flex: 1 }}>
      {renderHeader("Select Seats", "Pick your preferred place")}
      <View style={styles.stepContent}>
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
            <View style={[styles.legendBox, { backgroundColor: colors.gray[100] }]} />
            <Text style={styles.legendText}>Taken</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
           <View style={styles.busFrame}>
                <View style={styles.driverRow}>
                   <View style={styles.steering}><Icon name="disc" size={24} color={colors.gray[300]} /></View>
                   <Text style={styles.frontLabel}>FRONT</Text>
                </View>
                <View style={styles.seatsGrid}>
                    <View style={styles.seatColumn}>
                      {Array.from({ length: 12 }, (_, i) => i * 4 + 1).map(renderSeatItem)}
                    </View>
                    <View style={styles.seatColumn}>
                      {Array.from({ length: 12 }, (_, i) => i * 4 + 2).map(renderSeatItem)}
                    </View>
                    <View style={styles.aisle}>
                      <View style={styles.aisleLineDash} />
                    </View>
                    <View style={styles.seatColumn}>
                      {Array.from({ length: 12 }, (_, i) => i * 4 + 3).map(renderSeatItem)}
                    </View>
                    <View style={styles.seatColumn}>
                      {Array.from({ length: 12 }, (_, i) => i * 4 + 4).map(renderSeatItem)}
                    </View>
                </View>
           </View>
        </ScrollView>
        <View style={styles.stepFooter}>
          <View>
            <Text style={styles.footerLabel}>Total Price</Text>
            <Text style={styles.footerPrice}>UGX {(selectedSeats.length * (selectedBus?.route?.price || 0)).toLocaleString()}</Text>
          </View>
          <Button 
            title="Next Step" 
            disabled={selectedSeats.length === 0} 
            onPress={() => {
              setPassengers(selectedSeats.map(s => ({ 
                name: '', 
                age: '', 
                gender: 'Male', 
                phone: '',
                idNumber: '',
                seat: s 
              })));
              setCurrentStep(4);
            }} 
            style={styles.stepFooterBtn}
          />
        </View>
      </View>
    </View>
  );

  const renderPassengerStep = () => (
    <View style={{ flex: 1 }}>
      {renderHeader("Passenger Info", "Enter details for each traveler")}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {passengers.map((p, i) => (
          <View key={i} style={styles.pCard}>
            <View style={styles.pCardHeader}>
                <View style={styles.pAvatar}><Text style={styles.pAvatarText}>{i + 1}</Text></View>
                <Text style={styles.pTitle}>Passenger {i + 1} (Seat {p.seat})</Text>
            </View>
            <Input 
              label="Full Name *" 
              value={p.name} 
              onChangeText={txt => {
                const newP = [...passengers];
                newP[i].name = txt;
                setPassengers(newP);
              }} 
              placeholder="Name as per ID"
            />
            <View style={styles.row}>
                <View style={{ flex: 1, marginRight: 12 }}>
                   <Input 
                    label="Age *" 
                    value={p.age} 
                    onChangeText={txt => {
                      const newP = [...passengers];
                      newP[i].age = txt;
                      setPassengers(newP);
                    }} 
                    keyboardType="numeric" 
                    placeholder="e.g. 25"
                  />
                </View>
                <View style={{ flex: 1.5 }}>
                   <Text style={styles.genderLabel}>Gender *</Text>
                   <View style={styles.genderGrid}>
                     {['Male', 'Female'].map(g => (
                       <TouchableOpacity 
                        key={g} 
                        onPress={() => {
                          const newP = [...passengers];
                          newP[i].gender = g;
                          setPassengers(newP);
                        }}
                        style={[styles.genBtn, p.gender === g && styles.genBtnActive]}
                       >
                         <Text style={[styles.genTxt, p.gender === g && styles.genTxtActive]}>{g}</Text>
                       </TouchableOpacity>
                     ))}
                   </View>
                </View>
            </View>
            <View style={styles.extraPInfo}>
                <Input 
                  label="Phone Number *" 
                  value={p.phone} 
                  onChangeText={txt => {
                    const newP = [...passengers];
                    newP[i].phone = txt;
                    setPassengers(newP);
                  }} 
                  keyboardType="phone-pad"
                  placeholder="+256"
                />
                <Input 
                  label="ID Number (Optional)" 
                  value={p.idNumber} 
                  onChangeText={txt => {
                    const newP = [...passengers];
                    newP[i].idNumber = txt;
                    setPassengers(newP);
                  }} 
                  placeholder="National ID"
                  containerStyle={{ marginTop: 12 }}
                />
            </View>
          </View>
        ))}
        <Button 
          title="Proceed to Payment" 
          onPress={() => {
            const isInvalid = passengers.some(p => !p.name?.trim() || !p.age || !p.phone?.trim());
            if (isInvalid) {
              Alert.alert('Required Fields Missing', 'Please provide a Name, Age, and Phone Number for all passengers before continuing.');
              return;
            }
            setCurrentStep(5);
          }} 
          style={styles.proceedBtn}
          icon="credit-card"
        />
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );

  const renderPaymentStep = () => (
    <View style={{ flex: 1 }}>
      {renderHeader("Payment", "Choose your preferred method")}
      <View style={styles.paymentContent}>
        <View style={styles.payMethods}>
          {[
            { id: 'mtn', name: 'MTN Mobile Money', icon: 'smartphone', color: '#F59E0B' },
            { id: 'airtel', name: 'Airtel Money', icon: 'smartphone', color: '#EF4444' },
            { id: 'card', name: 'Debit/Credit Card', icon: 'credit-card', color: colors.primary },
            { id: 'cash', name: 'Pay at Counter', icon: 'dollar-sign', color: colors.success },
          ].map(m => (
            <TouchableOpacity 
              key={m.id} 
              style={styles.payCard}
              onPress={() => handleCreateBooking(m.id)}
            >
              <View style={[styles.payIcon, { backgroundColor: m.color + '15' }]}>
                <Icon name={m.icon} size={24} color={m.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.payName}>{m.name}</Text>
                <Text style={styles.paySubText}>Click to pay instantly</Text>
              </View>
              <Icon name="chevron-right" size={18} color={colors.gray[300]} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.bookingSummary}>
           <Text style={styles.summaryTitle}>Booking Summary</Text>
           <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Seats</Text>
              <Text style={styles.summaryVal}>{selectedSeats.length}</Text>
           </View>
           <View style={[styles.summaryRow, { borderBottomWidth: 0 }]}>
              <Text style={styles.summaryLabel}>Total Amount</Text>
              <Text style={styles.summaryTotal}>UGX {(selectedSeats.length * (selectedBus?.route?.price || 0)).toLocaleString()}</Text>
           </View>
        </View>
      </View>
    </View>
  );

  const renderCompletionStep = () => (
    <View style={styles.completionContainer}>
       <LinearGradient
        colors={colors.gradients.primary}
        style={styles.completionHeader}
       >
         <View style={styles.successIcon}>
           <Icon name="check" size={50} color={colors.white} />
         </View>
         <Text style={styles.successTitle}>Booking Initialized!</Text>
         <Text style={styles.successSub}>Awaiting payment confirmation</Text>
       </LinearGradient>

       <View style={styles.completionBody}>
          <Text style={styles.bookingIdLabel}>YOUR BOOKING ID</Text>
          <Text style={styles.bookingIdVal}>{bookingId}</Text>
          
          <Text style={styles.completionDesc}>
            Your seats have been reserved. Please complete the payment steps on your device as prompted.
          </Text>

          <Button 
            title="View Ticket" 
            onPress={() => navigation.navigate('MainTabs', { screen: 'Bookings' })} 
            style={styles.viewTicketBtn}
          />
          <TouchableOpacity style={styles.goHomeBtn} onPress={() => navigation.navigate('MainTabs')}>
             <Text style={styles.goHomeText}>Back to Home</Text>
          </TouchableOpacity>
       </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.white} />
          <Text style={styles.loadingText}>Please wait...</Text>
        </View>
      )}
      
      {currentStep === 1 && renderSearchStep()}
      {currentStep === 2 && renderResultsStep()}
      {currentStep === 3 && renderSeatStep()}
      {currentStep === 4 && renderPassengerStep()}
      {currentStep === 5 && renderPaymentStep()}
      {currentStep === 6 && renderCompletionStep()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.8)',
    zIndex: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: colors.white,
    marginTop: 16,
    fontWeight: '700',
    fontSize: 16,
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
  scrollContent: {
    padding: 24,
  },
  searchCard: {
    backgroundColor: colors.white,
    padding: 24,
    borderRadius: 28,
    ...shadows.lg,
    marginBottom: 32,
  },
  searchLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.gray[800],
    marginBottom: 12,
  },
  locationScroll: {
    marginBottom: 24,
  },
  locationChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.gray[50],
    borderRadius: 14,
    marginRight: 10,
    borderWidth: 1,
    borderColor: colors.gray[100],
  },
  activeChip: {
    backgroundColor: colors.primaryGhost,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 13,
    color: colors.gray[500],
    fontWeight: '600',
  },
  activeChipText: {
    color: colors.primary,
    fontWeight: '800',
  },
  datePickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[50],
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.gray[100],
    marginBottom: 24,
  },
  dateIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.primaryGhost,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  dateLabel: {
    fontSize: 11,
    color: colors.gray[400],
    fontWeight: '700',
  },
  dateVal: {
    fontSize: 15,
    color: colors.gray[800],
    fontWeight: '700',
    marginTop: 2,
  },
  searchActionBtn: {
    height: 56,
  },
  busCard: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    ...shadows.md,
  },
  busCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  operatorName: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.gray[800],
  },
  busType: {
    fontSize: 12,
    color: colors.gray[400],
    marginTop: 2,
    fontWeight: '600',
  },
  busPrice: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.primary,
  },
  busDivider: {
    height: 1,
    backgroundColor: colors.gray[50],
    marginVertical: 16,
  },
  busCardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeVal: {
    fontSize: 14,
    color: colors.gray[800],
    fontWeight: '700',
    marginLeft: 8,
  },
  seatInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seatVal: {
    fontSize: 13,
    color: colors.gray[400],
    fontWeight: '600',
    marginLeft: 6,
  },
  stepContent: {
    flex: 1,
  },
  busFrame: {
    backgroundColor: colors.white,
    borderRadius: 32,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.gray[100],
    ...shadows.lg,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 8,
    marginTop: 24,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  legendBox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: colors.gray[500],
    fontWeight: '600',
  },
  driverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[50],
    marginBottom: 24,
  },
  steering: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.gray[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  frontLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.gray[300],
    letterSpacing: 2,
  },
  seatsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  seatColumn: {
    alignItems: 'center',
  },
  aisle: {
    width: 32,
    alignItems: 'center',
  },
  aisleLineDash: {
    width: 2,
    height: '100%',
    borderWidth: 1,
    borderColor: colors.gray[100],
    borderStyle: 'dashed',
  },
  seatPill: {
    width: 44,
    height: 44,
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  seatPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  seatPillOccupied: {
    backgroundColor: colors.gray[100],
    borderColor: colors.gray[100],
  },
  seatPillText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.gray[400],
  },
  seatPillTextActive: {
    color: colors.white,
  },
  seatPillTextOccupied: {
    color: colors.gray[300],
  },
  stepFooter: {
    padding: 24,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray[50],
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...shadows.lg,
  },
  footerLabel: {
    fontSize: 12,
    color: colors.gray[400],
    fontWeight: '600',
  },
  footerPrice: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.gray[800],
  },
  stepFooterBtn: {
    width: 140,
    height: 52,
  },
  pCard: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    ...shadows.md,
  },
  pCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  pAvatar: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.primaryGhost,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  pAvatarText: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.primary,
  },
  pTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.gray[800],
  },
  row: {
    flexDirection: 'row',
    marginTop: 12,
  },
  genderLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.gray[700],
    marginBottom: 8,
    marginLeft: 4,
  },
  genderGrid: {
    flexDirection: 'row',
    backgroundColor: colors.gray[50],
    borderRadius: 10,
    padding: 4,
  },
  genBtn: {
    flex: 1,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  genBtnActive: {
    backgroundColor: colors.white,
    ...shadows.sm,
  },
  genTxt: {
    fontSize: 13,
    color: colors.gray[400],
    fontWeight: '700',
  },
  genTxtActive: {
    color: colors.primary,
  },
  extraPInfo: {
      marginTop: 20,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: colors.gray[50],
  },
  proceedBtn: {
    height: 60,
    borderRadius: 20,
  },
  paymentContent: {
    flex: 1,
    padding: 24,
  },
  payMethods: {
      marginBottom: 32,
  },
  payCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: 18,
    borderRadius: 24,
    marginBottom: 14,
    ...shadows.md,
  },
  payIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  payName: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.gray[800],
  },
  paySubText: {
      fontSize: 11,
      color: colors.gray[400],
      marginTop: 2,
      fontWeight: '500',
  },
  bookingSummary: {
      backgroundColor: colors.white,
      padding: 24,
      borderRadius: 28,
      ...shadows.lg,
  },
  summaryTitle: {
      fontSize: 14,
      fontWeight: '900',
      color: colors.gray[800],
      marginBottom: 16,
  },
  summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.gray[50],
  },
  summaryLabel: {
      fontSize: 13,
      color: colors.gray[400],
      fontWeight: '600',
  },
  summaryVal: {
      fontSize: 14,
      fontWeight: '800',
      color: colors.gray[800],
  },
  summaryTotal: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.primary,
  },
  completionContainer: {
      flex: 1,
      backgroundColor: colors.white,
  },
  completionHeader: {
      paddingVertical: 80,
      alignItems: 'center',
      borderBottomLeftRadius: 40,
      borderBottomRightRadius: 40,
  },
  successIcon: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: 'rgba(255,255,255,0.2)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 24,
  },
  successTitle: {
      fontSize: 28,
      fontWeight: '900',
      color: colors.white,
  },
  successSub: {
      fontSize: 15,
      color: 'rgba(255,255,255,0.7)',
      marginTop: 8,
      fontWeight: '600',
  },
  completionBody: {
      padding: 40,
      alignItems: 'center',
  },
  bookingIdLabel: {
      fontSize: 12,
      color: colors.gray[400],
      fontWeight: '900',
      letterSpacing: 2,
      marginBottom: 8,
  },
  bookingIdVal: {
      fontSize: 32,
      fontWeight: '900',
      color: colors.gray[900],
      letterSpacing: 2,
  },
  completionDesc: {
      fontSize: 14,
      color: colors.gray[500],
      textAlign: 'center',
      marginTop: 24,
      lineHeight: 22,
      paddingHorizontal: 20,
  },
  viewTicketBtn: {
      width: '100%',
      marginTop: 40,
      height: 56,
      borderRadius: 18,
  },
  goHomeBtn: {
      marginTop: 16,
  },
  goHomeText: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.primary,
  },
  errorText: {
      color: colors.danger,
      textAlign: 'center',
      marginTop: 16,
      fontWeight: '600',
  },
});

export default BookingScreen;
