// src/components/StationCard.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../utils/constants';

const StationCard = ({ station }) => {
  const isTelemetric = station.telemetric === true;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.stationName} numberOfLines={1}>{station.stationname || 'Unknown Station'}</Text>
        <View style={[styles.badge, isTelemetric ? styles.telemetricBadge : styles.manualBadge]}>
          <Text style={styles.badgeText}>{isTelemetric ? 'TELEMETRIC' : 'MANUAL'}</Text>
        </View>
      </View>
      <View style={styles.detailsRow}>
        <Text style={styles.detailText}>District ID: {station.district_id || 'N/A'}</Text>
        <Text style={styles.detailText}>Agency: {station.agencyid || 'N/A'}</Text>
      </View>
      <Text style={styles.detailCode}>Code: {station.stationcode || 'N/A'}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  stationName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.dark,
    flex: 1, // Ensures text doesn't push the badge off-screen
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  telemetricBadge: {
    backgroundColor: '#d1fae5',
  },
  manualBadge: {
    backgroundColor: '#dbeafe',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.dark,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 12,
    color: '#666',
  },
  detailCode: {
    fontSize: 12,
    color: '#888',
  },
});

export default StationCard;