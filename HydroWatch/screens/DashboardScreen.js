import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useAppContext } from '../state/AppContext';
import { fetchStates } from '../api/IndiaWrisApi';
import MetricCard from '../components/MetricCard';
import { COLORS } from '../utils/constants';

const DashboardScreen = () => {
  const { states, setStates, setApiStatus } = useAppContext();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getStates = async () => {
      try {
        const response = await fetchStates();
        if (response.data.statusCode === 200) {
          setStates(response.data.data);
          setApiStatus({ connected: true, message: 'Connected' });
        } else {
          setApiStatus({ connected: false, message: 'API Error' });
        }
      } catch (error) {
        setApiStatus({ connected: false, message: 'Connection Failed' });
      } finally {
        setLoading(false);
      }
    };
    getStates();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" style={styles.loader} />;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.grid}>
        <MetricCard icon="broadcast-tower" label="Total DWLR Stations" value="5,260*" />
        <MetricCard icon="map" label="States Covered" value={states.length.toString()} />
        <MetricCard icon="city" label="Districts Covered" value="Loading..." />
        <MetricCard icon="satellite-dish" label="Telemetric Stations" value="Available*" />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    padding: 8,
  },
});

export default DashboardScreen;