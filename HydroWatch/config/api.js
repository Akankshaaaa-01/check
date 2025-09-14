// config/api.js
// API Configuration for HydroWatch India

// IMPORTANT: Update these URLs before running the app
// Replace 'YOUR_SERVER_IP' with your actual server IP address

// For local development, you can find your IP by running:
// Windows: ipconfig
// Mac/Linux: ifconfig
// Look for your local network IP (usually starts with 192.168.x.x or 10.x.x.x)

const API_CONFIG = {
  // Backend Server Configuration
  SERVER_IP: '10.109.1.168', // Replace with your server IP (e.g., '192.168.1.100')
  SERVER_PORT: '3001',
  
  // Development URLs (most common)
  DEVELOPMENT: {
    BASE_URL: `http://YOUR_SERVER_IP:3001/api/indiawris`,
    ENHANCED_URL: `http://YOUR_SERVER_IP:3001/api`
  },
  
  // Production URLs (if deploying)
  PRODUCTION: {
    BASE_URL: 'https://your-domain.com/api/indiawris',
    ENHANCED_URL: 'https://your-domain.com/api'
  }
};

// Auto-detect environment and set URLs
const isDevelopment = __DEV__ || process.env.NODE_ENV !== 'production';

export const API_BASE_URL = isDevelopment 
  ? API_CONFIG.DEVELOPMENT.BASE_URL.replace('YOUR_SERVER_IP', API_CONFIG.SERVER_IP)
  : API_CONFIG.PRODUCTION.BASE_URL;

export const ENHANCED_API_BASE_URL = isDevelopment 
  ? API_CONFIG.DEVELOPMENT.ENHANCED_URL.replace('YOUR_SERVER_IP', API_CONFIG.SERVER_IP)
  : API_CONFIG.PRODUCTION.ENHANCED_URL;

// Validation helper
export const validateConfig = () => {
  if (API_CONFIG.SERVER_IP === 'YOUR_SERVER_IP') {
    console.error('⚠️  CONFIGURATION ERROR ⚠️');
    console.error('Please update the SERVER_IP in config/api.js');
    console.error('Current IP placeholder: YOUR_SERVER_IP');
    console.error('Example: SERVER_IP: "192.168.1.100"');
    return false;
  }
  
  console.log('✅ API Configuration Valid');
  console.log(`📡 Backend URL: ${API_BASE_URL}`);
  console.log(`🔧 Enhanced URL: ${ENHANCED_API_BASE_URL}`);
  return true;
};

export default API_CONFIG;