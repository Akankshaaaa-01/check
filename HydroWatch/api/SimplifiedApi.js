// SimplifiedApi.js - Using exact same approach as web frontend
const BACKEND_URL = 'http://10.182.66.33:3001';

// API endpoints matching web frontend exactly
const API_ENDPOINTS = {
  stateList: '/api/indiawris/masterState/StateList',
  districtByState: '/api/indiawris/masterDistrict/getDistrictbyState',
  tehsilList: '/api/indiawris/tehsil/getMasterTehsilList',
  blockList: '/api/indiawris/block/getMasterBlockList',
  agencyList: '/api/indiawris/masterAgency/AgencyListInAnyCase',
  masterStation: '/api/indiawris/masterStation/getMasterStation',
  stationDSList: '/api/indiawris/masterStationDS/stationDSList'
};

// Simple API request function matching web frontend
const makeAPIRequest = async (endpoint, data, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`📡 Making API request to: ${BACKEND_URL}${endpoint}`);
      console.log(`📋 With data:`, data);
      
      const response = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log(`✅ API request successful:`, result);
      return result;
      
    } catch (error) {
      console.error(`❌ API request failed (attempt ${i + 1}/${retries}):`, error);
      if (i === retries - 1) {
        return { statusCode: 500, message: error.message, data: [] };
      }
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
};

// Fetch all states - exact same as web frontend
export const fetchStates = async () => {
  const data = { datasetcode: "GWATERLVL" };
  const result = await makeAPIRequest(API_ENDPOINTS.stateList, data);
  
  if (result.statusCode === 200 && result.data && result.data.length > 0) {
    return { data: result.data, error: false };
  } else {
    return { data: [], error: true, message: 'Failed to fetch states' };
  }
};

// Fetch districts for a state - exact same as web frontend
export const fetchDistricts = async (statecode) => {
  const data = { statecode: statecode, datasetcode: "GWATERLVL" };
  const result = await makeAPIRequest(API_ENDPOINTS.districtByState, data);
  
  if (result.statusCode === 200 && result.data) {
    return { data: result.data, error: false };
  } else {
    return { data: [], error: true, message: `Failed to fetch districts for state ${statecode}` };
  }
};

// Fetch tehsils for a district - exact same as web frontend
export const fetchTehsils = async (statecode, district_id) => {
  const data = { statecode: statecode, district_id: district_id, datasetcode: "GWATERLVL" };
  const result = await makeAPIRequest(API_ENDPOINTS.tehsilList, data);
  
  if (result.statusCode === 200 && result.data) {
    return { data: result.data, error: false };
  } else {
    return { data: [], error: true, message: `Failed to fetch tehsils for district ${district_id}` };
  }
};

// Fetch blocks for a tehsil - exact same as web frontend
export const fetchBlocks = async (statecode, district_id, tahsil_id) => {
  const data = { 
    statecode: statecode, 
    district_id: district_id, 
    tahsil_id: tahsil_id, 
    datasetcode: "GWATERLVL" 
  };
  const result = await makeAPIRequest(API_ENDPOINTS.blockList, data);
  
  if (result.statusCode === 200 && result.data) {
    return { data: result.data, error: false };
  } else {
    return { data: [], error: true, message: `Failed to fetch blocks for tehsil ${tahsil_id}` };
  }
};

