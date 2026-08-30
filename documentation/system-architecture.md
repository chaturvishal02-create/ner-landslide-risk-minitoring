# System Architecture

```text
┌────────────────────────────────────────────────────────┐
│               PRESENTATION LAYER (Vite + React)        │
│  - Command Dashboard      - GIS Risk Map (Leaflet)     │
│  - AI Prediction Console  - Rainfall Telemetry Charts  │
│  - Alert Center           - Infrastructure Assessment  │
└───────────────────────────┬────────────────────────────┘
                            │ REST API (JSON / Axios)
┌───────────────────────────▼────────────────────────────┐
│              APPLICATION LAYER (FastAPI / Uvicorn)     │
│  - CORS Middleware        - Route Controllers          │
│  - Dynamic Rule Engine    - Alert Generation Pipeline  │
└───────────────────────────┬────────────────────────────┘
                            │
            ┌───────────────┴──────────────┐
            ▼                              ▼
┌─────────────────────────┐  ┌───────────────────────────┐
│   ML INFERENCE ENGINE   │  │     PERSISTENCE LAYER     │
│ - RandomForestClassifier│  │ - SQLite (WAL mode)       │
│ - Probability Calibrator│  │ - Locations / Alerts DB   │
│ - Risk Factor Extractor │  │ - Predictions Archive     │
└─────────────────────────┘  └───────────────────────────┘
```
