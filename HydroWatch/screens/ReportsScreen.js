import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Platform,
  Animated,
  Alert,
} from 'react-native';
import { FontAwesome5 as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppContext } from '../state/AppContext';

const { width, height } = Dimensions.get('window');

const ReportsScreen = () => {
  const { stations } = useAppContext();
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [animatedValue] = useState(new Animated.Value(0));
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const scrollViewRef = useRef();

  useEffect(() => {
    // Start animations when component mounts
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Start chart animation
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 1200,
      useNativeDriver: false,
    }).start();
  }, []);

  const periods = [
    { key: 'weekly', label: 'Weekly', icon: 'calendar-week' },
    { key: 'monthly', label: 'Monthly', icon: 'calendar' },
    { key: 'quarterly', label: 'Quarterly', icon: 'calendar-alt' },
    { key: 'yearly', label: 'Yearly', icon: 'calendar-check' },
  ];

  const regions = [
    { key: 'all', label: 'All India', count: '15,234' },
    { key: 'north', label: 'North India', count: '4,523' },
    { key: 'south', label: 'South India', count: '3,891' },
    { key: 'west', label: 'West India', count: '3,234' },
    { key: 'east', label: 'East India', count: '2,987' },
    { key: 'northeast', label: 'Northeast', count: '599' },
  ];

  const getReportData = () => {
    const baseData = {
      totalStations: stations?.length || 15234,
      activeStations: Math.floor((stations?.length || 15234) * 0.847),
      criticalAlerts: Math.floor(Math.random() * 30) + 10,
      dataQuality: Math.floor(88 + Math.random() * 10),
      avgWaterLevel: (18.2 + Math.random() * 6).toFixed(1),
      efficiency: Math.floor(92 + Math.random() * 6),
    };

    const regionMultipliers = {
      all: 1,
      north: 0.297,
      south: 0.255,
      west: 0.212,
      east: 0.196,
      northeast: 0.039,
    };

    const multiplier = regionMultipliers[selectedRegion] || 1;
    
    return {
      ...baseData,
      totalStations: Math.floor(baseData.totalStations * multiplier),
      activeStations: Math.floor(baseData.activeStations * multiplier),
      criticalAlerts: Math.floor(baseData.criticalAlerts * multiplier),
    };
  };

  const generateChartData = () => {
    const data = [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    
    for (let i = 0; i < months.length; i++) {
      data.push({
        month: months[i],
        value: 15 + Math.random() * 20,
        trend: i > 0 ? (Math.random() > 0.5 ? 'up' : 'down') : 'stable',
      });
    }
    return data;
  };

  const reportData = getReportData();
  const chartData = generateChartData();
  const maxChartValue = Math.max(...chartData.map(d => d.value));

  const handleGenerateReport = () => {
    const period = periods.find(p => p.key === selectedPeriod)?.label;
    const region = regions.find(r => r.key === selectedRegion)?.label;
    
    Alert.alert(
      'Generate Report',
      `Generate ${period} report for ${region}?\n\nReport will include:\n• Water level trends\n• Station performance metrics\n• Data quality analysis\n• Critical alerts summary\n• Comparative analysis`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Generate', 
          onPress: () => {
            Alert.alert('Success', 'Report generation initiated. You will receive the report via email within 10 minutes.');
          }
        },
      ]
    );
  };

  const StatCard = ({ title, value, subtitle, icon, color, trend, delay = 0 }) => {
    const cardScale = useState(new Animated.Value(0.9))[0];
    const cardOpacity = useState(new Animated.Value(0))[0];

    useEffect(() => {
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.spring(cardScale, {
            toValue: 1,
            tension: 50,
            friction: 7,
            useNativeDriver: true,
          }),
          Animated.timing(cardOpacity, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    }, [delay]);

    return (
      <Animated.View
        style={[
          styles.statCard,
          {
            transform: [{ scale: cardScale }],
            opacity: cardOpacity,
          },
        ]}
      >
        <LinearGradient
          colors={['#FFFFFF', '#F8FAFC']}
          style={[styles.statCardGradient, { borderLeftColor: color, borderLeftWidth: 4 }]}
        >
          <View style={styles.statCardHeader}>
            <View style={[styles.statIcon, { backgroundColor: `${color}15` }]}>
              <Icon name={icon} size={18} color={color} />
            </View>
            {trend && (
              <View style={[styles.trendBadge, { backgroundColor: trend > 0 ? '#10B981' : '#EF4444' }]}>
                <Icon 
                  name={trend > 0 ? 'arrow-up' : 'arrow-down'} 
                  size={8} 
                  color="#fff" 
                />
                <Text style={styles.trendText}>{Math.abs(trend)}%</Text>
              </View>
            )}
          </View>
          
          <Text style={styles.statValue}>{value}</Text>
          <Text style={styles.statTitle}>{title}</Text>
          {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
        </LinearGradient>
      </Animated.View>
    );
  };

  const ChartBar = ({ data, index, maxValue }) => {
    const barHeight = useState(new Animated.Value(0))[0];
    const barOpacity = useState(new Animated.Value(0))[0];

    useEffect(() => {
      Animated.sequence([
        Animated.delay(index * 100),
        Animated.parallel([
          Animated.timing(barHeight, {
            toValue: (data.value / maxValue) * 120,
            duration: 800,
            useNativeDriver: false,
          }),
          Animated.timing(barOpacity, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    }, [data.value, maxValue, index]);

    return (
      <View style={styles.chartBarContainer}>
        <View style={styles.chartBarWrapper}>
          <Animated.View
            style={[
              styles.chartBar,
              {
                height: barHeight,
                opacity: barOpacity,
                backgroundColor: data.trend === 'up' ? '#10B981' : 
                                data.trend === 'down' ? '#EF4444' : '#0EA5E9',
              },
            ]}
          />
        </View>
        <Text style={styles.chartLabel}>{data.month}</Text>
        <Text style={styles.chartValue}>{data.value.toFixed(1)}m</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0C4A6E" />
      
      {/* Header */}
      <LinearGradient 
        colors={['#0C4A6E', '#0891B2', '#06B6D4']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <View style={styles.logoSection}>
              <View style={styles.headerIcon}>
                <Icon name="chart-line" size={24} color="#fff" />
              </View>
              <View>
                <Text style={styles.headerTitle}>Analytics Reports</Text>
                <Text style={styles.headerSubtitle}>Comprehensive Water Data Analysis</Text>
              </View>
            </View>
            
            <TouchableOpacity 
              style={styles.generateButton}
              onPress={handleGenerateReport}
            >
              <Icon name="download" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <ScrollView 
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Period Selection */}
        <Animated.View style={[styles.section, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.sectionTitle}>Report Period</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.periodSelector}
          >
            {periods.map((period) => (
              <TouchableOpacity
                key={period.key}
                style={[
                  styles.periodButton,
                  selectedPeriod === period.key && styles.periodButtonActive,
                ]}
                onPress={() => setSelectedPeriod(period.key)}
              >
                <Icon 
                  name={period.icon} 
                  size={16} 
                  color={selectedPeriod === period.key ? '#fff' : '#0EA5E9'} 
                />
                <Text style={[
                  styles.periodButtonText,
                  selectedPeriod === period.key && styles.periodButtonTextActive,
                ]}>
                  {period.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>

        {/* Region Selection */}
        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
          <Text style={styles.sectionTitle}>Coverage Region</Text>
          <View style={styles.regionGrid}>
            {regions.map((region) => (
              <TouchableOpacity
                key={region.key}
                style={[
                  styles.regionCard,
                  selectedRegion === region.key && styles.regionCardActive,
                ]}
                onPress={() => setSelectedRegion(region.key)}
              >
                <Text style={[
                  styles.regionLabel,
                  selectedRegion === region.key && styles.regionLabelActive,
                ]}>
                  {region.label}
                </Text>
                <Text style={[
                  styles.regionCount,
                  selectedRegion === region.key && styles.regionCountActive,
                ]}>
                  {region.count} stations
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Key Metrics */}
        <Text style={styles.sectionTitle}>Key Performance Metrics</Text>
        <View style={styles.statsGrid}>
          <StatCard
            title="Total Stations"
            value={reportData.totalStations.toLocaleString()}
            subtitle={`${reportData.activeStations.toLocaleString()} active`}
            icon="database"
            color="#0EA5E9"
            trend={2.3}
            delay={0}
          />
          
          <StatCard
            title="Data Quality"
            value={`${reportData.dataQuality}%`}
            subtitle="Quality index"
            icon="award"
            color="#10B981"
            trend={1.5}
            delay={100}
          />
          
          <StatCard
            title="Avg Water Level"
            value={`${reportData.avgWaterLevel}m`}
            subtitle="Below ground level"
            icon="tint"
            color="#8B5CF6"
            trend={-0.8}
            delay={200}
          />
          
          <StatCard
            title="System Efficiency"
            value={`${reportData.efficiency}%`}
            subtitle="Operational efficiency"
            icon="cogs"
            color="#F59E0B"
            trend={3.2}
            delay={300}
          />
        </View>

        {/* Water Level Trends Chart */}
        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
          <Text style={styles.sectionTitle}>Water Level Trends</Text>
          <View style={styles.chartContainer}>
            <LinearGradient
              colors={['#FFFFFF', '#F0F9FF']}
              style={styles.chartCard}
            >
              <View style={styles.chartHeader}>
                <Text style={styles.chartTitle}>Monthly Average Levels</Text>
                <Text style={styles.chartSubtitle}>Meters below ground level</Text>
              </View>
              
              <View style={styles.chart}>
                {chartData.map((data, index) => (
                  <ChartBar
                    key={data.month}
                    data={data}
                    index={index}
                    maxValue={maxChartValue}
                  />
                ))}
              </View>
              
              <View style={styles.chartLegend}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
                  <Text style={styles.legendText}>Increasing</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
                  <Text style={styles.legendText}>Decreasing</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#0EA5E9' }]} />
                  <Text style={styles.legendText}>Stable</Text>
                </View>
              </View>
            </LinearGradient>
          </View>
        </Animated.View>

        {/* Performance Summary */}
        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
          <Text style={styles.sectionTitle}>Performance Summary</Text>
          <View style={styles.summaryContainer}>
            <LinearGradient
              colors={['#FFFFFF', '#F8FAFC']}
              style={styles.summaryCard}
            >
              <View style={styles.summaryItem}>
                <View style={styles.summaryIcon}>
                  <Icon name="check-circle" size={20} color="#10B981" />
                </View>
                <View style={styles.summaryContent}>
                  <Text style={styles.summaryTitle}>Station Uptime</Text>
                  <Text style={styles.summaryValue}>96.8%</Text>
                  <Text style={styles.summarySubtitle}>Above target (95%)</Text>
                </View>
                <View style={styles.summaryTrend}>
                  <Icon name="arrow-up" size={12} color="#10B981" />
                  <Text style={[styles.summaryTrendText, { color: '#10B981' }]}>+2.1%</Text>
                </View>
              </View>

              <View style={styles.summaryDivider} />

              <View style={styles.summaryItem}>
                <View style={styles.summaryIcon}>
                  <Icon name="exclamation-triangle" size={20} color="#F59E0B" />
                </View>
                <View style={styles.summaryContent}>
                  <Text style={styles.summaryTitle}>Critical Alerts</Text>
                  <Text style={styles.summaryValue}>{reportData.criticalAlerts}</Text>
                  <Text style={styles.summarySubtitle}>Requires attention</Text>
                </View>
                <View style={styles.summaryTrend}>
                  <Icon name="arrow-down" size={12} color="#10B981" />
                  <Text style={[styles.summaryTrendText, { color: '#10B981' }]}>-15%</Text>
                </View>
              </View>

              <View style={styles.summaryDivider} />

              <View style={styles.summaryItem}>
                <View style={styles.summaryIcon}>
                  <Icon name="wifi" size={20} color="#0EA5E9" />
                </View>
                <View style={styles.summaryContent}>
                  <Text style={styles.summaryTitle}>Data Transmission</Text>
                  <Text style={styles.summaryValue}>98.4%</Text>
                  <Text style={styles.summarySubtitle}>Real-time connectivity</Text>
                </View>
                <View style={styles.summaryTrend}>
                  <Icon name="arrow-up" size={12} color="#10B981" />
                  <Text style={[styles.summaryTrendText, { color: '#10B981' }]}>+0.8%</Text>
                </View>
              </View>
            </LinearGradient>
          </View>
        </Animated.View>

        {/* Report Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleGenerateReport}
          >
            <LinearGradient
              colors={['#0EA5E9', '#0284C7']}
              style={styles.actionButtonGradient}
            >
              <Icon name="file-download" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>Generate Full Report</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.actionButtonSecondary]}
            onPress={() => Alert.alert('Export', 'Data exported to CSV format')}
          >
            <View style={styles.actionButtonSecondaryContent}>
              <Icon name="file-csv" size={20} color="#0EA5E9" />
              <Text style={styles.actionButtonSecondaryText}>Export Data</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Icon name="info-circle" size={12} color="#94A3B8" />
          <Text style={styles.footerText}>
            Reports generated based on {selectedPeriod} data for {regions.find(r => r.key === selectedRegion)?.label}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 45,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
    marginTop: 2,
  },
  generateButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 24,
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  periodSelector: {
    paddingHorizontal: 4,
  },
  periodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  periodButtonActive: {
    backgroundColor: '#0EA5E9',
    borderColor: '#0EA5E9',
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 8,
  },
  periodButtonTextActive: {
    color: '#fff',
  },
  regionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  regionCard: {
    width: (width - 40) / 2 - 6,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  regionCardActive: {
    borderColor: '#0EA5E9',
    backgroundColor: '#F0F9FF',
  },
  regionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 4,
  },
  regionLabelActive: {
    color: '#0EA5E9',
  },
  regionCount: {
    fontSize: 12,
    color: '#64748B',
  },
  regionCountActive: {
    color: '#0284C7',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: (width - 40) / 2,
    marginBottom: 16,
  },
  statCardGradient: {
    borderRadius: 20,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  statCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  trendText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '700',
    marginLeft: 2,
  },
  statValue: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 4,
  },
  statSubtitle: {
    fontSize: 12,
    color: '#64748B',
  },
  chartContainer: {
    
  },
  chartCard: {
    borderRadius: 20,
    padding: 24,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  chartHeader: {
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  chartSubtitle: {
    fontSize: 14,
    color: '#64748B',
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 140,
    marginBottom: 20,
  },
  chartBarContainer: {
    alignItems: 'center',
    flex: 1,
  },
  chartBarWrapper: {
    height: 120,
    width: 20,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  chartBar: {
    width: 16,
    borderRadius: 8,
    minHeight: 4,
  },
  chartLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 8,
    fontWeight: '500',
  },
  chartValue: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#64748B',
  },
  summaryContainer: {
    
  },
  summaryCard: {
    borderRadius: 20,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  summaryContent: {
    flex: 1,
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0EA5E9',
    marginBottom: 2,
  },
  summarySubtitle: {
    fontSize: 12,
    color: '#64748B',
  },
  summaryTrend: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryTrendText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 20,
  },
  actionsContainer: {
    marginTop: 24,
    gap: 12,
  },
  actionButton: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginLeft: 12,
  },
  actionButtonSecondary: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#0EA5E9',
  },
  actionButtonSecondaryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  actionButtonSecondaryText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0EA5E9',
    marginLeft: 12,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
  },
  footerText: {
    fontSize: 12,
    color: '#64748B',
    marginLeft: 8,
    textAlign: 'center',
  },
});

export default ReportsScreen;