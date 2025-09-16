import axios from 'axios';

const CGWB_BASE_URL = 'https://gwdata.cgwb.gov.in';

export const CgwbApi = {
  // Get DWLR summary data
  getDwlrSummary: async () => {
    try {
      const response = await axios.get(`${CGWB_BASE_URL}/get-dwlr-summary`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        timeout: 30000
      });
      
      return {
        success: true,
        data: response.data,
        error: null
      };
    } catch (error) {
      console.error('CGWB API Error:', error);
      return {
        success: false,
        data: null,
        error: error.message
      };
    }
  },

  // You might need to add authentication for other endpoints
  login: async (username, password) => {
    // Implement login if needed for other endpoints
  }
};

export default CgwbApi;