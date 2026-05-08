import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

// Multiple secure fallbacks for ISS position
const ISS_ENDPOINTS = [
  'https://api.wheretheiss.at/v1/satellites/25544',
  'https://api.corquaid.com/iss/current', // Mock/Alternative if primary fails
];

const ASTROS_API = 'https://corquaid.github.io/international-space-station-api/stats/astros.json';
const GEO_API = 'https://nominatim.openstreetmap.org/reverse';

export const useISSTracker = () => {
  const [position, setPosition] = useState(null);
  const [history, setHistory] = useState([]);
  const [speed, setSpeed] = useState(0);
  const [speedHistory, setSpeedHistory] = useState([]);
  const [astros, setAstros] = useState({ people: [], number: 0 });
  const [locationName, setLocationName] = useState('Fetching location...');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const lastGeocodePos = useRef({ lat: 0, lon: 0 });

  const fetchAstros = async () => {
    try {
      const res = await axios.get(ASTROS_API);
      setAstros({
        number: res.data.number || res.data.people?.length || 0,
        people: res.data.people || []
      });
    } catch (err) {
      console.error('Astros Error:', err);
    }
  };

  const fetchLocationName = async (lat, lon) => {
    // Only geocode if the ISS has moved significantly to save API hits (OSM policy)
    const dist = Math.sqrt(Math.pow(lat - lastGeocodePos.current.lat, 2) + Math.pow(lon - lastGeocodePos.current.lon, 2));
    if (dist < 0.5 && locationName !== 'Fetching location...') return;

    try {
      const res = await axios.get(GEO_API, {
        params: { lat, lon, format: 'json', addressdetails: 1 },
        headers: { 'User-Agent': 'CosmosDashboard/1.1 (student_project_id_23)' }
      });
      const name = res.data.display_name || 'Over ocean / remote area';
      setLocationName(name);
      lastGeocodePos.current = { lat, lon };
    } catch (err) {
      setLocationName('Over ocean / remote area');
    }
  };

  const fetchPosition = useCallback(async () => {
    let success = false;
    
    // Try primary then fallback
    for (const endpoint of ISS_ENDPOINTS) {
      if (success) break;
      try {
        const res = await axios.get(endpoint);
        const data = res.data;
        
        // Handle different API response formats
        const lat = parseFloat(data.latitude || data.iss_position?.latitude);
        const lon = parseFloat(data.longitude || data.iss_position?.longitude);
        const vel = data.velocity || 27600; // Default ISS speed if missing

        if (!isNaN(lat) && !isNaN(lon)) {
          const newPos = { latitude: lat, longitude: lon, timestamp: Date.now() / 1000 };
          
          setPosition(newPos);
          setSpeed(vel);
          setHistory(h => [...h.slice(-14), newPos]);
          setSpeedHistory(h => [...h.slice(-29), { speed: vel, time: new Date().toLocaleTimeString() }]);
          
          fetchLocationName(lat, lon);
          setLoading(false);
          setError(null);
          success = true;
        }
      } catch (err) {
        console.warn(`Endpoint ${endpoint} failed:`, err.response?.status || err.message);
      }
    }

    if (!success) {
      setError('ISS Tracking temporarily unavailable (Rate limited). Retrying...');
      setLoading(false);
    }
  }, [locationName]);

  useEffect(() => {
    fetchPosition();
    fetchAstros();
    const interval = setInterval(fetchPosition, 15000);
    return () => clearInterval(interval);
  }, [fetchPosition]);

  return {
    position,
    history,
    speed,
    speedHistory,
    astros,
    locationName,
    loading,
    error,
    refresh: fetchPosition,
  };
};
