import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import CustomIcon from './CustomIcon';
import { COLORS } from '../utils/constants';

const MetricCard = ({ icon, label, value }) => (
  <View style={styles.card}>
    <View style={styles.iconContainer}>
      <CustomIcon name={icon} size={20} color={COLORS.primary} />
    </View>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    margin: 8,
    width: '45%', // Two cards per row
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  value: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginTop: 5,
  },
});

export default MetricCard;