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
  RefreshControl,
  StatusBar,
  Animated,
  Easing,
  Image
} from 'react-native';
import CustomGradient from '../components/CustomGradient';
import CustomIcon from '../components/CustomIcon';

const { width, height } = Dimensions.get('window');

// Color scheme
const COLORS = {
  primary: '#1e3a8a',
  secondary: '#3b82f6',
  accent: '#10b981',
  danger: '#ef4444',
  warning: '#f59e0b',
  light: '#f8fafc',
  dark: '#1e293b',
  muted: '#64748b',
  cardGradient1: ['#4f46e5', '#6366f1'],
  cardGradient2: ['#0ea5e9', '#38bdf8'],
  cardGradient3: ['#10b981', '#34d399'],
  cardGradient4: ['#f59e0b', '#fbbf24']
};

// Mock API functions
const mockAPI = {
  fetchAllStations: async ({ district_id }) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Generate mock stations based on district
    const mockStations = [
      { 
        stationcode: 'DWLR001', 
        stationname: 'Lucknow Central', 
        isDwlr: true, 
        districtname: 'Lucknow', 
        statename: 'Uttar Pradesh', 
        agencyid: 'CGWB',
        latitude: 26.8467,
        longitude: 80.9462,
        groundwaterLevel: (8 + Math.random() * 10).toFixed(1),
        trend: Math.random() > 0.5 ? 'up' : 'down'
      },
      { 
        stationcode: 'DWLR002', 
        stationname: 'Kanpur Riverside', 
        isDwlr: true, 
        districtname: 'Kanpur', 
        statename: 'Uttar Pradesh', 
        agencyid: 'CGWB',
        latitude: 26.4499,
        longitude: 80.3319,
        groundwaterLevel: (8 + Math.random() * 10).toFixed(1),
        trend: Math.random() > 0.5 ? 'up' : 'down'
      },
      { 
        stationcode: 'MAN001', 
        stationname: 'Varanasi Heritage', 
        isDwlr: false, 
        districtname: 'Varanasi', 
        statename: 'Uttar Pradesh', 
        agencyid: 'STATE',
        latitude: 25.3176,
        longitude: 82.9739,
        groundwaterLevel: (8 + Math.random() * 10).toFixed(1),
        trend: Math.random() > 0.5 ? 'up' : 'down'
      }
    ];
    
    return { data: mockStations, error: false };
  },
  
  getGroundwaterLevelData: async (stationCode) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      data: {
        currentLevel: (8 + Math.random() * 10).toFixed(1),
        trend: Math.random() > 0.5 ? 'up' : 'down',
        lastUpdated: new Date().toISOString()
      },
      error: false
    };
  }
};

