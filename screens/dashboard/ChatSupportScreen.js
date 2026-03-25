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
  Animated,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '@expo/vector-icons/Feather';
import { useAuth } from '../../context/AuthContext';
import { colors, shadows } from '../../styles/colors';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { sendChatMessage } from '../../api/chatApi';

const ChatSupportScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your EA Coach AI assistant. How can I help you today?",
      sender: 'agent',
      time: '09:00',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickHelp, setShowQuickHelp] = useState(true);
  
  const scrollViewRef = useRef();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  const commonQuestions = [
    "Check booking status",
    "Request a refund",
    "Change my seat",
    "Route availability",
    "Discount codes"
  ];

  const handleSendMessage = async () => {
    const textToSend = inputText.trim();
    if (!textToSend) return;

    // 1. Add user message locally
    const userMsg = {
      id: Date.now(),
      text: textToSend,
      sender: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setShowQuickHelp(false);
    setIsTyping(true);

    // 2. Call API
    try {
      const res = await sendChatMessage(textToSend);
      
      if (res.success && res.data) {
        // 3. Add agent response
        const agentMsg = {
          id: Date.now() + 1,
          text: res.data.response || res.data.message || "I've received your inquiry. A support member will be with you shortly.",
          sender: 'agent',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages(prev => [...prev, agentMsg]);
      } else {
        // Error handling
        Alert.alert('Chat Error', res.error || 'The connection failed. Please try again later.');
      }
    } catch (err) {
      Alert.alert('Offline', 'System is taking too long to respond. Please check your connection.');
    } finally {
      setIsTyping(false);
    }
  };

  const QuickChip = ({ text }) => (
    <TouchableOpacity 
      style={styles.quickChip}
      onPress={() => {
        setInputText(text);
      }}
    >
      <Text style={styles.quickChipText}>{text}</Text>
    </TouchableOpacity>
  );

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
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
              <Icon name="chevron-left" size={24} color={colors.white} />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <View style={styles.headerIconWrap}>
                 <Icon name="message-circle" size={18} color={colors.primary} />
                 <View style={styles.onlineStatus} />
              </View>
              <View>
                <Text style={styles.headerTitle}>EA AI Support</Text>
                <Text style={styles.headerSub}>Online • Responds instantly</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.headerBtn}>
              <Icon name="phone" size={20} color={colors.white} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          ref={scrollViewRef}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
        >
          {showQuickHelp && (
            <Animated.View style={[styles.quickQuestionsContainer, { opacity: fadeAnim }]}>
              <Text style={styles.quickHeading}>Hi {user?.fullName?.split(' ')[0] || 'there'}, how can we help?</Text>
              <View style={styles.quickListGrid}>
                {commonQuestions.map((q, i) => (
                   <QuickChip key={i} text={q} />
                ))}
              </View>
            </Animated.View>
          )}

          {messages.map((item) => (
            <View
              key={item.id}
              style={[
                styles.messageContainer,
                item.sender === 'user' ? styles.userMessage : styles.agentMessage,
              ]}
            >
              <View style={[
                styles.bubble,
                item.sender === 'user' ? styles.userBubble : styles.agentBubble
              ]}>
                <Text style={[
                  styles.messageText,
                  item.sender === 'user' ? styles.userMessageText : styles.agentMessageText
                ]}>{item.text}</Text>
              </View>
              <Text style={styles.timeText}>{item.time}</Text>
            </View>
          ))}

          {isTyping && (
            <View style={styles.typingContainer}>
              <View style={styles.agentBubbleSmall}>
                <ActivityIndicator size="small" color={colors.primary} />
              </View>
              <Text style={styles.typingText}>EA AI is typing...</Text>
            </View>
          )}
        </ScrollView>

        <View style={styles.inputArea}>
          <TouchableOpacity style={styles.attachBtn}>
             <Icon name="plus" size={24} color={colors.gray[400]} />
          </TouchableOpacity>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Type your message..."
              placeholderTextColor={colors.gray[400]}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxHeight={100}
            />
          </View>
          <TouchableOpacity 
            style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]} 
            onPress={handleSendMessage}
            disabled={!inputText.trim() || isTyping}
          >
            <Icon name="send" size={20} color={colors.white} />
          </TouchableOpacity>
        </View>
        <SafeAreaView edges={['bottom']} />
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
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    ...shadows.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  headerBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  onlineStatus: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.success,
    borderWidth: 2,
    borderColor: colors.white,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.white,
  },
  headerSub: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
  },

  messageList: {
    padding: 24,
    paddingBottom: 40,
  },

  quickQuestionsContainer: {
    marginBottom: 32,
    backgroundColor: colors.white,
    padding: 20,
    borderRadius: 24,
    ...shadows.sm,
  },
  quickHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.gray[800],
    marginBottom: 16,
    textAlign: 'center',
  },
  quickListGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  quickChip: {
    backgroundColor: colors.gray[50],
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    margin: 4,
    borderWidth: 1,
    borderColor: colors.gray[100],
  },
  quickChipText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },

  messageContainer: {
    marginBottom: 20,
    maxWidth: '85%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  agentMessage: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  bubble: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 22,
    ...shadows.sm,
  },
  userBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  agentBubble: {
    backgroundColor: colors.white,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
  },
  userMessageText: {
    color: colors.white,
  },
  agentMessageText: {
    color: colors.gray[800],
  },
  timeText: {
    fontSize: 11,
    color: colors.gray[400],
    marginTop: 6,
    marginHorizontal: 4,
  },

  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  agentBubbleSmall: {
    backgroundColor: colors.white,
    padding: 10,
    borderRadius: 15,
    ...shadows.sm,
  },
  typingText: {
    fontSize: 12,
    color: colors.gray[400],
    marginLeft: 10,
    fontWeight: '500',
  },

  inputArea: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray[50],
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: colors.gray[50],
    borderRadius: 24,
    paddingHorizontal: 16,
    marginHorizontal: 12,
  },
  input: {
    fontSize: 15,
    color: colors.gray[800],
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
  },
  attachBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.primary,
  },
  sendBtnDisabled: {
    backgroundColor: colors.gray[200],
    shadowOpacity: 0,
    elevation: 0,
  },
});

export default ChatSupportScreen;
