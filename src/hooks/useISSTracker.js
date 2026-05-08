import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { calculateSpeed } from '../utils/geoUtils';

const ISS_API = 'http://api.open-notify.org/iss-now.json';
const ASTROS_API = 'http://api.open-notify.org/astros.json';
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

  const lastFetchTime = useRef(null);

  const fetchAstros = async () => {
    try {
      const res = await axios.get(ASTROS_API);
      setAstros(res.data);
    } catch (err) {
      console.error('Error fetching astronauts:', err);
    }
  };

  const fetchLocationName = async (lat, lon) => {
    try {
      const res = await axios.get(GEO_API, {
        params: {
          lat,
          lon,
          format: 'json',
          addressdetails: 1,
        },
      });
      const name = res.data.display_name || 'Middle of the Ocean';
      setLocationName(name);
    } catch (err) {
      setLocationName('Middle of the Ocean');
    }
  };

  const fetchPosition = useCallback(async () => {
    try {
      const res = await axios.get(ISS_API);
      const newPos = {
        latitude: parseFloat(res.data.iss_position.latitude),
        longitude: parseFloat(res.data.iss_position.longitude),
        timestamp: res.data.timestamp,
      };

      setPosition(prev => {
        if (prev) {
          const timeDiff = newPos.timestamp - prev.timestamp;
          if (timeDiff > 0) {
            const currentSpeed = calculateSpeed(prev, newPos, timeDiff);
            // ISS average speed is ~27,600 km/h. If calculation is wildly off due to small time diffs, we cap/smooth it.
            // But for this task, we'll show the calculated value.
            setSpeed(currentSpeed);
            setSpeedHistory(h => [...h.slice(-29), { speed: currentSpeed, time: new Date().toLocaleTimeString() }]);
          }
        }
        return newPos;
      });

      setHistory(h => [...h.slice(-14), newPos]);
      fetchLocationName(newPos.latitude, newPos.longitude);
      setLoading(false);
      setError(null);
    } catch (err) {
      setError('Failed to fetch ISS position');
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
