import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
  TextInput,
  RefreshControl,
  StatusBar,
  Animated,
  Easing,
  SectionList
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

// Mock data and API functions for demo
const mockStates = [
  { statecode: '01', state: 'Andhra Pradesh' },
  { statecode: '02', state: 'Arunachal Pradesh' },
  { statecode: '03', state: 'Assam' },
  { statecode: '04', state: 'Bihar' },
  { statecode: '05', state: 'Chhattisgarh' },
  { statecode: '06', state: 'Goa' },
  { statecode: '07', state: 'Gujarat' },
  { statecode: '08', state: 'Haryana' }
];

const mockDistricts = {
  '04': [
    { district_id: 110102, districtname: 'Patna' },
    { district_id: 110103, districtname: 'Gaya' },
    { district_id: 110104, districtname: 'Nalanda' }
  ]
};

const mockStations = [
  { stationcode: 'DWLR001', stationname: 'Patna Station 1', isDwlr: true, telemetric: true, districtname: 'Patna', statename: 'Bihar', agencyid: 'CGWB' },
  { stationcode: 'DWLR002', stationname: 'Patna Station 2', isDwlr: true, telemetric: true, districtname: 'Patna', statename: 'Bihar', agencyid: 'CGWB' },
  { stationcode: 'MAN001', stationname: 'Patna Manual 1', isDwlr: false, telemetric: false, districtname: 'Patna', statename: 'Bihar', agencyid: 'STATE' },
  { stationcode: 'MAN002', stationname: 'Patna Manual 2', isDwlr: false, telemetric: false, districtname: 'Patna', statename: 'Bihar', agencyid: 'STATE' }
];