const ImprovedMonitoringScreen = () => {
  // Basic state
  const [selectedStation, setSelectedStation] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loadingStationData, setLoadingStationData] = useState(false);
  const [viewMode, setViewMode] = useState('list');
  const [refreshing, setRefreshing] = useState(false);
  const [serverConnected, setServerConnected] = useState(true);
  // Removed userLocation state - no longer using expo-location
  
  // Filter state
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [loadingFilters, setLoadingFilters] = useState(false);
  
  // Filter options
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  
  // Selected filters
  const [selectedState, setSelectedState] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  
  // Station data
  const [stations, setStations] = useState([]);
  const [loadingStations, setLoadingStations] = useState(false);
  
  // Groundwater data
  const [groundwaterData, setGroundwaterData] = useState({});
  
  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Load initial data
  useEffect(() => {
    loadFilterOptions();
    startAnimations();
  }, []);

  // Removed getUserLocation function - no longer using expo-location

  const startAnimations = () => {
    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.ease,
          useNativeDriver: true,
        })
      ])
    ).start();

    // Fade in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  };

  // Load filter options
  const loadFilterOptions = async () => {
    setLoadingFilters(true);
    try {
      // Mock states data
      const mockStates = [
        { statecode: 'UP', state: 'Uttar Pradesh' },
        { statecode: 'MH', state: 'Maharashtra' },
        { statecode: 'BR', state: 'Bihar' },
        { statecode: 'WB', state: 'West Bengal' },
        { statecode: 'MP', state: 'Madhya Pradesh' },
        { statecode: 'TN', state: 'Tamil Nadu' },
        { statecode: 'RJ', state: 'Rajasthan' },
        { statecode: 'KA', state: 'Karnataka' }
      ];
      setStates(mockStates);
    } catch (error) {
      Alert.alert('Error', 'Failed to load filter options');
    } finally {
      setLoadingFilters(false);
    }
  };

  // Load districts when state changes
  const handleStateChange = async (state) => {
    setSelectedState(state);
    setSelectedDistrict(null);
    
    if (state) {
      try {
        // Mock districts data
        const mockDistricts = {
          'UP': [
            { district_id: 1, districtname: 'Lucknow' },
            { district_id: 2, districtname: 'Kanpur' },
            { district_id: 3, districtname: 'Varanasi' }
          ],
          'MH': [
            { district_id: 4, districtname: 'Mumbai' },
            { district_id: 5, districtname: 'Pune' },
            { district_id: 6, districtname: 'Nagpur' }
          ]
        };
        setDistricts(mockDistricts[state.statecode] || []);
      } catch (error) {
        Alert.alert('Error', 'Failed to load districts');
      }
    } else {
      setDistricts([]);
    }
  };

  // Search stations
  const searchStations = async () => {
    if (!selectedDistrict) {
      Alert.alert('District Required', 'Please select a district to search for stations.');
      return;
    }

    setLoadingStations(true);
    try {
      // Fetch stations from mock API
      const response = await mockAPI.fetchAllStations({
        district_id: selectedDistrict.district_id
      });

      if (!response.error && response.data) {
        setStations(response.data);
        Alert.alert('Success', `Found ${response.data.length} stations in ${selectedDistrict.districtname}`);
      } else {
        setStations([]);
        Alert.alert('No Results', 'No stations found for the selected area.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to search stations. Please try again.');
      setStations([]);
    } finally {
      setLoadingStations(false);
    }
  };

  // Handle station selection
  const handleStationPress = async (station) => {
    setSelectedStation(station);
    setLoadingStationData(true);
    setModalVisible(true);

    try {
      // Try to fetch groundwater data from mock API
      const groundwaterResponse = await mockAPI.getGroundwaterLevelData(station.stationcode);
      
      if (!groundwaterResponse.error && groundwaterResponse.data) {
        setGroundwaterData(prev => ({
          ...prev,
          [station.stationcode]: groundwaterResponse.data
        }));
      } else {
        // Use station data if API fails
        setGroundwaterData(prev => ({
          ...prev,
          [station.stationcode]: {
            currentLevel: station.groundwaterLevel,
            trend: station.trend,
            lastUpdated: new Date().toISOString()
          }
        }));
      }
    } catch (error) {
      // Fallback to station data
      setGroundwaterData(prev => ({
        ...prev,
        [station.stationcode]: {
          currentLevel: station.groundwaterLevel,
          trend: station.trend,
          lastUpdated: new Date().toISOString()
        }
      }));
    } finally {
      setLoadingStationData(false);
    }
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedState(null);
    setSelectedDistrict(null);
    setDistricts([]);
    setStations([]);
  };

  // Group stations by type
  const { telemetricStations, manualStations } = {
    telemetricStations: stations.filter(station => station.isDwlr || station.telemetric),
    manualStations: stations.filter(station => !station.isDwlr && !station.telemetric)
  };

  // Simple Map View Component (without react-native-maps)
  const SimpleMapView = () => (
    <View style={styles.simpleMapContainer}>
      <View style={styles.mapPlaceholder}>
        <CustomIcon name="map" size={50} color={COLORS.muted} />
        <Text style={styles.mapPlaceholderText}>Map View</Text>
        <Text style={styles.mapPlaceholderSubtext}>
          {stations.length} stations in {selectedDistrict?.districtname}
        </Text>
        
        {/* Display stations as markers on the placeholder map */}
        <View style={styles.stationMarkersContainer}>
          {stations.map((station, index) => (
            <TouchableOpacity
              key={station.stationcode}
              style={[
                styles.stationMarker,
                { 
                  left: `${20 + (index * 15) % 70}%`,
                  top: `${30 + (index * 10) % 50}%`,
                  backgroundColor: station.isDwlr ? COLORS.accent : COLORS.secondary
                }
              ]}
              onPress={() => handleStationPress(station)}
            >
              <CustomIcon 
                name={station.isDwlr ? 'satellite-dish' : 'clipboard-list'} 
                size={12} 
                color="#fff" 
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      {/* Station list below the map */}
      <ScrollView style={styles.mapStationList}>
        {stations.map(station => (
          <TouchableOpacity
            key={station.stationcode}
            style={styles.mapStationItem}
            onPress={() => handleStationPress(station)}
          >
            <View style={[
              styles.stationTypeIndicator,
              { backgroundColor: station.isDwlr ? COLORS.accent : COLORS.secondary }
            ]} />
            <View style={styles.mapStationInfo}>
              <Text style={styles.mapStationName}>{station.stationname}</Text>
              <Text style={styles.mapStationLocation}>{station.districtname}</Text>
            </View>
            <View style={styles.gwLevelBadge}>
              <Text style={styles.gwLevelText}>
                {groundwaterData[station.stationcode]?.currentLevel || station.groundwaterLevel}m
              </Text>
              <CustomIcon 
                name={groundwaterData[station.stationcode]?.trend === 'up' ? 'arrow-up' : 'arrow-down'} 
                size={10} 
                color={groundwaterData[station.stationcode]?.trend === 'up' ? '#4ade80' : '#f87171'} 
              />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  // Station card component
  const StationCard = React.memo(({ station }) => {
    const statusColor = station.isDwlr || station.telemetric ? COLORS.accent : COLORS.secondary;
    const stationType = station.isDwlr || station.telemetric ? 'DWLR' : 'Manual';
    const iconName = station.isDwlr || station.telemetric ? 'satellite-dish' : 'clipboard-list';
    const groundwaterInfo = groundwaterData[station.stationcode] || {
      currentLevel: station.groundwaterLevel,
      trend: station.trend
    };
    
    return (
      <TouchableOpacity
        style={styles.stationCard}
        onPress={() => handleStationPress(station)}
        activeOpacity={0.8}
      >
        <CustomGradient
          colors={station.isDwlr || station.telemetric ? COLORS.cardGradient3 : COLORS.cardGradient2}
          style={styles.stationCardGradient}
        >
          <View style={styles.stationHeader}>
            <View style={[styles.statusIndicator, { backgroundColor: statusColor }]} />
            <Text style={styles.stationName} numberOfLines={2}>
              {station.stationname || station.stationcode}
            </Text>
          </View>
          
          <View style={styles.stationInfo}>
            <View style={styles.infoRow}>
              <CustomIcon name="map-pin" size={12} color="rgba(255,255,255,0.8)" />
              <Text style={styles.infoText}>{station.districtname}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <CustomIcon name={iconName} size={12} color="rgba(255,255,255,0.8)" />
              <Text style={styles.infoText}>{stationType}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <CustomIcon name="tint" size={12} color="rgba(255,255,255,0.8)" />
              <Text style={styles.infoText}>
                GW: {groundwaterInfo.currentLevel}m 
                <CustomIcon 
                  name={groundwaterInfo.trend === 'up' ? 'arrow-up' : 'arrow-down'} 
                  size={10} 
                  color={groundwaterInfo.trend === 'up' ? '#4ade80' : '#f87171'} 
                />
              </Text>
            </View>
          </View>
          
          <View style={styles.stationFooter}>
            <Text style={styles.stationCode}>{station.stationcode}</Text>
            <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
              <Text style={styles.statusText}>
                {station.isDwlr || station.telemetric ? 'TELEMETRIC' : 'MANUAL'}
              </Text>
            </View>
          </View>
        </CustomGradient>
      </TouchableOpacity>
    );
  });

  // Improved dropdown component
  const FilterDropdown = React.memo(({ title, data, selectedItem, onSelect, placeholder, loading = false }) => {
    const [isOpen, setIsOpen] = useState(false);
    
    const getSelectedText = () => {
      if (!selectedItem) return placeholder;
      return selectedItem.state || selectedItem.districtname || placeholder;
    };
    
    return (
      <View style={[styles.filterSection, { zIndex: isOpen ? 1000 : 1 }]}>
        <Text style={styles.filterLabel}>{title}</Text>
        {loading ? (
          <View style={styles.loadingDropdown}>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        ) : (
          <View>
            <TouchableOpacity 
              style={styles.dropdownButton}
              onPress={() => setIsOpen(!isOpen)}
              activeOpacity={0.8}
            >
              <Text style={styles.dropdownButtonText} numberOfLines={1}>
                {getSelectedText()}
              </Text>
              <CustomIcon 
                name={isOpen ? "chevron-up" : "chevron-down"} 
                size={16} 
                color={COLORS.muted} 
              />
            </TouchableOpacity>
            
            {isOpen && (
              <View style={styles.dropdownMenu}>
                <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
                  <TouchableOpacity
                    style={[styles.dropdownItem, !selectedItem && styles.dropdownItemSelected]}
                    onPress={() => {
                      onSelect(null);
                      setIsOpen(false);
                    }}
                  >
                    <Text style={[styles.dropdownItemText, !selectedItem && styles.dropdownItemTextSelected]}>
                      {placeholder}
                    </Text>
                  </TouchableOpacity>
                  
                  {data.map((item, index) => {
                    const isSelected = selectedItem && (
                      selectedItem.statecode === item.statecode ||
                      selectedItem.district_id === item.district_id
                    );
                    
                    const displayText = item.state || item.districtname;
                    
                    return (
                      <TouchableOpacity
                        key={`${item.statecode || item.district_id}-${index}`}
                        style={[styles.dropdownItem, isSelected && styles.dropdownItemSelected]}
                        onPress={() => {
                          onSelect(item);
                          setIsOpen(false);
                        }}
                      >
                        <Text style={[styles.dropdownItemText, isSelected && styles.dropdownItemTextSelected]} numberOfLines={1}>
                          {displayText}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            )}
          </View>
        )}
      </View>
    );
  });

  // Filter Modal
  const FilterModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={filterModalVisible}
      onRequestClose={() => setFilterModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.filterModalContent}>
          <CustomGradient
            colors={[COLORS.primary, COLORS.secondary]}
            style={styles.filterModalHeader}
          >
            <Text style={styles.filterModalTitle}>Filter Stations</Text>
            <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
              <CustomIcon name="times" size={24} color="#fff" />
            </TouchableOpacity>
          </CustomGradient>
          
          <ScrollView style={styles.filterModalBody} keyboardShouldPersistTaps="handled">
            <FilterDropdown
              title="State"
              data={states}
              selectedItem={selectedState}
              onSelect={handleStateChange}
              placeholder="Select State"
              loading={loadingFilters}
            />
            
            {selectedState && (
              <FilterDropdown
                title="District"
                data={districts}
                selectedItem={selectedDistrict}
                onSelect={setSelectedDistrict}
                placeholder="Select District"
              />
            )}
          </ScrollView>
          
          <View style={styles.filterModalFooter}>
            <TouchableOpacity style={styles.clearButton} onPress={clearAllFilters}>
              <Text style={styles.clearButtonText}>Clear All</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.searchButton} 
              onPress={() => {
                setFilterModalVisible(false);
                searchStations();
              }}
            >
              <CustomIcon name="search" size={16} color="#fff" />
              <Text style={styles.searchButtonText}>Search Stations</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  // Station Detail Modal
  const StationDetailModal = () => {
    const groundwaterInfo = selectedStation ? groundwaterData[selectedStation.stationcode] : null;
    
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.detailModalContent}>
          <CustomGradient
            colors={[COLORS.primary, COLORS.secondary]}
            style={styles.modalHeader}
          >
              <Text style={styles.modalTitle}>
                {selectedStation?.stationname || selectedStation?.stationcode}
              </Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <CustomIcon name="times" size={20} color="#fff" />
            </TouchableOpacity>
          </CustomGradient>

            {loadingStationData ? (
              <View style={styles.modalLoading}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Loading station data...</Text>
              </View>
            ) : selectedStation ? (
              <ScrollView style={styles.modalBody}>
                <View style={styles.detailGrid}>
                  <View style={styles.detailCard}>
                    <Text style={styles.detailLabel}>Station Code</Text>
                    <Text style={styles.detailValue}>{selectedStation.stationcode}</Text>
                  </View>
                  
                  <View style={styles.detailCard}>
                    <Text style={styles.detailLabel}>Type</Text>
                    <Text style={styles.detailValue}>
                      {selectedStation.isDwlr || selectedStation.telemetric ? 'Telemetric DWLR' : 'Manual'}
                    </Text>
                  </View>
                  
                  <View style={styles.detailCard}>
                    <Text style={styles.detailLabel}>District</Text>
                    <Text style={styles.detailValue}>{selectedStation.districtname}</Text>
                  </View>
                  
                  <View style={styles.detailCard}>
                    <Text style={styles.detailLabel}>State</Text>
                    <Text style={styles.detailValue}>{selectedStation.statename}</Text>
                  </View>
                  
                  <View style={styles.detailCard}>
                    <Text style={styles.detailLabel}>Agency</Text>
                    <Text style={styles.detailValue}>{selectedStation.agencyid}</Text>
                  </View>
                </View>

                {/* Groundwater Level Section */}
                {groundwaterInfo && (
                  <View style={styles.groundwaterSection}>
                    <Text style={styles.sectionTitle}>Groundwater Level</Text>
                    <View style={styles.groundwaterCard}>
                      <View style={styles.groundwaterRow}>
                      <CustomIcon name="tint" size={20} color={COLORS.primary} />
                        <Text style={styles.groundwaterLabel}>Current Level:</Text>
                        <Text style={styles.groundwaterValue}>
                          {groundwaterInfo.currentLevel} m
                        </Text>
                      <CustomIcon 
                        name={groundwaterInfo.trend === 'up' ? 'arrow-up' : 'arrow-down'} 
                        size={16} 
                        color={groundwaterInfo.trend === 'up' ? COLORS.accent : COLORS.danger} 
                        style={styles.trendIcon}
                      />
                      </View>
                      {groundwaterInfo.lastUpdated && (
                        <Text style={styles.groundwaterTime}>
                          Last updated: {new Date(groundwaterInfo.lastUpdated).toLocaleString()}
                        </Text>
                      )}
                    </View>
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
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      
      {/* Header */}
      <CustomGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.header}>
        <View style={styles.headerContent}>
          <Animated.View style={[styles.logoSection, { transform: [{ scale: pulseAnim }] }]}>
            <View style={styles.logoCircle}>
              <CustomIcon name="satellite-dish" size={20} color="#fff" />
            </View>
            <View>
              <Text style={styles.headerTitle}>DWLR Monitoring</Text>
              <Text style={styles.headerSubtitle}>
                {stations.length} stations loaded
              </Text>
            </View>
          </Animated.View>
          
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.viewToggleButton}
              onPress={() => setViewMode(viewMode === 'list' ? 'map' : 'list')}
            >
              <CustomIcon 
                name={viewMode === 'list' ? 'map' : 'list'} 
                size={16} 
                color="#fff" 
              />
              <Text style={styles.viewToggleText}>
                {viewMode === 'list' ? 'Map View' : 'List View'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => setFilterModalVisible(true)}
            >
              <CustomIcon name="filter" size={16} color="#fff" />
              <Text style={styles.filterButtonText}>Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </CustomGradient>

      {/* Content */}
      <Animated.View style={[styles.contentContainer, { opacity: fadeAnim }]}>
        {viewMode === 'map' ? (
          <SimpleMapView />
        ) : loadingStations ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading stations...</Text>
          </View>
        ) : stations.length > 0 ? (
          <ScrollView 
            style={styles.scrollView}
            refreshControl={
              <RefreshControl 
                refreshing={refreshing} 
                onRefresh={() => {
                  setRefreshing(true);
                  setTimeout(() => setRefreshing(false), 1000);
                }}
                colors={[COLORS.primary]}
              />
            }
          >
            {/* Telemetric Stations Section */}
            {telemetricStations.length > 0 && (
              <View>
                <View style={[styles.sectionHeader, { backgroundColor: COLORS.accent }]}>
                  <Text style={styles.sectionHeaderText}>Telemetric DWLR Stations</Text>
                  <Text style={styles.sectionCountText}>{telemetricStations.length} stations</Text>
                </View>
                <View style={styles.stationsGrid}>
                  {telemetricStations.map((station) => (
                    <StationCard key={station.stationcode} station={station} />
                  ))}
                </View>
              </View>
            )}

            {/* Manual Stations Section */}
            {manualStations.length > 0 && (
              <View>
                <View style={[styles.sectionHeader, { backgroundColor: COLORS.secondary }]}>
                  <Text style={styles.sectionHeaderText}>Manual Monitoring Stations</Text>
                  <Text style={styles.sectionCountText}>{manualStations.length} stations</Text>
                </View>
                <View style={styles.stationsGrid}>
                  {manualStations.map((station) => (
                    <StationCard key={station.stationcode} station={station} />
                  ))}
                </View>
              </View>
            )}
          </ScrollView>
        ) : (
          <View style={styles.emptyContainer}>
            <CustomIcon name="search-location" size={60} color={COLORS.muted} />
            <Text style={styles.emptyText}>No Stations Loaded</Text>
            <Text style={styles.emptySubtext}>
              Select a state and district, then search for groundwater monitoring stations
            </Text>
            <TouchableOpacity 
              style={styles.searchCTAButton}
              onPress={() => setFilterModalVisible(true)}
            >
              <CustomIcon name="filter" size={16} color="#fff" />
              <Text style={styles.searchCTAText}>Open Filters</Text>
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>

      <FilterModal />
      <StationDetailModal />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewToggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
  },
  viewToggleText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  filterButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: COLORS.light,
  },
  // Simple Map View
  simpleMapContainer: {
    flex: 1,
  },
  mapPlaceholder: {
    height: 250,
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    margin: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  mapPlaceholderText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.dark,
    marginTop: 8,
  },
  mapPlaceholderSubtext: {
    fontSize: 14,
    color: COLORS.muted,
    marginTop: 4,
  },
  stationMarkersContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  stationMarker: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  mapStationList: {
    flex: 1,
  },
  mapStationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  stationTypeIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  mapStationInfo: {
    flex: 1,
  },
  mapStationName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 4,
  },
  mapStationLocation: {
    fontSize: 12,
    color: COLORS.muted,
  },
  gwLevelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  gwLevelText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.dark,
    marginRight: 4,
  },
  // Loading states
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.muted,
    fontWeight: '500',
  },
  // Scroll View
  scrollView: {
    flex: 1,
  },
  // Section Headers
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginTop: 16,
  },
  sectionHeaderText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  sectionCountText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  // Stations Grid
  stationsGrid: {
    padding: 16,
  },
  // Station Card
  stationCard: {
    borderRadius: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  stationCardGradient: {
    padding: 16,
  },
  stationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
    marginTop: 2,
  },
  stationName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    flex: 1,
    lineHeight: 20,
  },
  stationInfo: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    marginLeft: 8,
  },
  stationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stationCode: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  // Empty states
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.dark,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.muted,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  searchCTAButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  searchCTAText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  // Filter Modal
  modalContainer: {
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
  },
  filterModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  filterModalBody: {
    padding: 20,
  },
  filterSection: {
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 8,
  },
  dropdownButton: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  dropdownButtonText: {
    fontSize: 14,
    color: COLORS.dark,
    flex: 1,
    marginRight: 8,
  },
  dropdownMenu: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingVertical: 6,
    elevation: 10,
    zIndex: 1000,
    maxHeight: 200,
  },
  dropdownScroll: {
    maxHeight: 200,
  },
  dropdownItem: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  dropdownItemSelected: {
    backgroundColor: '#f0f8ff',
  },
  dropdownItemText: {
    fontSize: 14,
    color: COLORS.dark,
  },
  dropdownItemTextSelected: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  loadingDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 10,
  },
  filterModalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
  },
  clearButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#e5e7eb',
  },
  clearButtonText: {
    color: COLORS.muted,
    fontWeight: '600',
  },
  searchButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  // Detail Modal
  detailModalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    flex: 1,
  },
  modalBody: {
    padding: 20,
  },
  modalLoading: {
    padding: 40,
    alignItems: 'center',
  },
  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  detailCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  detailLabel: {
    fontSize: 12,
    color: COLORS.muted,
    marginBottom: 4,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.dark,
  },
  // Groundwater section
  groundwaterSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: 12,
  },
  groundwaterCard: {
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0f2fe',
  },
  groundwaterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  groundwaterLabel: {
    fontSize: 14,
    color: COLORS.dark,
    marginLeft: 8,
    marginRight: 8,
    fontWeight: '600',
  },
  groundwaterValue: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },
  trendIcon: {
    marginLeft: 8,
  },
  groundwaterTime: {
    fontSize: 12,
    color: COLORS.muted,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.muted,
    textAlign: 'center',
  },
});

export default ImprovedMonitoringScreen;