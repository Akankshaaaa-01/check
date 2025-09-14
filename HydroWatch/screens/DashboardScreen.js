import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator, 
  RefreshControl,
  Dimensions,
  Animated,
  TouchableOpacity,
  Alert,
  StatusBar
} from 'react-native';
import { FontAwesome5 as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppContext } from '../state/AppContext';
import { getDashboardData, checkServerHealth } from '../api/IndiaWrisApi';

const { width } = Dimensions.get('window');

const DashboardScreen = () => {
  const { setApiStatus } = useAppContext();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [pulseAnim] = useState(new Animated.Value(1));
  const [slideAnim] = useState(new Animated.Value(0));

  // Animated pulse effect for real-time indicators
  const startPulseAnimation = useCallback(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  // Slide-in animation for cards
  const startSlideAnimation = useCallback(() => {
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [slideAnim]);

  const fetchDashboardData = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      
      // Check server health first
      const healthResponse = await checkServerHealth();
      if (healthResponse.error) {
        setApiStatus({ connected: false, message: 'Server Offline' });
        return;
      }
      
      setApiStatus({ connected: true, message: 'Connected' });
      
      // Fetch comprehensive dashboard data
      const response = await getDashboardData();
      
      if (response.error) {
        Alert.alert('Data Error', response.message);
        return;
      }
      
      setDashboardData(response.data);
      setLastUpdate(new Date());
      
    } catch (error) {
      console.error('Dashboard fetch error:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
      setApiStatus({ connected: false, message: 'Connection Failed' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData(false);
  };

  useEffect(() => {
    fetchDashboardData();
    startPulseAnimation();
    startSlideAnimation();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(() => {
      fetchDashboardData(false);
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (value, thresholds) => {
    if (value >= thresholds.excellent) return '#10B981';
    if (value >= thresholds.good) return '#F59E0B';
    return '#EF4444';
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const MetricCard = ({ icon, title, value, subtitle, trend, color, isAnimated = false }) => (
    <Animated.View style={[
      styles.metricCard,
      {
        transform: [
          {
            translateY: slideAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [50, 0],
            }),
          },
          isAnimated ? { scale: pulseAnim } : { scale: 1 },
        ],
        opacity: slideAnim,
      }
    ]}>
      <LinearGradient
        colors={[color + '20', color + '05']}
        style={styles.metricGradient}
      >
        <View style={styles.metricHeader}>
          <View style={[styles.metricIcon, { backgroundColor: color + '20' }]}>
            <Icon name={icon} size={20} color={color} />
          </View>
          {trend && (
            <View style={[styles.trendIndicator, { backgroundColor: trend > 0 ? '#10B981' : '#EF4444' }]}>
              <Icon name={trend > 0 ? 'arrow-up' : 'arrow-down'} size={10} color="#fff" />
            </View>
          )}
        </View>
        <Text style={styles.metricValue}>{value}</Text>
        <Text style={styles.metricTitle}>{title}</Text>
        {subtitle && <Text style={styles.metricSubtitle}>{subtitle}</Text>}
      </LinearGradient>
    </Animated.View>
  );

  const AlertCard = ({ alert, index }) => (
    <Animated.View 
      style={[
        styles.alertCard,
        {
          backgroundColor: alert.status === 'critical' ? '#FEE2E2' : '#FEF3C7',
          transform: [{
            translateX: slideAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [width, 0],
            }),
          }],
          opacity: slideAnim,
        }
      ]}
    >
      <View style={styles.alertHeader}>
        <Icon 
          name="exclamation-triangle" 
          size={16} 
          color={alert.status === 'critical' ? '#DC2626' : '#D97706'} 
        />
        <Text style={[
          styles.alertTitle,
          { color: alert.status === 'critical' ? '#DC2626' : '#D97706' }
        ]}>
          {alert.status === 'critical' ? 'CRITICAL' : 'WARNING'}
        </Text>
      </View>
      <Text style={styles.alertStation}>Station: {alert.stationCode}</Text>
      <Text style={styles.alertDepth}>Water Depth: {alert.depth.toFixed(1)}m</Text>
      <Text style={styles.alertTime}>{formatTimeAgo(new Date(alert.lastUpdated))}</Text>
    </Animated.View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient colors={['#667eea', '#764ba2']} style={StyleSheet.absoluteFill} />
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.loadingText}>Loading HydroWatch Dashboard...</Text>
        <Text style={styles.loadingSubtext}>Fetching real-time DWLR data</Text>
      </View>
    );
  }

  if (!dashboardData) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="exclamation-circle" size={50} color="#EF4444" />
        <Text style={styles.errorText}>Failed to load dashboard</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => fetchDashboardData()}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { summary, realTimeMetrics, alerts } = dashboardData;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header with gradient */}
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>HydroWatch India</Text>
            <Text style={styles.headerSubtitle}>Real-time DWLR Analysis</Text>
          </View>
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <View style={styles.liveIndicator}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          </Animated.View>
        </View>
        <Text style={styles.lastUpdateText}>
          Last updated: {formatTimeAgo(lastUpdate)}
        </Text>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#667eea']}
            tintColor="#667eea"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Primary Metrics Grid */}
        <View style={styles.metricsGrid}>
          <MetricCard
            icon="broadcast-tower"
            title="Total DWLR Stations"
            value={summary.totalStations.toLocaleString()}
            subtitle={`${summary.activeStations} active`}
            color="#3B82F6"
            isAnimated={true}
          />
          <MetricCard
            icon="map"
            title="States Covered"
            value={summary.totalStates.toString()}
            subtitle="Pan-India coverage"
            color="#10B981"
          />
          <MetricCard
            icon="satellite-dish"
            title="Telemetric Stations"
            value={summary.telemetricStations.toLocaleString()}
            subtitle="Real-time enabled"
            color="#8B5CF6"
            isAnimated={true}
          />
          <MetricCard
            icon="exclamation-triangle"
            title="Critical Alerts"
            value={summary.criticalStations.toString()}
            subtitle="Needs attention"
            color="#EF4444"
            trend={summary.criticalStations > 0 ? -1 : 1}
          />
        </View>

        {/* Real-time Metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Real-time Analytics</Text>
          <View style={styles.analyticsContainer}>
            <LinearGradient
              colors={['#F0F9FF', '#E0F2FE']}
              style={styles.analyticsCard}
            >
              <View style={styles.analyticsRow}>
                <View style={styles.analyticsItem}>
                  <Icon name="tint" size={24} color="#0EA5E9" />
                  <Text style={styles.analyticsValue}>
                    {realTimeMetrics.averageWaterLevel}m
                  </Text>
                  <Text style={styles.analyticsLabel}>Avg Water Level</Text>
                </View>
                <View style={styles.analyticsDivider} />
                <View style={styles.analyticsItem}>
                  <Icon name="award" size={24} color={getStatusColor(realTimeMetrics.dataQuality, { excellent: 90, good: 70 })} />
                  <Text style={[
                    styles.analyticsValue,
                    { color: getStatusColor(realTimeMetrics.dataQuality, { excellent: 90, good: 70 }) }
                  ]}>
                    {realTimeMetrics.dataQuality}%
                  </Text>
                  <Text style={styles.analyticsLabel}>Data Quality</Text>
                </View>
              </View>
            </LinearGradient>
          </View>
        </View>

        {/* Critical Alerts */}
        {alerts && alerts.length > 0 && (
          <View style={styles.section}>
            <View style={styles.alertsHeader}>
              <Text style={styles.sectionTitle}>Critical Alerts</Text>
              <View style={styles.alertsBadge}>
                <Text style={styles.alertsBadgeText}>{alerts.length}</Text>
              </View>
            </View>
            {alerts.slice(0, 3).map((alert, index) => (
              <AlertCard key={index} alert={alert} index={index} />
            ))}
          </View>
        )}

        {/* System Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>System Status</Text>
          <LinearGradient
            colors={['#ECFDF5', '#F0FDF4']}
            style={styles.statusCard}
          >
            <View style={styles.statusRow}>
              <Icon name="server" size={20} color="#059669" />
              <View style={styles.statusInfo}>
                <Text style={styles.statusTitle}>India-WRIS API</Text>
                <Text style={styles.statusSubtitle}>Connected & Operational</Text>
              </View>
              <View style={styles.statusIndicator}>
                <View style={styles.statusDot} />
              </View>
            </View>
            
            <View style={[styles.statusRow, { marginTop: 10 }]}>
              <Icon name="clock" size={20} color="#0EA5E9" />
              <View style={styles.statusInfo}>
                <Text style={styles.statusTitle}>Data Frequency</Text>
                <Text style={styles.statusSubtitle}>Every 6 hours (DWLR Standard)</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Data Quality Insights */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Performance Insights</Text>
          <View style={styles.insightsGrid}>
            <View style={styles.insightCard}>
              <Icon name="check-circle" size={20} color="#10B981" />
              <Text style={styles.insightValue}>
                {Math.round((summary.activeStations / summary.totalStations) * 100)}%
              </Text>
              <Text style={styles.insightLabel}>Station Uptime</Text>
            </View>
            <View style={styles.insightCard}>
              <Icon name="wifi" size={20} color="#8B5CF6" />
              <Text style={styles.insightValue}>
                {Math.round((summary.telemetricStations / summary.totalStations) * 100)}%
              </Text>
              <Text style={styles.insightLabel}>Real-time Coverage</Text>
            </View>
            <View style={styles.insightCard}>
              <Icon name="shield-alt" size={20} color="#F59E0B" />
              <Text style={styles.insightValue}>
                {Math.round(((summary.totalStations - summary.criticalStations) / summary.totalStations) * 100)}%
              </Text>
              <Text style={styles.insightLabel}>System Reliability</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 15,
  },
  loadingSubtext: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginTop: 5,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#374151',
    marginTop: 15,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 15,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  liveDot: {
    width: 8,
    height: 8,
    backgroundColor: '#10B981',
    borderRadius: 4,
    marginRight: 6,
  },
  liveText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  lastUpdateText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
  scrollView: {
    flex: 1,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 15,
    paddingTop: 15,
  },
  metricCard: {
    width: (width - 45) / 2,
    marginHorizontal: 7.5,
    marginBottom: 15,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  metricGradient: {
    padding: 16,
    backgroundColor: '#fff',
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  metricTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 2,
  },
  metricSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 15,
  },
  analyticsContainer: {
    marginBottom: 10,
  },
  analyticsCard: {
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  analyticsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  analyticsItem: {
    flex: 1,
    alignItems: 'center',
  },
  analyticsDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 20,
  },
  analyticsValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginTop: 8,
  },
  analyticsLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  alertsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  alertsBadge: {
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  alertsBadgeText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '600',
  },
  alertCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#DC2626',
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  alertTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 6,
  },
  alertStation: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  alertDepth: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },
  alertTime: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  statusCard: {
    borderRadius: 16,
    padding: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusInfo: {
    flex: 1,
    marginLeft: 12,
  },
  statusTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  statusSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  statusIndicator: {
    alignItems: 'center',
  },
  statusDot: {
    width: 10,
    height: 10,
    backgroundColor: '#10B981',
    borderRadius: 5,
  },
  insightsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  insightCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  insightValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginTop: 8,
  },
  insightLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
});
export default DashboardScreen;