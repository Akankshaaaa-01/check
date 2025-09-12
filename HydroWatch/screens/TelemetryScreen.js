// src/screens/TelemetryScreen.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const TelemetryScreen = () => (
  <View style={styles.container}>
    <Text style={styles.text}>Telemetry Data Coming Soon</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 18, color: '#555' },
});

export default TelemetryScreen;