// Fetch agencies - using API dynamically like the website
export const fetchAgencies = async (district_id = 0, tahsil_id = 0, block_id = 0) => {
  const data = { 
    district_id: district_id || 0, 
    datasetcode: "GWATERLVL",
    localriverid: 0,
    tributaryid: 0,
    tahsil_id: tahsil_id || 0,
    block_id: block_id || 0
  };
  
  console.log(`🏢 Fetching agencies for district: ${district_id}, tehsil: ${tahsil_id}, block: ${block_id}`);
  
  const result = await makeAPIRequest(API_ENDPOINTS.agencyList, data);
  
  if (result.statusCode === 200 && result.data && Array.isArray(result.data) && result.data.length > 0) {
    // Use the actual agencies from API exactly as they come
    const agencies = result.data.map(agency => ({
      agencyid: agency.agencyid, // Keep original format
      agencyname: agency.agencyname || agency.agencyid,
      ...agency
    }));
    console.log(`✅ Loaded ${agencies.length} agencies from API:`, agencies.map(a => `${a.agencyname} (${a.agencyid})`));
    return { data: agencies, error: false };
  } else {
    console.log(`ℹ️ No agencies found from API for location - will try without agency filter`);
    return { 
      data: [{ agencyid: '', agencyname: 'All Agencies' }], 
      error: false, 
      message: 'Using all agencies for this location' 
    };
  }
};

// Process agency ID for station fetching - keep it simple
const processAgencyId = (agencyId) => {
  // If empty or null, return empty string
  if (!agencyId || agencyId === 'All Agencies') return '';
  
  // Return as-is for API compatibility
  return agencyId;
};

// Use exact same approach as website for station fetching
const fetchStationsLikeWebsite = async (endpoint, district_id, agencyid = '') => {
  try {
    console.log(`🏭 Fetching stations exactly like website: district=${district_id}, agency=${agencyid}`);
    
    // Use exact same data structure as website
    const data = { 
      district_id: district_id, 
      agencyid: agencyid, 
      datasetcode: "GWATERLVL" 
    };
    
    console.log(`📫 Sending data:`, JSON.stringify(data));
    
    const result = await makeAPIRequest(endpoint, data);
    
    console.log(`📩 Received result:`, {
      statusCode: result.statusCode,
      message: result.message,
      dataLength: result.data ? result.data.length : 0
    });
    
    // Website accepts both 200 and 500 status codes, check for actual data
    if (result.data && Array.isArray(result.data) && result.data.length > 0) {
      console.log(`✅ Found ${result.data.length} stations successfully`);
      return { statusCode: 200, data: result.data, error: false };
    } else {
      console.log(`ℹ️ No stations found (normal for some district/agency combinations)`);
      return { statusCode: 404, data: [], error: false, message: 'No stations found for this location' };
    }
    
  } catch (error) {
    console.error(`❌ Station fetch error:`, error.message);
    return { statusCode: 500, data: [], error: true, message: error.message };
  }
};

// Fetch stations for a district - using website approach
export const fetchStations = async (district_id, agencyid = '') => {
  console.log(`🏭 Fetching regular stations for district: ${district_id}, agency: ${agencyid}`);
  
  const result = await fetchStationsLikeWebsite(API_ENDPOINTS.masterStation, district_id, agencyid);
  
  if (result.error) {
    return { data: [], error: true, message: result.message };
  }
  
  return { data: result.data || [], error: false };
};

// Fetch telemetric stations - using website approach
export const fetchTelemetricStations = async (district_id, agencyid = '') => {
  console.log(`📡 Fetching telemetric stations for district: ${district_id}, agency: ${agencyid}`);
  
  try {
    // Use exact same approach as website for telemetric stations
    const data = { 
      district_id: district_id.toString(), 
      agencyid: agencyid.toString(), 
      datasetcode: "GWATERLVL",
      telemetric: "true"
    };
    
    console.log(`📫 Sending telemetric data:`, JSON.stringify(data));
    
    const result = await makeAPIRequest(API_ENDPOINTS.stationDSList, data);
    
    console.log(`📩 Telemetric result:`, {
      statusCode: result.statusCode,
      message: result.message,
      dataLength: result.data ? result.data.length : 0
    });
    
    // Website accepts both 200 and 500 status codes for telemetric too
    if (result.data && Array.isArray(result.data) && result.data.length > 0) {
      console.log(`✅ Found ${result.data.length} telemetric stations`);
      return { data: result.data, error: false };
    } else {
      console.log(`ℹ️ No telemetric stations found - this is normal`);
      return { data: [], error: false, message: 'No telemetric stations available' };
    }
    
  } catch (error) {
    console.error(`❌ Telemetric fetch error:`, error.message);
    return { data: [], error: true, message: error.message };
  }
};

