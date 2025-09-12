import axios from "axios";

const API_BASE_URL = "http://192.168.11.209:3000/api/indiawris"; // Replace with your server's address

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 30000,
});

export const fetchStates = () => {
  return apiClient.post("/masterState/StateList", { datasetcode: "GWATERLVL" });
};

export const fetchDistrictsByState = (statecode) => {
  return apiClient.post("/masterDistrict/getDistrictbyState", {
    statecode,
    datasetcode: "GWATERLVL",
  });
};

export const fetchStations = (district_id, agencyid = '') => {
  // Ensure district_id is a string, which the API requires
  return apiClient.post('/masterStation/getMasterStation', { 
    district_id: district_id.toString(), // <-- APPLY FIX HERE
    agencyid: agencyid.toString(), // <-- ADDED .toString() for extra safety
    datasetcode: "GWATERLVL" 
  });
};

export const fetchTelemetricStations = (district_id, agencyid = "") => {
  return apiClient.post("/masterStationDS/stationDSList", {
    district_id: district_id.toString(),
    agencyid: agencyid.toString(),
    datasetcode: "GWATERLVL",
    telemetric: "true",
  });
};
