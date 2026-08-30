from __future__ import annotations

from datetime import datetime
from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from database.database import get_connection, dict_from_row
from ml.predict import predict_risk

router = APIRouter()


class PredictRequest(BaseModel):
    rainfall: float
    slope: float
    elevation: float
    soil: int
    land_use: int
    historical_landslide: int
    location_id: Optional[str] = None
    location_name: Optional[str] = None


def maybe_create_alert(conn, result: dict, location_id: str | None, location_name: str) -> Optional[dict]:
    risk_score = result["risk_score"]
    if risk_score < 70:
        return None

    severity = "CRITICAL" if risk_score >= 85 else "VERY HIGH"
    cause = "; ".join(result["risk_factors"])
    timestamp = datetime.utcnow().isoformat()

    conn.execute(
        """
        INSERT INTO alerts
        (severity, location_id, location_name, risk_score, cause, timestamp, recommended_action, status)
        VALUES (?,?,?,?,?,?,?,?)
        """,
        (
            severity,
            location_id or "",
            location_name,
            risk_score,
            cause,
            timestamp,
            result["recommendation"],
            "ACTIVE",
        ),
    )
    conn.commit()

    alert_id = conn.execute("SELECT last_insert_rowid()").fetchone()[0]
    return {
        "id": alert_id,
        "severity": severity,
        "location_name": location_name,
        "risk_score": risk_score,
        "cause": cause,
        "timestamp": timestamp,
        "recommended_action": result["recommendation"],
        "status": "ACTIVE",
    }


@router.post("/predict-risk")
def predict(req: PredictRequest):
    try:
        result = predict_risk(
            rainfall=req.rainfall,
            slope=req.slope,
            elevation=req.elevation,
            soil=req.soil,
            land_use=req.land_use,
            historical_landslide=req.historical_landslide,
            location_id=req.location_id,
            location_name=req.location_name,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

    loc_name = req.location_name or "Manual Input"

    conn = get_connection()
    try:
        # Save prediction record
        conn.execute(
            """
            INSERT INTO predictions
            (location_id, location_name, rainfall, slope, elevation, soil, land_use,
             historical_landslide, risk_score, risk_probability, risk_level, risk_factors,
             recommendation, timestamp)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)
            """,
            (
                req.location_id, loc_name,
                req.rainfall, req.slope, req.elevation,
                req.soil, req.land_use, req.historical_landslide,
                result["risk_score"], result["risk_probability"],
                result["risk_level"],
                "; ".join(result["risk_factors"]),
                result["recommendation"],
                datetime.utcnow().isoformat(),
            ),
        )
        conn.commit()

        # Update location if ID provided
        if req.location_id:
            conn.execute(
                """
                UPDATE locations
                SET rainfall=?, risk_score=?, risk_level=?, last_updated=?
                WHERE id=?
                """,
                (
                    req.rainfall,
                    result["risk_score"],
                    result["risk_level"],
                    datetime.utcnow().isoformat(),
                    req.location_id,
                ),
            )
            conn.commit()

        # Possibly create an alert
        alert = maybe_create_alert(conn, result, req.location_id, loc_name)
        if alert:
            result["alert_generated"] = alert

    finally:
        conn.close()

    return result
