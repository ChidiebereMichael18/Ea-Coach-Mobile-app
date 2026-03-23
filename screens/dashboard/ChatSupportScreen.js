import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Linking,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import api from '../../services/api';
import { colors } from '../../styles/colors';

const ChatSupportScreen = () => {
  const [messages, setMessages] = useState([
    {
      id: '1',
      type: 'bot',
      text: "Hello! I'm your EA Coach assistant. How can I help you today?",
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickHelp, setShowQuickHelp] = useState(true);
  const [showContactModal, setShowContactModal] = useState(false);
  const flatListRef = useRef(null);

  const commonQuestions = [
    "How do I change my booking?",
    "What payment methods do you accept?",
    "Can I cancel my ticket?",
    "What's your baggage policy?",
    "Arrival terminal info",
    "Student discounts"
  ];

  const handleSendMessage = async (textOverride = null) => {
    const text = textOverride || inputMessage;
    if (!text.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      type: 'user',
      text: text,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);
    setShowQuickHelp(false);

    try {
      const chatHistory = messages
        .slice(-6)
        .map(msg => ({
          role: msg.type === 'user' ? 'user' : 'assistant',
          content: msg.text
        }));
      
      chatHistory.push({ role: 'user', content: text });

      const response = await api.post('/chat', { messages: chatHistory });
      
      if (response.data && response.data.message) {
        const botMessage = {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          text: response.data.message,
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, botMessage]);
      } else {
        throw new Error('No response from bot');
      }
    } catch (error) {
      console.error('Chat Error:', error);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        text: "I'm having trouble connecting right now. Please try again or check our contact info.",
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickQuestion = (question) => {
    handleSendMessage(question);
  };

  const renderMessage = ({ item }) => {
    const isUser = item.type === 'user';
    return (
      <View style={[styles.messageRow, isUser ? styles.userRow : styles.botRow]}>
        {!isUser && (
          <View style={styles.botIconCircle}>
            <Icon name="cpu" size={14} color={colors.primary} />
          </View>
        )}
        <View style={[styles.bubble, isUser ? styles.userBubble : styles.botBubble]}>
          <Text style={[styles.messageText, isUser ? styles.userText : styles.botText]}>{item.text}</Text>
          <Text style={[styles.timeText, isUser ? styles.userTime : styles.botTime]}>
            {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Support</Text>
          <View style={styles.statusRow}>
            <View style={styles.onlineDot} />
            <Text style={styles.statusText}>Live Assistant</Text>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.helpToggle}
          onPress={() => setShowContactModal(true)}
        >
          <Icon name="phone" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
          ListFooterComponent={isTyping && (
            <View style={styles.typingContainer}>
              <View style={styles.botIconCircle}>
                <Icon name="cpu" size={14} color={colors.primary} />
              </View>
              <View style={styles.typingBubble}>
                <ActivityIndicator size="small" color={colors.gray[400]} />
              </View>
            </View>
          )}
        />

        {/* Action Area */}
        <View style={styles.actionArea}>
          {showQuickHelp && (
            <View style={styles.quickQuestionsContainer}>
              <Text style={styles.quickHeading}>Quick Questions</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickList}>
                {commonQuestions.map((q, i) => (
                  <TouchableOpacity 
                    key={i} 
                    style={styles.quickChip}
                    onPress={() => handleQuickQuestion(q)}
                  >
                    <Text style={styles.quickChipText}>{q}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="How can we help?"
              value={inputMessage}
              onChangeText={setInputMessage}
              multiline
            />
            <TouchableOpacity 
              style={[styles.sendBtn, !inputMessage.trim() && styles.sendBtnDisabled]}
              onPress={() => handleSendMessage()}
              disabled={!inputMessage.trim() || isTyping}
            >
              <Icon name="send" size={20} color={colors.white} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Contact Modal */}
      <Modal visible={showContactModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Contact Team</Text>
              <TouchableOpacity onPress={() => setShowContactModal(false)}>
                <Icon name="x" size={24} color={colors.gray[400]} />
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <TouchableOpacity 
                style={styles.contactItem}
                onPress={() => Linking.openURL('tel:+256700123456')}
              >
                <View style={styles.contactIcon}>
                  <Icon name="phone" size={20} color={colors.primary} />
                </View>
                <View>
                  <Text style={styles.contactLabel}>Phone Support</Text>
                  <Text style={styles.contactValue}>+256 700 123 456</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.contactItem}
                onPress={() => Linking.openURL('mailto:support@eacoach.com')}
              >
                <View style={[styles.contactIcon, { backgroundColor: '#E0F2FE' }]}>
                  <Icon name="mail" size={20} color="#0EA5E9" />
                </View>
                <View>
                  <Text style={styles.contactLabel}>Email Us</Text>
                  <Text style={styles.contactValue}>support@eacoach.com</Text>
                </View>
              </TouchableOpacity>

              <View style={styles.hoursBox}>
                <Text style={styles.hoursLabel}>Support Availability</Text>
                <View style={styles.hoursRow}>
                  <Text style={styles.hoursText}>Mon - Sun</Text>
                  <Text style={styles.hoursVal}>24/7 Hours</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </Modal>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.gray[900],
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: colors.gray[400],
    fontWeight: '500',
  },
  helpToggle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.gray[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageList: {
    padding: 20,
    paddingBottom: 40,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 20,
    maxWidth: '85%',
  },
  userRow: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  botRow: {
    alignSelf: 'flex-start',
  },
  botIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  bubble: {
    padding: 12,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1,
  },
  userBubble: {
    backgroundColor: colors.primary,
    borderTopRightRadius: 4,
  },
  botBubble: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userText: {
    color: colors.white,
  },
  botText: {
    color: colors.gray[800],
  },
  timeText: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  userTime: {
    color: 'rgba(255,255,255,0.7)',
  },
  botTime: {
    color: colors.gray[400],
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  typingBubble: {
    backgroundColor: colors.white,
    padding: 10,
    borderRadius: 15,
    borderTopLeftRadius: 4,
  },
  actionArea: {
    backgroundColor: colors.white,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
  },
  quickQuestionsContainer: {
    marginBottom: 16,
  },
  quickHeading: {
    fontSize: 11,
    color: colors.gray[400],
    textTransform: 'uppercase',
    fontWeight: 'bold',
    marginBottom: 8,
    marginLeft: 4,
  },
  quickList: {
    flexDirection: 'row',
  },
  quickChip: {
    backgroundColor: colors.gray[50],
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  quickChipText: {
    fontSize: 13,
    color: colors.gray[700],
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: colors.gray[50],
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: 15,
    maxHeight: 120,
    color: colors.gray[800],
  },
  sendBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  sendBtnDisabled: {
    opacity: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.gray[900],
  },
  modalBody: {
    gap: 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[50],
    padding: 16,
    borderRadius: 20,
  },
  contactIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  contactLabel: {
    fontSize: 12,
    color: colors.gray[400],
    fontWeight: 'bold',
  },
  contactValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.gray[800],
    marginTop: 2,
  },
  hoursBox: {
    marginTop: 8,
    padding: 20,
    backgroundColor: colors.gray[50],
    borderRadius: 20,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  hoursLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    color: colors.gray[800],
    marginBottom: 12,
    textAlign: 'center',
  },
  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hoursText: {
    color: colors.gray[500],
    fontSize: 14,
  },
  hoursVal: {
    fontWeight: 'bold',
    color: colors.success,
    fontSize: 14,
  },
});

export default ChatSupportScreen;
