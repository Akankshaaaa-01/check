import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FontAwesome5 as Icon } from '@expo/vector-icons';

import DashboardScreen from '../screens/DashboardScreen';
import MonitoringScreen from '../screens/MonitoringScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import TelemetryScreen from '../screens/TelemetryScreen';
import { COLORS } from '../utils/constants';

const Tab = createBottomTabNavigator();

const AppNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Dashboard') {
            iconName = 'tachometer-alt';
          } else if (route.name === 'Monitoring') {
            iconName = 'map-marked-alt';
          } else if (route.name === 'Analytics') {
            iconName = 'chart-line';
          } else if (route.name === 'Telemetry') {
            iconName = 'satellite-dish';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: 'gray',
        headerStyle: {
          backgroundColor: COLORS.primary,
        },
        headerTintColor: '#fff',
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Monitoring" component={MonitoringScreen} />
      <Tab.Screen name="Analytics" component={AnalyticsScreen} />
      <Tab.Screen name="Telemetry" component={TelemetryScreen} />
    </Tab.Navigator>
  );
};

export default AppNavigator;