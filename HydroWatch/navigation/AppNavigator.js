import React from 'react';
import { View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FontAwesome5 as Icon } from '@expo/vector-icons';

import DashboardScreen from '../screens/DashboardScreen';
import ImprovedMonitoringScreen from '../screens/ImprovedMonitoringScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import ChatbotScreen from '../screens/ChatbotScreen';
import ReportsScreen from '../screens/ReportsScreen';
import { COLORS } from '../utils/constants';

const Tab = createBottomTabNavigator();

const AppNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Dashboard') {
            iconName = 'chart-pie';
          } else if (route.name === 'Monitoring') {
            iconName = 'map-marked-alt';
          } else if (route.name === 'Analytics') {
            iconName = 'chart-area';
          } else if (route.name === 'Chatbot') {
            iconName = 'robot';
          } else if (route.name === 'Reports') {
            iconName = 'file-alt';
          }

          return (
            <View style={{
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: focused ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
            }}>
              <Icon 
                name={iconName} 
                size={focused ? size + 2 : size} 
                color={focused ? '#3b82f6' : color}
                style={{
                  textShadowColor: focused ? 'rgba(59, 130, 246, 0.3)' : 'transparent',
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: 2,
                }}
              />
            </View>
          );
        },
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: {
          position: 'absolute',
          bottom: 20,
          left: 16,
          right: 16,
          elevation: 12,
          backgroundColor: '#ffffff',
          borderRadius: 28,
          height: 75,
          paddingBottom: 12,
          paddingTop: 12,
          shadowColor: '#3b82f6',
          shadowOffset: {
            width: 0,
            height: 10,
          },
          shadowOpacity: 0.15,
          shadowRadius: 20,
          borderTopWidth: 0,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          letterSpacing: 0.3,
          marginTop: 2,
        },
        tabBarItemStyle: {
          paddingVertical: 5,
        },
        headerShown: false, // Hide default header to use custom ones
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Monitoring" component={ImprovedMonitoringScreen} />
      <Tab.Screen name="Analytics" component={AnalyticsScreen} />
      <Tab.Screen name="Chatbot" component={ChatbotScreen} />
      <Tab.Screen name="Reports" component={ReportsScreen} />
    </Tab.Navigator>
  );
};

export default AppNavigator;