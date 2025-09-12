import React, { createContext, useState, useContext } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState({ connected: false, message: 'Connecting...' });

  const value = {
    states,
    setStates,
    districts,
    setDistricts,
    stations,
    setStations,
    loading,
    setLoading,
    apiStatus,
    setApiStatus,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  return useContext(AppContext);
};