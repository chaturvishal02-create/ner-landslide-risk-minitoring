# AI-Based Early Warning & Landslide Risk Monitoring System in NER
## Smart India Hackathon — Problem Statement ID: 26001

> **College-Level Hackathon Demonstration MVP**  
> *Note: This system is trained and populated with synthetic/demo monitoring data for demonstration purposes. It is not intended for real-world operational deployment.*

---

## 1. Problem Statement
The North Eastern Region (NER) of India (comprising Sikkim, Meghalaya, Arunachal Pradesh, Mizoram, Nagaland, Manipur, Assam, and Tripura) is geographically vulnerable to catastrophic landslides triggered by intense monsoon precipitation, high slope gradients, active seismicity, and complex geological formations. Existing disaster responses are often reactive. 

**Our Solution:** An AI-powered early warning disaster management command center that assimilates multi-parameter environmental telemetry (rainfall intensity, slope angle, elevation ASL, soil shear vulnerability, land-use pattern, and historical landslide occurrences) to generate predictive risk scores (0–100), spatial GIS visualizations, actionable SOP recommendations, and automated early warning alerts.

---

## 2. Key Features

- **Dynamic ML Risk Engine:** RandomForestClassifier trained on multi-factor geological and meteorological telemetry, mapping features to 5 risk categories: `LOW` (0–29), `MODERATE` (30–49), `HIGH` (50–69), `VERY HIGH` (70–84), and `CRITICAL` (85–100).
- **Interactive GIS Risk Map:** React-Leaflet GIS visualization centered on the 8 NER states with dynamic risk-coded markers and full situational metadata popups.
- **⚡ Extreme Rainfall Simulation:** Presentation-ready trigger simulating a 165mm monsoon cloudburst that recalculates risk scores, updates spatial maps, and dispatches automated disaster notices in real time.
- **Disaster Warning & Alert Center:** Real-time threat feed with severity filters and operational dispatch acknowledgment workflows (`PUT /api/alerts/{id}/acknowledge`).
- **Telemetry & Historical Analytics:** Hourly/daily precipitation profiles and retrospective 2023–2024 landslide incident correlations powered by Recharts.
- **Infrastructure Vulnerability Assessment:** Proximity analysis for critical lifelines (National Highways, bridges, district hospitals, schools, and hillside villages).

---

## 3. Technology Stack

- **Frontend:** React 19, Vite, Vanilla CSS Design System (Command Center theme), React-Leaflet (OpenStreetMap GIS), Recharts, Lucide React, Axios.
- **Backend:** FastAPI (Python 3.14), Uvicorn, Pydantic, SQLite (WAL mode).
- **Machine Learning:** Scikit-Learn (RandomForestClassifier), NumPy, Pandas, Joblib.

---

## 4. Installation & Local Setup

### Prerequisites
- Python 3.10+ (Tested on Python 3.14)
- Node.js 18+ & npm

### Backend Setup
```bash
cd backend
python -m pip install -r requirements.txt
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
*The database and ML model are initialized and trained automatically on first startup.*

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open **http://localhost:5173** in your browser.

---

## 5. Demo Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **Emergency Commander / Admin** | `admin@landslide.ai` | `demo123` |

*(A 1-click **⚡ Demo Login** button is also provided on the login page).*

---

## 6. Judge Demo Workflow

1. **Sign In:** Click **⚡ Demo Login** to enter the Command Center.
2. **Dashboard Review:** Inspect monitored NER locations, active alerts, and peak rainfall statistics.
3. **Explore GIS Map:** Navigate to **Risk Map**, click on markers (e.g. *Gangtok*, *Cherrapunji*, *Tawang*), and filter by severity.
4. **Interactive Prediction:** Go to **AI Prediction**, select a location or input custom parameters, and click **PREDICT LANDSLIDE RISK**.
5. **⚡ Heavy Rainfall Simulation:** Click **⚡ SIMULATE HEAVY RAINFALL (165mm)**:
   - Observe the rainfall parameter increase from 45mm to 165mm.
   - The ML model recalculates the risk index to **98/100 (CRITICAL)**.
   - An automatic alert notice is created.
6. **Acknowledge Alert:** Go to **Alert Center** to review the dispatched emergency SOP and click **Acknowledge Notice**.

---

## 7. Known Limitations & Transparency
- **Synthetic/Demo Data:** All monitoring feeds, spatial telemetry, and training sets are synthetic approximations created for hackathon demonstration.
- **Non-Operational:** Not integrated with real-time IMD radars or Geological Survey of India (GSI) seismic telemetry.