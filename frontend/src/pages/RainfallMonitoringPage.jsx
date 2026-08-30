import { useState, useEffect } from 'react';
import { rainfallAPI, locationsAPI } from '../services/api';
import { useToast } from '../components/Toast';
import { CloudRain, TrendingUp, Calendar, Clock } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export default function RainfallMonitoringPage() {
  const toast = useToast();
  const [locations, setLocations] = useState([]);
  const [selectedLocId, setSelectedLocId] = useState('loc_001');
  const [rainfallData, setRainfallData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLocations() {
      try {
        const res = await locationsAPI();
        setLocations(res.data.locations || []);
      } catch (err) {
        toast('Failed to load locations', 'error');
      }
    }
    loadLocations();
  }, []);

  useEffect(() => {
    async function loadRainfall() {
      if (!selectedLocId) return;
      setLoading(true);
      try {
        const res = await rainfallAPI(selectedLocId);
        setRainfallData(res.data.data);
      } catch (err) {
        toast('Failed to load rainfall data', 'error');
      } finally {
        setLoading(false);
      }
    }
    loadRainfall();
  }, [selectedLocId]);

  const hourlyChartData = rainfallData?.hourly
    ? rainfallData.hourly.map((val, idx) => ({
        hour: `${String(idx).padStart(2, '0')}:00`,
        rainfall: val,
      }))
    : [];

  const dailyChartData = rainfallData?.daily
    ? rainfallData.daily.map((val, idx) => ({
        day: rainfallData.days?.[idx] || `Day ${idx + 1}`,
        rainfall: val,
      }))
    : [];

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1>Rainfall Monitoring Station</h1>
          <p>Precipitation telemetry & temporal trend analysis — <strong style={{ color: 'var(--accent-yellow)' }}>DEMO MONITORING DATA</strong></p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <label className="form-label" style={{ marginBottom: 0 }}>Select Station:</label>
          <select
            className="form-select"
            style={{ width: 220 }}
            value={selectedLocId}
            onChange={(e) => setSelectedLocId(e.target.value)}
          >
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name}, {loc.state}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner" />
          <p className="loading-text">Loading rainfall telemetry...</p>
        </div>
      ) : rainfallData ? (
        <div>
          {/* Key Metrics Cards */}
          <div className="stat-grid">
            <div className="stat-card cyan">
              <div className="stat-icon cyan"><CloudRain size={20} /></div>
              <div className="stat-value">{rainfallData.current_rainfall} <span style={{ fontSize: 16 }}>mm</span></div>
              <div className="stat-label">Current Intensity (1h)</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Station: {rainfallData.location_name}</div>
            </div>

            <div className="stat-card blue">
              <div className="stat-icon blue"><Clock size={20} /></div>
              <div className="stat-value">{rainfallData.rainfall_6h} <span style={{ fontSize: 16 }}>mm</span></div>
              <div className="stat-label">Cumulative 6-Hour Rainfall</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Short-term runoff load</div>
            </div>

            <div className="stat-card orange">
              <div className="stat-icon orange"><Calendar size={20} /></div>
              <div className="stat-value">{rainfallData.rainfall_24h} <span style={{ fontSize: 16 }}>mm</span></div>
              <div className="stat-label">Cumulative 24-Hour Rainfall</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Primary trigger threshold</div>
            </div>

            <div className="stat-card yellow">
              <div className="stat-icon yellow"><TrendingUp size={20} /></div>
              <div className="stat-value">{rainfallData.rainfall_7d} <span style={{ fontSize: 16 }}>mm</span></div>
              <div className="stat-label">Cumulative 7-Day Rainfall</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Antecedent soil moisture</div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid-2">
            <div className="card">
              <div className="card-header">
                <span className="card-title">24-Hour Hourly Rainfall Profile (mm)</span>
                <span className="topbar-badge" style={{ background: 'rgba(6, 182, 212, 0.1)', color: 'var(--accent-cyan)' }}>
                  Hourly Telemetry
                </span>
              </div>
              <div style={{ height: 260, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={hourlyChartData}>
                    <defs>
                      <linearGradient id="rainGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(55, 75, 115, 0.2)" />
                    <XAxis dataKey="hour" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} />
                    <Tooltip
                      contentStyle={{ background: '#111827', borderColor: '#374b73', borderRadius: 8, fontSize: 12 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="rainfall"
                      stroke="#06b6d4"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#rainGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <span className="card-title">7-Day Daily Cumulative Precipitation (mm)</span>
                <span className="topbar-badge" style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-blue)' }}>
                  Weekly Overview
                </span>
              </div>
              <div style={{ height: 260, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(55, 75, 115, 0.2)" />
                    <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} />
                    <Tooltip
                      contentStyle={{ background: '#111827', borderColor: '#374b73', borderRadius: 8, fontSize: 12 }}
                    />
                    <Bar dataKey="rainfall" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
