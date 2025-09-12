// src/screens/MonitoringScreen.js
import {React, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
// Use the correct icon import for Expo
import { FontAwesome5 as Icon } from '@expo/vector-icons';

import { useAppContext } from '../state/AppContext';
import { fetchDistrictsByState, fetchStations, fetchTelemetricStations } from '../api/IndiaWrisApi';
import { COLORS } from '../utils/constants';
import StationCard from '../components/StationCard';

const MonitoringScreen = () => {
  const { states } = useAppContext();
  const [districts, setDistricts] = useState([]);
  
  const [selectedState, setSelectedState] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [stations, setStations] = useState([]);
  
  const [isLoadingDistricts, setIsLoadingDistricts] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const stateItems = states.map(state => ({
    label: state.state,
    value: state.statecode,
  }));

  const districtItems = districts.map(district => ({
    label: district.districtname,
    value: district.district_id,
  }));

  const handleStateChange = async (stateCode) => {
    if (!stateCode) {
      setSelectedState(null);
      setSelectedDistrict(null);
      setDistricts([]);
      return;
    }
    
    setSelectedState(stateCode);
    setSelectedDistrict(null);
    setIsLoadingDistricts(true);

    try {
      const response = await fetchDistrictsByState(stateCode);
      if (response.data.statusCode === 200) {
        setDistricts(response.data.data);
      } else {
        Alert.alert("Error", "Could not fetch districts.");
      }
    } catch (error) {
      Alert.alert("Error", "An error occurred while fetching districts.");
    } finally {
      setIsLoadingDistricts(false);
    }
  };

  const handleSearch = async () => {
    if (!selectedDistrict) {
      Alert.alert("Missing Information", "Please select a state and a district.");
      return;
    }
    
    setIsSearching(true);
    setStations([]);

    try {
      // Use Promise.allSettled to handle cases where one API might fail
      const results = await Promise.allSettled([
        fetchStations(selectedDistrict),
        fetchTelemetricStations(selectedDistrict),
      ]);

      const stationMap = new Map();

      // Process successful results for regular stations
      if (results[0].status === 'fulfilled' && results[0].value.data.statusCode === 200) {
        results[0].value.data.data.forEach(station => {
          stationMap.set(station.stationcode, { ...station, telemetric: false });
        });
      }

      // Process successful results for telemetric stations
      if (results[1].status === 'fulfilled' && results[1].value.data.statusCode === 200) {
        results[1].value.data.data.forEach(station => {
          stationMap.set(station.stationcode, { ...station, telemetric: true });
        });
      }

      const allStations = Array.from(stationMap.values());
      setStations(allStations);

      if (allStations.length === 0) {
        Alert.alert("No Results", "No stations found for the selected district.");
      }

    } catch (error) {
      // This catch is for network-level errors, not API errors handled above
      Alert.alert("Search Error", "An error occurred while searching for stations.");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <Text style={styles.filterTitle}>Filter DWLR Stations</Text>
        
        <RNPickerSelect
          onValueChange={handleStateChange}
          items={stateItems}
          placeholder={{ label: 'Select a State', value: null }}
          style={pickerSelectStyles}
          useNativeAndroidPickerStyle={false}
          Icon={() => <Icon name="chevron-down" size={12} color="gray" />}
        />

        <RNPickerSelect
          onValueChange={(value) => setSelectedDistrict(value)}
          items={districtItems}
          placeholder={{ label: 'Select a District', value: null }}
          style={pickerSelectStyles}
          useNativeAndroidPickerStyle={false}
          disabled={!selectedState || isLoadingDistricts}
          Icon={() => <Icon name="chevron-down" size={12} color="gray" />}
        />
        {isLoadingDistricts && <ActivityIndicator color={COLORS.primary} style={{ marginTop: 10 }} />}

        <TouchableOpacity style={styles.searchButton} onPress={handleSearch} disabled={isSearching}>
            {isSearching ? (
                <ActivityIndicator color="#fff" />
            ) : (
                <Text style={styles.searchButtonText}>Search Stations</Text>
            )}
        </TouchableOpacity>
      </View>

      <FlatList
        data={stations}
        keyExtractor={(item) => item.stationcode}
        renderItem={({ item }) => <StationCard station={item} />}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={stations.length > 0 && <Text style={styles.resultsTitle}>Found {stations.length} Stations</Text>}
        ListEmptyComponent={!isSearching ? (
            <View style={styles.emptyContainer}>
                <Icon name="search-location" size={40} color="#ccc" />
                <Text style={styles.emptyText}>Please select filters and search for stations.</Text>
            </View>
        ) : null}
      />
    </View>
  );
};

// ... (The styles remain exactly the same as before)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  filterContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  searchButton: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  searchButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 15,
  },
  resultsTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 10,
      color: COLORS.dark,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 4,
    color: 'black',
    paddingRight: 30,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    color: 'black',
    paddingRight: 30,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  iconContainer: {
    top: 15,
    right: 15,
  },
});


export default MonitoringScreen;