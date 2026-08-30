import { useState, useEffect } from 'react';
import { predictRiskAPI, locationsAPI } from '../services/api';
import { useToast } from '../components/Toast';
import { Zap, BrainCircuit, AlertOctagon, CheckCircle, RefreshCw } from 'lucide-react';

const SOIL_OPTIONS = [
  { value: 0, label: 'Alluvial (Stable)' },
  { value: 1, label: 'Sandy Loam (Moderate)' },
  { value: 2, label: 'Silty Clay Loam (Vulnerable)' },
  { value: 3, label: 'Clay (Highly Vulnerable)' },
];

const LAND_USE_OPTIONS = [
  { value: 1, label: 'Urban Settlement' },
  { value: 2, label: 'Urban / Forest Mix' },
  { value: 3, label: 'Dense Forest / Slope' },
  { value: 4, label: 'Agricultural / Terrace' },
];

export default function AIPredictionPage() {
  const toast = useToast();
  const [locations, setLocations] = useState([]);
  const [selectedLocationId, setSelectedLocationId] = useState('');
  
  const [formData, setFormData] = useState({
    rainfall: 45,
    slope: 28,
    elevation: 1450,
    soil: 2,
    land_use: 2,
    historical_landslide: 1,
  });

  const [loading, setLoading] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    async function fetchLocations() {
      try {
        const res = await locationsAPI();
        setLocations(res.data.locations || []);
      } catch (err) {
        console.error('Failed to load locations', err);
      }
    }
    fetchLocations();
  }, []);

  const handleLocationChange = (e) => {
    const locId = e.target.value;
    setSelectedLocationId(locId);
    if (!locId) return;

    const loc = locations.find((l) => l.id === locId);
    if (loc) {
      setFormData({
        rainfall: loc.rainfall,
        slope: loc.slope,
        elevation: loc.elevation,
        soil: loc.soil_code ?? 2,
        land_use: loc.land_use_code ?? 2,
        historical_landslide: loc.historical_landslide ?? 0,
      });
      toast(`Loaded preset data for ${loc.name}`, 'info');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (checked ? 1 : 0) : Number(value),
    }));
  };

  const runPrediction = async (customPayload = null) => {
    setLoading(true);
    try {
      const selectedLoc = locations.find((l) => l.id === selectedLocationId);
      const payload = customPayload || {
        ...formData,
        location_id: selectedLocationId || undefined,
        location_name: selectedLoc ? `${selectedLoc.name}, ${selectedLoc.state}` : 'Manual Simulation',
      };

      const res = await predictRiskAPI(payload);
      setResult(res.data);

      if (res.data.alert_generated) {
        toast(`🚨 Alert Generated: ${res.data.risk_level} Risk at ${payload.location_name}`, 'critical');
      } else {
        toast('Risk prediction calculated successfully', 'success');
      }
    } catch (err) {
      toast('Failed to run AI prediction', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateHeavyRainfall = async () => {
    setSimulating(true);
    try {
      // Pick Gangtok or current selected location
      let targetLoc = locations.find((l) => l.id === selectedLocationId) || locations[0];
      const newRainfall = 165; // Heavy monsoon downpour

      const updatedPayload = {
        rainfall: newRainfall,
        slope: targetLoc ? targetLoc.slope : 38,
        elevation: targetLoc ? targetLoc.elevation : 1800,
        soil: targetLoc ? targetLoc.soil_code : 3,
        land_use: targetLoc ? targetLoc.land_use_code : 2,
        historical_landslide: 1,
        location_id: targetLoc ? targetLoc.id : 'loc_001',
        location_name: targetLoc ? `${targetLoc.name}, ${targetLoc.state}` : 'Gangtok, Sikkim',
      };

      setFormData({
        rainfall: updatedPayload.rainfall,
        slope: updatedPayload.slope,
        elevation: updatedPayload.elevation,
        soil: updatedPayload.soil,
        land_use: updatedPayload.land_use,
        historical_landslide: updatedPayload.historical_landslide,
      });

      if (targetLoc) {
        setSelectedLocationId(targetLoc.id);
      }

      await runPrediction(updatedPayload);
      toast(`⚡ SIMULATION TRIGGERED: 165mm Heavy Downpour at ${updatedPayload.location_name}!`, 'critical');
    } finally {
      setSimulating(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 85) return 'var(--critical)';
    if (score >= 70) return 'var(--very-high)';
    if (score >= 50) return 'var(--high)';
    if (score >= 30) return 'var(--moderate)';
    return 'var(--low)';
  };

  return (
    <div>
      <div className="page-header">
        <h1>AI Landslide Risk Prediction</h1>
        <p>RandomForest ML Inference Engine — <strong style={{ color: 'var(--accent-yellow)' }}>DEMO / SYNTHETIC MODEL</strong></p>
      </div>

      {/* Heavy Rainfall Simulation Banner */}
      <div className="simulation-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div className="simulation-title">
              <Zap size={22} color="#f97316" />
              ⚡ Heavy Rainfall Trigger Simulation
            </div>
            <p className="simulation-desc" style={{ marginBottom: 0 }}>
              Simulate an extreme monsoon cloudburst (165mm) to observe dynamic risk score elevation, ML classification change, and automatic alert generation.
            </p>
          </div>
          <button
            id="simulate-rainfall-btn"
            className="btn btn-warning"
            onClick={handleSimulateHeavyRainfall}
            disabled={simulating || loading}
          >
            {simulating ? <RefreshCw className="spinner" size={18} /> : <Zap size={18} />}
            ⚡ SIMULATE HEAVY RAINFALL (165mm)
          </button>
        </div>
      </div>

      <div className="prediction-grid">
        {/* Input Form */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Environmental & Geological Inputs</span>
            <span className="topbar-badge" style={{ background: 'rgba(59,130,246,0.1)', color: 'var(--accent-blue)' }}>
              Parameters
            </span>
          </div>

          <div className="form-group">
            <label className="form-label">Autofill from Monitored Location</label>
            <select
              className="form-select"
              value={selectedLocationId}
              onChange={handleLocationChange}
            >
              <option value="">-- Custom Manual Input --</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name}, {loc.state} (Current: {loc.rainfall}mm, {loc.risk_level})
                </option>
              ))}
            </select>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Rainfall (mm in 24h)</label>
              <input
                type="number"
                name="rainfall"
                className="form-input mono"
                value={formData.rainfall}
                onChange={handleInputChange}
                min="0"
                max="500"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Slope Gradient (degrees °)</label>
              <input
                type="number"
                name="slope"
                className="form-input mono"
                value={formData.slope}
                onChange={handleInputChange}
                min="0"
                max="90"
              />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Elevation (meters ASL)</label>
              <input
                type="number"
                name="elevation"
                className="form-input mono"
                value={formData.elevation}
                onChange={handleInputChange}
                min="0"
                max="5000"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Soil Condition</label>
              <select
                name="soil"
                className="form-select"
                value={formData.soil}
                onChange={handleInputChange}
              >
                {SOIL_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Land-Use Pattern</label>
              <select
                name="land_use"
                className="form-select"
                value={formData.land_use}
                onChange={handleInputChange}
              >
                {LAND_USE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ display: 'flex', alignItems: 'center', marginTop: 24 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13 }}>
                <input
                  type="checkbox"
                  name="historical_landslide"
                  checked={formData.historical_landslide === 1}
                  onChange={handleInputChange}
                  style={{ width: 18, height: 18, accentColor: 'var(--accent-blue)' }}
                />
                <span>Previous Landslide History</span>
              </label>
            </div>
          </div>

          <button
            id="predict-submit-btn"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '14px', marginTop: 12 }}
            onClick={() => runPrediction()}
            disabled={loading}
          >
            {loading ? <RefreshCw className="spinner" size={18} /> : <BrainCircuit size={18} />}
            PREDICT LANDSLIDE RISK
          </button>
        </div>

        {/* Prediction Results Display */}
        <div>
          {result ? (
            <div className={`risk-result-card ${result.risk_level.replace(' ', '_')}`}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <span className="topbar-badge" style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)' }}>
                  ML INFERENCE OUTPUT
                </span>
                <span className={`risk-badge ${result.risk_level.replace(' ', '_')}`}>
                  {result.risk_level}
                </span>
              </div>

              <div className="risk-meter">
                <div className="risk-score-display">
                  <span className="risk-score-number" style={{ color: getScoreColor(result.risk_score) }}>
                    {result.risk_score}
                  </span>
                  <span className="risk-score-label">RISK INDEX / 100</span>
                </div>
              </div>

              <div style={{ margin: '16px 0', fontSize: 13, color: 'var(--text-secondary)' }}>
                Confidence: <strong style={{ color: 'var(--text-primary)' }}>{(result.risk_probability * 100).toFixed(1)}%</strong>
              </div>

              {/* Actionable Recommendation */}
              <div style={{
                background: 'rgba(10, 15, 26, 0.6)',
                border: '1px solid var(--border)',
                borderRadius: 10,
                padding: '16px',
                textAlign: 'left',
                marginBottom: 16
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent-cyan)', textTransform: 'uppercase', marginBottom: 6 }}>
                  Recommended Standard Operating Procedure (SOP):
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.5 }}>
                  {result.recommendation}
                </div>
              </div>

              {/* Risk Factors Breakdown */}
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>
                  Identified Contributing Risk Factors:
                </div>
                <ul className="risk-factors-list">
                  {result.risk_factors.map((factor, idx) => (
                    <li key={idx} className="risk-factor-item">
                      <div className="risk-factor-dot" />
                      <span>{factor}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {result.alert_generated && (
                <div className="critical-alert-banner">
                  <AlertOctagon size={28} color="var(--critical)" style={{ flexShrink: 0 }} />
                  <div style={{ textAlign: 'left' }}>
                    <strong style={{ color: 'var(--critical)', fontSize: 14 }}>
                      🚨 AUTOMATIC DISASTER ALERT LOGGED (ID #{result.alert_generated.id})
                    </strong>
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                      Alert has been dispatched to district emergency command and logged in the Alert Center.
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 380, textAlign: 'center', color: 'var(--text-muted)' }}>
              <BrainCircuit size={56} style={{ opacity: 0.2, marginBottom: 16 }} />
              <h3 style={{ color: 'var(--text-secondary)', marginBottom: 6 }}>Awaiting Input Parameters</h3>
              <p style={{ fontSize: 13, maxWidth: 320 }}>
                Adjust environmental parameters and click <strong>PREDICT LANDSLIDE RISK</strong> or trigger <strong>HEAVY RAINFALL</strong> to compute live risk scores.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
