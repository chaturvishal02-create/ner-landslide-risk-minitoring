import { useEffect, useState } from 'react';
import { dashboardAPI } from '../services/api';
import { MapPin, AlertTriangle, Activity, CloudRain, TrendingUp, Bell } from 'lucide-react';
import { useToast } from '../components/Toast';

function RiskBadge({ level }) {
  const cls = level?.replace(' ', '-') || 'LOW';
  return <span className={`risk-badge ${cls}`}>{level || 'N/A'}</span>;
}

function formatTime(ts) {
  if (!ts) return '—';
  const d = new Date(ts + 'Z');
  return d.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'short', timeStyle: 'short' });
}

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const toast = useToast();

  const load = async () => {
    try {
      const res = await dashboardAPI();
      setData(res.data);
      setError(null);
    } catch (err) {
      setError('Failed to load dashboard data. Is the backend running?');
      toast('Backend connection failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); const t = setInterval(load, 30000); return () => clearInterval(t); }, []);

  if (loading) return (
    <div className="loading-container">
      <div className="spinner" />
      <p className="loading-text">Loading dashboard data...</p>
    </div>
  );

  if (error) return (
    <div className="empty-state">
      <div className="empty-state-icon">⚠</div>
      <p className="empty-state-title">Connection Error</p>
      <p className="empty-state-desc">{error}</p>
      <button className="btn btn-primary" onClick={load} style={{ marginTop: 16 }}>Retry</button>
    </div>
  );

  const stats = [
    { label: 'Monitored Locations', value: data.total_locations, icon: MapPin, color: 'blue', desc: 'NER states' },
    { label: 'High Risk Locations', value: data.high_risk_locations, icon: TrendingUp, color: 'orange', desc: 'Risk ≥ HIGH' },
    { label: 'Critical Locations', value: data.critical_locations, icon: AlertTriangle, color: 'red', desc: 'Risk ≥ 85' },
    { label: 'Active Alerts', value: data.active_alerts, icon: Bell, color: 'red', desc: 'Unacknowledged' },
    { label: 'Max Rainfall', value: `${data.current_max_rainfall}mm`, icon: CloudRain, color: 'cyan', desc: 'Current peak' },
    { label: 'Avg Rainfall', value: `${data.average_rainfall}mm`, icon: Activity, color: 'blue', desc: 'Across all sites' },
  ];

  return (
    <div>
      <div className="page-header">
        <h1>Command Dashboard</h1>
        <p>Real-time situational overview — <strong style={{ color: 'var(--accent-yellow)' }}>DEMO MONITORING DATA</strong></p>
      </div>

      <div className="stat-grid">
        {stats.map(({ label, value, icon: Icon, color, desc }) => (
          <div key={label} className={`stat-card ${color}`}>
            <div className={`stat-icon ${color}`}><Icon size={20} /></div>
            <div className="stat-value">{value}</div>
            <div className="stat-label">{label}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{desc}</div>
          </div>
        ))}
      </div>

      {data.total_predictions > 0 && (
        <div className="card" style={{ marginBottom: 20, padding: '14px 20px' }}>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            <strong style={{ color: 'var(--accent-cyan)' }}>{data.total_predictions}</strong> AI predictions run in this session
          </span>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <span className="card-title">Recent Alerts</span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Last 5 alerts</span>
        </div>
        {data.recent_alerts?.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: 13 }}>
            No active alerts
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Severity</th>
                  <th>Location</th>
                  <th>Risk Score</th>
                  <th>Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.recent_alerts.map(alert => (
                  <tr key={alert.id}>
                    <td>
                      <RiskBadge level={alert.severity?.replace('_', ' ')} />
                    </td>
                    <td style={{ fontWeight: 600 }}>{alert.location_name}</td>
                    <td>
                      <span className="mono" style={{ color: alert.risk_score >= 85 ? 'var(--critical)' : alert.risk_score >= 70 ? 'var(--very-high)' : 'var(--high)', fontWeight: 700 }}>
                        {alert.risk_score}/100
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{formatTime(alert.timestamp)}</td>
                    <td>
                      <span style={{
                        fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 10,
                        background: alert.status === 'ACTIVE' ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)',
                        color: alert.status === 'ACTIVE' ? 'var(--critical)' : 'var(--accent-green)',
                      }}>
                        {alert.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
