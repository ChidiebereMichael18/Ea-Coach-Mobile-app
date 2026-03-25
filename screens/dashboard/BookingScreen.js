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
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';

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
        setError(res.error || 'No buses found for this route.');
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

  const renderHeader = (title, sub) => (
    <LinearGradient
      colors={colors.gradients.primary}
      style={styles.headerArea}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
    >
      <SafeAreaView edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : navigation.goBack()}>
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

          <TouchableOpacity style={styles.datePickerBtn} onPress={() => setShowDatePicker(true)}>
            <View style={styles.dateIconWrap}>
              <Icon name="calendar" size={20} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.dateLabel}>Departure Date</Text>
              <Text style={styles.dateVal}>{searchData.date.toDateString()}</Text>
            </View>
            <Icon name="edit-2" size={16} color={colors.gray[300]} />
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

          <Button title="Search Buses" onPress={handleSearch} loading={loading} style={styles.searchActionBtn} icon="search" />
        </View>

        {availableBuses.length > 0 ? (
          <View style={styles.resultsArea}>
            <Text style={styles.resultsTitle}>Found {availableBuses.length} options</Text>
            {availableBuses.map(bus => (
              <TouchableOpacity 
                key={bus._id} 
                style={styles.busCard}
                activeOpacity={0.8}
                onPress={() => {
                  setSelectedBus(bus);
                  setCurrentStep(2);
                }}
              >
                <View style={styles.busCardHeader}>
                  <View style={styles.operatorBox}>
                    <View style={styles.operatorIcon}>
                       <Icon name="truck" size={18} color={colors.primary} />
                    </View>
                    <View>
                      <Text style={styles.operatorName}>{bus.operator?.name || 'Bus'}</Text>
                      <Text style={styles.busTypeLabel}>{bus.busType}</Text>
                    </View>
                  </View>
                  <Text style={styles.priceTag}>UGX {bus.route.price.toLocaleString()}</Text>
                </View>
                
                <View style={styles.routeFlow}>
                  <View>
                    <Text style={styles.routeTime}>{bus.route.departureTime}</Text>
                    <Text style={styles.routeCity}>{bus.route.from}</Text>
                  </View>
                  <View style={styles.routeVisual}>
                    <View style={styles.routeDot} />
                    <View style={styles.routeLine} />
                    <Icon name="chevron-right" size={16} color={colors.gray[300]} />
                    <View style={styles.routeLine} />
                    <View style={[styles.routeDot, { backgroundColor: colors.primary }]} />
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.routeTime}>{bus.route.arrivalTime}</Text>
                    <Text style={styles.routeCity}>{bus.route.to}</Text>
                  </View>
                </View>

                <View style={styles.busCardFooter}>
                   <View style={styles.footerInfo}>
                      <Icon name="users" size={12} color={colors.success} />
                      <Text style={styles.footerInfoText}>{bus.availableSeats ?? bus.totalSeats} seats available</Text>
                   </View>
                   <View style={styles.amenityRow}>
                      {bus.amenities?.wifi && <Icon name="wifi" size={14} color={colors.gray[300]} style={{ marginLeft: 8 }} />}
                      {bus.amenities?.usbCharging && <Icon name="zap" size={14} color={colors.gray[300]} style={{ marginLeft: 8 }} />}
                   </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : error ? (
           <View style={styles.emptyResults}>
              <Icon name="alert-circle" size={40} color={colors.gray[200]} />
              <Text style={styles.emptyTitle}>No Results Found</Text>
              <Text style={styles.emptySub}>Try different locations or dates.</Text>
           </View>
        ) : null}
      </ScrollView>
    </View>
  );

  const renderSeatStep = () => (
    <View style={{ flex: 1 }}>
      {renderHeader("Select Seats", `${selectedBus?.operator?.name} • ${selectedBus?.route?.departureTime}`)}
      <View style={styles.seatStepContent}>
        <View style={styles.legend}>
          <View style={styles.legendItem}><View style={[styles.legBox, { bg: colors.gray[100] }]} /><Text style={styles.legText}>Available</Text></View>
          <View style={styles.legendItem}><View style={[styles.legBox, { bg: colors.primary }]} /><Text style={styles.legText}>Selected</Text></View>
          <View style={styles.legendItem}><View style={[styles.legBox, { bg: colors.gray[300] }]} /><Text style={styles.legText}>Reserved</Text></View>
        </View>

        <ScrollView contentContainerStyle={styles.seatScroll} showsVerticalScrollIndicator={false}>
          <View style={styles.busGraphic}>
            <View style={styles.busFront}>
               <Icon name="disc" size={32} color={colors.gray[200]} />
            </View>
            <View style={styles.seatGrid}>
              {Array(40).fill(0).map((_, i) => {
                const seatNum = i + 1;
                const isSelected = selectedSeats.includes(seatNum);
                return (
                  <TouchableOpacity
                    key={i}
                    style={[styles.seatPill, isSelected && styles.seatPillActive]}
                    onPress={() => {
                      if (isSelected) setSelectedSeats(prev => prev.filter(s => s !== seatNum));
                      else if (selectedSeats.length < 5) setSelectedSeats(prev => [...prev, seatNum]);
                      else Alert.alert('Limit Reached', 'Maximum 5 seats allowed.');
                    }}
                  >
                    <Text style={[styles.seatPillText, isSelected && styles.seatPillTextActive]}>{seatNum}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </ScrollView>

        <View style={styles.stepFooter}>
          <View>
            <Text style={styles.footerSubLabel}>{selectedSeats.length} seats selected</Text>
            <Text style={styles.footerPrice}>UGX {(selectedSeats.length * selectedBus?.route?.price).toLocaleString()}</Text>
          </View>
          <Button 
            title="Next Step" 
            disabled={selectedSeats.length === 0} 
            onPress={() => {
              setPassengers(selectedSeats.map(s => ({ name: '', age: '', gender: 'Male', seat: s })));
              setCurrentStep(3);
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
              label="Full Name" 
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
                    label="Age" 
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
                   <Text style={styles.genderLabel}>Gender</Text>
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
          </View>
        ))}
        <Button 
          title="Proceed to Payment" 
          onPress={() => setCurrentStep(4)} 
          disabled={passengers.some(p => !p.name || !p.age)}
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
            { id: 'mobile_money', name: 'Mobile Money', icon: 'smartphone', color: '#F59E0B' },
            { id: 'card', name: 'Card Payment', icon: 'credit-card', color: colors.primary },
            { id: 'cash', name: 'Cash at Counter', icon: 'dollar-sign', color: colors.success },
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
                <Text style={styles.paySub}>Secure and official</Text>
              </View>
              <Icon name="chevron-right" size={20} color={colors.gray[300]} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.totalBox}>
          <Text style={styles.totalLabel}>Grand Total</Text>
          <Text style={styles.totalVal}>UGX {(selectedSeats.length * selectedBus?.route?.price).toLocaleString()}</Text>
        </View>
      </View>
    </View>
  );

  const renderConfirmation = () => (
    <View style={styles.confirmView}>
      <StatusBar style="dark" />
      <View style={styles.successCircle}>
         <Icon name="check" size={40} color={colors.white} />
      </View>
      <Text style={styles.successTitle}>Booking Verified!</Text>
      <Text style={styles.successSub}>Your ticket is ready and has been added to your history.</Text>
      
      <View style={styles.ticketCard}>
        <View style={styles.ticketTop}>
           <Text style={styles.tickId}>ID: {bookingId}</Text>
           <Text style={styles.tickRoute}>{searchData.from} → {searchData.to}</Text>
        </View>
        <View style={styles.tickRow}>
           <View>
             <Text size={10} style={styles.tickLabel}>DATE</Text>
             <Text style={styles.tickVal}>{searchData.date.toDateString()}</Text>
           </View>
           <View style={{ alignItems: 'flex-end' }}>
             <Text size={10} style={styles.tickLabel}>TIME</Text>
             <Text style={styles.tickVal}>{selectedBus?.route?.departureTime}</Text>
           </View>
        </View>
        <View style={styles.tickDivider} />
        <View style={styles.tickRow}>
           <View>
             <Text size={10} style={styles.tickLabel}>SEATS</Text>
             <Text style={styles.tickVal}>{selectedSeats.join(', ')}</Text>
           </View>
           <View style={{ alignItems: 'flex-end' }}>
             <Text size={10} style={styles.tickLabel}>AMOUNT</Text>
             <Text style={styles.tickVal}>UGX {(selectedSeats.length * selectedBus?.route?.price).toLocaleString()}</Text>
           </View>
        </View>
      </View>

      <Button title="Back to Dashboard" onPress={() => navigation.navigate('Home')} style={styles.finishBtn} />
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      {currentStep === 1 && renderSearchStep()}
      {currentStep === 2 && renderSeatStep()}
      {currentStep === 3 && renderPassengerStep()}
      {currentStep === 4 && renderPaymentStep()}
      {currentStep === 5 && renderConfirmation()}
      
      {error && (
        <View style={styles.errorBox}>
          <Icon name="alert-circle" size={16} color={colors.white} />
          <Text style={styles.errorBoxText}>{error}</Text>
          <TouchableOpacity onPress={() => setError(null)}><Icon name="x" size={16} color={colors.white} /></TouchableOpacity>
        </View>
      )}
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
  resultsTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.gray[800],
    marginBottom: 16,
  },
  busCard: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    ...shadows.md,
  },
  busCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  operatorBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  operatorIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.primaryGhost,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  operatorName: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.gray[800],
  },
  busTypeLabel: {
    fontSize: 11,
    color: colors.gray[400],
    fontWeight: '600',
  },
  priceTag: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.primary,
  },
  routeFlow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  routeTime: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.gray[800],
  },
  routeCity: {
    fontSize: 13,
    color: colors.gray[400],
    fontWeight: '600',
    marginTop: 4,
  },
  routeVisual: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    flex: 1,
  },
  routeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.gray[200],
  },
  routeLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.gray[100],
    marginHorizontal: 4,
  },
  busCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.gray[50],
  },
  footerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerInfoText: {
    fontSize: 12,
    color: colors.success,
    fontWeight: '700',
    marginLeft: 6,
  },
  amenityRow: {
    flexDirection: 'row',
  },

  // Seat Selection Styles
  seatStepContent: {
    flex: 1,
    padding: 24,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  legBox: {
    width: 12,
    height: 12,
    borderRadius: 3,
    marginRight: 6,
  },
  legText: {
    fontSize: 11,
    color: colors.gray[500],
    fontWeight: '600',
  },
  busGraphic: {
    backgroundColor: colors.white,
    borderRadius: 32,
    padding: 24,
    ...shadows.lg,
  },
  busFront: {
    paddingBottom: 24,
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[50],
    alignItems: 'center',
  },
  seatGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  seatPill: {
    width: '22%',
    height: 44,
    backgroundColor: colors.gray[50],
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  seatPillActive: {
    backgroundColor: colors.primary,
    ...shadows.primary,
  },
  seatPillText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.gray[600],
  },
  seatPillTextActive: {
    color: colors.white,
  },
  stepFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  footerSubLabel: {
    fontSize: 13,
    color: colors.gray[400],
    fontWeight: '600',
  },
  footerPrice: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.gray[900],
  },
  stepFooterBtn: {
    width: 150,
  },

  // Passenger Card
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
    fontSize: 16,
    fontWeight: '800',
    color: colors.primary,
  },
  pTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.gray[800],
  },
  genderLabel: {
    fontSize: 13,
    fontWeight: '800',
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
  genBtn: {
    flex: 1,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
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
  proceedBtn: {
    height: 56,
  },

  // Payment
  paymentContent: {
    flex: 1,
    padding: 24,
  },
  payCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: 20,
    borderRadius: 24,
    marginBottom: 16,
    ...shadows.md,
  },
  payIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  payName: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.gray[800],
  },
  paySub: {
    fontSize: 12,
    color: colors.gray[400],
    marginTop: 2,
    fontWeight: '500',
  },
  totalBox: {
    marginTop: 'auto',
    backgroundColor: colors.white,
    padding: 24,
    borderRadius: 24,
    alignItems: 'center',
    ...shadows.lg,
  },
  totalLabel: {
    fontSize: 14,
    color: colors.gray[400],
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  totalVal: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.primary,
    marginTop: 4,
  },

  // Success Confirmation
  confirmView: {
    flex: 1,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  successCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    ...shadows.md,
  },
  successTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: colors.gray[900],
    marginBottom: 12,
  },
  successSub: {
    fontSize: 15,
    color: colors.gray[500],
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 40,
  },
  ticketCard: {
    width: '100%',
    backgroundColor: colors.gray[50],
    borderRadius: 24,
    padding: 24,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: colors.gray[100],
  },
  ticketTop: {
    marginBottom: 20,
  },
  tickId: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '800',
  },
  tickRoute: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.gray[800],
    marginTop: 4,
  },
  tickRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  tickLabel: {
    fontSize: 10,
    color: colors.gray[400],
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  tickVal: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.gray[800],
    marginTop: 4,
  },
  tickDivider: {
    height: 1,
    backgroundColor: colors.gray[200],
    marginVertical: 4,
    marginBottom: 20,
    borderStyle: 'dashed',
    borderRadius: 1,
  },
  finishBtn: {
    width: '100%',
    height: 56,
  },

  // Error
  errorBox: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
    backgroundColor: colors.danger,
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    ...shadows.lg,
  },
  errorBoxText: {
    color: colors.white,
    flex: 1,
    marginHorizontal: 12,
    fontWeight: '600',
  },
});

export default BookingScreen;
