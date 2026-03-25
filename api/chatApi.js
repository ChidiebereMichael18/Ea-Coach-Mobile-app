import api from '../services/api';

/**
 * Send a message to the AI support agent
 * @param {string} message 
 * @param {Array} chatHistory - Previous messages for context (optional)
 * @returns {Promise<{ success: boolean, data?: object, error?: string }>}
 */
export async function sendChatMessage(message, chatHistory = []) {
  try {
    // Format messages for OpenAI format
    const formattedMessages = chatHistory.map(msg => ({
      role: msg.type === 'user' ? 'user' : 'assistant',
      content: msg.text
    }));
    
    formattedMessages.push({ role: 'user', content: message });
    
    // Use the existing api service
    const response = await api.post('/chat', { messages: formattedMessages });
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Send chat message error:', error);
    return { 
      success: false, 
      error: error.response?.data?.message || error.message || 'Failed to send message' 
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
    return { success: true, data: Array.isArray(response.data) ? response.data : (response.data.messages || []) };
  } catch (error) {
    console.error('Get chat history error:', error);
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to load chat history' 
    };
  }
}

/**
 * Send a message with context (maintains conversation history)
 * @param {string} message 
 * @param {Array} previousMessages 
 * @returns {Promise<{ success: boolean, data?: object, error?: string }>}
 */
export async function sendMessageWithContext(message, previousMessages = []) {
  try {
    // Take last 6 messages for context to keep token usage efficient
    const recentMessages = previousMessages.slice(-6);
    const chatHistory = recentMessages.map(msg => ({
      role: msg.type === 'user' ? 'user' : 'assistant',
      content: msg.text
    }));
    
    chatHistory.push({ role: 'user', content: message });
    
    // Use the existing api service
    const response = await api.post('/chat', { messages: chatHistory });
    
    return { 
      success: true, 
      data: { 
        response: response.data.message || response.data.response,
        message: response.data.message 
      } 
    };
  } catch (error) {
    console.error('Send message with context error:', error);
    return { 
      success: false, 
      error: error.response?.data?.message || error.message || 'Failed to send message. Please check your connection.' 
    };
  }
}