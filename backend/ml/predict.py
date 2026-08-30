"""
Prediction service for landslide risk assessment.
NOTE: Uses a model trained on synthetic/demo data for hackathon demonstration.
"""

from __future__ import annotations

import os
import json
from typing import Any

import joblib
import numpy as np


# ── Model singleton ──────────────────────────────────────────────────────────
_model = None
_metrics: dict[str, Any] = {}


def load_model():
    global _model, _metrics
    model_path = os.path.join(os.path.dirname(__file__), "model.pkl")
    metrics_path = os.path.join(os.path.dirname(__file__), "metrics.json")

    if not os.path.exists(model_path):
        raise FileNotFoundError(
            f"Model not found at {model_path}. Run ml/train_model.py first."
        )

    _model = joblib.load(model_path)

    if os.path.exists(metrics_path):
        with open(metrics_path) as f:
            _metrics = json.load(f)

    return _model


def get_model():
    global _model
    if _model is None:
        load_model()
    return _model


# ── Thresholds ───────────────────────────────────────────────────────────────
RISK_LEVELS = {
    (0, 29): "LOW",
    (30, 49): "MODERATE",
    (50, 69): "HIGH",
    (70, 84): "VERY HIGH",
    (85, 100): "CRITICAL",
}

LABEL_TO_RISK = {0: "LOW", 1: "MODERATE", 2: "HIGH", 3: "CRITICAL"}
LABEL_TO_SCORE_RANGE = {
    0: (10, 29),
    1: (30, 49),
    2: (50, 72),
    3: (73, 100),
}

SOIL_LABELS = {
    0: "Alluvial (stable)",
    1: "Sandy loam (moderate)",
    2: "Silty clay loam (vulnerable)",
    3: "Clay (highly vulnerable)",
}

LAND_USE_LABELS = {
    1: "Urban",
    2: "Urban/Forest mix",
    3: "Dense forest",
    4: "Agricultural",
}

RECOMMENDATIONS = {
    "LOW": "Continue routine monitoring. No immediate action required.",
    "MODERATE": "Increase monitoring frequency. Alert local panchayat authorities. Inspect drainage systems.",
    "HIGH": "Issue advisory to residents in vulnerable zones. Inspect road sections. Pre-position emergency response teams.",
    "VERY HIGH": "Evacuate high-risk settlements immediately. Restrict vehicle movement on vulnerable roads. Activate district emergency operations.",
    "CRITICAL": "ACTIVATE FULL EMERGENCY PROTOCOL. Immediate evacuation of all vulnerable areas. Block all vehicle movement. Notify NDRF and state disaster management authority.",
}


def get_risk_level(score: int) -> str:
    for (lo, hi), level in RISK_LEVELS.items():
        if lo <= score <= hi:
            return level
    return "CRITICAL" if score > 84 else "LOW"


def generate_risk_factors(
    rainfall: float,
    slope: float,
    elevation: float,
    soil: int,
    land_use: int,
    historical_landslide: int,
) -> list[str]:
    factors = []

    if rainfall >= 150:
        factors.append("Extremely high rainfall — major saturation risk")
    elif rainfall >= 100:
        factors.append("Very high rainfall — soil saturation likely")
    elif rainfall >= 70:
        factors.append("High rainfall — elevated moisture content")
    elif rainfall >= 40:
        factors.append("Moderate rainfall contributing to risk")

    if slope >= 40:
        factors.append("Extremely steep slope — very high shear stress")
    elif slope >= 30:
        factors.append("Steep slope — elevated gravitational instability")
    elif slope >= 20:
        factors.append("Moderate slope angle contributing to risk")

    if elevation >= 2000:
        factors.append("High altitude — freeze-thaw cycles increase instability")
    elif elevation >= 1000:
        factors.append("Elevated terrain with complex geological structure")

    if soil >= 3:
        factors.append("Highly vulnerable clay soil — low shear strength")
    elif soil == 2:
        factors.append("Vulnerable silty clay soil condition")

    if land_use in (2, 3):
        factors.append("Forest/mixed land use — potential root system weakening")

    if historical_landslide == 1:
        factors.append("Previous landslide history detected at this location")

    return factors if factors else ["No critical individual risk factor identified"]


def predict_risk(
    rainfall: float,
    slope: float,
    elevation: float,
    soil: int,
    land_use: int,
    historical_landslide: int,
    location_id: str | None = None,
    location_name: str | None = None,
) -> dict[str, Any]:

    model = get_model()

    features = np.array([[rainfall, slope, elevation, soil, land_use, historical_landslide]])
    label_pred = int(model.predict(features)[0])
    proba = model.predict_proba(features)[0]

    # Map label → probability → score
    risk_probability = float(proba[label_pred])

    lo, hi = LABEL_TO_SCORE_RANGE[label_pred]
    # Scale within the band using the probability
    band_width = hi - lo
    risk_score = int(lo + risk_probability * band_width)
    risk_score = max(0, min(100, risk_score))

    risk_level = get_risk_level(risk_score)
    risk_factors = generate_risk_factors(rainfall, slope, elevation, soil, land_use, historical_landslide)
    recommendation = RECOMMENDATIONS.get(risk_level, RECOMMENDATIONS["MODERATE"])

    result = {
        "risk_probability": round(risk_probability, 4),
        "risk_score": risk_score,
        "risk_level": risk_level,
        "risk_factors": risk_factors,
        "recommendation": recommendation,
        "soil_label": SOIL_LABELS.get(soil, "Unknown"),
        "land_use_label": LAND_USE_LABELS.get(land_use, "Unknown"),
        "model_note": "DEMO/SYNTHETIC — trained on synthetic data for hackathon demonstration only",
    }

    if location_id:
        result["location_id"] = location_id
    if location_name:
        result["location_name"] = location_name

    return result
