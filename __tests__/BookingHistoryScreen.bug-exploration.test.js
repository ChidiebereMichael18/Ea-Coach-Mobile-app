/**
 * Bug Condition Exploration Test for Booking Price Display
 * 
 * CRITICAL: This test MUST FAIL on unfixed code - failure confirms the bug exists
 * DO NOT attempt to fix the test or the code when it fails
 * 
 * Property 1: Bug Condition - Mobile App Displays Zero Instead of Actual Booking Amount
 * **Validates: Requirements 1.1, 1.2, 2.1, 2.2**
 * 
 * This test encodes the expected behavior - it will validate the fix when it passes after implementation
 * GOAL: Surface counterexamples that demonstrate the bug exists
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import BookingHistoryScreen from '../screens/dashboard/BookingHistoryScreen';
import * as dashboardApi from '../api/dashboardApi';

// Mock the API module
jest.mock('../api/dashboardApi');
const mockGetMyBookings = dashboardApi.getMyBookings;

// Mock navigation
const mockNavigation = {
  navigate: jest.fn(),
};

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => mockNavigation,
}));

// Mock other dependencies
jest.mock('@expo/vector-icons/Feather', () => 'Icon');
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: 'LinearGradient',
}));
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }) => children,
}));
jest.mock('expo-status-bar', () => ({
  StatusBar: 'StatusBar',
}));

describe('Bug Condition Exploration: Booking Price Display', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Test Case 1: Standard Booking Test - UGX 50,000
   * Expected on UNFIXED code: Shows "UGX 0" instead of "UGX 50,000"
   * Expected on FIXED code: Shows "UGX 50,000"
   */
  it('should display correct booking amount for UGX 50,000 booking (EXPECTED TO FAIL on unfixed code)', async () => {
    // Arrange: Create test booking with totalAmount = 50000 (API field)
    const testBooking = {
      _id: 'booking-1',
      totalAmount: 50000, // API returns this field
      // Note: totalPrice is NOT in API response - this is the bug
      route: {
        from: 'Kampala',
        to: 'Jinja',
        departureTime: '08:00',
        arrivalTime: '10:30',
        departureDate: '2024-01-15'
      },
      passengerName: 'John Doe',
      bookedSeats: [12],
      bus: {
        busNumber: 'UBE-001'
      },
      bookingStatus: 'confirmed'
    };

    mockGetMyBookings.mockResolvedValue({
      success: true,
      data: [testBooking]
    });

    // Act: Render component and open ticket details modal
    const { getByText, getByTestId } = render(<BookingHistoryScreen />);
    
    // Wait for bookings to load
    await waitFor(() => {
      expect(getByText('Kampala')).toBeTruthy();
    });

    // Click on booking card to open modal
    const bookingCard = getByText('Kampala').closest('TouchableOpacity');
    fireEvent.press(bookingCard);

    // Wait for modal to open
    await waitFor(() => {
      expect(getByText('Ticket Details')).toBeTruthy();
    });

    // Assert: Check that the correct amount is displayed
    // On UNFIXED code: This will show "UGX 0" because selectedBooking.totalPrice is undefined
    // On FIXED code: This should show "UGX 50,000" using selectedBooking.totalAmount
    const expectedAmount = 'UGX 50,000';
    const totalPriceElement = getByText(expectedAmount);
    expect(totalPriceElement).toBeTruthy();
  });

  /**
   * Test Case 2: High Amount Test - UGX 250,000
   * Expected on UNFIXED code: Shows "UGX 0" instead of "UGX 250,000"
   * Expected on FIXED code: Shows "UGX 250,000"
   */
  it('should display correct booking amount for UGX 250,000 booking (EXPECTED TO FAIL on unfixed code)', async () => {
    // Arrange: Create test booking with high amount
    const testBooking = {
      _id: 'booking-2',
      totalAmount: 250000, // API returns this field
      route: {
        from: 'Kampala',
        to: 'Mbarara',
        departureTime: '06:00',
        arrivalTime: '10:00',
        departureDate: '2024-01-20'
      },
      passengerName: 'Jane Smith',
      bookedSeats: [5, 6],
      bus: {
        busNumber: 'UBE-002'
      },
      bookingStatus: 'confirmed'
    };

    mockGetMyBookings.mockResolvedValue({
      success: true,
      data: [testBooking]
    });

    // Act: Render and open modal
    const { getByText } = render(<BookingHistoryScreen />);
    
    await waitFor(() => {
      expect(getByText('Kampala')).toBeTruthy();
    });

    const bookingCard = getByText('Kampala').closest('TouchableOpacity');
    fireEvent.press(bookingCard);

    await waitFor(() => {
      expect(getByText('Ticket Details')).toBeTruthy();
    });

    // Assert: Check high amount display
    const expectedAmount = 'UGX 250,000';
    const totalPriceElement = getByText(expectedAmount);
    expect(totalPriceElement).toBeTruthy();
  });

  /**
   * Test Case 3: Multiple Seats Test - UGX 120,000
   * Expected on UNFIXED code: Shows "UGX 0" instead of "UGX 120,000"
   * Expected on FIXED code: Shows "UGX 120,000"
   */
  it('should display correct booking amount for multiple seats booking (EXPECTED TO FAIL on unfixed code)', async () => {
    // Arrange: Create booking with multiple seats
    const testBooking = {
      _id: 'booking-3',
      totalAmount: 120000, // API returns this field
      route: {
        from: 'Entebbe',
        to: 'Kampala',
        departureTime: '14:30',
        arrivalTime: '15:30',
        departureDate: '2024-01-25'
      },
      passengerName: 'Bob Wilson',
      bookedSeats: [10, 11, 12], // 3 seats
      bus: {
        busNumber: 'UBE-003'
      },
      bookingStatus: 'confirmed'
    };

    mockGetMyBookings.mockResolvedValue({
      success: true,
      data: [testBooking]
    });

    // Act: Render and open modal
    const { getByText } = render(<BookingHistoryScreen />);
    
    await waitFor(() => {
      expect(getByText('Entebbe')).toBeTruthy();
    });

    const bookingCard = getByText('Entebbe').closest('TouchableOpacity');
    fireEvent.press(bookingCard);

    await waitFor(() => {
      expect(getByText('Ticket Details')).toBeTruthy();
    });

    // Assert: Check multiple seats amount display
    const expectedAmount = 'UGX 120,000';
    const totalPriceElement = getByText(expectedAmount);
    expect(totalPriceElement).toBeTruthy();
  });

  /**
   * Test Case 4: API Response Field Verification
   * This test verifies the field name mismatch that causes the bug
   * Expected on UNFIXED code: totalPrice is undefined, totalAmount exists
   * Expected on FIXED code: Component uses totalAmount correctly
   */
  it('should verify API response contains totalAmount field but not totalPrice (EXPECTED TO FAIL on unfixed code)', async () => {
    // Arrange: Create booking with explicit field structure
    const testBooking = {
      _id: 'booking-4',
      totalAmount: 75000, // This field EXISTS in API response
      // totalPrice: undefined, // This field does NOT exist in API response
      route: {
        from: 'Gulu',
        to: 'Kampala',
        departureTime: '07:00',
        arrivalTime: '13:00',
        departureDate: '2024-01-30'
      },
      passengerName: 'Alice Johnson',
      bookedSeats: [8],
      bus: {
        busNumber: 'UBE-004'
      },
      bookingStatus: 'confirmed'
    };

    mockGetMyBookings.mockResolvedValue({
      success: true,
      data: [testBooking]
    });

    // Act: Render component
    const { getByText } = render(<BookingHistoryScreen />);
    
    await waitFor(() => {
      expect(getByText('Gulu')).toBeTruthy();
    });

    // Verify the booking object structure
    expect(testBooking.totalAmount).toBe(75000); // This field exists
    expect(testBooking.totalPrice).toBeUndefined(); // This field does NOT exist

    // Open modal to trigger the bug
    const bookingCard = getByText('Gulu').closest('TouchableOpacity');
    fireEvent.press(bookingCard);

    await waitFor(() => {
      expect(getByText('Ticket Details')).toBeTruthy();
    });

    // Assert: The component should display the correct amount from totalAmount field
    // On UNFIXED code: This will fail because component uses totalPrice (undefined)
    // On FIXED code: This will pass because component uses totalAmount (75000)
    const expectedAmount = 'UGX 75,000';
    const totalPriceElement = getByText(expectedAmount);
    expect(totalPriceElement).toBeTruthy();
  });

  /**
   * Test Case 5: Zero Amount Edge Case
   * This test handles the edge case where totalAmount is legitimately 0
   * Expected behavior: Should display "UGX 0" (correct zero, not bug zero)
   */
  it('should correctly display UGX 0 for legitimate zero amount bookings', async () => {
    // Arrange: Create booking with legitimate zero amount (e.g., free promotional booking)
    const testBooking = {
      _id: 'booking-5',
      totalAmount: 0, // Legitimate zero value
      route: {
        from: 'Kampala',
        to: 'Entebbe',
        departureTime: '16:00',
        arrivalTime: '17:00',
        departureDate: '2024-02-01'
      },
      passengerName: 'Free Rider',
      bookedSeats: [1],
      bus: {
        busNumber: 'UBE-005'
      },
      bookingStatus: 'confirmed'
    };

    mockGetMyBookings.mockResolvedValue({
      success: true,
      data: [testBooking]
    });

    // Act: Render and open modal
    const { getByText } = render(<BookingHistoryScreen />);
    
    await waitFor(() => {
      expect(getByText('Kampala')).toBeTruthy();
    });

    const bookingCard = getByText('Kampala').closest('TouchableOpacity');
    fireEvent.press(bookingCard);

    await waitFor(() => {
      expect(getByText('Ticket Details')).toBeTruthy();
    });

    // Assert: Should display UGX 0 (this is correct for zero amount)
    const expectedAmount = 'UGX 0';
    const totalPriceElement = getByText(expectedAmount);
    expect(totalPriceElement).toBeTruthy();
  });
});