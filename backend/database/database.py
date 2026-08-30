"""
Database initialization and access for the Landslide Risk System.
Uses SQLite — no external database server required.
"""

from __future__ import annotations

import sqlite3
import json
import os
from datetime import datetime, timedelta
from typing import Any

DB_PATH = os.path.join(os.path.dirname(__file__), "landslide.db")
DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")


def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    return conn


def dict_from_row(row) -> dict[str, Any]:
    return dict(row) if row else {}


def create_tables(conn: sqlite3.Connection) -> None:
    conn.executescript(
        """
        CREATE TABLE IF NOT EXISTS locations (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            state TEXT NOT NULL,
            latitude REAL,
            longitude REAL,
            elevation REAL,
            slope REAL,
            soil_type TEXT,
            soil_code INTEGER,
            land_use TEXT,
            land_use_code INTEGER,
            historical_landslide INTEGER DEFAULT 0,
            rainfall REAL DEFAULT 0,
            risk_score INTEGER DEFAULT 0,
            risk_level TEXT DEFAULT 'LOW',
            last_updated TEXT
        );

        CREATE TABLE IF NOT EXISTS alerts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            severity TEXT NOT NULL,
            location_id TEXT,
            location_name TEXT NOT NULL,
            risk_score INTEGER,
            cause TEXT,
            timestamp TEXT NOT NULL,
            recommended_action TEXT,
            status TEXT DEFAULT 'ACTIVE'
        );

        CREATE TABLE IF NOT EXISTS predictions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            location_id TEXT,
            location_name TEXT,
            rainfall REAL,
            slope REAL,
            elevation REAL,
            soil INTEGER,
            land_use INTEGER,
            historical_landslide INTEGER,
            risk_score INTEGER,
            risk_probability REAL,
            risk_level TEXT,
            risk_factors TEXT,
            recommendation TEXT,
            timestamp TEXT NOT NULL
        );
        """
    )
    conn.commit()


def seed_locations(conn: sqlite3.Connection) -> None:
    count = conn.execute("SELECT COUNT(*) FROM locations").fetchone()[0]
    if count > 0:
        return  # Already seeded

    loc_file = os.path.join(DATA_DIR, "locations.json")
    with open(loc_file) as f:
        data = json.load(f)

    for loc in data["locations"]:
        conn.execute(
            """
            INSERT OR REPLACE INTO locations
            (id, name, state, latitude, longitude, elevation, slope,
             soil_type, soil_code, land_use, land_use_code,
             historical_landslide, rainfall, risk_score, risk_level, last_updated)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
            """,
            (
                loc["id"], loc["name"], loc["state"],
                loc["latitude"], loc["longitude"],
                loc["elevation"], loc["slope"],
                loc["soil_type"], loc["soil_code"],
                loc["land_use"], loc["land_use_code"],
                loc["historical_landslide"],
                loc["rainfall"], loc["risk_score"],
                loc["risk_level"], loc["last_updated"],
            ),
        )

    conn.commit()
    print(f"[OK] Seeded {len(data['locations'])} demo locations")


def seed_alerts(conn: sqlite3.Connection) -> None:
    count = conn.execute("SELECT COUNT(*) FROM alerts").fetchone()[0]
    if count > 0:
        return

    now = datetime.utcnow()
    sample_alerts = [
        {
            "severity": "CRITICAL",
            "location_id": "loc_012",
            "location_name": "Mangan, Sikkim",
            "risk_score": 88,
            "cause": "Extremely high rainfall on steep clay slopes with previous landslide history",
            "timestamp": (now - timedelta(hours=1)).isoformat(),
            "recommended_action": "ACTIVATE FULL EMERGENCY PROTOCOL. Immediate evacuation of all vulnerable areas. Block all vehicle movement. Notify NDRF.",
            "status": "ACTIVE",
        },
        {
            "severity": "VERY HIGH",
            "location_id": "loc_010",
            "location_name": "Cherrapunji, Meghalaya",
            "risk_score": 82,
            "cause": "Record rainfall with saturated soil and historical landslide vulnerability",
            "timestamp": (now - timedelta(hours=3)).isoformat(),
            "recommended_action": "Evacuate high-risk settlements. Restrict vehicle movement. Activate district emergency operations.",
            "status": "ACTIVE",
        },
        {
            "severity": "VERY HIGH",
            "location_id": "loc_009",
            "location_name": "Tawang, Arunachal Pradesh",
            "risk_score": 76,
            "cause": "High rainfall and extreme slope at high elevation",
            "timestamp": (now - timedelta(hours=6)).isoformat(),
            "recommended_action": "Evacuate high-risk settlements. Inspect and close vulnerable road sections near highway.",
            "status": "ACKNOWLEDGED",
        },
    ]

    for alert in sample_alerts:
        conn.execute(
            """
            INSERT INTO alerts
            (severity, location_id, location_name, risk_score, cause, timestamp, recommended_action, status)
            VALUES (?,?,?,?,?,?,?,?)
            """,
            (
                alert["severity"], alert["location_id"], alert["location_name"],
                alert["risk_score"], alert["cause"], alert["timestamp"],
                alert["recommended_action"], alert["status"],
            ),
        )
    conn.commit()
    print(f"[OK] Seeded {len(sample_alerts)} demo alerts")


def initialize_database() -> None:
    conn = get_connection()
    create_tables(conn)
    seed_locations(conn)
    seed_alerts(conn)
    conn.close()
    print("[OK] Database initialized")
