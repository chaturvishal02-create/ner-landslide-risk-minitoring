# REST API Documentation

Base URL: `http://localhost:8000`

### 1. Health Check
- **Endpoint:** `GET /api/health`
- **Response:**
  ```json
  {
    "status": "operational",
    "system": "Landslide Risk Monitoring System",
    "version": "1.0.0"
  }
  ```

### 2. Dashboard Aggregates
- **Endpoint:** `GET /api/dashboard`
- **Response:** Returns aggregated monitoring statistics (total locations, high risk count, active alerts, average rainfall, recent alerts list).

### 3. Monitored Locations
- **Endpoint:** `GET /api/locations`
- **Response:** List of all 12 NER monitoring sites with coordinates, current rainfall, slope, and computed risk score.

### 4. AI Risk Prediction
- **Endpoint:** `POST /api/predict-risk`
- **Payload:**
  ```json
  {
    "rainfall": 150,
    "slope": 38,
    "elevation": 1800,
    "soil": 2,
    "land_use": 2,
    "historical_landslide": 1,
    "location_id": "loc_001",
    "location_name": "Gangtok, Sikkim"
  }
  ```
- **Response:**
  ```json
  {
    "risk_probability": 0.9506,
    "risk_score": 98,
    "risk_level": "CRITICAL",
    "risk_factors": ["Extremely high rainfall", "Steep slope", "Vulnerable silty clay soil"],
    "recommendation": "ACTIVATE FULL EMERGENCY PROTOCOL. Immediate evacuation...",
    "alert_generated": { "id": 5, "severity": "CRITICAL", "status": "ACTIVE" }
  }
  ```

### 5. Alerts Management
- **Endpoint:** `GET /api/alerts?status=ACTIVE`
- **Endpoint:** `POST /api/alerts`
- **Endpoint:** `PUT /api/alerts/{id}/acknowledge`

### 6. Telemetry & Historical Data
- **Endpoint:** `GET /api/rainfall?location_id=loc_001`
- **Endpoint:** `GET /api/infrastructure?location_id=loc_001`
- **Endpoint:** `GET /api/historical`
