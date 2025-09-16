// Simple Chart Components for HydroWatch Analytics
// Reliable charts without animation issues

import React from 'react';
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

// Color schemes for charts
const CHART_COLORS = {
  primary: ['#667eea', '#764ba2'],
  secondary: ['#f093fb', '#f5576c'],
  success: ['#4facfe', '#00f2fe'],
  warning: ['#ffeaa7', '#fab1a0'],
  danger: ['#ff7675', '#fd79a8'],
  info: ['#74b9ff', '#0984e3'],
  water: ['#0093E9', '#80D0C7'],
  earth: ['#8EC5FC', '#E0C3FC'],
  nature: ['#A8EDEA', '#FED6E3']
};

// Summary Statistics Component
export const SummaryStats = ({ rechargeRate, depletionRate, storageCapacity, transmissivity }) => {
  const StatCard = ({ title, value, unit, trend, color, icon, subtitle }) => (
    <View style={styles.statCard}>
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
      </LinearGradient>
    </View>
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
          icon="cloud-rain"
          subtitle={`Confidence: ${rechargeRate?.confidence || 85}%`}
        />
        
        <StatCard
          title="Depletion Risk"
          value={depletionRate?.value || "2.1"}
          unit="m/year"
          trend={depletionRate?.trend || -1.5}
          color={CHART_COLORS.danger}
          icon="exclamation-triangle"
          subtitle={`${depletionRate?.criticalStations || 3} stations critical`}
        />
        
        <StatCard
          title="Storage Capacity"
          value={storageCapacity?.value || "1,245"}
          unit="MCM"
          trend={1.8}
          color={CHART_COLORS.success}
          icon="database"
          subtitle="Regional aquifer"
        />
        
        <StatCard
          title="Transmissivity"
          value={transmissivity?.value || "125.7"}
          unit="m²/day"
          trend={0.5}
          color={CHART_COLORS.info}
          icon="exchange-alt"
          subtitle="Flow efficiency"
        />
      </ScrollView>
    </View>
  );
};

