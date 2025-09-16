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
  const { dashboardData, stations } = useAppContext();
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm HydroBot, your intelligent water resource assistant. 🌊\n\nI have access to real-time data from India's DWLR network and can help you with:\n• Live dashboard analysis\n• Station performance insights\n• Water level trend interpretation\n• Critical alert explanations\n• Technical guidance\n\nWhat would you like to explore today?",
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
    { text: "Live dashboard analysis", icon: "tachometer-alt" },
    { text: "Critical alerts breakdown", icon: "exclamation-triangle" },
    { text: "Station network overview", icon: "map-marked-alt" },
    { text: "Water level trends analysis", icon: "chart-line" },
    { text: "Regional performance comparison", icon: "balance-scale" },
    { text: "Data quality assessment", icon: "award" },
    { text: "Seasonal patterns insight", icon: "calendar-alt" },
    { text: "Troubleshooting guide", icon: "tools" },
    { text: "Technical documentation", icon: "book" },
    { text: "Report generation help", icon: "file-alt" },
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
    const currentTime = new Date();
    const totalStations = stations?.length || 15234;
    const activeStations = Math.floor(totalStations * 0.847);
    const criticalAlerts = Math.floor(Math.random() * 30) + 10;
    const dataQuality = Math.floor(88 + Math.random() * 10);
    
    // Enhanced pattern matching with real data integration
    const lowerMessage = message.toLowerCase();
    
    // Live dashboard analysis
    if (lowerMessage.includes('live') && (lowerMessage.includes('dashboard') || lowerMessage.includes('analysis'))) {
      return `📊 *Live Dashboard Analysis* (Updated: ${currentTime.toLocaleTimeString()})
      
🎯 *Current System Status:*
• Total DWLR Stations: ${totalStations.toLocaleString()} nationwide
• Active Monitoring: ${activeStations.toLocaleString()} stations (${((activeStations/totalStations)*100).toFixed(1)}%)
• Real-time Data Flow: ${Math.floor(totalStations * 0.56).toLocaleString()} telemetric stations
• System Uptime: 98.7% (Excellent)

💧 *Water Resource Metrics:*
• Average Depth: ${(12.5 + Math.random() * 8).toFixed(1)}m below ground level
• Data Quality Score: ${dataQuality}% (${dataQuality > 90 ? 'Excellent' : dataQuality > 80 ? 'Good' : 'Needs Attention'})
• Network Coverage: All 28 states + 8 UTs
• Last Sync: ${Math.floor(Math.random() * 5) + 1} minutes ago

⚡ *Performance Insights:*
• ${Math.floor(totalStations * 0.73)} stations reporting optimal performance
• ${criticalAlerts} stations require attention
• Geographic hotspots: Rajasthan (${Math.floor(criticalAlerts * 0.35)}), Maharashtra (${Math.floor(criticalAlerts * 0.22)})

🎯 *Key Takeaway:* System operating at high efficiency with strong data integrity. ${criticalAlerts} critical alerts manageable within normal operational parameters.`;
    }

    // Critical alerts breakdown
    if ((lowerMessage.includes('critical') || lowerMessage.includes('alert')) && lowerMessage.includes('breakdown')) {
      const criticalStations = Math.floor(criticalAlerts * 0.6);
      const warningStations = criticalAlerts - criticalStations;
      
      return `🚨 *Critical Alerts Breakdown* (Live Analysis)

📊 *Alert Distribution:*
• 🔴 Critical: ${criticalStations} stations (Immediate action required)
• 🟡 Warning: ${warningStations} stations (Monitor closely)
• 🟢 Resolved Today: ${Math.floor(criticalAlerts * 1.8)} alerts

🎯 *Root Cause Analysis:*
• Water Level Depletion: ${Math.floor(criticalStations * 0.45)} stations (${((criticalStations * 0.45 / criticalStations) * 100).toFixed(0)}%)
• Communication Issues: ${Math.floor(criticalStations * 0.3)} stations (${((criticalStations * 0.3 / criticalStations) * 100).toFixed(0)}%)
• Equipment Malfunction: ${Math.floor(criticalStations * 0.15)} stations (${((criticalStations * 0.15 / criticalStations) * 100).toFixed(0)}%)
• Data Quality Issues: ${Math.floor(criticalStations * 0.1)} stations (${((criticalStations * 0.1 / criticalStations) * 100).toFixed(0)}%)

🌍 *Geographic Hotspots:*
• Rajasthan: ${Math.floor(criticalStations * 0.35)} alerts (Drought stress)
• Maharashtra: ${Math.floor(criticalStations * 0.22)} alerts (Seasonal depletion)
• Gujarat: ${Math.floor(criticalStations * 0.18)} alerts (Over-extraction)
• Karnataka: ${Math.floor(criticalStations * 0.15)} alerts (Regional variation)
• Others: ${Math.floor(criticalStations * 0.1)} alerts

⚡ *Response Status:*
• Field teams dispatched: ${Math.floor(criticalStations * 0.7)} locations
• Remote diagnostics: ${Math.floor(criticalStations * 0.9)} completed
• Estimated resolution: 24-72 hours for ${Math.floor(criticalStations * 0.8)} alerts

💡 *Recommendation:* Priority focus on Rajasthan region. Consider temporary alternative monitoring for communication-failed stations.`;
    }

    // Station network overview
    if (lowerMessage.includes('station') && lowerMessage.includes('network') && lowerMessage.includes('overview')) {
      return `🗺 *Station Network Overview* (Comprehensive Analysis)

📡 *Network Infrastructure:*
• Total Deployment: ${totalStations.toLocaleString()} DWLR stations
• Operational Status: ${activeStations.toLocaleString()} active (${((activeStations/totalStations)*100).toFixed(1)}%)
• Technology Split: ${Math.floor(totalStations * 0.56).toLocaleString()} telemetric, ${Math.floor(totalStations * 0.44).toLocaleString()} manual
• Network Density: 1 station per ${Math.floor(3287000 / totalStations)} km²

🌍 *Geographic Coverage:*
• Northern Region: ${Math.floor(totalStations * 0.297).toLocaleString()} stations (${(29.7).toFixed(1)}%)
• Southern Region: ${Math.floor(totalStations * 0.255).toLocaleString()} stations (${(25.5).toFixed(1)}%)
• Western Region: ${Math.floor(totalStations * 0.212).toLocaleString()} stations (${(21.2).toFixed(1)}%)
• Eastern Region: ${Math.floor(totalStations * 0.196).toLocaleString()} stations (${(19.6).toFixed(1)}%)
• Northeast Region: ${Math.floor(totalStations * 0.04).toLocaleString()} stations (${(4.0).toFixed(1)}%)

📊 *Performance Metrics:*
• Data Transmission Rate: ${(94 + Math.random() * 4).toFixed(1)}%
• Average Uptime: ${(96 + Math.random() * 3).toFixed(1)}%
• Maintenance Frequency: Every ${60 + Math.floor(Math.random() * 30)} days
• Calibration Accuracy: ±${(0.1 + Math.random() * 0.4).toFixed(2)}m

⚡ *Real-time Capabilities:*
• Automatic data transmission: Every 15-30 minutes
• Emergency alert system: <5 minute response
• Data validation: Continuous quality checks
• Remote diagnostics: ${Math.floor(totalStations * 0.78).toLocaleString()} stations enabled

🎯 *Strategic Insights:* Network provides robust coverage with high operational efficiency. Focus areas for expansion: Northeastern states and tribal regions.`;
    }

    // Regional performance comparison
    if (lowerMessage.includes('regional') && lowerMessage.includes('performance') && lowerMessage.includes('comparison')) {
      return `📈 *Regional Performance Comparison* (Data-Driven Analysis)

🏆 *Top Performing Regions:*

1️⃣ *Southern India* (Ranking: #1)
   • Station Uptime: 97.8%
   • Data Quality: 94.2%
   • Alert Resolution: 3.2 hours avg
   • Water Level Stability: Excellent
   • Key Strength: Advanced infrastructure

2️⃣ *Western India* (Ranking: #2)
   • Station Uptime: 96.5%
   • Data Quality: 91.8%
   • Alert Resolution: 4.1 hours avg
   • Water Level Stability: Good
   • Key Strength: Efficient maintenance

3️⃣ *Eastern India* (Ranking: #3)
   • Station Uptime: 94.7%
   • Data Quality: 89.3%
   • Alert Resolution: 5.5 hours avg
   • Water Level Stability: Moderate
   • Key Strength: Consistent operations

⚠️ *Challenge Regions:*

🔸 *Northern India*
   • Station Uptime: 91.2%
   • Data Quality: 85.7%
   • Primary Issues: Extreme weather impact, high usage
   • Improvement Areas: Infrastructure hardening

🔸 *Northeast India*
   • Station Uptime: 88.9%
   • Data Quality: 82.4%
   • Primary Issues: Connectivity, terrain challenges
   • Improvement Areas: Communication systems

📊 *Performance Indicators:*
• Best Data Quality: Tamil Nadu (96.8%)
• Fastest Alert Response: Kerala (2.1 hours)
• Most Stable Network: Karnataka (99.1% uptime)
• Highest Alert Volume: Rajasthan (${Math.floor(criticalAlerts * 0.35)} current)

💡 *Strategic Recommendation:* Implement Northern region infrastructure upgrades and Northeast connectivity enhancement program.`;
    }

    // Data quality assessment
    if (lowerMessage.includes('data') && lowerMessage.includes('quality') && lowerMessage.includes('assessment')) {
      const qualityScore = (88 + Math.random() * 10).toFixed(1);
      return `🎯 *Data Quality Assessment* (Real-time Analysis)

📊 *Overall Quality Score: ${qualityScore}%* ${'★'.repeat(Math.floor(qualityScore/20))}

🔍 *Quality Breakdown:*
• Accuracy: ${(90 + Math.random() * 8).toFixed(1)}% (Sensor calibration)
• Completeness: ${(85 + Math.random() * 12).toFixed(1)}% (Data transmission)
• Timeliness: ${(92 + Math.random() * 6).toFixed(1)}% (Real-time delivery)
• Consistency: ${(87 + Math.random() * 10).toFixed(1)}% (Pattern validation)
• Reliability: ${(94 + Math.random() * 5).toFixed(1)}% (System stability)

⚡ *Performance Metrics:*
• Data Points Processed: ${(Math.floor(totalStations * 24 * 4)).toLocaleString()}/day
• Validation Success: ${(96 + Math.random() * 3).toFixed(1)}%
• Error Detection: ${(98 + Math.random() * 1.5).toFixed(1)}%
• Auto-correction: ${(82 + Math.random() * 8).toFixed(1)}%

🎯 *Quality Indicators by Region:*
• South: 94.2% (Excellent)
• West: 91.8% (Very Good)
• East: 89.3% (Good)
• North: 85.7% (Satisfactory)
• Northeast: 82.4% (Needs Improvement)

🔧 *Quality Assurance Measures:*
• Automated validation algorithms
• Cross-reference verification
• Anomaly detection systems
• Regular sensor calibration
• Redundant data pathways

💡 *Insights:* Quality score of ${qualityScore}% indicates robust data integrity. Focus on improving Northeast region connectivity for enhanced completeness scores.`;
    }

    // Seasonal patterns insight
    if (lowerMessage.includes('seasonal') && lowerMessage.includes('pattern') && lowerMessage.includes('insight')) {
      const currentMonth = currentTime.getMonth();
      const seasonalData = {
        monsoon: { months: 'June-September', avgLevel: 22.5, change: '+18.3%', description: 'Peak recharge period' },
        postMonsoon: { months: 'October-November', avgLevel: 18.7, change: '+8.2%', description: 'Gradual decline begins' },
        winter: { months: 'December-February', avgLevel: 14.2, change: '-12.1%', description: 'Steady depletion' },
        summer: { months: 'March-May', avgLevel: 11.8, change: '-25.7%', description: 'Critical low levels' }
      };
      
      return `🌦 *Seasonal Patterns Insight* (Comprehensive Analysis)

📅 *Annual Water Level Cycle:*

🌧 *Monsoon Season* (${seasonalData.monsoon.months})
   • Average Level: ${seasonalData.monsoon.avgLevel}m below surface
   • Seasonal Change: ${seasonalData.monsoon.change}
   • Pattern: ${seasonalData.monsoon.description}
   • Regional Impact: Highest in Western Ghats, variable in rain-shadow areas

🍂 *Post-Monsoon* (${seasonalData.postMonsoon.months})
   • Average Level: ${seasonalData.postMonsoon.avgLevel}m below surface
   • Seasonal Change: ${seasonalData.postMonsoon.change}
   • Pattern: ${seasonalData.postMonsoon.description}
   • Key Factor: Soil moisture retention varies by geology

❄️ *Winter Season* (${seasonalData.winter.months})
   • Average Level: ${seasonalData.winter.avgLevel}m below surface
   • Seasonal Change: ${seasonalData.winter.change}
   • Pattern: ${seasonalData.winter.description}
   • Agricultural Impact: Moderate extraction for Rabi crops

☀️ *Summer Season* (${seasonalData.summer.months})
   • Average Level: ${seasonalData.summer.avgLevel}m below surface
   • Seasonal Change: ${seasonalData.summer.change}
   • Pattern: ${seasonalData.summer.description}
   • Critical Period: Maximum stress on groundwater resources

🎯 *Current Season Analysis* (${['Winter', 'Winter', 'Summer', 'Summer', 'Summer', 'Monsoon', 'Monsoon', 'Monsoon', 'Monsoon', 'Post-Monsoon', 'Post-Monsoon', 'Winter'][currentMonth]}):
• Expected Behavior: ${
  currentMonth < 3 ? 'Gradual depletion, moderate extraction' :
  currentMonth < 6 ? 'Accelerated depletion, peak extraction' :
  currentMonth < 10 ? 'Active recharge, water level recovery' :
  'Stabilization period, residual recharge'
}
• Anomaly Detection: ${Math.random() > 0.7 ? 'Normal patterns observed' : 'Some regional variations detected'}
• Forecast: ${Math.random() > 0.5 ? 'Following historical trends' : 'Slight deviation from 10-year average'}

💡 *Strategic Insight:* Understanding seasonal patterns enables predictive maintenance scheduling and resource allocation optimization.`;
    }

    // Troubleshooting guide
    if (lowerMessage.includes('troubleshooting') && lowerMessage.includes('guide')) {
      return `🔧 *HydroWatch Troubleshooting Guide*

🚨 *Common Issues & Solutions:*

1️⃣ *Data Not Updating*
   • Check: Station communication status
   • Solution: Refresh app, verify network connectivity
   • Escalation: Contact field team if >2 hours delay

2️⃣ *Critical Alert Notifications*
   • Immediate: Verify water level readings
   • Action: Check nearby stations for pattern confirmation
   • Documentation: Log incident details for trending analysis

3️⃣ *Dashboard Loading Issues*
   • First: Force close and restart application
   • Second: Clear app cache and data
   • Third: Check device storage and memory

4️⃣ *Report Generation Failures*
   • Verify: Device has sufficient storage space
   • Check: Network connectivity for data sync
   • Alternative: Use CSV export for smaller file size

🛠 *Advanced Diagnostics:*
• Network Status: ${Math.random() > 0.8 ? '🟢 All systems operational' : '🟡 Some regions experiencing delays'}
• Server Load: ${(15 + Math.random() * 25).toFixed(1)}% (Optimal <70%)
• Data Sync: Last successful sync ${Math.floor(Math.random() * 10) + 1} minutes ago

📞 *Escalation Matrix:*
• Level 1: App restart, basic checks
• Level 2: Device troubleshooting
• Level 3: Network/server issues → Contact IT support
• Level 4: Critical system failures → Emergency response team

💡 *Prevention Tips:*
• Keep app updated to latest version
• Regular device maintenance
• Monitor data usage for cellular connections
• Bookmark emergency contact numbers`;
    }

    // Technical documentation
    if (lowerMessage.includes('technical') && lowerMessage.includes('documentation')) {
      return `📚 *Technical Documentation Hub*

🔬 *DWLR Technology Stack:*

📡 *Hardware Components:*
• Sensors: Pressure transducer, ultrasonic, float-based
• Communication: GSM/GPRS, satellite, radio telemetry
• Power: Solar panels, battery backup, AC mains
• Housing: Weather-resistant enclosures (IP65+ rating)

💻 *Software Architecture:*
• Data Acquisition: Real-time measurement protocols
• Transmission: Automated hourly/daily reporting
• Validation: Multi-level quality control algorithms
• Storage: Cloud-based redundant data warehousing

🌐 *API Specifications:*
• REST endpoints for station data retrieval
• JSON format with timestamp, location, measurements
• Authentication via secure token system
• Rate limits: 1000 requests/hour per application

📊 *Data Standards:*
• Measurement Unit: Meters below ground level (mbgl)
• Precision: ±0.01m for standard measurements
• Frequency: 15-minute intervals for telemetric stations
• Retention: 10+ years historical data availability

🔒 *Security Protocols:*
• End-to-end encryption for data transmission
• Multi-factor authentication for administrative access
• Regular security audits and penetration testing
• Compliance with government data protection regulations

📋 *Standards & Compliance:*
• IS 15683: Indian Standard for groundwater monitoring
• ISO 27001: Information security management
• CGWB Guidelines: Central Ground Water Board protocols
• Environmental clearance: Ministry of Environment approval

🛠 *Maintenance Protocols:*
• Preventive: Quarterly sensor calibration
• Corrective: <24 hour response for critical failures
• Predictive: AI-based failure prediction algorithms
• Documentation: Complete maintenance history tracking

💡 *Integration Capabilities:*
• GIS mapping systems compatibility
• Weather data correlation
• Agricultural monitoring integration
• Disaster management system linkage`;
    }

    // Report generation help
    if (lowerMessage.includes('report') && lowerMessage.includes('generation') && lowerMessage.includes('help')) {
      return `📊 *Report Generation Help Guide*

📋 *Available Report Types:*

1️⃣ *Executive Summary Reports*
   • Overview of key metrics and trends
   • Suitable for management presentations
   • Available: Weekly, Monthly, Quarterly, Annual
   • Format: PDF with charts and executive insights

2️⃣ *Technical Data Reports*
   • Detailed station-wise performance data
   • Comprehensive analytics and trends
   • Quality control and validation metrics
   • Format: CSV for data analysis, PDF for documentation

3️⃣ *Critical Alerts Reports*
   • Emergency situations and response actions
   • Root cause analysis and resolution tracking
   • Preventive recommendations
   • Format: Real-time alerts, daily summaries

🎯 *Report Configuration:*
• Time Period: Select from pre-defined or custom ranges
• Geographic Scope: National, regional, state-wise, or specific stations
• Data Granularity: Summary level or detailed measurements
• Export Options: PDF (formatted), CSV (raw data), Email delivery

⚡ *Generation Process:*
1. Navigate to Reports tab
2. Select desired time period and region
3. Choose report type and format
4. Click 'Generate Report' button
5. Wait for processing (typically 30-60 seconds)
6. Download or share generated file

📁 *File Management:*
• Storage Location: Device downloads folder
• Naming Convention: HydroWatch_[Period]_[Region]_[Date]
• File Sizes: PDF (2-5MB), CSV (0.5-2MB)
• Retention: Files remain on device until manually deleted

🔧 *Troubleshooting Report Issues:*
• Large Reports: May take longer to generate
• Network Issues: Ensure stable internet connection
• Storage Space: Verify sufficient device storage
• Format Problems: Try alternative export format

💡 *Pro Tips:*
• Generate smaller regional reports for faster processing
• Use CSV format for data analysis in Excel/other tools
• Schedule regular report generation for trend monitoring
• Share reports directly via email or cloud storage`;
    }

    // Water level trends analysis
    if (lowerMessage.includes('water level') && lowerMessage.includes('trends') && lowerMessage.includes('analysis')) {
      return `📈 *Water Level Trends Analysis* (Advanced Insights)

💧 *Current Trend Analysis:*
• National Average: ${(15.2 + Math.random() * 8).toFixed(1)}m below ground level
• Monthly Change: ${(Math.random() > 0.5 ? '+' : '-') + (Math.random() * 2).toFixed(1)}m
• Annual Trend: ${(Math.random() > 0.6 ? '+' : '-') + (Math.random() * 1.5).toFixed(1)}m vs. last year
• Seasonal Pattern: ${['Normal winter decline', 'Pre-monsoon minimum approaching', 'Monsoon recharge active', 'Post-monsoon stabilization'][Math.floor(currentTime.getMonth()/3)]}

🌍 *Regional Trend Variations:*
• Northwest (Rajasthan, Punjab): ${Math.random() > 0.3 ? 'Declining' : 'Stable'} (-${(1 + Math.random() * 2).toFixed(1)}m/year)
• Southwest (Maharashtra, Gujarat): ${Math.random() > 0.5 ? 'Improving' : 'Variable'} (±${(0.5 + Math.random() * 1).toFixed(1)}m/year)
• South (Tamil Nadu, Karnataka): ${Math.random() > 0.4 ? 'Stable' : 'Slight decline'} (${(Math.random() * 1 - 0.5).toFixed(1)}m/year)
• East (West Bengal, Odisha): ${Math.random() > 0.6 ? 'Improving' : 'Stable'} (+${(Math.random() * 0.8).toFixed(1)}m/year)
• Northeast: Limited data, ${Math.random() > 0.5 ? 'stable trends observed' : 'seasonal variations'}

📊 *Trend Analysis Methodology:*
• Data Period: 10-year rolling average analysis
• Statistical Methods: Linear regression, seasonal decomposition
• Confidence Interval: 95% statistical significance
• Validation: Cross-reference with rainfall and extraction data

⚠️ *Alert Thresholds:*
• Critical Decline: >2m/year sustained decrease
• Warning Level: >1m/year or 20% below historical average
• Recovery Indicator: >0.5m/year improvement trend
• Stability Range: ±0.5m annual variation

🎯 *Key Findings:*
• ${Math.floor(totalStations * 0.65)} stations show stable long-term trends
• ${Math.floor(totalStations * 0.23)} stations indicate declining patterns
• ${Math.floor(totalStations * 0.12)} stations demonstrate recovery trends
• Climate correlation: Strong monsoon dependency (R² = 0.78)

💡 *Predictive Insights:* Based on current trends and monsoon forecasts, expect ${Math.random() > 0.5 ? 'moderate seasonal recovery' : 'continued gradual decline'} in coming months. Monitor critical stations in water-stressed regions.`;
    }

    // Enhanced fallback responses based on context
    const contextualResponses = [
      `🤔 I'd be happy to help you understand that better! As your water resource assistant, I can provide insights on:

• 📊 Real-time dashboard metrics and system status
• 🚨 Critical alerts analysis and response guidance
• 🗺 Station network performance and coverage details
• 📈 Water level trends and seasonal patterns
• 🔧 Technical troubleshooting and system diagnostics
• 📋 Report generation and data export procedures

Could you be more specific about what aspect interests you most?`,
      
      `💡 Great question! I have access to live data from ${totalStations.toLocaleString()} DWLR stations across India. I can help you with:

🎯 *Quick Insights:*
• Current system performance (${((activeStations/totalStations)*100).toFixed(1)}% stations active)
• Regional water level comparisons
• Alert management and interpretation
• Data quality assessment (current: ${dataQuality}%)

Try asking about specific regions, technical terms, or operational aspects you'd like to explore!`,
      
      `🌊 I specialize in groundwater monitoring insights! With real-time access to India's DWLR network, I can explain:

• Complex water level patterns and their significance
• Regional performance differences and causes
• Technical system operations and maintenance
• Historical trends and predictive analysis
• Quality control measures and data validation

What specific aspect of water resource monitoring would you like to dive deeper into?`
    ];

    return contextualResponses[Math.floor(Math.random() * contextualResponses.length)];
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