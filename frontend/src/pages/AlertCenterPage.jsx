import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { alertsAPI, acknowledgeAlertAPI } from '../services/api';
import { useToast } from '../components/Toast';
import { Bell, CheckCircle2, MapPin, AlertOctagon, ShieldAlert, RefreshCw } from 'lucide-react';

function formatTime(ts) {
  if (!ts) return '—';
  const d = new Date(ts.endsWith('Z') ? ts : ts + 'Z');
  return d.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'short', timeStyle: 'short' });
}

export default function AlertCenterPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [actionLoading, setActionLoading] = useState(null);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const res = await alertsAPI();
      setAlerts(res.data.alerts || []);
    } catch (err) {
      toast('Failed to retrieve alerts', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleAcknowledge = async (alertId) => {
    setActionLoading(alertId);
    try {
      await acknowledgeAlertAPI(alertId);
      toast(`Alert #${alertId} acknowledged successfully`, 'success');
      setAlerts((prev) =>
        prev.map((a) => (a.id === alertId ? { ...a, status: 'ACKNOWLEDGED' } : a))
      );
    } catch (err) {
      toast('Failed to acknowledge alert', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredAlerts = alerts.filter((alert) => {
    if (filter === 'ALL') return true;
    if (filter === 'ACTIVE') return alert.status === 'ACTIVE';
    if (filter === 'ACKNOWLEDGED') return alert.status === 'ACKNOWLEDGED';
    if (filter === 'CRITICAL') return alert.severity === 'CRITICAL';
    if (filter === 'HIGH') return alert.severity === 'HIGH' || alert.severity === 'VERY HIGH';
    return true;
  });

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1>Disaster Warning & Alert Center</h1>
          <p>Real-time threat notification log & operational dispatch — <strong style={{ color: 'var(--accent-yellow)' }}>DEMO DATA</strong></p>
        </div>
        <button className="btn btn-outline" onClick={fetchAlerts} disabled={loading}>
          <RefreshCw size={16} className={loading ? 'spinner' : ''} />
          Refresh Feed
        </button>
      </div>

      {/* Filter Chips */}
      <div className="filter-bar">
        {[
          { id: 'ALL', label: 'All Warnings' },
          { id: 'ACTIVE', label: 'Active Only' },
          { id: 'CRITICAL', label: 'Critical Severity' },
          { id: 'HIGH', label: 'High / Very High' },
          { id: 'ACKNOWLEDGED', label: 'Acknowledged' },
        ].map((item) => (
          <button
            key={item.id}
            className={`filter-chip ${filter === item.id ? 'active' : ''}`}
            onClick={() => setFilter(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner" />
          <p className="loading-text">Synchronizing threat notices...</p>
        </div>
      ) : filteredAlerts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🛡️</div>
          <p className="empty-state-title">No Alerts in Selected Filter</p>
          <p className="empty-state-desc">All monitored sectors within acceptable environmental safety thresholds.</p>
        </div>
      ) : (
        <div>
          {filteredAlerts.map((alert) => (
            <div key={alert.id} className={`alert-card ${alert.severity?.replace(' ', '_')}`}>
              <div className="alert-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span className={`risk-badge ${alert.severity?.replace(' ', '_')}`}>
                    {alert.severity}
                  </span>
                  <span className="alert-location">{alert.location_name}</span>
                  <span className="mono" style={{ fontSize: 13, fontWeight: 700, color: alert.risk_score >= 85 ? 'var(--critical)' : 'var(--very-high)' }}>
                    (Risk Index: {alert.risk_score}/100)
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span className="alert-time">{formatTime(alert.timestamp)}</span>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: 12,
                      background: alert.status === 'ACTIVE' ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)',
                      color: alert.status === 'ACTIVE' ? 'var(--critical)' : 'var(--accent-green)',
                    }}
                  >
                    {alert.status}
                  </span>
                </div>
              </div>

              <div className="alert-cause">
                <strong>Trigger Cause:</strong> {alert.cause}
              </div>

              <div className="alert-recommendation">
                <strong style={{ color: 'var(--accent-cyan)' }}>Mandatory SOP / Mitigation:</strong> {alert.recommended_action}
              </div>

              <div className="alert-actions">
                {alert.status === 'ACTIVE' && (
                  <button
                    className="btn btn-primary"
                    style={{ padding: '6px 14px', fontSize: 12 }}
                    onClick={() => handleAcknowledge(alert.id)}
                    disabled={actionLoading === alert.id}
                  >
                    <CheckCircle2 size={14} />
                    {actionLoading === alert.id ? 'Acknowledging...' : 'Acknowledge Notice'}
                  </button>
                )}
                <button
                  className="btn btn-outline"
                  style={{ padding: '6px 14px', fontSize: 12 }}
                  onClick={() => navigate('/map')}
                >
                  <MapPin size={14} /> View on GIS Map
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
