const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cron = require('node-cron');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Enhanced CORS configuration for Express 5.x
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:19006',
      'http://localhost:19000',
      'http://localhost:8081',
      /^exp:\/\/192\.168\.\d+\.\d+:19000$/,
      /^http:\/\/192\.168\.\d+\.\d+:19006$/
    ];
    
    const isAllowed = allowedOrigins.some(allowed => {
      if (typeof allowed === 'string') return origin === allowed;
      return allowed.test(origin);
    });
    
    callback(null, isAllowed || true); // Allow for development
  },
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With']
};

app.use(cors(corsOptions));

// Handle preflight requests
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Origin, X-Requested-With');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.status(200).end();
    return;
  }
  next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const INDIA_WRIS_BASE_URL = 'https://indiawris.gov.in';

// Cache for storing frequently accessed data
const dataCache = {
  states: [],
  districts: {},
  stations: {},
  telemetryData: {},
  realtimeData: {},
  lastUpdated: null
};

// Enhanced API request function with better error handling
async function makeIndiaWrisRequest(endpoint, data, maxRetries = 3) {
  const targetUrl = `${INDIA_WRIS_BASE_URL}${endpoint}`;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[Attempt ${attempt}/${maxRetries}] Request to: ${targetUrl}`);
      console.log(`Request data:`, JSON.stringify(data, null, 2));
      
      const response = await axios({
        method: 'post',
        url: targetUrl,
        data: data,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'HydroWatchIndia/1.0.0',
          'Referer': 'https://indiawris.gov.in/'
        },
        timeout: 45000
      });
      
      console.log(`Success: ${targetUrl} - Status: ${response.status}`);
      return response.data;
      
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        url: targetUrl
      });
      
      if (attempt === maxRetries) {
        throw new Error(`Failed after ${maxRetries} attempts: ${error.message}`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt - 1)));
    }
  }
}

// Specific proxy routes instead of wildcard - Express 5.x compatible
const proxyRoutes = [
  '/masterState/StateList',
  '/masterDistrict/getDistrictbyState', 
  '/masterStation/getMasterStation',
  '/masterStationDS/stationDSList',
  '/tehsil/getMasterTehsilList',
  '/block/getMasterBlockList',
  '/masterAgency/AgencyListInAnyCase',
  '/CommonDataSetMasterAPI/getCommonDataSetByStationCode'
];

// Create individual routes for each endpoint
proxyRoutes.forEach(route => {
  app.post(`/api/indiawris${route}`, async (req, res) => {
    console.log(`Proxying request to: ${route}`);
    console.log(`Request body:`, JSON.stringify(req.body, null, 2));
    
    try {
      const response = await makeIndiaWrisRequest(route, req.body);
      
      // Cache commonly requested data
      if (route.includes('StateList')) {
        dataCache.states = response.data || [];
        dataCache.lastUpdated = new Date().toISOString();
      }
      
      res.json(response);
    } catch (error) {
      console.error('Proxy error:', error.message);
      res.status(500).json({ 
        error: 'Failed to fetch data from India-WRIS',
        message: error.message,
        statusCode: 500,
        data: []
      });
    }
  });
});

// Enhanced endpoint to get real-time water level data
app.post('/api/station/water-level', async (req, res) => {
  const { stationCode, days = 30 } = req.body;
  
  if (!stationCode) {
    return res.status(400).json({ 
      error: 'Station code is required',
      statusCode: 400 
    });
  }
  
  console.log(`Fetching water level data for station: ${stationCode}`);
  
  try {
    const response = await makeIndiaWrisRequest('/CommonDataSetMasterAPI/getCommonDataSetByStationCode', {
      stationcode: stationCode,
      days: days
    });
    
    if (!response.data) {
      return res.json({
        statusCode: 404,
        message: 'No data found for this station',
        data: [],
        stationCode: stationCode
      });
    }
    
    // Process and categorize the data
    const waterLevelData = response.data
      .filter(item => 
        item.datatypeCode === 'GGZ' || 
        item.datatypeCode === 'MS4' || 
        item.datatypeDescription.toLowerCase().includes('water level')
      )
      .map(item => ({
        timestamp: item.dataTime,
        value: parseFloat(item.dataValue),
        unit: item.unitCode,
        type: item.datatypeDescription,
        typeCode: item.datatypeCode,
        isRecent: new Date(item.dataTime) > new Date(Date.now() - 24 * 60 * 60 * 1000),
        depthFromSurface: item.datatypeCode === 'GGZ' ? Math.abs(item.dataValue) : null
      }))
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // Calculate analytics
    const analytics = {
      totalReadings: waterLevelData.length,
      latestReading: waterLevelData[0] || null,
      averageLevel: waterLevelData.length > 0 
        ? waterLevelData.reduce((sum, item) => sum + item.value, 0) / waterLevelData.length 
        : null,
      trend: calculateTrend(waterLevelData),
      dataQuality: calculateDataQuality(waterLevelData, days),
      criticalStatus: assessCriticalStatus(waterLevelData)
    };
    
    // Cache the data
    dataCache.realtimeData[stationCode] = {
      data: waterLevelData,
      analytics,
      lastUpdated: new Date().toISOString()
    };
    
    res.json({
      statusCode: 200,
      message: 'Water level data fetched successfully',
      data: waterLevelData,
      analytics,
      stationCode: stationCode,
      lastUpdated: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Water level data error:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch water level data',
      message: error.message,
      statusCode: 500,
      data: []
    });
  }
});

// Calculate trend from water level data
function calculateTrend(data) {
  if (data.length < 2) return 'insufficient_data';
  
  const recent = data.slice(0, Math.min(10, data.length));
  const older = data.slice(-Math.min(10, data.length));
  
  const recentAvg = recent.reduce((sum, item) => sum + item.value, 0) / recent.length;
  const olderAvg = older.reduce((sum, item) => sum + item.value, 0) / older.length;
  
  const difference = recentAvg - olderAvg;
  const threshold = 0.1; // 10cm threshold
  
  if (Math.abs(difference) < threshold) return 'stable';
  return difference > 0 ? 'rising' : 'falling';
}

// Calculate data quality score
function calculateDataQuality(data, expectedDays) {
  const expectedReadings = expectedDays * 4; // 4 readings per day (every 6 hours)
  const actualReadings = data.length;
  const completeness = Math.min((actualReadings / expectedReadings) * 100, 100);
  
  // Check for recent data
  const latestReading = data[0];
  const hoursAgo = latestReading ? 
    (new Date() - new Date(latestReading.timestamp)) / (1000 * 60 * 60) : 999;
  const recency = hoursAgo < 12 ? 100 : hoursAgo < 24 ? 75 : hoursAgo < 48 ? 50 : 25;
  
  // Overall quality score
  const quality = (completeness * 0.7) + (recency * 0.3);
  
  return {
    score: Math.round(quality),
    completeness: Math.round(completeness),
    recency: Math.round(recency),
    status: quality >= 90 ? 'excellent' : quality >= 70 ? 'good' : quality >= 50 ? 'fair' : 'poor'
  };
}

// Assess critical status
function assessCriticalStatus(data) {
  if (data.length === 0) return { status: 'unknown', message: 'No data available' };
  
  const latest = data[0];
  const depth = Math.abs(latest.value);
  
  // Critical thresholds (these should be customized per region/aquifer)
  if (depth > 50) return { status: 'critical', message: 'Very deep water level detected' };
  if (depth > 30) return { status: 'warning', message: 'Deep water level - monitor closely' };
  if (depth > 15) return { status: 'caution', message: 'Moderate depth - within acceptable range' };
  return { status: 'normal', message: 'Water level is in good range' };
}

// Bulk water level data for multiple stations
app.post('/api/stations/bulk-water-level', async (req, res) => {
  const { stationCodes, days = 7 } = req.body;
  
  if (!stationCodes || !Array.isArray(stationCodes)) {
    return res.status(400).json({ 
      error: 'Station codes array is required',
      statusCode: 400 
    });
  }
  
  console.log(`Bulk fetching water level data for ${stationCodes.length} stations`);
  
  const results = {};
  const errors = {};
  
  const processStation = async (stationCode) => {
    try {
      const response = await makeIndiaWrisRequest('/CommonDataSetMasterAPI/getCommonDataSetByStationCode', {
        stationcode: stationCode,
        days: days
      });
      
      if (response.data && response.data.length > 0) {
        const waterLevelData = response.data
          .filter(item => item.datatypeCode === 'GGZ' || item.datatypeCode === 'MS4')
          .map(item => ({
            timestamp: item.dataTime,
            value: parseFloat(item.dataValue),
            unit: item.unitCode,
            type: item.datatypeDescription
          }))
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        results[stationCode] = {
          data: waterLevelData.slice(0, 5), // Only latest 5 readings for bulk
          latest: waterLevelData[0] || null,
          count: waterLevelData.length
        };
      } else {
        results[stationCode] = { data: [], latest: null, count: 0 };
      }
    } catch (error) {
      errors[stationCode] = error.message;
    }
  };
  
  // Process in chunks to avoid overwhelming the API
  const chunkSize = 5;
  for (let i = 0; i < stationCodes.length; i += chunkSize) {
    const chunk = stationCodes.slice(i, i + chunkSize);
    await Promise.allSettled(chunk.map(processStation));
    
    // Add delay between chunks
    if (i + chunkSize < stationCodes.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  res.json({
    statusCode: 200,
    message: `Bulk water level data processed for ${Object.keys(results).length} stations`,
    results,
    errors,
    processedAt: new Date().toISOString()
  });
});

// Health check endpoint with detailed status
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'HydroWatch India Enhanced Server is running',
    version: '2.0.0',
    expressVersion: '5.x',
    timestamp: new Date().toISOString(),
    cacheStatus: {
      states: dataCache.states.length,
      cachedStations: Object.keys(dataCache.realtimeData).length,
      lastUpdated: dataCache.lastUpdated
    },
    endpoints: {
      'POST /api/indiawris/[endpoint]': 'Proxy to India-WRIS API',
      'POST /api/station/water-level': 'Get water level data for a station',
      'POST /api/stations/bulk-water-level': 'Get water level data for multiple stations',
      'GET /api/health': 'Health check'
    }
  });
});

// Initialize cache with states data
async function initializeCache() {
  try {
    console.log('Initializing data cache...');
    
    // Fetch states
    const statesResponse = await makeIndiaWrisRequest('/masterState/StateList', {
      datasetcode: "GWATERLVL"
    });
    
    if (statesResponse.statusCode === 200) {
      dataCache.states = statesResponse.data;
      dataCache.lastUpdated = new Date().toISOString();
      console.log(`Loaded ${statesResponse.data.length} states into cache`);
    }
    
  } catch (error) {
    console.error('Failed to initialize cache:', error.message);
  }
}

// Schedule cache refresh every 2 hours
cron.schedule('0 */2 * * *', () => {
  console.log('Scheduled cache refresh started...');
  initializeCache();
});

// Clear old cached data every 6 hours
cron.schedule('0 */6 * * *', () => {
  console.log('Cleaning old cached data...');
  const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
  
  Object.keys(dataCache.realtimeData).forEach(stationCode => {
    const cacheEntry = dataCache.realtimeData[stationCode];
    if (new Date(cacheEntry.lastUpdated) < sixHoursAgo) {
      delete dataCache.realtimeData[stationCode];
    }
  });
  
  console.log(`Cleaned cache. ${Object.keys(dataCache.realtimeData).length} stations remaining`);
});

// Start server
app.listen(PORT, '0.0.0.0',async () => {
  console.log(`HydroWatch India Enhanced Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`Water level API: http://localhost:${PORT}/api/station/water-level`);
  console.log(`Bulk API: http://localhost:${PORT}/api/stations/bulk-water-level`);
  console.log(`DWLR data updates every 6 hours - Server will cache and serve real-time data`);
  
  await initializeCache();
});

// CGWB Proxy endpoint
app.get('/api/cgwb/*splat', async (req, res) => {
  const cgwbEndpoint = req.params.splat ? '/' + req.params.splat : '';
  const targetUrl = `https://gwdata.cgwb.gov.in${cgwbEndpoint}`;
  
  console.log(`Proxying to CGWB: ${targetUrl}`);
  
  try {
    const response = await axios({
      method: 'get',
      url: targetUrl,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'HydroWatchIndia/1.0.0'
      },
      timeout: 30000
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('CGWB Proxy error:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch data from CGWB',
      message: error.message 
    });
  }
});