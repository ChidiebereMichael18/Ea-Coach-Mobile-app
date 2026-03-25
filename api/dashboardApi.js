import api from '../services/api';

/**
 * Get user profile
 * @returns {Promise<{ success: boolean, data?: object, error?: string }>}
 */
export async function getProfile() {
  try {
    const response = await api.get('/auth/profile');
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to fetch profile' 
    };
  }
}

/**
 * Get total booking stats
 * @returns {Promise<{ success: boolean, data?: object, error?: string }>}
 */
export async function getTotalBookingAmount() {
  try {
    const response = await api.get('/auth/bookings/total-amount');
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to fetch stats' 
    };
  }
}

/**
 * Get user bookings
 * @returns {Promise<{ success: boolean, data?: array, error?: string }>}
 */
export async function getMyBookings() {
  try {
    const response = await api.get('/bookings/mybookings');
    return { success: true, data: Array.isArray(response.data) ? response.data : [] };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to fetch bookings' 
    };
  }
}

/**
 * Cancel a booking
 * @param {string} id 
 * @returns {Promise<{ success: boolean, data?: object, error?: string }>}
 */
export async function cancelBooking(id) {
  try {
    const response = await api.post(`/bookings/cancel/${id}`);
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to cancel booking' 
    };
  }
}
