from fastapi import APIRouter
from database.database import get_connection, dict_from_row

router = APIRouter()


@router.get("/dashboard")
def get_dashboard():
    conn = get_connection()
    try:
        locations = conn.execute("SELECT * FROM locations").fetchall()
        locs = [dict_from_row(r) for r in locations]

        total = len(locs)
        high_risk = sum(1 for l in locs if l["risk_level"] in ("HIGH", "VERY HIGH", "CRITICAL"))
        critical = sum(1 for l in locs if l["risk_level"] == "CRITICAL")
        avg_rainfall = round(sum(l["rainfall"] for l in locs) / total, 1) if total else 0
        current_max_rainfall = max((l["rainfall"] for l in locs), default=0)

        active_alerts = conn.execute(
            "SELECT COUNT(*) FROM alerts WHERE status='ACTIVE'"
        ).fetchone()[0]

        total_predictions = conn.execute("SELECT COUNT(*) FROM predictions").fetchone()[0]

        recent_alerts = conn.execute(
            "SELECT * FROM alerts ORDER BY timestamp DESC LIMIT 5"
        ).fetchall()
        recent_alerts_list = [dict_from_row(a) for a in recent_alerts]

        return {
            "total_locations": total,
            "high_risk_locations": high_risk,
            "critical_locations": critical,
            "active_alerts": active_alerts,
            "current_max_rainfall": current_max_rainfall,
            "average_rainfall": avg_rainfall,
            "total_predictions": total_predictions,
            "recent_alerts": recent_alerts_list,
            "note": "DEMO MONITORING DATA",
        }
    finally:
        conn.close()
