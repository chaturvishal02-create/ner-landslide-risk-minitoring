from __future__ import annotations

from datetime import datetime
from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from database.database import get_connection, dict_from_row

router = APIRouter()


class AlertCreate(BaseModel):
    severity: str
    location_id: Optional[str] = None
    location_name: str
    risk_score: int
    cause: str
    recommended_action: str
    status: str = "ACTIVE"


@router.get("/alerts")
def get_alerts(status: Optional[str] = None, severity: Optional[str] = None):
    conn = get_connection()
    try:
        query = "SELECT * FROM alerts"
        params = []
        conditions = []

        if status:
            conditions.append("status=?")
            params.append(status.upper())
        if severity:
            conditions.append("severity=?")
            params.append(severity.upper())

        if conditions:
            query += " WHERE " + " AND ".join(conditions)

        query += " ORDER BY timestamp DESC"

        rows = conn.execute(query, params).fetchall()
        alerts = [dict_from_row(r) for r in rows]
        return {"alerts": alerts, "total": len(alerts)}
    finally:
        conn.close()


@router.post("/alerts")
def create_alert(alert: AlertCreate):
    conn = get_connection()
    try:
        timestamp = datetime.utcnow().isoformat()
        conn.execute(
            """
            INSERT INTO alerts
            (severity, location_id, location_name, risk_score, cause, timestamp, recommended_action, status)
            VALUES (?,?,?,?,?,?,?,?)
            """,
            (
                alert.severity.upper(),
                alert.location_id or "",
                alert.location_name,
                alert.risk_score,
                alert.cause,
                timestamp,
                alert.recommended_action,
                alert.status.upper(),
            ),
        )
        conn.commit()
        alert_id = conn.execute("SELECT last_insert_rowid()").fetchone()[0]
        return {
            "id": alert_id,
            "severity": alert.severity.upper(),
            "location_name": alert.location_name,
            "risk_score": alert.risk_score,
            "timestamp": timestamp,
            "status": alert.status.upper(),
            "message": "Alert created successfully",
        }
    finally:
        conn.close()


@router.put("/alerts/{alert_id}/acknowledge")
def acknowledge_alert(alert_id: int):
    conn = get_connection()
    try:
        row = conn.execute("SELECT * FROM alerts WHERE id=?", (alert_id,)).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Alert not found")

        conn.execute(
            "UPDATE alerts SET status='ACKNOWLEDGED' WHERE id=?", (alert_id,)
        )
        conn.commit()
        return {"id": alert_id, "status": "ACKNOWLEDGED", "message": "Alert acknowledged"}
    finally:
        conn.close()
