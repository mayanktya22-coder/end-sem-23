import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

// HTTPS alternatives for production
const ISS_API = 'https://api.wheretheiss.at/v1/satellites/25544';
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

  const fetchAstros = async () => {
    try {
      const res = await axios.get(ASTROS_API);
      setAstros({
        number: res.data.number || res.data.people?.length || 0,
        people: res.data.people || []
      });
    } catch (err) {
      console.error('Error fetching astronauts:', err);
    }
  };

  const fetchLocationName = async (lat, lon) => {
    try {
      // Nominatim requires a User-Agent and an email to avoid 403 errors
      const res = await axios.get(GEO_API, {
        params: {
          lat,
          lon,
          format: 'json',
          addressdetails: 1,
        },
        headers: {
          'User-Agent': 'CosmosDashboard/1.0 (contact: student@example.com)'
        }
      });
      const name = res.data.display_name || 'Middle of the Ocean';
      setLocationName(name);
    } catch (err) {
      console.error('Geocoding Error (403 fix attempted):', err);
      setLocationName('Middle of the Ocean');
    }
  };

  const fetchPosition = useCallback(async () => {
    try {
      const res = await axios.get(ISS_API);
      const newPos = {
        latitude: parseFloat(res.data.latitude),
        longitude: parseFloat(res.data.longitude),
        timestamp: res.data.timestamp,
      };

      const currentSpeed = res.data.velocity || 0;
      setSpeed(currentSpeed);
      
      setPosition(newPos);
      setHistory(h => [...h.slice(-14), newPos]);
      setSpeedHistory(h => [...h.slice(-29), { speed: currentSpeed, time: new Date().toLocaleTimeString() }]);
      
      fetchLocationName(newPos.latitude, newPos.longitude);
      setLoading(false);
      setError(null);
    } catch (err) {
      console.error('ISS Fetch Error:', err);
      setError('Failed to fetch ISS position. Please check your connection.');
      setLoading(false);
    }
  }, []);

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
