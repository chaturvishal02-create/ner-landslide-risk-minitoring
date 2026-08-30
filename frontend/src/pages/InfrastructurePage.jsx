import { useState, useEffect } from 'react';
import { infrastructureAPI, locationsAPI } from '../services/api';
import { useToast } from '../components/Toast';
import { Building2, Navigation, Users, ShieldAlert } from 'lucide-react';

export default function InfrastructurePage() {
  const toast = useToast();
  const [locations, setLocations] = useState([]);
  const [selectedLocId, setSelectedLocId] = useState('ALL');
  const [infraList, setInfraList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [locRes, infraRes] = await Promise.all([locationsAPI(), infrastructureAPI()]);
        setLocations(locRes.data.locations || []);
        setInfraList(infraRes.data.infrastructure || []);
      } catch (err) {
        toast('Failed to load infrastructure data', 'error');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredInfra = selectedLocId === 'ALL'
    ? infraList
    : infraList.filter((item) => item.location_id === selectedLocId);

  const getVulnerabilityBadge = (vuln) => {
    switch (vuln) {
      case 'CRITICAL':
        return <span className="risk-badge CRITICAL">CRITICAL</span>;
      case 'VERY HIGH':
        return <span className="risk-badge VERY-HIGH">VERY HIGH</span>;
      case 'HIGH':
        return <span className="risk-badge HIGH">HIGH</span>;
      case 'MODERATE':
        return <span className="risk-badge MODERATE">MODERATE</span>;
      default:
        return <span className="risk-badge LOW">LOW</span>;
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'Road':
        return '🛣️';
      case 'Bridge':
        return '🌉';
      case 'Hospital':
        return '🏥';
      case 'School':
        return '🏫';
      case 'Village':
        return '🏘️';
      default:
        return '🏢';
    }
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1>Infrastructure Vulnerability Assessment</h1>
          <p>Critical lifeline assets in landslide influence zones — <strong style={{ color: 'var(--accent-yellow)' }}>DEMO DATA</strong></p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <label className="form-label" style={{ marginBottom: 0 }}>Filter by Sector:</label>
          <select
            className="form-select"
            style={{ width: 220 }}
            value={selectedLocId}
            onChange={(e) => setSelectedLocId(e.target.value)}
          >
            <option value="ALL">All Monitored Sectors</option>
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
          <p className="loading-text">Loading infrastructure asset registry...</p>
        </div>
      ) : (
        <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
          {filteredInfra.map((item) => (
            <div key={item.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 24 }}>{getIcon(item.type)}</span>
                    <div>
                      <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{item.name}</h3>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Type: {item.type}</span>
                    </div>
                  </div>
                  {getVulnerabilityBadge(item.vulnerability)}
                </div>

                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.4 }}>
                  {item.description}
                </p>
              </div>

              <div style={{
                background: 'var(--bg-secondary)',
                borderRadius: 8,
                padding: '10px 14px',
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 12,
                border: '1px solid var(--border)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)' }}>
                  <Navigation size={14} color="var(--accent-cyan)" />
                  <span>Proximity: <strong style={{ color: 'var(--text-primary)' }}>{item.distance_km} km</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)' }}>
                  <Users size={14} color="var(--accent-yellow)" />
                  <span>Impact: <strong style={{ color: 'var(--text-primary)' }}>{item.population_affected.toLocaleString()} pop.</strong></span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
