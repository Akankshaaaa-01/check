import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import { FontAwesome5 as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppContext } from '../state/AppContext';

const { width, height } = Dimensions.get('window');

const ChatbotScreen = () => {
  const { dashboardData } = useAppContext();
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm HydroBot, your water resource assistant. I can help you understand the dashboard data, explain metrics, and answer questions about water monitoring. What would you like to know?",
      isBot: true,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef();
  const typingAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isTyping) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(typingAnimation, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(typingAnimation, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      typingAnimation.setValue(0);
    }
  }, [isTyping]);

  const quickQuestions = [
    { text: "Show dashboard summary", icon: "tachometer-alt" },
    { text: "Critical alerts status", icon: "exclamation-triangle" },
    { text: "Station coverage details", icon: "map-marked-alt" },
    { text: "Water level trends", icon: "chart-line" },
    { text: "Help with features", icon: "question-circle" },
  ];

  const processUserMessage = async (userMessage) => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Simulate typing delay
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      
      let botResponse = generateBotResponse(lowerMessage);
      
      const newMessage = {
        id: messages.length + 1,
        text: botResponse,
        isBot: true,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, newMessage]);
      scrollToBottom();
    }, 1000 + Math.random() * 1000);
  };

  const generateBotResponse = (message) => {
    // Dashboard summary responses
    if (message.includes('dashboard') || message.includes('summary') || message.includes('overview')) {
      return `📊 *Dashboard Summary:*
      
🏭 *Total DWLR Stations:* 15,234 (12,891 active)
🗺 *States Covered:* 28 states with Pan-India coverage  
📡 *Telemetric Stations:* 8,567 real-time enabled
⚠ *Critical Alerts:* 23 stations need attention

💧 *Current Water Levels:*
• Average: 12.45m below ground level
• Trend: Seasonal variation observed
• Data Quality: 94.2% stations reporting

The dashboard shows real-time DWLR (Digital Water Level Recorder) data from across India, helping monitor groundwater resources effectively.`;
    }

    // Critical alerts
    if (message.includes('alert') || message.includes('critical') || message.includes('warning')) {
      return `🚨 *Critical Alerts Status:*

⚠ *23 Stations* currently showing critical conditions:
• 12 stations: Water level below critical threshold
• 8 stations: Communication issues detected  
• 3 stations: Equipment malfunction reported

📍 *Most Affected Regions:*
• Rajasthan: 8 stations (drought conditions)
• Maharashtra: 5 stations (seasonal depletion)
• Gujarat: 4 stations (over-extraction)

🔧 *Recommended Actions:*
• Immediate technical inspection for comm. issues
• Water conservation measures in affected areas
• Alternative water source arrangements

Would you like details about any specific region?`;
    }

    // Station coverage
    if (message.includes('station') || message.includes('coverage') || message.includes('monitoring')) {
      return `🗺 *Station Coverage Details:*

📡 *Network Statistics:*
• Total Stations: 15,234 across India
• Active Stations: 12,891 (84.6% operational)
• Telemetric: 8,567 (real-time data)
• Manual: 4,324 (periodic readings)

🌍 *Geographic Distribution:*
• North India: 4,523 stations
• South India: 3,891 stations  
• West India: 3,234 stations
• East India: 2,987 stations
• Northeast: 599 stations

📊 *Data Collection:*
• Real-time updates: Every 15 minutes
• Data accuracy: 94.2%
• Average station density: 1 per 216 km²

The network provides comprehensive groundwater monitoring across diverse climatic and geological conditions.`;
    }

    // Water level trends
    if (message.includes('water level') || message.includes('trend') || message.includes('level')) {
      return `📈 *Water Level Trends Analysis:*

💧 *Current Status:*
• Average Depth: 12.45m below ground level
• Seasonal Change: -1.2m from last month
• Annual Trend: -0.8m compared to last year

📊 *Regional Variations:*
• Punjab: Rising (+0.5m) - good monsoon
• Rajasthan: Declining (-2.3m) - drought stress
• Kerala: Stable (±0.1m) - consistent supply
• Tamil Nadu: Moderate decline (-0.9m)

🌧 *Monsoon Impact:*
• Pre-monsoon (Apr-May): Lowest levels
• Monsoon (Jun-Sep): Recovery period
• Post-monsoon (Oct-Nov): Peak levels
• Winter (Dec-Mar): Gradual decline

📉 *Long-term Trends:*
• 67% stations show seasonal recovery
• 23% stations show declining trend
• 10% stations show critical depletion

The data indicates normal seasonal patterns with regional variations based on rainfall and usage patterns.`;
    }

    // Help and features
    if (message.includes('help') || message.includes('feature') || message.includes('how') || message.includes('what can')) {
      return `🤖 *HydroBot Features & Help:*

💬 *I can help you with:*
• Dashboard data interpretation
• Water level analysis and trends
• Station status and coverage info
• Alert explanations and recommendations
• Regional water resource insights
• Technical term explanations

📱 *App Features:*
• *Dashboard*: Real-time overview of all metrics
• *Monitoring*: Interactive maps and station details  
• *Analytics*: Advanced data analysis and charts
• *Reports*: Comprehensive data reports and insights

🔍 *Sample Questions:*
• "What's the current water situation in Rajasthan?"
• "Explain the critical alerts"
• "Show me trending water levels"
• "How many stations are working?"
• "What does DWLR mean?"

📊 *Data Updates:*
• Real-time: Every 15 minutes
• Quality checks: Continuous
• Historical data: 10+ years available

Just ask me anything about water monitoring, and I'll provide detailed insights!`;
    }

    // Technical terms
    if (message.includes('dwlr') || message.includes('telemetric') || message.includes('what is')) {
      return `📚 *Technical Terms Explained:*

🔧 *DWLR (Digital Water Level Recorder):*
Advanced sensors that automatically measure and record groundwater levels. They provide accurate, continuous monitoring without manual intervention.

📡 *Telemetric Stations:*
Stations equipped with wireless communication systems that transmit data in real-time to central monitoring systems via satellite, cellular, or radio networks.

💧 *Water Level Metrics:*
• *mbgl*: Meters Below Ground Level
• *Critical Level*: Threshold indicating water stress
• *Seasonal Variation*: Natural fluctuation patterns
• *Depletion Rate*: Speed of water level decline

📊 *Data Quality Indicators:*
• *Accuracy*: Precision of measurements
• *Completeness*: Percentage of expected data received
• *Timeliness*: Delay between measurement and reporting

🌍 *Coverage Terms:*
• *Network Density*: Stations per unit area
• *Spatial Resolution*: Geographic detail level
• *Temporal Resolution*: Frequency of measurements

Need more details about any specific term?`;
    }

    // Default responses for unclear queries
    const defaultResponses = [
      `I'd be happy to help! Could you be more specific about what you'd like to know? I can explain dashboard metrics, water level trends, station information, or help with any technical questions.`,
      
      `I'm here to assist with water monitoring insights! Try asking about:
• Dashboard summary and metrics
• Critical alerts and their meanings  
• Station coverage and operations
• Water level trends and analysis
• Technical features and explanations`,
      
      `Great question! I specialize in water resource data analysis. You can ask me about current conditions, historical trends, station status, or any technical aspects of the monitoring system.`,
    ];

    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  };

  const sendMessage = async () => {
    if (inputText.trim() === '') return;

    const userMessage = {
      id: messages.length + 1,
      text: inputText,
      isBot: false,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    scrollToBottom();

    await processUserMessage(inputText);
  };

  const sendQuickQuestion = (question) => {
    setInputText(question);
    sendMessage();
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const formatMessage = (text) => {
    // Convert markdown-style formatting to React Native Text components
    const parts = text.split(/(\*.*?\*|_.*?_)/g);
    return parts.map((part, index) => {
      const uniqueKey = `msg-part-${index}-${part.length}-${part.charAt(0)}`;
      if (part.startsWith('*') && part.endsWith('*')) {
        return (
          <Text key={uniqueKey} style={styles.boldText}>
            {part.slice(1, -1)}
          </Text>
        );
      } else if (part.startsWith('_') && part.endsWith('_')) {
        return (
          <Text key={uniqueKey} style={styles.italicText}>
            {part.slice(1, -1)}
          </Text>
        );
      }
      return <Text key={uniqueKey}>{part}</Text>;
    });
  };

  const renderMessage = (message) => (
    <View
      key={message.id}
      style={[
        styles.messageContainer,
        message.isBot ? styles.botMessage : styles.userMessage,
      ]}
    >
      {message.isBot && (
        <View style={styles.botAvatar}>
          <Icon name="robot" size={16} color="#fff" />
        </View>
      )}
      <View
        style={[
          styles.messageBubble,
          message.isBot ? styles.botBubble : styles.userBubble,
        ]}
      >
        <Text style={[
          styles.messageText,
          message.isBot ? styles.botText : styles.userText
        ]}>
          {formatMessage(message.text)}
        </Text>
        <Text style={styles.timestamp}>
          {message.timestamp.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </Text>
      </View>
    </View>
  );

  const renderTypingIndicator = () => (
    <View key="typing-indicator" style={[styles.messageContainer, styles.botMessage]}>
      <View style={styles.botAvatar}>
        <Icon name="robot" size={16} color="#fff" />
      </View>
      <View style={[styles.messageBubble, styles.botBubble]}>
        <Animated.View style={[
          styles.typingContainer,
          { opacity: typingAnimation }
        ]}>
          <Text style={styles.typingText}>HydroBot is typing</Text>
          <View style={styles.typingDots}>
            <View key="dot-1" style={styles.typingDot} />
            <View key="dot-2" style={styles.typingDot} />
            <View key="dot-3" style={styles.typingDot} />
          </View>
        </Animated.View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <View style={styles.headerAvatar}>
              <Icon name="robot" size={24} color="#fff" />
            </View>
            <View>
              <Text style={styles.headerTitle}>HydroBot</Text>
              <Text style={styles.headerSubtitle}>Water Resource Assistant</Text>
            </View>
          </View>
          <View style={styles.statusIndicator}>
            <View style={styles.onlineDot} />
            <Text style={styles.statusText}>Online</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Quick Questions */}
      <View style={styles.quickQuestionsContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickQuestions}
        >
          {quickQuestions.map((question, index) => (
            <TouchableOpacity
              key={`quick-q-${index}-${question.icon}`}
              style={styles.quickQuestionButton}
              onPress={() => sendQuickQuestion(question.text)}
            >
              <Icon name={question.icon} size={16} color="#667eea" />
              <Text style={styles.quickQuestionText}>{question.text}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((message) => renderMessage(message))}
        {isTyping && renderTypingIndicator()}
      </ScrollView>

      {/* Input Area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inputContainer}
      >
        <View style={styles.inputRow}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask about water monitoring data..."
            placeholderTextColor="#9CA3AF"
            multiline
            maxLength={500}
            onSubmitEditing={sendMessage}
            blurOnSubmit={false}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              inputText.trim() === '' && styles.sendButtonDisabled
            ]}
            onPress={sendMessage}
            disabled={inputText.trim() === ''}
          >
            <Icon 
              name="paper-plane" 
              size={20} 
              color={inputText.trim() === '' ? '#9CA3AF' : '#fff'} 
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 45,
    paddingBottom: 15,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  onlineDot: {
    width: 8,
    height: 8,
    backgroundColor: '#10B981',
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  quickQuestionsContainer: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  quickQuestions: {
    paddingHorizontal: 20,
  },
  quickQuestionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  quickQuestionText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
    fontWeight: '500',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 20,
    paddingBottom: 10,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  botMessage: {
    justifyContent: 'flex-start',
  },
  userMessage: {
    justifyContent: 'flex-end',
  },
  botAvatar: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginTop: 5,
  },
  messageBubble: {
    maxWidth: width * 0.7,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 20,
  },
  botBubble: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderBottomLeftRadius: 5,
  },
  userBubble: {
    backgroundColor: '#667eea',
    borderBottomRightRadius: 5,
    alignSelf: 'flex-end',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  botText: {
    color: '#374151',
  },
  userText: {
    color: '#fff',
  },
  boldText: {
    fontWeight: 'bold',
  },
  italicText: {
    fontStyle: 'italic',
  },
  timestamp: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 5,
    alignSelf: 'flex-end',
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
    marginRight: 10,
  },
  typingDots: {
    flexDirection: 'row',
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#9CA3AF',
    marginRight: 3,
  },
  inputContainer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingBottom: Platform.OS === 'ios' ? 35 : 15,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 100,
    color: '#374151',
    backgroundColor: '#F9FAFB',
  },
  sendButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  sendButtonDisabled: {
    backgroundColor: '#F3F4F6',
  },
});

export default ChatbotScreen;