import json
import os
from typing import Optional
from fastapi import APIRouter, HTTPException

router = APIRouter()

DATA_FILE = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "rainfall.json")


def load_rainfall():
    with open(DATA_FILE) as f:
        return json.load(f)["rainfall_data"]


@router.get("/rainfall")
def get_rainfall(location_id: Optional[str] = None):
    data = load_rainfall()
    if location_id:
        if location_id not in data:
            raise HTTPException(status_code=404, detail="Location rainfall data not found")
        return {"data": data[location_id], "note": "DEMO MONITORING DATA"}
    return {"data": list(data.values()), "note": "DEMO MONITORING DATA"}
