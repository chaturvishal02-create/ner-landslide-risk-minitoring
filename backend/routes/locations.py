from fastapi import APIRouter
from database.database import get_connection, dict_from_row

router = APIRouter()


@router.get("/locations")
def get_locations():
    conn = get_connection()
    try:
        rows = conn.execute("SELECT * FROM locations ORDER BY risk_score DESC").fetchall()
        locations = [dict_from_row(r) for r in rows]
        return {"locations": locations, "total": len(locations), "note": "DEMO MONITORING DATA"}
    finally:
        conn.close()


@router.get("/locations/{location_id}")
def get_location(location_id: str):
    conn = get_connection()
    try:
        row = conn.execute("SELECT * FROM locations WHERE id=?", (location_id,)).fetchone()
        if not row:
            from fastapi import HTTPException
            raise HTTPException(status_code=404, detail="Location not found")
        return dict_from_row(row)
    finally:
        conn.close()
