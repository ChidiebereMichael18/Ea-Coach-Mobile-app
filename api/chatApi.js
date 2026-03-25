import api from '../services/api';

/**
 * Send a message to the AI support agent
 * @param {string} message 
 * @returns {Promise<{ success: boolean, data?: object, error?: string }>}
 */
export async function sendChatMessage(message) {
  try {
    const response = await api.post('/chat', { message });
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to send message' 
    };
  }
}

/**
 * Get chat history (if supported by backend)
 * @returns {Promise<{ success: boolean, data?: array, error?: string }>}
 */
export async function getChatHistory() {
  try {
    const response = await api.get('/chat/history');
    return { success: true, data: Array.isArray(response.data) ? response.data : [] };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to load chat history' 
    };
  }
}
