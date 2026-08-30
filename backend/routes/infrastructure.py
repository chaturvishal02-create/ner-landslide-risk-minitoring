import json
import os
from typing import Optional
from fastapi import APIRouter

router = APIRouter()

DATA_FILE = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "infrastructure.json")


def load_infra():
    with open(DATA_FILE) as f:
        return json.load(f)["infrastructure"]


@router.get("/infrastructure")
def get_infrastructure(location_id: Optional[str] = None):
    data = load_infra()
    if location_id:
        filtered = [i for i in data if i["location_id"] == location_id]
        return {"infrastructure": filtered, "total": len(filtered), "note": "DEMO DATA"}
    return {"infrastructure": data, "total": len(data), "note": "DEMO DATA"}
