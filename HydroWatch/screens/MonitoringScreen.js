// src/screens/MonitoringScreen.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  Alert,
  FlatList,
  TextInput,
  Platform,
  RefreshControl,
  Linking
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5 as Icon, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useAppContext } from '../state/AppContext';
import { 
  fetchAllStations,
  fetchEnhancedWaterLevelData,
  getStationDetails,
  getFilterOptions,
  getEnhancedAnalytics
} from '../api/IndiaWrisApi';

const { width, height } = Dimensions.get('window');

// Check if maps are available
let MAPS_AVAILABLE = false;
let MapView, Marker, Heatmap, PROVIDER_GOOGLE;

try {
  const maps = require('react-native-maps');
  MapView = maps.default;
  Marker = maps.Marker;
  Heatmap = maps.Heatmap;
  PROVIDER_GOOGLE = maps.PROVIDER_GOOGLE;
  MAPS_AVAILABLE = true;
} catch (e) {
  console.warn('React Native Maps not available:', e.message);
  MAPS_AVAILABLE = false;
}

const MonitoringScreen = () => {
  const { stations, loading, updateStations } = useAppContext();
  
  // Map state
  const [selectedStation, setSelectedStation] = useState(null);
  const [stationDetails, setStationDetails] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loadingStationData, setLoadingStationData] = useState(false);
  const [mapRegion, setMapRegion] = useState({
    latitude: 20.5937,
    longitude: 78.9629,
    latitudeDelta: 15,
    longitudeDelta: 15,
  });
  
  // Analysis state
  const [criticalZones, setCriticalZones] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  
  // Filter state
  const [filterType, setFilterType] = useState('all');
  const [viewMode, setViewMode] = useState(MAPS_AVAILABLE ? 'map' : 'list');
  const [showLegend, setShowLegend] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filter options
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [agencies, setAgencies] = useState([]);
  const [selectedState, setSelectedState] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [selectedAgency, setSelectedAgency] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Filtered stations
  const [filteredStations, setFilteredStations] = useState([]);
  const [apiRetryCount, setApiRetryCount] = useState(0);
  const [loadingFilters, setLoadingFilters] = useState(true);
  const [cgwbDataLoaded, setCgwbDataLoaded] = useState(false);
  
  // Graph modal state
  const [showGraphModal, setShowGraphModal] = useState(false);
  const [selectedGraphData, setSelectedGraphData] = useState(null);
  const [graphLoading, setGraphLoading] = useState(false);
  
  const mapRef = useRef(null);
  const listKeyRef = useRef(0); // For fixing FlatList numColumns issue

  // Load filter options
  useEffect(() => {
    loadFilterOptions();
  }, []);

  // Apply filters when dependencies change
  useEffect(() => {
    if (stations.length > 0) {
      analyzeCriticalZones();
      computeAnalytics();
      applyFilters();
    }
  }, [stations, filterType, selectedState, selectedDistrict, selectedBlock, selectedAgency, searchQuery]);

  // Retry loading when retry count changes
  useEffect(() => {
    if (apiRetryCount > 0 && apiRetryCount <= 3) {
      loadFilterOptions();
    }
  }, [apiRetryCount]);

  // Force re-render when view mode changes to fix FlatList numColumns issue
  useEffect(() => {
    listKeyRef.current += 1; // Change key to force fresh render
  }, [viewMode]);

  // Load filter options from API with error handling
  const loadFilterOptions = async () => {
    setLoadingFilters(true);
    try {
      const response = await getFilterOptions();
      
      if (response && !response.error && response.data) {
        setStates(Array.isArray(response.data.states) ? response.data.states : []);
        setAgencies(Array.isArray(response.data.agencies) ? response.data.agencies : []);
      } else {
        console.warn('Failed to load filter options');
        setStates([]);
        setAgencies([]);
        
        // Retry logic
        if (apiRetryCount < 3) {
          setTimeout(() => {
            setApiRetryCount(prev => prev + 1);
          }, 2000);
        }
      }
    } catch (error) {
      console.error('Error loading filter options:', error);
      setStates([]);
      setAgencies([]);
    } finally {
      setLoadingFilters(false);
    }
  };

  // Load districts when state is selected
  useEffect(() => {
    if (selectedState) {
      // For now, we'll use static districts or implement district loading later
      setDistricts([]);
    } else {
      setDistricts([]);
      setSelectedDistrict(null);
    }
  }, [selectedState]);

  // Load blocks when district is selected
  useEffect(() => {
    if (selectedDistrict) {
      // For now, we'll use static blocks or implement block loading later
      setBlocks([]);
    } else {
      setBlocks([]);
      setSelectedBlock(null);
    }
  }, [selectedDistrict]);

  // Apply filters to stations
  const applyFilters = useCallback(() => {
    let filtered = [...stations];

    // Apply type filter
    switch (filterType) {
      case 'telemetric':
        filtered = filtered.filter(s => s.isDwlr);
        break;
      case 'critical':
        filtered = filtered.filter(s => 
          criticalZones.some(cz => cz.stationcode === s.stationcode)
        );
        break;
      case 'manual':
        filtered = filtered.filter(s => !s.isDwlr);
        break;
      default:
        // No additional filtering for 'all'
    }

    // Apply location filters
    if (selectedState) {
      filtered = filtered.filter(s => s.statecode === selectedState.statecode);
    }
    
    if (selectedDistrict) {
      filtered = filtered.filter(s => s.districtcode === selectedDistrict.districtcode);
    }
    
    if (selectedBlock) {
      filtered = filtered.filter(s => s.blockcode === selectedBlock.blockcode);
    }
    
    if (selectedAgency) {
      filtered = filtered.filter(s => s.agencyid === selectedAgency.agencyid);
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(s => 
        (s.stationname && s.stationname.toLowerCase().includes(query)) ||
        (s.stationcode && s.stationcode.toLowerCase().includes(query)) ||
        (s.districtname && s.districtname.toLowerCase().includes(query))
      );
    }

    setFilteredStations(filtered);

    // If in map view, adjust map to show filtered stations
    if (viewMode === 'map' && filtered.length > 0 && mapRef.current) {
      setTimeout(() => {
        fitMapToMarkers(filtered);
      }, 100);
    }
  }, [stations, filterType, criticalZones, selectedState, selectedDistrict, selectedBlock, selectedAgency, searchQuery, viewMode]);

  // Fit map to show all markers
  const fitMapToMarkers = (stationsToShow) => {
    if (stationsToShow.length === 0 || !mapRef.current) return;

    const coordinates = stationsToShow
      .filter(station => station.latitude && station.longitude)
      .map(station => ({
        latitude: parseFloat(station.latitude),
        longitude: parseFloat(station.longitude)
      }));

    if (coordinates.length > 0) {
      mapRef.current.fitToCoordinates(coordinates, {
        edgePadding: { top: 100, right: 100, bottom: 100, left: 100 },
        animated: true
      });
    }
  };

  // Analyze critical zones based on water levels
  const analyzeCriticalZones = async () => {
    if (stations.length === 0) return;

    const criticalStations = [];
    const sampleStations = stations.slice(0, Math.min(10, stations.length));
    
    for (const station of sampleStations) {
      try {
        const response = await fetchEnhancedWaterLevelData(station.stationcode, 7);
        if (!response.error && response.data) {
          let currentLevel = null;
          
          if (station.isDwlr && response.data.values) {
            // DWLR data from CGWB
            currentLevel = response.data.values.length > 0 ? response.data.values[response.data.values.length - 1] : null;
          } else if (response.data.analytics && response.data.analytics.latestReading) {
            // India-WRIS data
            currentLevel = Math.abs(response.data.analytics.latestReading.value);
          }
          
          if (currentLevel !== null && currentLevel > 25) { // Critical threshold
            criticalStations.push({
              ...station,
              currentLevel,
              status: currentLevel > 30 ? 'critical' : 'warning'
            });
          }
        }
      } catch (error) {
        console.error(`Error analyzing station ${station.stationcode}:`, error);
      }
    }
    
    setCriticalZones(criticalStations);
  };

  // Compute overall analytics
  const computeAnalytics = async () => {
    if (stations.length === 0) return;

    const stationCodes = stations.slice(0, Math.min(10, stations.length)).map(s => s.stationcode);
    
    try {
      const response = await getEnhancedAnalytics(stationCodes);
      if (!response.error) {
        setAnalytics(response.data);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Error computing analytics:', error);
    }
  };

  // Handle station selection
  const handleStationPress = async (station) => {
    setSelectedStation(station);
    setLoadingStationData(true);
    setModalVisible(true);

    try {
      const response = await getStationDetails(station);
      if (!response.error) {
        setStationDetails(response.data);
        
        // Center map on selected station if in map view
        if (viewMode === 'map' && station.latitude && station.longitude) {
          setMapRegion({
            latitude: parseFloat(station.latitude),
            longitude: parseFloat(station.longitude),
            latitudeDelta: 0.5,
            longitudeDelta: 0.5,
          });
        }
      } else {
        Alert.alert('Error', 'Could not load station details');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch station data');
    } finally {
      setLoadingStationData(false);
    }
  };

  // Show DWLR graph
  const showDwlrGraph = async () => {
    if (!selectedStation) return;
    
    setGraphLoading(true);
    setShowGraphModal(true);
    
    try {
      const toDate = new Date().toISOString().split('T')[0];
      const fromDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const response = await fetchEnhancedWaterLevelData(selectedStation.stationcode, 30, 'cgwb');
      
      if (!response.error) {
        setSelectedGraphData(response.data);
      } else {
        Alert.alert('Error', 'No graph data available for this station');
        setShowGraphModal(false);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load graph data');
      setShowGraphModal(false);
    } finally {
      setGraphLoading(false);
    }
  };

  // Refresh data
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const filterParams = {
        stateCode: selectedState?.statecode,
        districtCode: selectedDistrict?.districtcode,
        blockCode: selectedBlock?.blockcode,
        agencyId: selectedAgency?.agencyid
      };
      
      const response = await fetchAllStations(filterParams);
      if (!response.error && response.data) {
        updateStations(response.data);
        setCgwbDataLoaded(true);
        Alert.alert('Success', 'Data refreshed successfully');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh data');
    } finally {
      setRefreshing(false);
    }
  }, [selectedState, selectedDistrict, selectedBlock, selectedAgency]);

  // Get status color helper
  const getStatusColor = (status) => {
    switch (status) {
      case 'critical': return '#ff4444';
      case 'warning': return '#ffaa00';
      case 'caution': return '#ff9500';
      case 'normal': return '#00C851';
      default: return '#666';
    }
  };

  // Get station status
  const getStationStatus = (station) => {
    const criticalStation = criticalZones.find(cz => cz.stationcode === station.stationcode);
    if (criticalStation) {
      return criticalStation.status;
    }
    return station.isDwlr ? 'normal' : 'manual';
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedState(null);
    setSelectedDistrict(null);
    setSelectedBlock(null);
    setSelectedAgency(null);
    setSearchQuery('');
    setFilterType('all');
  };

  // Open maps setup instructions
  const openMapsSetupInstructions = () => {
    Alert.alert(
      "Maps Not Configured",
      "To enable map view, you need to properly set up react-native-maps. Would you like to view setup instructions?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "View Instructions", onPress: () => 
          Linking.openURL("https://github.com/react-native-maps/react-native-maps/blob/master/docs/installation.md")
        }
      ]
    );
  };

  // Filter buttons component
  const FilterButtons = () => (
    <View style={styles.filterContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {[
          { key: 'all', label: 'All Stations', icon: 'broadcast-tower' },
          { key: 'telemetric', label: 'DWLR', icon: 'satellite-dish' },
          { key: 'critical', label: 'Critical', icon: 'exclamation-triangle' },
          { key: 'manual', label: 'Manual', icon: 'tools' }
        ].map(filter => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterButton,
              filterType === filter.key && styles.filterButtonActive
            ]}
            onPress={() => setFilterType(filter.key)}
          >
            <Icon
              name={filter.icon}
              size={14}
              color={filterType === filter.key ? '#fff' : '#666'}
            />
            <Text
              style={[
                styles.filterButtonText,
                filterType === filter.key && styles.filterButtonTextActive
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      <TouchableOpacity
        style={styles.filterSettingsButton}
        onPress={() => setFilterModalVisible(true)}
      >
        <Icon name="filter" size={16} color="#007cff" />
        <Text style={styles.filterSettingsText}>Filters</Text>
      </TouchableOpacity>
    </View>
  );

  // View mode selector
  const ViewModeSelector = () => (
    <View style={styles.viewModeContainer}>
      {[
        { key: 'grid', icon: 'th-large' },
        { key: 'list', icon: 'list' },
        ...(MAPS_AVAILABLE ? [{ key: 'map', icon: 'map' }] : [])
      ].map(mode => (
        <TouchableOpacity
          key={mode.key}
          style={[
            styles.viewModeButton,
            viewMode === mode.key && styles.viewModeButtonActive
          ]}
          onPress={() => setViewMode(mode.key)}
        >
          <Icon
            name={mode.icon}
            size={16}
            color={viewMode === mode.key ? '#007cff' : '#666'}
          />
        </TouchableOpacity>
      ))}
      
      {viewMode === 'map' && MAPS_AVAILABLE && (
        <TouchableOpacity
          style={styles.legendButton}
          onPress={() => setShowLegend(!showLegend)}
        >
          <Icon
            name={showLegend ? 'eye-slash' : 'eye'}
            size={16}
            color="#666"
          />
          <Text style={styles.legendButtonText}>Legend</Text>
        </TouchableOpacity>
      )}

      {!MAPS_AVAILABLE && (
        <TouchableOpacity
          style={styles.mapSetupButton}
          onPress={openMapsSetupInstructions}
        >
          <Icon name="map" size={16} color="#ff9500" />
          <Text style={styles.mapSetupText}>Setup Maps</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  // Filter modal component
  const FilterModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={filterModalVisible}
      onRequestClose={() => setFilterModalVisible(false)}
    >
      <View style={styles.filterModalContainer}>
        <View style={styles.filterModalContent}>
          <View style={styles.filterModalHeader}>
            <Text style={styles.filterModalTitle}>Filter DWLR Stations</Text>
            <TouchableOpacity
              onPress={() => setFilterModalVisible(false)}
              style={styles.filterModalClose}
            >
              <Icon name="times" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          {loadingFilters ? (
            <View style={styles.filterLoadingContainer}>
              <ActivityIndicator size="large" color="#007cff" />
              <Text style={styles.filterLoadingText}>Loading filters...</Text>
              {apiRetryCount > 0 && (
                <Text style={styles.retryText}>Retry attempt {apiRetryCount} of 3</Text>
              )}
            </View>
          ) : (
            <ScrollView style={styles.filterOptions}>
              <Text style={styles.filterSectionTitle}>Search</Text>
              <View style={styles.searchContainer}>
                <Icon name="search" size={16} color="#999" style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search by station name or code"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>
              
              <Text style={styles.filterSectionTitle}>Location</Text>
              <Text style={styles.filterLabel}>State</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
                <TouchableOpacity
                  style={[styles.filterPill, !selectedState && styles.filterPillActive]}
                  onPress={() => setSelectedState(null)}
                >
                  <Text style={[styles.filterPillText, !selectedState && styles.filterPillTextActive]}>
                    All States
                  </Text>
                </TouchableOpacity>
                {Array.isArray(states) && states.map(state => (
                  <TouchableOpacity
                    key={state.statecode}
                    style={[styles.filterPill, selectedState?.statecode === state.statecode && styles.filterPillActive]}
                    onPress={() => setSelectedState(state)}
                  >
                    <Text style={[styles.filterPillText, selectedState?.statecode === state.statecode && styles.filterPillTextActive]}>
                      {state.statename || state.districtname}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              
              {selectedState && (
                <>
                  <Text style={styles.filterLabel}>District</Text>
                  <View style={styles.placeholderContainer}>
                    <Text style={styles.placeholderText}>Select state first</Text>
                  </View>
                </>
              )}
              
              <Text style={styles.filterSectionTitle}>Agency</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
                <TouchableOpacity
                  style={[styles.filterPill, !selectedAgency && styles.filterPillActive]}
                  onPress={() => setSelectedAgency(null)}
                >
                  <Text style={[styles.filterPillText, !selectedAgency && styles.filterPillTextActive]}>
                    All Agencies
                  </Text>
                </TouchableOpacity>
                {Array.isArray(agencies) && agencies.map(agency => (
                  <TouchableOpacity
                    key={agency.agencyid}
                    style={[styles.filterPill, selectedAgency?.agencyid === agency.agencyid && styles.filterPillActive]}
                    onPress={() => setSelectedAgency(agency)}
                  >
                    <Text style={[styles.filterPillText, selectedAgency?.agencyid === agency.agencyid && styles.filterPillTextActive]}>
                      {agency.agencyname}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </ScrollView>
          )}
          
          <View style={styles.filterModalFooter}>
            <TouchableOpacity
              style={styles.clearFiltersButton}
              onPress={clearFilters}
            >
              <Text style={styles.clearFiltersText}>Clear All Filters</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.applyFiltersButton}
              onPress={() => setFilterModalVisible(false)}
            >
              <Text style={styles.applyFiltersText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  // Station detail modal
  const StationDetailModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <View style={styles.modalTitleContainer}>
              <Icon name="broadcast-tower" size={20} color="#007cff" />
              <Text style={styles.modalTitle}>
                {selectedStation?.stationname || selectedStation?.stationcode || 'Station Details'}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Icon name="times" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          {loadingStationData ? (
            <View style={styles.modalLoading}>
              <ActivityIndicator size="large" color="#007cff" />
              <Text style={styles.loadingText}>Loading station data...</Text>
            </View>
          ) : stationDetails ? (
            <ScrollView style={styles.modalBody}>
              <View style={styles.stationInfoGrid}>
                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>Station Code</Text>
                  <Text style={styles.infoValue}>{selectedStation?.stationcode}</Text>
                </View>
                
                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>Type</Text>
                  <Text style={styles.infoValue}>
                    {selectedStation?.isDwlr ? 'DWLR (Telemetric)' : 'Manual'}
                  </Text>
                </View>
                
                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>District</Text>
                  <Text style={styles.infoValue}>{selectedStation?.districtname || 'N/A'}</Text>
                </View>
                
                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>Data Source</Text>
                  <Text style={styles.infoValue}>{selectedStation?.source?.toUpperCase() || 'N/A'}</Text>
                </View>
              </View>

              {stationDetails.basic?.analytics && (
                <View style={styles.analyticsCard}>
                  <Text style={styles.analyticsCardTitle}>Water Level Information</Text>
                  
                  {stationDetails.basic.analytics.latestReading && (
                    <View style={styles.readingContainer}>
                      <Text style={styles.readingValue}>
                        {Math.abs(stationDetails.basic.analytics.latestReading.value)?.toFixed(2) || 'N/A'}
                      </Text>
                      <Text style={styles.readingUnit}>meters below ground</Text>
                    </View>
                  )}
                  
                  <View style={styles.statusContainer}>
                    <View style={[
                      styles.statusBadge, 
                      { backgroundColor: getStatusColor(getStationStatus(selectedStation)) }
                    ]}>
                      <Text style={styles.statusText}>
                        {getStationStatus(selectedStation)?.toUpperCase() || 'UNKNOWN'}
                      </Text>
                    </View>
                  </View>
                  
                  {stationDetails.basic.analytics.trend && (
                    <Text style={styles.trendText}>
                      Trend: {stationDetails.basic.analytics.trend}
                    </Text>
                  )}
                  
                  {selectedStation?.isDwlr && (
                    <TouchableOpacity
                      style={styles.graphButton}
                      onPress={showDwlrGraph}
                    >
                      <Icon name="chart-line" size={16} color="#007cff" />
                      <Text style={styles.graphButtonText}>View DWLR Graph</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              {!stationDetails.basic && (
                <View style={styles.noDataContainer}>
                  <Icon name="database" size={40} color="#ccc" />
                  <Text style={styles.noDataText}>No detailed data available</Text>
                  {selectedStation?.isDwlr && (
                    <TouchableOpacity
                      style={styles.graphButton}
                      onPress={showDwlrGraph}
                    >
                      <Icon name="chart-line" size={16} color="#007cff" />
                      <Text style={styles.graphButtonText}>View DWLR Graph</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </ScrollView>
          ) : (
            <View style={styles.modalLoading}>
              <Text style={styles.errorText}>No data available for this station</Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );

  // Graph modal component
  const GraphModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showGraphModal}
      onRequestClose={() => setShowGraphModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <View style={styles.modalTitleContainer}>
              <Icon name="chart-line" size={20} color="#007cff" />
              <Text style={styles.modalTitle}>
                DWLR Data - {selectedStation?.stationcode}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowGraphModal(false)}
            >
              <Icon name="times" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          {graphLoading ? (
            <View style={styles.modalLoading}>
              <ActivityIndicator size="large" color="#007cff" />
              <Text style={styles.loadingText}>Loading graph data...</Text>
            </View>
          ) : selectedGraphData ? (
            <ScrollView style={styles.modalBody}>
              <View style={styles.graphContainer}>
                <Text style={styles.graphTitle}>Water Level Trend (Last 30 Days)</Text>
                
                {selectedGraphData.values && selectedGraphData.values.length > 0 ? (
                  <>
                    <View style={styles.graphStats}>
                      <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Current Level</Text>
                        <Text style={styles.statValue}>
                          {selectedGraphData.values[selectedGraphData.values.length - 1]}m
                        </Text>
                      </View>
                      <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Min Level</Text>
                        <Text style={styles.statValue}>
                          {Math.min(...selectedGraphData.values).toFixed(2)}m
                        </Text>
                      </View>
                      <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Max Level</Text>
                        <Text style={styles.statValue}>
                          {Math.max(...selectedGraphData.values).toFixed(2)}m
                        </Text>
                      </View>
                    </View>
                    
                    <View style={styles.graphPlaceholder}>
                      <Icon name="chart-line" size={40} color="#007cff" />
                      <Text style={styles.graphPlaceholderText}>DWLR Graph Visualization</Text>
                      <Text style={styles.graphInfo}>
                        {selectedGraphData.values.length} readings available
                      </Text>
                    </View>
                  </>
                ) : (
                  <View style={styles.noDataContainer}>
                    <Icon name="chart-bar" size={40} color="#ccc" />
                    <Text style={styles.noDataText}>No graph data available</Text>
                  </View>
                )}
              </View>
            </ScrollView>
          ) : (
            <View style={styles.modalLoading}>
              <Text style={styles.errorText}>Failed to load graph data</Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );

  // Station card component for grid view
  const StationCard = ({ station }) => {
    const status = getStationStatus(station);
    const statusColor = getStatusColor(status);

    return (
      <TouchableOpacity
        style={styles.stationCard}
        onPress={() => handleStationPress(station)}
      >
        <View style={styles.stationCardHeader}>
          <View style={[styles.statusIndicator, { backgroundColor: statusColor }]} />
          <Text style={styles.stationName} numberOfLines={2}>
            {station.stationname || station.stationcode}
          </Text>
        </View>
        
        <View style={styles.stationInfo}>
          <View style={styles.infoRow}>
            <Icon name="map-pin" size={12} color="#666" />
            <Text style={styles.infoText}>District: {station.districtname || 'N/A'}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Icon name={station.isDwlr ? 'satellite-dish' : 'broadcast-tower'} size={12} color="#666" />
            <Text style={styles.infoText}>
              {station.isDwlr ? 'DWLR' : 'Manual'}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Icon name="database" size={12} color="#666" />
            <Text style={styles.infoText}>Source: {station.source?.toUpperCase() || 'N/A'}</Text>
          </View>
        </View>
        
        <View style={styles.stationFooter}>
          <Text style={styles.stationCode}>{station.stationcode}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>
              {status.toUpperCase()}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Station list item for list view
  const StationListItem = ({ station }) => {
    const status = getStationStatus(station);
    const statusColor = getStatusColor(status);

    return (
      <TouchableOpacity
        style={styles.stationListItem}
        onPress={() => handleStationPress(station)}
      >
        <View style={styles.listItemLeft}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <View style={styles.listItemInfo}>
            <Text style={styles.listItemName} numberOfLines={1}>
              {station.stationname || station.stationcode}
            </Text>
            <Text style={styles.listItemDetails}>
              {station.stationcode} • {station.districtname} • {station.isDwlr ? 'DWLR' : 'Manual'}
            </Text>
          </View>
        </View>
        
        <View style={styles.listItemRight}>
          <Icon 
            name={station.isDwlr ? 'satellite-dish' : 'broadcast-tower'} 
            size={16} 
            color="#666" 
          />
          <Text style={styles.listItemType}>
            {station.source?.toUpperCase() || 'N/A'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007cff" />
        <Text style={styles.loadingText}>Loading monitoring data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>DWLR Station Monitoring</Text>
        <Text style={styles.headerSubtitle}>
          Real-time groundwater monitoring • {filteredStations.length} of {stations.length} stations
        </Text>
      </LinearGradient>

      <FilterButtons />
      <ViewModeSelector />

      {/* Analytics Summary */}
      {analytics && (
        <View style={styles.analyticsSummary}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryValue}>{analytics.activeStations}</Text>
              <Text style={styles.summaryLabel}>Active</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryValue}>{analytics.dwlrStations}</Text>
              <Text style={styles.summaryLabel}>DWLR</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryValue}>{analytics.criticalStations}</Text>
              <Text style={styles.summaryLabel}>Critical</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryValue}>{analytics.averageWaterLevel}m</Text>
              <Text style={styles.summaryLabel}>Avg Depth</Text>
            </View>
          </ScrollView>
        </View>
      )}

      <View style={styles.contentContainer}>
        {viewMode === 'map' ? (
          <View style={styles.mapFallback}>
            <Icon name="map" size={40} color="#ccc" />
            <Text style={styles.mapFallbackText}>
              Map view requires react-native-maps setup
            </Text>
            <TouchableOpacity 
              style={styles.mapSetupButtonLarge}
              onPress={openMapsSetupInstructions}
            >
              <Text style={styles.mapSetupTextLarge}>Setup Instructions</Text>
            </TouchableOpacity>
          </View>
        ) : viewMode === 'grid' ? (
          <FlatList
            key={`grid-${listKeyRef.current}`} // Fix for numColumns change issue
            data={filteredStations}
            keyExtractor={(item) => item.stationcode}
            numColumns={2}
            renderItem={({ item }) => <StationCard station={item} />}
            contentContainerStyle={styles.gridContainer}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Icon name="search-location" size={40} color="#ccc" />
                <Text style={styles.emptyText}>No stations found for selected filter</Text>
                <TouchableOpacity onPress={clearFilters} style={styles.clearFiltersButtonSmall}>
                  <Text style={styles.clearFiltersTextSmall}>Clear Filters</Text>
                </TouchableOpacity>
              </View>
            }
          />
        ) : (
          <FlatList
            key={`list-${listKeyRef.current}`} // Fix for list re-render issue
            data={filteredStations}
            keyExtractor={(item) => item.stationcode}
            renderItem={({ item }) => <StationListItem station={item} />}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Icon name="search-location" size={40} color="#ccc" />
                <Text style={styles.emptyText}>No stations found for selected filter</Text>
                <TouchableOpacity onPress={clearFilters} style={styles.clearFiltersButtonSmall}>
                  <Text style={styles.clearFiltersTextSmall}>Clear Filters</Text>
                </TouchableOpacity>
              </View>
            }
          />
        )}
      </View>

      <StationDetailModal />
      <GraphModal />
      <FilterModal />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 5,
  },
  filterContainer: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  filterButtonActive: {
    backgroundColor: '#007cff',
  },
  filterButtonText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 5,
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  filterSettingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
  },
  filterSettingsText: {
    fontSize: 12,
    color: '#007cff',
    marginLeft: 5,
  },
  viewModeContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 10,
    justifyContent: 'flex-end',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  viewModeButton: {
    padding: 8,
    marginLeft: 10,
    borderRadius: 5,
  },
  viewModeButtonActive: {
    backgroundColor: '#f0f8ff',
  },
  legendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    marginLeft: 15,
    borderRadius: 5,
    backgroundColor: '#f8f9fa',
  },
  legendButtonText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 5,
  },
  mapSetupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    marginLeft: 15,
    borderRadius: 5,
    backgroundColor: '#fff8e1',
  },
  mapSetupText: {
    fontSize: 12,
    color: '#ff9500',
    marginLeft: 5,
  },
  analyticsSummary: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 15,
    elevation: 1,
  },
  summaryCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 15,
    marginRight: 15,
    alignItems: 'center',
    minWidth: 80,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007cff',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  contentContainer: {
    flex: 1,
  },
  gridContainer: {
    padding: 15,
  },
  listContainer: {
    padding: 15,
  },
  stationCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    margin: 5,
    padding: 15,
    flex: 1,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    maxWidth: width / 2 - 20,
  },
  stationCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
    marginTop: 2,
  },
  stationName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  stationInfo: {
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  infoText: {
    fontSize: 11,
    color: '#666',
    marginLeft: 5,
  },
  stationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stationCode: {
    fontSize: 10,
    color: '#999',
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: 'bold',
  },
  stationListItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
  },
  listItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  listItemInfo: {
    flex: 1,
  },
  listItemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  listItemDetails: {
    fontSize: 12,
    color: '#666',
  },
  listItemRight: {
    alignItems: 'center',
  },
  listItemType: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
  },
  mapFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  mapFallbackText: {
    marginTop: 15,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 5,
  },
  mapSetupButtonLarge: {
    backgroundColor: '#ff9500',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    marginTop: 15,
  },
  mapSetupTextLarge: {
    color: 'white',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f7fa',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
    padding: 20,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginBottom: 15,
  },
  clearFiltersButtonSmall: {
    backgroundColor: '#007cff',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  clearFiltersTextSmall: {
    color: 'white',
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: height * 0.8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
  },
  closeButton: {
    padding: 5,
  },
  modalBody: {
    padding: 20,
  },
  modalLoading: {
    padding: 40,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  stationInfoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  infoCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 15,
    width: '48%',
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  analyticsCard: {
    backgroundColor: '#f0f8ff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  analyticsCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  readingContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 15,
  },
  readingValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007cff',
  },
  readingUnit: {
    fontSize: 16,
    color: '#666',
    marginLeft: 5,
  },
  statusContainer: {
    marginBottom: 15,
  },
  trendText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  graphButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  graphButtonText: {
    color: '#007cff',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  noDataContainer: {
    alignItems: 'center',
    padding: 30,
  },
  noDataText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
    textAlign: 'center',
  },
  graphContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
  },
  graphTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  graphStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007cff',
  },
  graphPlaceholder: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
  },
  graphPlaceholderText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
    marginBottom: 5,
  },
  graphInfo: {
    fontSize: 12,
    color: '#888',
  },
  filterModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterModalContent: {
    backgroundColor: '#fff',
    borderRadius: 15,
    width: '90%',
    maxHeight: '80%',
    overflow: 'hidden',
  },
  filterModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  filterModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  filterModalClose: {
    padding: 5,
  },
  filterOptions: {
    padding: 20,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 20,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
    color: '#555',
  },
  filterScroll: {
    marginBottom: 20,
  },
  filterPill: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  filterPillActive: {
    backgroundColor: '#007cff',
  },
  filterPillText: {
    fontSize: 12,
    color: '#666',
  },
  filterPillTextActive: {
    color: '#fff',
  },
  placeholderContainer: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  placeholderText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
  filterModalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  clearFiltersButton: {
    padding: 10,
  },
  clearFiltersText: {
    color: '#666',
  },
  applyFiltersButton: {
    backgroundColor: '#007cff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  applyFiltersText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  filterLoadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterLoadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#666',
  },
  retryText: {
    marginTop: 5,
    fontSize: 12,
    color: '#888',
  },
});

export default MonitoringScreen;