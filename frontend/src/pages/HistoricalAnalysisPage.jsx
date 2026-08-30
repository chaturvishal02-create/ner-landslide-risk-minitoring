import { useState, useEffect } from 'react';
import { historicalAPI } from '../services/api';
import { useToast } from '../components/Toast';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

export default function HistoricalAnalysisPage() {
  const toast = useToast();
  const [data, setData] = useState({ events: [], monthly_summary: {} });
  const [loading, setLoading] = useState(true);
  const [selectedSeverity, setSelectedSeverity] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const res = await historicalAPI();
        setData(res.data);
      } catch (err) {
        toast('Failed to load historical records', 'error');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const events = data.events || [];
  const filteredEvents = events.filter((e) => {
    const matchSev = selectedSeverity === 'ALL' || e.severity === selectedSeverity;
    const matchQ =
      !searchQuery ||
      e.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.state.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSev && matchQ;
  });

  const scatterData = events.map((e) => ({
    rainfall: e.rainfall_mm,
    risk: e.risk_score,
    location: `${e.location}, ${e.state}`,
    date: e.date,
  }));

  const monthly2023 = data.monthly_summary?.['2023'] || {};
  const monthlyData = Object.entries(monthly2023).map(([month, val]) => ({
    month,
    alerts: val.alerts,
    events: val.events,
    avgRisk: val.avg_risk,
  }));

  return (
    <div>
      <div className="page-header">
        <h1>Historical Landslide & Meteorological Analytics</h1>
        <p>Retrospective incident correlation & seasonal risk patterns — <strong style={{ color: 'var(--accent-yellow)' }}>DEMO / SYNTHETIC DATA</strong></p>
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        {/* Rainfall vs Risk Scatter Plot */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Rainfall (mm) vs Risk Score Correlation</span>
            <span className="topbar-badge" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--critical)' }}>
              Historical Incidents
            </span>
          </div>
          <div style={{ height: 260, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(55, 75, 115, 0.2)" />
                <XAxis type="number" dataKey="rainfall" name="Rainfall" unit="mm" stroke="#64748b" fontSize={11} />
                <YAxis type="number" dataKey="risk" name="Risk Score" domain={[0, 100]} stroke="#64748b" fontSize={11} />
                <ZAxis range={[60, 140]} />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  contentStyle={{ background: '#111827', borderColor: '#374b73', borderRadius: 8, fontSize: 12 }}
                />
                <Scatter name="Historical Landslides" data={scatterData} fill="#ef4444" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Trend 2023 */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">2023 Monthly Risk & Warning Frequency</span>
            <span className="topbar-badge" style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--accent-yellow)' }}>
              Monsoon Seasonality
            </span>
          </div>
          <div style={{ height: 260, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(55, 75, 115, 0.2)" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ background: '#111827', borderColor: '#374b73', borderRadius: 8, fontSize: 12 }}
                />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 6 }} />
                <Line type="monotone" dataKey="avgRisk" name="Avg Risk Index" stroke="#f97316" strokeWidth={2} />
                <Line type="monotone" dataKey="alerts" name="Total Alerts" stroke="#3b82f6" strokeWidth={2} />
                <Line type="monotone" dataKey="events" name="Landslide Events" stroke="#ef4444" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Historical Incidents Table */}
      <div className="card">
        <div className="card-header" style={{ flexWrap: 'wrap', gap: 12 }}>
          <div>
            <span className="card-title">Documented Historical Landslide Incidents</span>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{filteredEvents.length} recorded events matching filter</div>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <input
              className="form-input"
              style={{ maxWidth: 200, padding: '6px 12px', fontSize: 12 }}
              placeholder="Search location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="filter-bar" style={{ marginBottom: 0 }}>
              {['ALL', 'CRITICAL', 'VERY HIGH', 'HIGH', 'MODERATE'].map((sev) => (
                <button
                  key={sev}
                  className={`filter-chip ${selectedSeverity === sev ? 'active' : ''}`}
                  onClick={() => setSelectedSeverity(sev)}
                  style={{ padding: '4px 10px', fontSize: 11 }}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Location & State</th>
                <th>Rainfall</th>
                <th>Slope / Elev</th>
                <th>Risk Score</th>
                <th>Severity</th>
                <th>Impact / Blockage</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.map((evt) => (
                <tr key={evt.id}>
                  <td className="mono" style={{ color: 'var(--text-muted)', fontSize: 12 }}>{evt.date}</td>
                  <td style={{ fontWeight: 600 }}>{evt.location}, {evt.state}</td>
                  <td>{evt.rainfall_mm} mm</td>
                  <td style={{ fontSize: 12 }}>{evt.slope}° / {evt.elevation}m</td>
                  <td>
                    <span className="mono" style={{ fontWeight: 700, color: evt.risk_score >= 85 ? 'var(--critical)' : 'var(--very-high)' }}>
                      {evt.risk_score}/100
                    </span>
                  </td>
                  <td>
                    <span className={`risk-badge ${evt.severity.replace(' ', '_')}`}>
                      {evt.severity}
                    </span>
                  </td>
                  <td style={{ fontSize: 12 }}>
                    {evt.road_blocked_km} km blocked · {evt.houses_damaged} homes damaged
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--text-secondary)', maxWidth: 240 }}>
                    {evt.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
