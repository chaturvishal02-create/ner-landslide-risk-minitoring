"""
Landslide Risk Monitoring System — FastAPI Backend
===================================================
SIH Problem Statement 26001
AI-Based Early Warning and Landslide Risk Monitoring System in NER

NOTE: This system uses DEMO/SYNTHETIC data for hackathon demonstration.
It is not a real-time operational system.
"""

import os
import sys

# Ensure routes and database modules can be found
sys.path.insert(0, os.path.dirname(__file__))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database.database import initialize_database
from ml.train_model import train_model
from ml.predict import load_model

from routes.dashboard import router as dashboard_router
from routes.locations import router as locations_router
from routes.prediction import router as prediction_router
from routes.alerts import router as alerts_router
from routes.rainfall import router as rainfall_router
from routes.infrastructure import router as infrastructure_router
from routes.historical import router as historical_router

# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="Landslide Risk Monitoring System",
    description="AI-Based Early Warning and Landslide Risk Monitoring for NER — SIH 26001",
    version="1.0.0",
)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routes ────────────────────────────────────────────────────────────────────
app.include_router(dashboard_router, prefix="/api")
app.include_router(locations_router, prefix="/api")
app.include_router(prediction_router, prefix="/api")
app.include_router(alerts_router, prefix="/api")
app.include_router(rainfall_router, prefix="/api")
app.include_router(infrastructure_router, prefix="/api")
app.include_router(historical_router, prefix="/api")


@app.get("/api/health")
def health():
    return {
        "status": "operational",
        "system": "Landslide Risk Monitoring System",
        "version": "1.0.0",
        "note": "DEMO MONITORING DATA — not for real-world deployment",
    }


# ── Startup ───────────────────────────────────────────────────────────────────
@app.on_event("startup")
def startup():
    print("\n" + "=" * 60)
    print("  Landslide Risk Monitoring System — Starting Up")
    print("=" * 60)

    # Initialize database
    initialize_database()

    # Train or load ML model
    model_path = os.path.join(os.path.dirname(__file__), "ml", "model.pkl")
    if not os.path.exists(model_path):
        print("\nTraining ML model (first run)...")
        train_model()
    else:
        print("[OK] ML model already trained")

    load_model()
    print("[OK] ML model loaded and ready")
    print("\n[READY] System ready! API available at http://localhost:8000")
    print("   Docs: http://localhost:8000/docs\n")
