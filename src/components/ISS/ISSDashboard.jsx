import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { RefreshCw } from 'lucide-react';

// ISS Icon
const issIcon = L.divIcon({
  html: `<div class="relative">
          <div class="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75"></div>
          <div class="relative bg-white p-1 rounded-lg border-2 border-slate-800 shadow-md">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path><path d="M9 12H4s.55-3.03 2-4.5c1.62-1.63 5-4.5 5-4.5"></path><path d="M12 15v5s3.03-.55 4.5-2c1.63-1.62 4.5-5 4.5-5"></path></svg>
          </div>
         </div>`,
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

function ChangeView({ center }) {
  const map = useMap();
  map.setView(center, map.getZoom());
  return null;
}

const ISSDashboard = ({ data }) => {
  const { position, history, speed, locationName, refresh } = data;

  const center = position ? [position.latitude, position.longitude] : [0, 0];
  const polylinePositions = history.map(p => [p.latitude, p.longitude]);

  return (
    <div className="dashboard-card h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-[#1a1a1a] dark:text-white">ISS Live Tracking</h2>
        <div className="flex gap-2">
          <button onClick={refresh} className="btn-refresh">Refresh Now</button>
          <button className="btn-refresh">Auto-Refresh: ON</button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatItem 
          label="Latitude / Longitude" 
          value={position ? `${position.latitude.toFixed(3)}, ${position.longitude.toFixed(3)}` : '...'} 
        />
        <StatItem 
          label="Speed" 
          value={`${speed.toLocaleString(undefined, { maximumFractionDigits: 2 })} km/h`} 
        />
        <StatItem 
          label="Nearest Place" 
          value={locationName || 'Calculating...'} 
          isSmall
        />
        <StatItem 
          label="Tracked Positions" 
          value={history.length} 
        />
      </div>

      <div className="flex-grow min-h-[400px] border border-[#eee3d8] rounded-[16px] overflow-hidden relative">
        <MapContainer center={center} zoom={3} scrollWheelZoom={true} className="z-10">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ChangeView center={center} />
          <Polyline positions={polylinePositions} color="#ef4444" weight={2} opacity={0.6} />
          {position && <Marker position={center} icon={issIcon} />}
        </MapContainer>
      </div>
    </div>
  );
};

const StatItem = ({ label, value, isSmall }) => (
  <div className="stat-box">
    <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">{label}</span>
    <span className={`font-bold ${isSmall ? 'text-xs' : 'text-lg'} text-slate-800 dark:text-slate-200 truncate`}>{value}</span>
  </div>
);

export default ISSDashboard;