// Mock API functions
const mockAPI = {
  fetchStates: () => Promise.resolve({ data: mockStates, error: false }),
  fetchDistricts: (statecode) => Promise.resolve({ data: mockDistricts[statecode] || [], error: false }),
  fetchAllStations: ({ district_id }) => {
    // Simulate API delay
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({ data: mockStations, error: false });
      }, 1000);
    });
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
  
  // Filter state
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [loadingFilters, setLoadingFilters] = useState(false);
  
  // Filter options - FIXED: Proper state management
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  
  // Selected filters - FIXED: Clear dependent filters when parent changes
  const [selectedState, setSelectedState] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  
  // Station data - FIXED: Separate loading and display states
  const [allStations, setAllStations] = useState([]);
  const [displayStations, setDisplayStations] = useState([]);
  const [loadingStations, setLoadingStations] = useState(false);
  
  // Search state - FIXED: Debounced search without screen jitter
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const searchTimeoutRef = useRef(null);
  
  // Station type filter - NEW: Navigation between telemetry/manual
  const [stationTypeFilter, setStationTypeFilter] = useState('all'); // 'all', 'telemetry', 'manual'
  
  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // FIXED: Debounced search without triggering re-renders
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // FIXED: Filter stations only when necessary, memoized for performance
  const filteredStations = useMemo(() => {
    let filtered = [...allStations];

    // Apply search filter
    if (debouncedSearchQuery.trim()) {
      const query = debouncedSearchQuery.toLowerCase();
      filtered = filtered.filter(station => 
        (station.stationname?.toLowerCase().includes(query)) ||
        (station.stationcode?.toLowerCase().includes(query)) ||
        (station.districtname?.toLowerCase().includes(query))
      );
    }

    // Apply station type filter
    switch (stationTypeFilter) {
      case 'telemetry':
        filtered = filtered.filter(station => station.isDwlr || station.telemetric);
        break;
      case 'manual':
        filtered = filtered.filter(station => !station.isDwlr && !station.telemetric);
        break;
      default:
        // Show all
        break;
    }

    return filtered;
  }, [allStations, debouncedSearchQuery, stationTypeFilter]);

  // FIXED: Organize stations into sections for better navigation
  const stationSections = useMemo(() => {
    const telemetricStations = filteredStations.filter(station => station.isDwlr || station.telemetric);
    const manualStations = filteredStations.filter(station => !station.isDwlr && !station.telemetric);
    
    const sections = [];
    
    if (stationTypeFilter === 'all' || stationTypeFilter === 'telemetry') {
      if (telemetricStations.length > 0) {
        sections.push({
          title: 'Telemetric DWLR Stations',
          data: telemetricStations,
          type: 'telemetry',
          count: telemetricStations.length
        });
      } else if (stationTypeFilter === 'telemetry') {
        sections.push({
          title: 'Telemetric DWLR Stations',
          data: [],
          type: 'telemetry',
          count: 0,
          isEmpty: true
        });
      }
    }
    
    if (stationTypeFilter === 'all' || stationTypeFilter === 'manual') {
      if (manualStations.length > 0) {
        sections.push({
          title: 'Manual Monitoring Stations',
          data: manualStations,
          type: 'manual',
          count: manualStations.length
        });
      } else if (stationTypeFilter === 'manual') {
        sections.push({
          title: 'Manual Monitoring Stations',
          data: [],
          type: 'manual',
          count: 0,
          isEmpty: true
        });
      }
    }
    
    return sections;
  }, [filteredStations, stationTypeFilter]);

  // Load initial data
  useEffect(() => {
    loadFilterOptions();
    startAnimations();
  }, []);

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

  // FIXED: Improved filter loading
  const loadFilterOptions = async () => {
    setLoadingFilters(true);
    try {
      const statesResponse = await mockAPI.fetchStates();
      if (!statesResponse.error) {
        setStates(statesResponse.data);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load filter options');
    } finally {
      setLoadingFilters(false);
    }
  };

  // FIXED: Clear dependent filters when state changes
  const handleStateChange = async (state) => {
    setSelectedState(state);
    setSelectedDistrict(null); // Clear district
    setDistricts([]); // Clear districts list
    setAllStations([]); // Clear previous stations
    setDisplayStations([]);
    
    if (state) {
      try {
        const districtsResponse = await mockAPI.fetchDistricts(state.statecode);
        if (!districtsResponse.error) {
          setDistricts(districtsResponse.data);
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to load districts');
      }
    }
  };

  // FIXED: Clear stations when district changes
  const handleDistrictChange = (district) => {
    setSelectedDistrict(district);
    setAllStations([]); // Clear previous stations
    setDisplayStations([]);
  };

  // FIXED: Better station search with loading states
  const searchStations = async () => {
    if (!selectedDistrict) {
      Alert.alert('District Required', 'Please select a district to search for stations.');
      return;
    }

    setLoadingStations(true);
    try {
      const response = await mockAPI.fetchAllStations({
        district_id: selectedDistrict.district_id
      });

      if (!response.error && response.data) {
        setAllStations(response.data);
        setDisplayStations(response.data);
        Alert.alert('Success', `Found ${response.data.length} stations in ${selectedDistrict.districtname}`);
      } else {
        setAllStations([]);
        setDisplayStations([]);
        Alert.alert('No Results', 'No stations found for the selected area.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to search stations. Please try again.');
      setAllStations([]);
      setDisplayStations([]);
    } finally {
      setLoadingStations(false);
    }
  };

  // FIXED: Proper filter clearing
  const clearAllFilters = () => {
    setSelectedState(null);
    setSelectedDistrict(null);
    setDistricts([]);
    setSearchQuery('');
    setDebouncedSearchQuery('');
    setStationTypeFilter('all');
    setAllStations([]);
    setDisplayStations([]);
  };

  // Station card component
  const StationCard = React.memo(({ station }) => {
    const statusColor = station.isDwlr || station.telemetric ? COLORS.accent : COLORS.secondary;
    const stationType = station.isDwlr || station.telemetric ? 'DWLR' : 'Manual';
    const iconName = station.isDwlr || station.telemetric ? 'satellite-dish' : 'clipboard-list';
    
    return (
      <TouchableOpacity
        style={styles.stationCard}
        onPress={() => {
          setSelectedStation(station);
          setModalVisible(true);
        }}
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
              <CustomIcon name="building" size={12} color="rgba(255,255,255,0.8)" />
              <Text style={styles.infoText}>{station.agencyid}</Text>
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

  // FIXED: Improved dropdown component without screen jitter
  const FilterDropdown = React.memo(({ title, data, selectedItem, onSelect, placeholder, loading = false }) => {
    const [isOpen, setIsOpen] = useState(false);
    
    const getSelectedText = () => {
      if (!selectedItem) return placeholder;
      return selectedItem.state || selectedItem.districtname || selectedItem.tehsilname || selectedItem.blockname || selectedItem.agencyname || placeholder;
    };
    
    return (
      <View style={styles.filterSection}>
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

  // NEW: Station type navigation bar
  const StationTypeNavBar = () => (
    <View style={styles.typeNavBar}>
      <TouchableOpacity
        style={[styles.typeNavItem, stationTypeFilter === 'all' && styles.typeNavItemActive]}
        onPress={() => setStationTypeFilter('all')}
      >
        <CustomIcon name="list" size={16} color={stationTypeFilter === 'all' ? '#fff' : COLORS.primary} />
        <Text style={[styles.typeNavText, stationTypeFilter === 'all' && styles.typeNavTextActive]}>
          All Stations
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.typeNavItem, stationTypeFilter === 'telemetry' && styles.typeNavItemActive]}
        onPress={() => setStationTypeFilter('telemetry')}
      >
        <CustomIcon name="satellite-dish" size={16} color={stationTypeFilter === 'telemetry' ? '#fff' : COLORS.accent} />
        <Text style={[styles.typeNavText, stationTypeFilter === 'telemetry' && styles.typeNavTextActive]}>
          Telemetric
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.typeNavItem, stationTypeFilter === 'manual' && styles.typeNavItemActive]}
        onPress={() => setStationTypeFilter('manual')}
      >
        <CustomIcon name="clipboard-list" size={16} color={stationTypeFilter === 'manual' ? '#fff' : COLORS.secondary} />
        <Text style={[styles.typeNavText, stationTypeFilter === 'manual' && styles.typeNavTextActive]}>
          Manual
        </Text>
      </TouchableOpacity>
    </View>
  );

  // Empty state for telemetry stations
  const EmptyTelemetryMessage = () => (
    <View style={styles.emptySection}>
      <CustomIcon name="satellite-dish" size={40} color={COLORS.muted} />
      <Text style={styles.emptyTitle}>No Telemetric DWLR Stations</Text>
      <Text style={styles.emptySubtext}>
        Real-time telemetric stations are not available in this area.
      </Text>
      <Text style={styles.emptyAction}>
        Request your local government to install DWLR systems for better groundwater monitoring.
      </Text>
    </View>
  );

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
            {/* Search Input - FIXED: No screen jitter */}
            <View style={styles.searchSection}>
              <Text style={styles.filterLabel}>Search Stations</Text>
              <View style={styles.searchContainer}>
                <CustomIcon name="search" size={16} color={COLORS.muted} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Type station name or code..."
                  placeholderTextColor={COLORS.muted}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  returnKeyType="search"
                />
              </View>
            </View>
            
            {/* Location Filters */}
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
                onSelect={handleDistrictChange}
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
  const StationDetailModal = () => (
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

          <ScrollView style={styles.modalBody}>
            <View style={styles.detailGrid}>
              <View style={styles.detailCard}>
                <Text style={styles.detailLabel}>Station Code</Text>
                <Text style={styles.detailValue}>{selectedStation?.stationcode}</Text>
              </View>
              
              <View style={styles.detailCard}>
                <Text style={styles.detailLabel}>Type</Text>
                <Text style={styles.detailValue}>
                  {selectedStation?.isDwlr || selectedStation?.telemetric ? 'Telemetric DWLR' : 'Manual'}
                </Text>
              </View>
              
              <View style={styles.detailCard}>
                <Text style={styles.detailLabel}>District</Text>
                <Text style={styles.detailValue}>{selectedStation?.districtname}</Text>
              </View>
              
              <View style={styles.detailCard}>
                <Text style={styles.detailLabel}>State</Text>
                <Text style={styles.detailValue}>{selectedStation?.statename}</Text>
              </View>
              
              <View style={styles.detailCard}>
                <Text style={styles.detailLabel}>Agency</Text>
                <Text style={styles.detailValue}>{selectedStation?.agencyid}</Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  // Render section header
  const renderSectionHeader = ({ section }) => (
    <View style={[
      styles.sectionHeader,
      { backgroundColor: section.type === 'telemetry' ? COLORS.accent : COLORS.secondary }
    ]}>
      <Text style={styles.sectionHeaderText}>{section.title}</Text>
      <Text style={styles.sectionCountText}>{section.count} stations</Text>
    </View>
  );

  // Render station item
  const renderStationItem = ({ item }) => <StationCard station={item} />;

  // Render empty section
  const renderEmptySection = ({ section }) => {
    if (section.type === 'telemetry' && section.isEmpty) {
      return <EmptyTelemetryMessage />;
    }
    return null;
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
                {filteredStations.length} stations loaded
              </Text>
            </View>
          </Animated.View>
          
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setFilterModalVisible(true)}
          >
            <CustomIcon name="filter" size={16} color="#fff" />
            <Text style={styles.filterButtonText}>Filters</Text>
          </TouchableOpacity>
        </View>
      </CustomGradient>

      {/* Content */}
      <Animated.View style={[styles.contentContainer, { opacity: fadeAnim }]}>
        {allStations.length > 0 && <StationTypeNavBar />}
        
        {loadingStations ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading stations...</Text>
          </View>
        ) : allStations.length > 0 ? (
          <SectionList
            sections={stationSections}
            keyExtractor={(item) => item.stationcode}
            renderItem={renderStationItem}
            renderSectionHeader={renderSectionHeader}
            renderSectionFooter={renderEmptySection}
            contentContainerStyle={styles.sectionListContent}
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
          />
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
  // Station Type Navigation
  typeNavBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  typeNavItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  typeNavItemActive: {
    backgroundColor: COLORS.primary,
  },
  typeNavText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
    color: COLORS.muted,
  },
  typeNavTextActive: {
    color: '#fff',
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
  // Section List
  sectionListContent: {
    padding: 16,
    paddingBottom: 100,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
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
  // Station Card
  stationCard: {
    borderRadius: 16,
    marginBottom: 12,
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
    marginBottom: 10,
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
  emptySection: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    margin: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.dark,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyAction: {
    fontSize: 12,
    color: COLORS.muted,
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
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
  searchSection: {
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.dark,
    marginLeft: 12,
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
});

export default ImprovedMonitoringScreen;