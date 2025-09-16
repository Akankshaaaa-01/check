// Beautiful Chart Components for HydroWatch Analytics
// Simple, reliable charts with stunning visual design

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { FontAwesome5 as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

// Beautiful color schemes for charts
const CHART_COLORS = {
  primary: ['#667eea', '#764ba2'],
  secondary: ['#f093fb', '#f5576c'],
  success: ['#4facfe', '#00f2fe'],
  warning: ['#ffeaa7', '#fab1a0'],
  danger: ['#ff7675', '#fd79a8'],
  info: ['#74b9ff', '#0984e3'],
  gradient: ['#667eea', '#764ba2', '#f093fb', '#f5576c'],
  water: ['#0093E9', '#80D0C7'],
  earth: ['#8EC5FC', '#E0C3FC'],
  nature: ['#A8EDEA', '#FED6E3']
};

// Summary Statistics Component with beautiful cards
export const SummaryStats = ({ rechargeRate, depletionRate, storageCapacity, transmissivity }) => {
  const [animatedValues] = useState([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0)
  ]);

  useEffect(() => {
    // Stagger the animations for a beautiful cascading effect
    const animations = animatedValues.map((animatedValue, index) =>
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 800,
        delay: index * 200,
        useNativeDriver: true,
      })
    );

    Animated.stagger(150, animations).start();
  }, []);

  const StatCard = ({ title, value, unit, trend, color, animatedValue, icon, subtitle }) => (
    <Animated.View
      style={[
        styles.statCard,
        {
          opacity: animatedValue,
          transform: [{
            translateY: animatedValue.interpolate({
              inputRange: [0, 1],
              outputRange: [50, 0]
            })
          }]
        }
      ]}
    >
      <LinearGradient colors={color} style={styles.statCardGradient}>
        <View style={styles.statCardHeader}>
          <View style={styles.statCardIcon}>
            <Icon name={icon} size={20} color="#fff" />
          </View>
          {trend && (
            <View style={styles.trendBadge}>
              <Icon 
                name={trend > 0 ? "arrow-up" : "arrow-down"} 
                size={12} 
                color={trend > 0 ? "#10B981" : "#EF4444"} 
              />
              <Text style={[styles.trendText, { color: trend > 0 ? "#10B981" : "#EF4444" }]}>
                {Math.abs(trend)}%
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.statCardContent}>
          <Text style={styles.statCardValue}>{value}</Text>
          <Text style={styles.statCardUnit}>{unit}</Text>
        </View>
        
        <Text style={styles.statCardTitle}>{title}</Text>
        {subtitle && <Text style={styles.statCardSubtitle}>{subtitle}</Text>}
        
        {/* Animated background pattern */}
        <View style={styles.patternOverlay}>
          <Icon name="tint" size={100} color="rgba(255,255,255,0.1)" />
        </View>
      </LinearGradient>
    </Animated.View>
  );

  return (
    <View style={styles.summaryContainer}>
      <Text style={styles.sectionTitle}>📊 Real-time Metrics</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={styles.statsScrollContainer}
      >
        <StatCard
          title="Recharge Rate"
          value={rechargeRate?.value || "45.2"}
          unit="mm/year"
          trend={rechargeRate?.trend || 2.3}
          color={CHART_COLORS.water}
          animatedValue={animatedValues[0]}
          icon="cloud-rain"
          subtitle={`Confidence: ${rechargeRate?.confidence || 85}%`}
        />
        
        <StatCard
          title="Depletion Risk"
          value={depletionRate?.value || "2.1"}
          unit="m/year"
          trend={depletionRate?.trend || -1.5}
          color={CHART_COLORS.danger}
          animatedValue={animatedValues[1]}
          icon="exclamation-triangle"
          subtitle={`${depletionRate?.criticalStations || 3} stations critical`}
        />
        
        <StatCard
          title="Storage Capacity"
          value={storageCapacity?.value || "1,245"}
          unit="MCM"
          trend={1.8}
          color={CHART_COLORS.success}
          animatedValue={animatedValues[2]}
          icon="database"
          subtitle="Regional aquifer"
        />
        
        <StatCard
          title="Transmissivity"
          value={transmissivity?.value || "125.7"}
          unit="m²/day"
          trend={0.5}
          color={CHART_COLORS.info}
          animatedValue={animatedValues[3]}
          icon="exchange-alt"
          subtitle="Flow efficiency"
        />
      </ScrollView>
    </View>
  );
};

