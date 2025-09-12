// server.js

const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const INDIA_WRIS_BASE_URL = 'https://indiawris.gov.in';

app.post('/api/indiawris/*', async (req, res) => {
  const originalUrl = req.originalUrl;
  const indiaWrisEndpoint = originalUrl.replace('/api/indiawris', '');
  const targetUrl = `${INDIA_WRIS_BASE_URL}${indiaWrisEndpoint}`;
  
  // Enhanced logging
  console.log(`\n---\n[${new Date().toLocaleTimeString()}] Proxying request...`);
  console.log(`  -> TO: ${targetUrl}`);
  console.log(`  -> WITH BODY: ${JSON.stringify(req.body)}`); // Log the exact body
  
  try {
    const response = await axios({
      method: 'post',
      url: targetUrl,
      data: req.body,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      timeout: 30000
    });
    
    console.log('  -> SUCCESS: Request to India-WRIS was successful.');
    res.json(response.data);

  } catch (error) {
    // Enhanced error logging
    console.error('  -> PROXY ERROR: Failed to fetch data from India-WRIS.');
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error(`  -> Status: ${error.response.status}`);
      console.error(`  -> Data: ${JSON.stringify(error.response.data)}`);
      console.error(`  -> Headers: ${JSON.stringify(error.response.headers)}`);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('  -> No response received from India-WRIS server.');
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('  -> Error Message:', error.message);
    }
    res.status(500).json({ 
      error: 'Failed to fetch data from India-WRIS',
      message: error.message 
    });
  } finally {
    console.log('---');
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'HydroWatch India Proxy Server is running' });
});

app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});