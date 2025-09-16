import React, { createContext, useState, useContext } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState({ connected: false, message: 'Connecting...' });

  // Helper function to update stations
  const updateStations = (newStations) => {
    console.log('🔄 Updating stations in context:', newStations?.length || 0);
    setStations(newStations || []);
  };

  const value = {
    states,
    setStates,
    districts,
    setDistricts,
    stations,
    setStations,
    updateStations,
    loading,
    setLoading,
    apiStatus,
    setApiStatus,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};