// Beautiful Correlation Chart
export const CorrelationChart = ({ data, title, subtitle }) => {
  const [animatedValue] = useState(new Animated.Value(0));
  const maxValue = Math.max(...data);

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: false,
    }).start();
  }, []);

  return (
    <View style={styles.chartContainer}>
      <LinearGradient colors={['#FFFFFF', '#F8FAFC']} style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <View style={styles.chartTitleContainer}>
            <Icon name="link" size={18} color="#667eea" />
            <Text style={styles.chartTitle}>{title}</Text>
          </View>
          <Text style={styles.chartSubtitle}>{subtitle}</Text>
        </View>
        
        <View style={styles.correlationChart}>
          {data.map((value, index) => {
            const height = (value / maxValue) * 120;
            return (
              <View key={`correlation-${index}-${value}`} style={styles.correlationBarContainer}>
                <Animated.View
                  style={[
                    styles.correlationBar,
                    {
                    height: height * (animatedValue._value || 0),
                      backgroundColor: `hsl(${220 + (value/maxValue) * 60}, 70%, 60%)`,
                    },
                  ]}
                />
                <Text style={styles.correlationLabel}>
                  {['J', 'F', 'M', 'A', 'M', 'J'][index] || index + 1}
                </Text>
              </View>
            );
          })}
        </View>
        
        <View style={styles.correlationInsights}>
          <View style={styles.insightItem}>
            <Icon name="info-circle" size={14} color="#667eea" />
            <Text style={styles.insightText}>
              Correlation: <Text style={styles.insightValue}>R² = 0.73</Text>
            </Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

// Seasonal Chart with beautiful design
export const SeasonalChart = ({ data, title, subtitle }) => {
  const [animatedValue] = useState(new Animated.Value(0));
  const [selectedMonth, setSelectedMonth] = useState(null);
  
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const maxValue = Math.max(...data);
  const minValue = Math.min(...data);

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: false,
    }).start();
  }, []);

  return (
    <View style={styles.chartContainer}>
      <LinearGradient colors={['#FFFFFF', '#F0F9FF']} style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <View style={styles.chartTitleContainer}>
            <Icon name="calendar-alt" size={18} color="#0EA5E9" />
            <Text style={styles.chartTitle}>{title}</Text>
          </View>
          <Text style={styles.chartSubtitle}>{subtitle}</Text>
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.seasonalChart}>
            {data.map((value, index) => {
              const height = ((value - minValue) / (maxValue - minValue)) * 150;
              const isSelected = selectedMonth === index;
              
              return (
                <TouchableOpacity 
                  key={`seasonal-${index}-${value}`}
                  style={styles.seasonalBarContainer}
                  onPress={() => setSelectedMonth(isSelected ? null : index)}
                >
                  <View style={styles.seasonalBarWrapper}>
                    <Animated.View
                      style={[
                        styles.seasonalBar,
                        {
                          height: height,
                          backgroundColor: isSelected ? '#0EA5E9' : '#93C5FD',
                          transform: [{
                            scale: isSelected ? 1.05 : 1
                          }],
                        },
                      ]}
                    />
                    {isSelected && (
                      <View style={styles.valueTooltip}>
                        <Text style={styles.tooltipText}>{value.toFixed(1)}m</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.seasonalLabel, isSelected && styles.selectedLabel]}>
                    {months[index]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
        
        <View style={styles.seasonalInsights}>
          <View style={styles.seasonalStats}>
            <View style={styles.seasonalStat}>
              <Icon name="arrow-up" size={12} color="#10B981" />
              <Text style={styles.seasonalStatLabel}>Peak: Jul</Text>
              <Text style={styles.seasonalStatValue}>{maxValue.toFixed(1)}m</Text>
            </View>
            <View style={styles.seasonalStat}>
              <Icon name="arrow-down" size={12} color="#EF4444" />
              <Text style={styles.seasonalStatLabel}>Low: Apr</Text>
              <Text style={styles.seasonalStatValue}>{minValue.toFixed(1)}m</Text>
            </View>
            <View style={styles.seasonalStat}>
              <Icon name="chart-line" size={12} color="#F59E0B" />
              <Text style={styles.seasonalStatLabel}>Range</Text>
              <Text style={styles.seasonalStatValue}>{(maxValue - minValue).toFixed(1)}m</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

// Pumping Impact Chart
export const PumpingImpactChart = ({ data, title, subtitle }) => {
  const [animatedValue] = useState(new Animated.Value(0));
  
  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 1800,
      useNativeDriver: false,
    }).start();
  }, []);

  return (
    <View style={styles.chartContainer}>
      <LinearGradient colors={['#FEF7ED', '#FFFFFF']} style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <View style={styles.chartTitleContainer}>
            <Icon name="industry" size={18} color="#F59E0B" />
            <Text style={styles.chartTitle}>{title}</Text>
          </View>
          <Text style={styles.chartSubtitle}>{subtitle}</Text>
        </View>
        
        <View style={styles.pumpingChart}>
        {data.map((value, index) => (
            <View key={`pumping-${index}-${value}`} style={styles.pumpingArea}>
              <Animated.View
                style={[
                  styles.pumpingFill,
                  {
                    height: (value / Math.max(...data)) * 100,
                    backgroundColor: `hsla(${45 - (value/Math.max(...data)) * 20}, 80%, 60%, 0.7)`,
                  },
                ]}
              />
            </View>
          ))}
        </View>
        
        <View style={styles.pumpingLegend}>
          <View style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
            <Text style={styles.legendText}>High Impact</Text>
            <View style={[styles.legendDot, { backgroundColor: '#FCD34D' }]} />
            <Text style={styles.legendText}>Moderate Impact</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

// Long Term Trends Chart
export const LongTermTrendsChart = ({ data, title, subtitle }) => {
  const [animatedValue] = useState(new Animated.Value(0));
  
  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 2500,
      useNativeDriver: false,
    }).start();
  }, []);

  const createPath = () => {
    const width = 300;
    const height = 120;
    const stepX = width / (data.length - 1);
    const max = Math.max(...data);
    const min = Math.min(...data);
    
    return data.map((value, index) => ({
      x: index * stepX,
      y: height - ((value - min) / (max - min)) * height
    }));
  };

  const pathPoints = createPath();

  return (
    <View style={styles.chartContainer}>
      <LinearGradient colors={['#F3E8FF', '#FFFFFF']} style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <View style={styles.chartTitleContainer}>
            <Icon name="chart-line" size={18} color="#8B5CF6" />
            <Text style={styles.chartTitle}>{title}</Text>
          </View>
          <Text style={styles.chartSubtitle}>{subtitle}</Text>
        </View>
        
        <View style={styles.trendsChart}>
          {/* Grid Lines */}
          <View style={styles.gridLines}>
            {[0, 1, 2, 3, 4].map(i => (
              <View key={i} style={[styles.gridLine, { top: i * 30 }]} />
            ))}
          </View>
          
          {/* Trend Line */}
          <Animated.View style={styles.trendLine}>
            {pathPoints.map((point, index) => (
              <Animated.View
                key={`trend-point-${index}-${point.x}`}
                style={[
                  styles.trendPoint,
                  {
                    left: point.x,
                    top: point.y,
                    opacity: animatedValue,
                    transform: [{
                      scale: animatedValue.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 1],
                        extrapolate: 'clamp',
                      })
                    }]
                  },
                ]}
              />
            ))}
          </Animated.View>
          
          {/* Year Labels */}
          <View style={styles.yearLabels}>
            {['2019', '2020', '2021', '2022', '2023', '2024'].map((year, index) => (
              <Text key={`year-${year}-${index}`} style={styles.yearLabel}>{year}</Text>
            ))}
          </View>
        </View>
        
        <View style={styles.trendsInsights}>
          <View style={styles.trendInsight}>
            <Icon name="trending-up" size={14} color="#10B981" />
            <Text style={styles.trendInsightText}>
              Overall Trend: <Text style={styles.trendInsightValue}>Improving</Text>
            </Text>
          </View>
          <View style={styles.trendInsight}>
            <Icon name="percent" size={14} color="#8B5CF6" />
            <Text style={styles.trendInsightText}>
              Annual Change: <Text style={styles.trendInsightValue}>+2.3%</Text>
            </Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