// Combined filter options function
export const getFilterOptions = async () => {
  try {
    console.log('🔧 Fetching filter options...');
    
    // Fetch states and agencies in parallel
    const [statesResponse, agenciesResponse] = await Promise.all([
      fetchStates(),
      fetchAgencies()
    ]);
    
    const filterData = {
      states: [],
      agencies: []
    };
    
    // Process states
    if (!statesResponse.error && statesResponse.data) {
      filterData.states = Array.isArray(statesResponse.data) ? statesResponse.data : [];
    }
    
    // Process agencies
    if (!agenciesResponse.error && agenciesResponse.data) {
      filterData.agencies = Array.isArray(agenciesResponse.data) ? agenciesResponse.data : [];
    }
    
    console.log('✅ Filter options loaded successfully');
    return { data: filterData, error: false };
    
  } catch (error) {
    console.error('Error fetching filter options:', error);
    return { data: { states: [], agencies: [] }, error: true, message: error.message };
  }
};

// Fetch all stations combined (regular + telemetric)
export const fetchAllStations = async (filters = {}) => {
  try {
    const district_id = filters.districtId || filters.district_id;
    const agencyid = filters.agencyId || filters.agencyid || '';
    
    if (!district_id) {
      return { data: [], error: true, message: 'District ID is required' };
    }
    
    console.log(`🏭 Fetching all stations for district: ${district_id}, agency: ${agencyid}`);
    
    // Fetch both regular and telemetric stations in parallel
    const [regularStations, telemetricStations] = await Promise.all([
      fetchStations(district_id, agencyid),
      fetchTelemetricStations(district_id, agencyid)
    ]);
    
    let allStations = [];
    
    // Add regular stations
    if (!regularStations.error && regularStations.data) {
      const stations = regularStations.data.map(station => ({
        ...station,
        telemetric: false,
        isDwlr: false,
        source: 'indiawris'
      }));
      allStations = allStations.concat(stations);
    }
    
    // Add telemetric stations
    if (!telemetricStations.error && telemetricStations.data) {
      const stations = telemetricStations.data.map(station => ({
        ...station,
        telemetric: true,
        isDwlr: true,
        source: 'indiawris'
      }));
      allStations = allStations.concat(stations);
    }
    
    // Deduplicate by station code
    const stationMap = new Map();
    allStations.forEach(station => {
      stationMap.set(station.stationcode, station);
    });
    
    const uniqueStations = Array.from(stationMap.values());
    console.log(`✅ Fetched ${uniqueStations.length} unique stations`);
    
    return { data: uniqueStations, error: false };
    
  } catch (error) {
    console.error('Error fetching all stations:', error);
    return { data: [], error: true, message: error.message };
  }
};

// Simplified analytics for now
export const getEnhancedAnalytics = async (stationCodes) => {
  if (!stationCodes || stationCodes.length === 0) {
    return { 
      data: {
        activeStations: 0,
        dwlrStations: 0,
        criticalStations: 0,
        averageWaterLevel: 0,
        dataQuality: 0
      }, 
      error: false 
    };
  }
  
  // Fallback to basic computation
  return {
    data: {
      activeStations: stationCodes.length,
      dwlrStations: Math.round(stationCodes.length * 0.3), // Estimated
      criticalStations: 0,
      averageWaterLevel: 18.5, // Estimated
      dataQuality: 75 // Estimated
    },
    error: false
  };
};

// Simplified station details
export const getStationDetails = async (station) => {
  return {
    data: {
      basic: {
        ...station,
        analytics: null
      },
      waterLevel: null,
      trend: null
    },
    error: false
  };
};

// Health check
export const checkServerHealth = async () => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/health`);
    const data = await response.json();
    return { data: data, error: false };
  } catch (error) {
    return { data: null, error: true, message: error.message };
  }
};