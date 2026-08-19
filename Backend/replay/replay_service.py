import json
from datetime import datetime, timezone
from pathlib import Path

import database
from services.risk_service import calculate_risk

EVENTS_PATH = Path(__file__).resolve().parent / "historical_events.json"

with open(EVENTS_PATH) as f:
    HISTORICAL_EVENTS: dict = json.load(f)


def list_events() -> list[dict]:
    return [
        {"id": event_id, "name": data["name"], "description": data["description"]}
        for event_id, data in HISTORICAL_EVENTS.items()
    ]


def run_replay(event_id: str) -> list[dict]:
    """
    Feed a historical storm's data points through the exact same
    risk engine used for live data, and persist each step to the DB
    tagged source='replay'. Returns the computed risk timeline so the
    frontend can animate the dashboard reacting to it.
    """

    if event_id not in HISTORICAL_EVENTS:
        raise ValueError(f"Unknown event: {event_id}")

    database.clear_replay_readings()

    event = HISTORICAL_EVENTS[event_id]
    timeline = []

    for point in event["sequence"]:
        geomagnetic = {"kp": point["kp"], "dst": point["dst"]}
        solar_wind = {"speed": point["speed"], "bz": point["bz"], "density": None}
        solar_activity = {
            "xray_flux": point["xray_flux"],
            "proton_flux": point["proton_flux"],
        }

        risk = calculate_risk(geomagnetic, solar_wind, solar_activity)

        time_tag = datetime.now(timezone.utc).isoformat()

        database.insert_reading(
            {
                "time_tag": time_tag,
                "kp": point["kp"],
                "dst": point["dst"],
                "solar_wind_speed": point["speed"],
                "bz": point["bz"],
                "xray_flux": point["xray_flux"],
                "proton_flux": point["proton_flux"],
                "overall_score": risk.overall_score,
                "overall_level": risk.overall_level.value,
            },
            source="replay",
        )

        timeline.append(
            {
                "minute": point["minute"],
                "time_tag": time_tag,
                "inputs": point,
                "risk": risk.model_dump(),
            }
        )

    return timeline
