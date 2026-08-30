# Machine Learning Methodology

> **Transparency Note:** The model is trained on a synthetic dataset generated specifically for this hackathon prototype to demonstrate multi-class probabilistic risk modeling without external proprietary data dependencies.

### 1. Model Selection
We employ an ensemble `RandomForestClassifier` (150 estimators, max depth 10, balanced class stratification) due to its robustness against non-linear feature interactions, resilience against overfitting on continuous-categorical mixed features, and fast inference capability (<5ms per prediction).

### 2. Feature Vector
| Feature | Type | Range / Categories | Description |
| :--- | :--- | :--- | :--- |
| `rainfall` | Continuous | 0 – 300 mm | 24-hour cumulative rainfall |
| `slope` | Continuous | 0 – 60 degrees | Slope angle of terrain |
| `elevation` | Continuous | 0 – 3500 meters | Height above mean sea level |
| `soil` | Categorical (0-3) | Alluvial, Sandy loam, Silty clay, Clay | Soil shear stability index |
| `land_use` | Categorical (1-4) | Urban, Mixed, Forest, Agriculture | Land cover & vegetation anchor |
| `historical_landslide`| Binary (0/1) | 0 (No), 1 (Yes) | Prior recorded failure history |

### 3. Risk Mapping Logic
- 0 to 29: `LOW`
- 30 to 49: `MODERATE`
- 50 to 69: `HIGH`
- 70 to 84: `VERY HIGH`
- 85 to 100: `CRITICAL`
