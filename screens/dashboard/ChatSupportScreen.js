import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '@expo/vector-icons/Feather';
import { useAuth } from '../../context/AuthContext';
import { colors, shadows } from '../../styles/colors';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { sendMessageWithContext, getChatHistory } from '../../api/chatApi';

const ChatSupportScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  
  const scrollViewRef = useRef();
  const inputRef = useRef();

  const commonQuestions = [
    "How do I change my booking?",
    "What payment methods do you accept?",
    "Can I cancel my ticket?",
    "What's your baggage policy?"
  ];

  useEffect(() => {
    loadChatHistory();
  }, []);

  const loadChatHistory = async () => {
    try {
      const res = await getChatHistory();
      if (res.success && res.data && res.data.length > 0) {
        const formattedMessages = res.data.map((msg, index) => ({
          id: msg.id || index,
          type: msg.sender === 'user' ? 'user' : 'bot',
          text: msg.message || msg.text,
          timestamp: msg.timestamp || new Date().toISOString(),
        }));
        setMessages(formattedMessages);
      } else {
        setMessages([
          {
            id: 1,
            type: 'bot',
            text: "Hello! I'm your EA Coach assistant. How can I help you today?",
            timestamp: new Date().toISOString(),
          },
        ]);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
      setMessages([
        {
          id: 1,
          type: 'bot',
          text: "Hello! I'm your EA Coach assistant. How can I help you today?",
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    const messageToSend = inputMessage.trim();
    if (!messageToSend) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: messageToSend,
      timestamp: new Date().toISOString(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);
    scrollToBottom();

    try {
      const previousMessages = messages.slice(-6);
      const res = await sendMessageWithContext(messageToSend, previousMessages);
      
      if (res.success && res.data) {
        const botMessage = {
          id: Date.now() + 1,
          type: 'bot',
          text: res.data.response || res.data.message || "I've received your message. How else can I help?",
          timestamp: new Date().toISOString(),
        };
        setMessages(prev => [...prev, botMessage]);
      } else {
        throw new Error(res.error || 'Failed to get response');
      }
    } catch (error) {
      console.error('Chat Error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        text: "I'm having trouble connecting right now. Please try again.",
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
      scrollToBottom();
    }
  };

  const handleQuickQuestion = (question) => {
    setInputMessage(question);
    setTimeout(() => {
      handleSendMessage();
    }, 100);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loadingHistory) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <LinearGradient
          colors={colors.gradients.primary}
          style={styles.headerArea}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0.5 }}
        >
          <SafeAreaView edges={['top']}>
            <View style={styles.header}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                <Icon name="chevron-left" size={24} color={colors.white} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Chat Support</Text>
              <View style={{ width: 40 }} />
            </View>
          </SafeAreaView>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient
        colors={colors.gradients.primary}
        style={styles.headerArea}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0.5 }}
      >
        <SafeAreaView edges={['top']}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Icon name="chevron-left" size={24} color={colors.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Chat Support</Text>
            <View style={{ width: 40 }} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      <KeyboardAvoidingView 
        style={styles.flex} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
      >
        <View style={styles.chatContainer}>
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={scrollToBottom}
          >
            {messages.length === 0 && (
              <View style={styles.welcomeContainer}>
                <View style={styles.welcomeIcon}>
                  <Icon name="message-circle" size={40} color={colors.primary} />
                </View>
                <Text style={styles.welcomeTitle}>Welcome to Support</Text>
                <Text style={styles.welcomeText}>
                  Ask me anything about bookings, routes, or travel tips
                </Text>
                <View style={styles.quickQuestions}>
                  {commonQuestions.map((q, i) => (
                    <TouchableOpacity 
                      key={i} 
                      style={styles.questionChip}
                      onPress={() => handleQuickQuestion(q)}
                    >
                      <Text style={styles.questionChipText}>{q}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {messages.map((item) => (
              <View
                key={item.id}
                style={[
                  styles.messageRow,
                  item.type === 'user' ? styles.userRow : styles.botRow
                ]}
              >
                {item.type === 'bot' && (
                  <View style={styles.botAvatar}>
                    <Icon name="message-circle" size={16} color={colors.primary} />
                  </View>
                )}
                <View style={[
                  styles.messageBubble,
                  item.type === 'user' ? styles.userBubble : styles.botBubble
                ]}>
                  <Text style={[
                    styles.messageText,
                    item.type === 'user' ? styles.userText : styles.botText
                  ]}>{item.text}</Text>
                  <Text style={styles.messageTime}>{formatTime(item.timestamp)}</Text>
                </View>
                {item.type === 'user' && (
                  <View style={styles.userAvatar}>
                    <Icon name="user" size={16} color={colors.white} />
                  </View>
                )}
              </View>
            ))}

            {isTyping && (
              <View style={styles.typingRow}>
                <View style={styles.botAvatar}>
                  <Icon name="message-circle" size={16} color={colors.primary} />
                </View>
                <View style={styles.typingBubble}>
                  <View style={styles.typingDots}>
                    <View style={styles.dot} />
                    <View style={[styles.dot, styles.dotDelay]} />
                    <View style={[styles.dot, styles.dotDelayLong]} />
                  </View>
                </View>
              </View>
            )}
          </ScrollView>

          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <TextInput
                ref={inputRef}
                style={styles.input}
                placeholder="Type a message..."
                placeholderTextColor={colors.gray[400]}
                value={inputMessage}
                onChangeText={setInputMessage}
                multiline
                maxHeight={100}
              />
            </View>
            <TouchableOpacity 
              style={[styles.sendButton, !inputMessage.trim() && styles.sendButtonDisabled]} 
              onPress={handleSendMessage}
              disabled={!inputMessage.trim() || isTyping}
            >
              <Icon name="send" size={20} color={colors.white} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  flex: {
    flex: 1,
  },
  headerArea: {
    paddingBottom: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    ...shadows.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatContainer: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 16,
  },
  welcomeContainer: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 32,
  },
  welcomeIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primaryGhost,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.gray[800],
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 14,
    color: colors.gray[500],
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
  quickQuestions: {
    width: '100%',
    gap: 12,
  },
  questionChip: {
    backgroundColor: colors.white,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray[200],
    ...shadows.sm,
  },
  questionChipText: {
    fontSize: 14,
    color: colors.gray[700],
    textAlign: 'center',
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  userRow: {
    justifyContent: 'flex-end',
  },
  botRow: {
    justifyContent: 'flex-start',
  },
  botAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primaryGhost,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
  },
  userBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  botBubble: {
    backgroundColor: colors.white,
    borderBottomLeftRadius: 4,
    ...shadows.sm,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  userText: {
    color: colors.white,
  },
  botText: {
    color: colors.gray[800],
  },
  messageTime: {
    fontSize: 10,
    color: colors.gray[400],
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  typingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  typingBubble: {
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderBottomLeftRadius: 4,
    ...shadows.sm,
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.gray[400],
    opacity: 0.6,
  },
  dotDelay: {
    opacity: 0.4,
  },
  dotDelayLong: {
    opacity: 0.2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: colors.gray[50],
    borderRadius: 24,
    paddingHorizontal: 16,
    marginRight: 12,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  input: {
    fontSize: 15,
    color: colors.gray[800],
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.primary,
  },
  sendButtonDisabled: {
    backgroundColor: colors.gray[300],
    shadowOpacity: 0,
  },
});

export default ChatSupportScreen;