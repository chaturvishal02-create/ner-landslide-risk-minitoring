# Data Flow Architecture

```text
[Meteorological & Terrain Inputs]
 (Rainfall, Slope, Elevation, Soil Type, Land Use, History)
                       │
                       ▼
            [POST /api/predict-risk]
                       │
                       ▼
        [RandomForest ML Scoring Model]
                       │
         ┌─────────────┴─────────────┐
         ▼                           ▼
[Risk Probability & Score]   [Risk Factor Breakdown]
 (0 to 100 Risk Scale)       (e.g., Extreme Rainfall, Shear Stress)
         │                           │
         └─────────────┬─────────────┘
                       ▼
             [Threshold Evaluator]
                       │
         ┌─────────────┴─────────────┐
         ▼ (Risk >= 70)              ▼ (Risk < 70)
[Generate Alert Record]      [Log Normal Prediction]
 - Severity: VERY HIGH/CRIT   - Store to predictions table
 - SOP Action attached       - Update location telemetry
         │                           │
         └─────────────┬─────────────┘
                       ▼
     [Frontend Dashboard & Map Live Refresh]
```