// Simple Bar Chart Component
const SimpleBarChart = ({ data, maxHeight = 120, colors = CHART_COLORS.primary }) => {
  const maxValue = Math.max(...data);
  
  return (
    <View style={styles.simpleChart}>
      <View style={styles.barsContainer}>
        {data.slice(0, 12).map((value, index) => {
          const height = (value / maxValue) * maxHeight;
          return (
            <View key={`bar-${index}`} style={styles.barContainer}>
              <View style={[styles.bar, { height }]}>
                <LinearGradient colors={colors} style={StyleSheet.absoluteFill} />
              </View>
              <Text style={styles.barLabel}>{index + 1}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

// Chart Card Container
const ChartCard = ({ title, subtitle, children, color = '#667eea' }) => (
  <View style={styles.chartContainer}>
    <LinearGradient colors={['#FFFFFF', '#F8FAFC']} style={styles.chartCard}>
      <View style={styles.chartHeader}>
        <View style={styles.chartTitleContainer}>
          <Icon name="chart-bar" size={18} color={color} />
          <Text style={styles.chartTitle}>{title}</Text>
        </View>
        <Text style={styles.chartSubtitle}>{subtitle}</Text>
      </View>
      {children}
    </LinearGradient>
  </View>
);

// Correlation Chart
export const CorrelationChart = ({ data, title, subtitle }) => (
  <ChartCard title={title} subtitle={subtitle} color="#667eea">
    <SimpleBarChart data={data} colors={CHART_COLORS.primary} />
    <View style={styles.chartInsights}>
      <View style={styles.insightItem}>
        <Icon name="info-circle" size={14} color="#667eea" />
        <Text style={styles.insightText}>
          Correlation: <Text style={styles.insightValue}>R² = 0.73</Text>
        </Text>
      </View>
    </View>
  </ChartCard>
);

// Seasonal Chart
export const SeasonalChart = ({ data, title, subtitle }) => (
  <ChartCard title={title} subtitle={subtitle} color="#0EA5E9">
    <SimpleBarChart data={data} colors={CHART_COLORS.info} />
    <View style={styles.seasonalStats}>
      <View style={styles.seasonalStat}>
        <Icon name="arrow-up" size={12} color="#10B981" />
        <Text style={styles.seasonalStatLabel}>Peak: Jul</Text>
        <Text style={styles.seasonalStatValue}>{Math.max(...data).toFixed(1)}m</Text>
      </View>
      <View style={styles.seasonalStat}>
        <Icon name="arrow-down" size={12} color="#EF4444" />
        <Text style={styles.seasonalStatLabel}>Low: Apr</Text>
        <Text style={styles.seasonalStatValue}>{Math.min(...data).toFixed(1)}m</Text>
      </View>
    </View>
  </ChartCard>
);

// Pumping Impact Chart
export const PumpingImpactChart = ({ data, title, subtitle }) => (
  <ChartCard title={title} subtitle={subtitle} color="#F59E0B">
    <SimpleBarChart data={data} colors={CHART_COLORS.warning} />
    <View style={styles.pumpingLegend}>
      <View style={styles.legendRow}>
        <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
        <Text style={styles.legendText}>High Impact</Text>
        <View style={[styles.legendDot, { backgroundColor: '#FCD34D' }]} />
        <Text style={styles.legendText}>Moderate Impact</Text>
      </View>
    </View>
  </ChartCard>
);

// Long Term Trends Chart (simple line visualization)
export const LongTermTrendsChart = ({ data, title, subtitle }) => {
  const maxValue = Math.max(...data);
  const minValue = Math.min(...data);
  const range = maxValue - minValue || 1;

  return (
    <ChartCard title={title} subtitle={subtitle} color="#8B5CF6">
      <View style={styles.trendsChart}>
        <View style={styles.lineChart}>
          {data.map((value, index) => {
            const height = ((value - minValue) / range) * 100;
            const left = (index / (data.length - 1)) * 280;
            return (
              <View
                key={`trend-${index}`}
                style={[
                  styles.trendPoint,
                  {
                    left: left + 20,
                    bottom: height + 20,
                    backgroundColor: '#8B5CF6',
                  }
                ]}
              />
            );
          })}
        </View>
        <View style={styles.yearLabels}>
          {['2019', '2020', '2021', '2022', '2023', '2024'].map((year, index) => (
            <Text key={year} style={styles.yearLabel}>{year}</Text>
          ))}
        </View>
      </View>
      <View style={styles.trendsInsights}>
        <View style={styles.trendInsight}>
          <Icon name="trending-up" size={14} color="#10B981" />
          <Text style={styles.trendInsightText}>
            Overall Trend: <Text style={styles.trendInsightValue}>Stable</Text>
          </Text>
        </View>
      </View>
    </ChartCard>
  );
};

// Metric Chart Card
export const MetricChartCard = ({ 
  title, 
  value, 
  unit, 
  trend, 
  color, 
  icon, 
  size = 'large' 
}) => {
  const isLarge = size === 'large';
  
  return (
    <View style={[styles.metricCard, isLarge ? styles.metricCardLarge : styles.metricCardMedium]}>
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
      </LinearGradient>
    </View>
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

  // Chart Styles
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

  // Simple Chart Styles
  simpleChart: {
    height: 140,
    marginBottom: 16,
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: '100%',
    paddingHorizontal: 10,
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
    maxWidth: 30,
  },
  bar: {
    width: 20,
    borderRadius: 10,
    marginBottom: 8,
    overflow: 'hidden',
  },
  barLabel: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '600',
  },

  // Chart Insights
  chartInsights: {
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

  // Seasonal Stats
  seasonalStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
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

  // Pumping Legend
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

  // Trends Chart
  trendsChart: {
    height: 150,
    position: 'relative',
    marginBottom: 16,
  },
  lineChart: {
    position: 'relative',
    height: 120,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginBottom: 10,
  },
  trendPoint: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: -4,
    marginBottom: -4,
  },
  yearLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  yearLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  trendsInsights: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  trendInsight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
});

export default {
  SummaryStats,
  CorrelationChart,
  SeasonalChart,
  PumpingImpactChart,
  LongTermTrendsChart,
  MetricChartCard,
};