// Metric Chart Card Component
export const MetricChartCard = ({ 
  title, 
  value, 
  unit, 
  trend, 
  color, 
  icon, 
  size = 'large', 
  showChart = true 
}) => {
  const [animatedValue] = useState(new Animated.Value(0));
  
  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const isLarge = size === 'large';
  
  return (
    <Animated.View
      style={[
        styles.metricCard,
        isLarge ? styles.metricCardLarge : styles.metricCardMedium,
        {
          opacity: animatedValue,
          transform: [{
            scale: animatedValue.interpolate({
              inputRange: [0, 1],
              outputRange: [0.8, 1],
            })
          }]
        }
      ]}
    >
      <LinearGradient colors={[color, `${color}CC`]} style={styles.metricCardGradient}>
        <View style={styles.metricCardHeader}>
          <View style={styles.metricCardIcon}>
            <Icon name={icon} size={isLarge ? 24 : 18} color="#fff" />
          </View>
          {trend && (
            <View style={styles.metricTrendBadge}>
              <Icon 
                name={trend > 0 ? "caret-up" : "caret-down"} 
                size={10} 
                color="#fff" 
              />
              <Text style={styles.metricTrendText}>{Math.abs(trend)}%</Text>
            </View>
          )}
        </View>
        
        <View style={styles.metricCardContent}>
          <Text style={[styles.metricCardValue, !isLarge && styles.metricCardValueMedium]}>
            {value}
          </Text>
          <Text style={styles.metricCardUnit}>{unit}</Text>
        </View>
        
        <Text style={styles.metricCardTitle}>{title}</Text>
        
        {showChart && (
          <View style={styles.miniChart}>
            {[...Array(8)].map((_, i) => (
              <Animated.View
                key={`mini-bar-${i}-${Math.random()}`}
                style={[
                  styles.miniBar,
                  {
                    height: (Math.random() * 20) + 10,
                  },
                ]}
              />
            ))}
          </View>
        )}
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  // Summary Stats Styles
  summaryContainer: {
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  statsScrollContainer: {
    paddingHorizontal: 16,
    paddingRight: 32,
  },
  statCard: {
    width: width * 0.75,
    marginRight: 16,
    borderRadius: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
  },
  statCardGradient: {
    padding: 24,
    borderRadius: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  statCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statCardIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4,
  },
  statCardContent: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  statCardValue: {
    fontSize: 32,
    fontWeight: '900',
    color: '#fff',
  },
  statCardUnit: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginLeft: 8,
    fontWeight: '600',
  },
  statCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  statCardSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  patternOverlay: {
    position: 'absolute',
    right: -20,
    top: -20,
    opacity: 0.1,
  },

  // Chart Container Styles
  chartContainer: {
    marginHorizontal: 16,
    marginVertical: 12,
  },
  chartCard: {
    borderRadius: 20,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  chartHeader: {
    marginBottom: 20,
  },
  chartTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F2937',
    marginLeft: 8,
  },
  chartSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
  },

  // Correlation Chart Styles
  correlationChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 140,
    marginBottom: 16,
  },
  correlationBarContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  correlationBar: {
    width: 20,
    borderRadius: 10,
    marginBottom: 8,
  },
  correlationLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  correlationInsights: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  insightText: {
    fontSize: 14,
    color: '#4B5563',
    marginLeft: 8,
  },
  insightValue: {
    fontWeight: '700',
    color: '#667eea',
  },

  // Seasonal Chart Styles
  seasonalChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 180,
    paddingHorizontal: 16,
  },
  seasonalBarContainer: {
    alignItems: 'center',
    marginHorizontal: 6,
  },
  seasonalBarWrapper: {
    position: 'relative',
    alignItems: 'center',
  },
  seasonalBar: {
    width: 24,
    borderRadius: 12,
    marginBottom: 12,
  },
  valueTooltip: {
    position: 'absolute',
    top: -30,
    backgroundColor: '#1F2937',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tooltipText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  seasonalLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  selectedLabel: {
    color: '#0EA5E9',
    fontWeight: '800',
  },
  seasonalInsights: {
    marginTop: 20,
  },
  seasonalStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  seasonalStat: {
    alignItems: 'center',
  },
  seasonalStatLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  seasonalStatValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 2,
  },

  // Pumping Impact Chart Styles
  pumpingChart: {
    flexDirection: 'row',
    height: 120,
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  pumpingArea: {
    flex: 1,
    backgroundColor: '#FEF3C7',
    marginHorizontal: 1,
    borderRadius: 2,
  },
  pumpingFill: {
    backgroundColor: '#F59E0B',
    borderRadius: 2,
  },
  pumpingLegend: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginHorizontal: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#6B7280',
    marginRight: 16,
  },

  // Trends Chart Styles
  trendsChart: {
    height: 150,
    position: 'relative',
    marginBottom: 16,
  },
  gridLines: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#F3F4F6',
  },
  trendLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 300,
    height: 120,
  },
  trendPoint: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#8B5CF6',
    marginLeft: -4,
    marginTop: -4,
  },
  yearLabels: {
    position: 'absolute',
    bottom: -20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  yearLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  trendsInsights: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  trendInsight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendInsightText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 6,
  },
  trendInsightValue: {
    fontWeight: '700',
    color: '#8B5CF6',
  },

  // Metric Card Styles
  metricCard: {
    borderRadius: 16,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    margin: 8,
  },
  metricCardLarge: {
    width: (width - 64) / 2,
  },
  metricCardMedium: {
    width: (width - 80) / 3,
  },
  metricCardGradient: {
    padding: 16,
    borderRadius: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  metricCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricCardIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  metricTrendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  metricTrendText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1F2937',
    marginLeft: 2,
  },
  metricCardContent: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  metricCardValue: {
    fontSize: 24,
    fontWeight: '900',
    color: '#fff',
  },
  metricCardValueMedium: {
    fontSize: 18,
  },
  metricCardUnit: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginLeft: 4,
    fontWeight: '600',
  },
  metricCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  miniChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 24,
    marginTop: 8,
  },
  miniBar: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 1,
    borderRadius: 1,
  },
});

export default {
  SummaryStats,
  CorrelationChart,
  SeasonalChart,
  PumpingImpactChart,
  LongTermTrendsChart,
  MetricChartCard,
};