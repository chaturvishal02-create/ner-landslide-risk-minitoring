import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { locationsAPI } from '../services/api';
import { useToast } from '../components/Toast';

const RISK_COLORS = {
  LOW: '#10b981',
  MODERATE: '#eab308',
  HIGH: '#f59e0b',
  'VERY HIGH': '#f97316',
  VERY_HIGH: '#f97316',
  CRITICAL: '#ef4444',
};

const RISK_RADIUS = {
  LOW: 8, MODERATE: 10, HIGH: 12, 'VERY HIGH': 14, VERY_HIGH: 14, CRITICAL: 16,
};

function formatTime(ts) {
  if (!ts) return '—';
  const d = new Date(ts.endsWith('Z') ? ts : ts + 'Z');
  return d.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'short', timeStyle: 'short' });
}

export default function RiskMapPage() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const toast = useToast();

  const load = async () => {
    try {
      const res = await locationsAPI();
      setLocations(res.data.locations || []);
    } catch {
      toast('Failed to load location data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = locations.filter(loc => {
    const matchFilter = filter === 'ALL' || loc.risk_level === filter || loc.risk_level === filter.replace(' ', '_');
    const matchSearch = !search || loc.name.toLowerCase().includes(search.toLowerCase()) || loc.state.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const filters = ['ALL', 'LOW', 'MODERATE', 'HIGH', 'VERY HIGH', 'CRITICAL'];

  return (
    <div>
      <div className="page-header">
        <h1>Risk Map — NER India</h1>
        <p>GIS monitoring across 8 North Eastern states — <strong style={{ color: 'var(--accent-yellow)' }}>DEMO MONITORING DATA</strong></p>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <input
          className="form-input"
          style={{ maxWidth: 240 }}
          placeholder="Search location or state..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="filter-bar" style={{ marginBottom: 0 }}>
          {filters.map(f => (
            <button
              key={f}
              className={`filter-chip ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="loading-container"><div className="spinner" /><p className="loading-text">Loading map data...</p></div>
      ) : (
        <div className="map-container">
          <div className="map-overlay-badge">⚠ DEMO MONITORING DATA — Not Real-Time</div>

          <MapContainer
            center={[25.5, 92.5]}
            zoom={6}
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <ZoomControl position="bottomleft" />

            {filtered.map(loc => {
              const color = RISK_COLORS[loc.risk_level] || '#10b981';
              const radius = RISK_RADIUS[loc.risk_level] || 8;
              return (
                <CircleMarker
                  key={loc.id}
                  center={[loc.latitude, loc.longitude]}
                  radius={radius}
                  pathOptions={{
                    fillColor: color,
                    color: color,
                    fillOpacity: 0.8,
                    weight: 2,
                    opacity: 1,
                  }}
                >
                  <Popup maxWidth={280}>
                    <div className="popup-title">
                      📍 {loc.name}, {loc.state}
                    </div>
                    <div className="popup-row">
                      <span className="popup-key">Risk Level</span>
                      <span className="popup-val" style={{ color }}>{loc.risk_level}</span>
                    </div>
                    <div className="popup-row">
                      <span className="popup-key">Risk Score</span>
                      <span className="popup-val mono">{loc.risk_score}/100</span>
                    </div>
                    <div className="popup-row">
                      <span className="popup-key">Rainfall</span>
                      <span className="popup-val">{loc.rainfall} mm</span>
                    </div>
                    <div className="popup-row">
                      <span className="popup-key">Slope</span>
                      <span className="popup-val">{loc.slope}°</span>
                    </div>
                    <div className="popup-row">
                      <span className="popup-key">Elevation</span>
                      <span className="popup-val">{loc.elevation} m</span>
                    </div>
                    <div className="popup-row">
                      <span className="popup-key">Soil Type</span>
                      <span className="popup-val">{loc.soil_type}</span>
                    </div>
                    <div className="popup-row">
                      <span className="popup-key">Hist. Event</span>
                      <span className="popup-val">{loc.historical_landslide ? 'Yes ⚠' : 'No'}</span>
                    </div>
                    <div className="popup-row">
                      <span className="popup-key">Last Updated</span>
                      <span className="popup-val" style={{ fontSize: 10 }}>{formatTime(loc.last_updated)}</span>
                    </div>
                    <p style={{ fontSize: 10, color: '#94a3b8', marginTop: 8, fontStyle: 'italic' }}>
                      ⚠ DEMO DATA — not real-time
                    </p>
                  </Popup>
                </CircleMarker>
              );
            })}
          </MapContainer>

          <div className="map-legend">
            <div className="map-legend-title">Risk Level</div>
            {[
              ['CRITICAL', '#ef4444'],
              ['VERY HIGH', '#f97316'],
              ['HIGH', '#f59e0b'],
              ['MODERATE', '#eab308'],
              ['LOW', '#10b981'],
            ].map(([label, color]) => (
              <div key={label} className="legend-item">
                <div className="legend-dot" style={{ background: color }} />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {filtered.map(loc => (
          <div key={loc.id} style={{
            background: 'var(--bg-card)', border: `1px solid ${RISK_COLORS[loc.risk_level] || '#10b981'}40`,
            borderRadius: 8, padding: '6px 12px', display: 'flex', gap: 8, alignItems: 'center', fontSize: 12
          }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: RISK_COLORS[loc.risk_level] || '#10b981', flexShrink: 0 }} />
            <strong>{loc.name}</strong>
            <span style={{ color: 'var(--text-muted)' }}>{loc.risk_score}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
