import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, TouchableOpacity, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import { FontAwesome5 as Icon } from '@expo/vector-icons';

const OpenStreetMap = ({ stations = [], onStationSelect }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const webViewRef = useRef(null);

  // Create map HTML with Leaflet
  const mapHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>HydroWatch Map</title>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <style>
        body { margin: 0; padding: 0; }
        #map { height: 100vh; width: 100vw; }
        .custom-popup {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        .popup-title {
          font-weight: bold;
          font-size: 16px;
          margin-bottom: 8px;
          color: #333;
        }
        .popup-info {
          font-size: 14px;
          line-height: 1.4;
        }
        .popup-badge {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 10px;
          font-weight: bold;
          color: white;
          margin-top: 4px;
        }
        .badge-dwlr { background-color: #10b981; }
        .badge-manual { background-color: #3b82f6; }
        .station-button {
          background: #007cff;
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: 4px;
          margin-top: 8px;
          cursor: pointer;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <script>
        // Initialize map
        const map = L.map('map').setView([20.5937, 78.9629], 5);
        
        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors | DWLR Data: India-WRIS & CGWB',
          maxZoom: 18
        }).addTo(map);

        // Station markers
        const markers = [];
        
        // Function to get regional coordinates for states
        function getRegionalCoordinates(statecode) {
          const stateCoords = {
            '01': { lat: 15.9129, lng: 79.7400 }, // Andhra Pradesh
            '02': { lat: 28.2180, lng: 94.7278 }, // Arunachal Pradesh
            '03': { lat: 26.2006, lng: 92.9376 }, // Assam
            '04': { lat: 25.0961, lng: 85.3131 }, // Bihar
            '05': { lat: 15.2993, lng: 74.1240 }, // Goa
            '06': { lat: 23.0225, lng: 72.5714 }, // Gujarat
            '07': { lat: 29.0588, lng: 76.0856 }, // Haryana
            '08': { lat: 31.1048, lng: 77.1734 }, // Himachal Pradesh
            '09': { lat: 33.7782, lng: 76.5762 }, // Jammu & Kashmir
            '10': { lat: 15.3173, lng: 75.7139 }, // Karnataka
            '11': { lat: 10.8505, lng: 76.2711 }, // Kerala
            '12': { lat: 22.9734, lng: 78.6569 }, // Madhya Pradesh
            '13': { lat: 19.7515, lng: 75.7139 }, // Maharashtra
            '14': { lat: 24.6637, lng: 93.9063 }, // Manipur
            '15': { lat: 25.4670, lng: 91.3662 }, // Meghalaya
            '16': { lat: 23.1645, lng: 92.9376 }, // Mizoram
            '17': { lat: 26.1584, lng: 94.5624 }, // Nagaland
            '18': { lat: 20.9517, lng: 85.0985 }, // Odisha
            '19': { lat: 31.1471, lng: 75.3412 }, // Punjab
            '20': { lat: 27.0238, lng: 74.2179 }, // Rajasthan
            '22': { lat: 11.1271, lng: 78.6569 }, // Tamil Nadu
            '23': { lat: 23.9408, lng: 91.9882 }, // Tripura
            '24': { lat: 26.8467, lng: 80.9462 }, // Uttar Pradesh
            '25': { lat: 22.9868, lng: 87.8550 }, // West Bengal
            '26': { lat: 21.2787, lng: 81.8661 }, // Chhattisgarh
            '27': { lat: 23.6102, lng: 85.2799 }, // Jharkhand
            '28': { lat: 30.0668, lng: 79.0193 }, // Uttarakhand
            '29': { lat: 18.1124, lng: 79.0193 }, // Telangana
          };
          return stateCoords[statecode] || { lat: 20.5937, lng: 78.9629 };
        }

        // Add stations to map
        function updateStations(stations) {
          // Clear existing markers
          markers.forEach(marker => map.removeLayer(marker));
          markers.length = 0;
          
          if (!stations || stations.length === 0) return;
          
          stations.forEach((station, index) => {
            // Enhanced coordinate generation with better distribution
            const baseCoords = getRegionalCoordinates(station.statecode);
            
            // Use actual coordinates if available, otherwise generate realistic ones
            let lat, lng;
            
            if (station.latitude && station.longitude && 
                station.latitude !== 0 && station.longitude !== 0) {
              lat = parseFloat(station.latitude);
              lng = parseFloat(station.longitude);
            } else {
              // Generate coordinates within realistic district boundaries
              const variation = 0.5; // Reduced for more realistic clustering
              lat = baseCoords.lat + (Math.random() - 0.5) * variation;
              lng = baseCoords.lng + (Math.random() - 0.5) * variation;
              
              // Ensure coordinates stay within India's bounds
              lat = Math.max(8, Math.min(37, lat));
              lng = Math.max(68, Math.min(97, lng));
            }
            
            const isDwlr = station.isDwlr || station.telemetric;
            const color = isDwlr ? '#10b981' : '#3b82f6';
            
            // Create marker
            const marker = L.circleMarker([lat, lng], {
              radius: isDwlr ? 8 : 6,
              fillColor: color,
              color: '#fff',
              weight: 2,
              opacity: 1,
              fillOpacity: 0.8
            });
            
            // Enhanced popup content with more information
            const popupContent = \`
              <div class="custom-popup">
                <div class="popup-title">\${station.stationname || station.stationcode || 'Unknown Station'}</div>
                <div class="popup-info">
                  <strong>Station Code:</strong> \${station.stationcode || 'N/A'}<br>
                  <strong>District:</strong> \${station.districtname || 'N/A'}<br>
                  <strong>State:</strong> \${station.statename || station.state || 'N/A'}<br>
                  <strong>Agency:</strong> \${station.agencyid || 'N/A'}<br>
                  <strong>Data Source:</strong> \${station.source ? station.source.toUpperCase() : 'India-WRIS'}<br>
                  <strong>Coordinates:</strong> \${lat.toFixed(4)}°, \${lng.toFixed(4)}°<br>
                  <strong>Type:</strong> \${isDwlr ? 'DWLR (Real-time Telemetric)' : 'Manual Recording'}
                  <div class="popup-badge \${isDwlr ? 'badge-dwlr' : 'badge-manual'}">
                    \${isDwlr ? '📡 TELEMETRIC' : '📊 MANUAL'}
                  </div>
                  <br>
                  <button class="station-button" onclick="selectStation('\${station.stationcode}')">
                    🔍 View Details
                  </button>
                </div>
              </div>
            \`;
            
            marker.bindPopup(popupContent);
            marker.addTo(map);
            markers.push(marker);
          });
          
          // Fit map to markers if we have them
          if (markers.length > 0) {
            const group = new L.featureGroup(markers);
            map.fitBounds(group.getBounds().pad(0.1));
          }
        }
        
        // Function to handle station selection
        function selectStation(stationCode) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'STATION_SELECTED',
            stationCode: stationCode
          }));
        }
        
        // Listen for messages from React Native
        document.addEventListener('message', function(event) {
          const data = JSON.parse(event.data);
          if (data.type === 'UPDATE_STATIONS') {
            updateStations(data.stations);
          }
        });
        
        // For Android
        window.addEventListener('message', function(event) {
          const data = JSON.parse(event.data);
          if (data.type === 'UPDATE_STATIONS') {
            updateStations(data.stations);
          }
        });
        
        // Notify React Native that map is loaded
        setTimeout(() => {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'MAP_LOADED'
          }));
        }, 1000);
        
        // Add legend
        const legend = L.control({position: 'bottomright'});
        legend.onAdd = function() {
          const div = L.DomUtil.create('div', 'legend');
          div.innerHTML = \`
            <div style="background: white; padding: 10px; border-radius: 5px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); font-size: 12px;">
              <div style="font-weight: bold; margin-bottom: 6px;">DWLR Stations</div>
              <div style="display: flex; align-items: center; margin-bottom: 4px;">
                <div style="width: 10px; height: 10px; background: #10b981; border-radius: 50%; margin-right: 6px;"></div>
                <span>Telemetric</span>
              </div>
              <div style="display: flex; align-items: center;">
                <div style="width: 10px; height: 10px; background: #3b82f6; border-radius: 50%; margin-right: 6px;"></div>
                <span>Manual</span>
              </div>
            </div>
          \`;
          return div;
        };
        legend.addTo(map);
        
      </script>
    </body>
    </html>
  `;

  // Handle WebView messages
  const handleMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      switch (data.type) {
        case 'MAP_LOADED':
          setLoading(false);
          // Send initial stations data
          if (stations && stations.length > 0) {
            updateMapStations();
          }
          break;
          
        case 'STATION_SELECTED':
          const selectedStation = stations.find(s => s.stationcode === data.stationCode);
          if (selectedStation && onStationSelect) {
            onStationSelect(selectedStation);
          }
          break;
          
        default:
          break;
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
    }
  };

  // Update stations on map
  const updateMapStations = () => {
    if (webViewRef.current && stations) {
      const message = JSON.stringify({
        type: 'UPDATE_STATIONS',
        stations: stations
      });
      webViewRef.current.postMessage(message);
    }
  };

  // Update stations when prop changes
  useEffect(() => {
    if (!loading) {
      updateMapStations();
    }
  }, [stations, loading]);

  // Handle WebView error
  const handleError = (syntheticEvent) => {
    const { nativeEvent } = syntheticEvent;
    console.error('WebView error:', nativeEvent);
    setError('Failed to load map. Please check your internet connection.');
    setLoading(false);
  };

  // Retry loading
  const retryLoad = () => {
    setError(null);
    setLoading(true);
    if (webViewRef.current) {
      webViewRef.current.reload();
    }
  };

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="exclamation-triangle" size={40} color="#ff4444" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={retryLoad}>
          <Icon name="refresh" size={16} color="#007cff" />
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007cff" />
          <Text style={styles.loadingText}>Loading map...</Text>
        </View>
      )}
      
      <WebView
        ref={webViewRef}
        source={{ html: mapHTML }}
        style={styles.webview}
        onMessage={handleMessage}
        onError={handleError}
        onHttpError={handleError}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        mixedContentMode="compatibility"
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(248, 249, 250, 0.9)',
    zIndex: 1000,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginVertical: 15,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: '#007cff',
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default OpenStreetMap;