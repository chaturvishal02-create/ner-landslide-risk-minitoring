# -*- coding: utf-8 -*-
"""
ML Training Script for Landslide Risk Prediction
=================================================
NOTE: This model is trained on synthetic/demo data for hackathon demonstration.
It is NOT suitable for real-world operational deployment.
A real system would require validated geospatial datasets, field surveys,
and peer-reviewed feature engineering.
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
import joblib
import os
import json

np.random.seed(42)


def generate_synthetic_dataset(n_samples: int = 2000) -> pd.DataFrame:
    """
    Generate synthetic training data with realistic correlations.
    DEMO/SYNTHETIC DATA — not real measurement data.
    """

    # ── LOW RISK (0) ─────────────────────────────────────────────
    n_low = n_samples // 4
    low = {
        "rainfall": np.random.uniform(0, 40, n_low),
        "slope": np.random.uniform(0, 20, n_low),
        "elevation": np.random.uniform(50, 500, n_low),
        "soil": np.random.choice([0, 1], n_low, p=[0.6, 0.4]),
        "land_use": np.random.choice([1, 4], n_low, p=[0.5, 0.5]),
        "historical_landslide": np.zeros(n_low, dtype=int),
        "risk_label": np.zeros(n_low, dtype=int),
    }

    # ── MODERATE RISK (1) ────────────────────────────────────────
    n_mod = n_samples // 4
    mod = {
        "rainfall": np.random.uniform(30, 70, n_mod),
        "slope": np.random.uniform(15, 30, n_mod),
        "elevation": np.random.uniform(300, 1200, n_mod),
        "soil": np.random.choice([1, 2], n_mod, p=[0.5, 0.5]),
        "land_use": np.random.choice([1, 2, 4], n_mod),
        "historical_landslide": np.random.choice([0, 1], n_mod, p=[0.7, 0.3]),
        "risk_label": np.ones(n_mod, dtype=int),
    }

    # ── HIGH RISK (2) ────────────────────────────────────────────
    n_high = n_samples // 4
    high = {
        "rainfall": np.random.uniform(60, 120, n_high),
        "slope": np.random.uniform(25, 40, n_high),
        "elevation": np.random.uniform(800, 2000, n_high),
        "soil": np.random.choice([2, 3], n_high, p=[0.4, 0.6]),
        "land_use": np.random.choice([2, 3], n_high, p=[0.5, 0.5]),
        "historical_landslide": np.random.choice([0, 1], n_high, p=[0.4, 0.6]),
        "risk_label": np.full(n_high, 2, dtype=int),
    }

    # ── CRITICAL RISK (3) ────────────────────────────────────────
    n_crit = n_samples - n_low - n_mod - n_high
    crit = {
        "rainfall": np.random.uniform(100, 300, n_crit),
        "slope": np.random.uniform(35, 60, n_crit),
        "elevation": np.random.uniform(1200, 3500, n_crit),
        "soil": np.random.choice([2, 3], n_crit, p=[0.2, 0.8]),
        "land_use": np.random.choice([2, 3], n_crit, p=[0.3, 0.7]),
        "historical_landslide": np.ones(n_crit, dtype=int),
        "risk_label": np.full(n_crit, 3, dtype=int),
    }

    frames = [pd.DataFrame(d) for d in [low, mod, high, crit]]
    df = pd.concat(frames, ignore_index=True)
    df = df.sample(frac=1, random_state=42).reset_index(drop=True)

    # Add small Gaussian noise to numeric columns for realism
    for col in ["rainfall", "slope", "elevation"]:
        noise = np.random.normal(0, df[col].std() * 0.05, len(df))
        df[col] = (df[col] + noise).clip(lower=0)

    return df


def train_model():
    print("=" * 60)
    print("  LANDSLIDE RISK ML MODEL - DEMO/SYNTHETIC TRAINING")
    print("  [!] Trained on synthetic data. Not for real deployment.")
    print("=" * 60)

    df = generate_synthetic_dataset(2000)
    print(f"[OK] Generated {len(df)} synthetic training samples")
    print(f"  Class distribution:\n{df['risk_label'].value_counts().sort_index()}\n")

    features = ["rainfall", "slope", "elevation", "soil", "land_use", "historical_landslide"]
    X = df[features]
    y = df["risk_label"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    model = RandomForestClassifier(
        n_estimators=150,
        max_depth=10,
        min_samples_split=5,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1,
    )
    model.fit(X_train, y_train)
    print("[OK] Model trained")

    y_pred = model.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"[OK] Test accuracy on synthetic data: {acc:.4f} ({acc*100:.1f}%)")
    print("\nClassification Report (synthetic test set):")
    label_names = ["LOW", "MODERATE", "HIGH", "CRITICAL"]
    print(classification_report(y_test, y_pred, target_names=label_names))

    # Save model
    os.makedirs(os.path.dirname(__file__), exist_ok=True)
    model_path = os.path.join(os.path.dirname(__file__), "model.pkl")
    joblib.dump(model, model_path)
    print(f"[OK] Model saved -> {model_path}")

    # Save metrics for API
    metrics = {
        "accuracy_synthetic": round(float(acc), 4),
        "n_training_samples": len(X_train),
        "n_test_samples": len(X_test),
        "features": features,
        "classes": label_names,
        "note": "DEMO/SYNTHETIC — not validated on real operational data",
    }
    metrics_path = os.path.join(os.path.dirname(__file__), "metrics.json")
    with open(metrics_path, "w") as f:
        json.dump(metrics, f, indent=2)
    print(f"[OK] Metrics saved -> {metrics_path}")

    return model, acc


if __name__ == "__main__":
    train_model()
