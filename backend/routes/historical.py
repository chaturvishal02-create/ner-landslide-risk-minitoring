import json
import os
from typing import Optional
from fastapi import APIRouter

router = APIRouter()

DATA_FILE = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "historical.json")


def load_historical():
    with open(DATA_FILE) as f:
        return json.load(f)


@router.get("/historical")
def get_historical(location: Optional[str] = None, severity: Optional[str] = None):
    data = load_historical()
    events = data["historical_events"]

    if location:
        events = [e for e in events if location.lower() in e["location"].lower()]
    if severity:
        events = [e for e in events if e["severity"].upper() == severity.upper()]

    return {
        "events": events,
        "total": len(events),
        "monthly_summary": data.get("monthly_summary", {}),
        "note": "DEMO/SYNTHETIC HISTORICAL DATA",
    }
