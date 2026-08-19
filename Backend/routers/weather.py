import asyncio
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, Query

import database
from schemas import SpaceWeatherCurrent
from services.geomagnetic_service import (
    get_geomagnetic_data,
    get_kp_forecast,
)
from services.risk_service import calculate_risk
from services.solar_activity_service import (
    get_solar_activity,
)
from services.solar_wind_service import (
    get_solar_wind,
)

router = APIRouter(
    prefix="/api/weather",
    tags=["Weather"],
)


@router.get(
    "/current",
    response_model=SpaceWeatherCurrent,
)
async def current_weather():

    try:

        geomagnetic, solar_wind, solar_activity = await asyncio.gather(
            get_geomagnetic_data(),
            get_solar_wind(),
            get_solar_activity(),
        )

        risk = calculate_risk(
            geomagnetic,
            solar_wind,
            solar_activity,
        )

        return {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "geomagnetic": geomagnetic,
            "solar_wind": solar_wind,
            "solar_activity": solar_activity,
            "risk": risk,
        }

    except Exception as exc:

        raise HTTPException(
            status_code=502,
            detail=("Unable to retrieve NOAA " f"space-weather data: {exc}"),
        )


@router.get("/forecast")
async def weather_forecast():

    try:
        return await get_kp_forecast()

    except Exception as exc:

        raise HTTPException(
            status_code=502,
            detail=f"Unable to retrieve forecast: {exc}",
        )


@router.get("/history")
async def weather_history(
    hours: int = Query(
        24,
        ge=1,
        le=168,
    ),
    source: str = Query(
        "live",
        pattern="^(live|replay)$",
    ),
):
    """
    Persisted history from our own SQLite store (populated by
    /api/sectors/current on every poll, or by /api/replay during a
    demo) -- this is what actually backs the 24-48hr dashboard graph,
    since NOAA's own feed doesn't retain long backfill for every field.
    """

    try:
        return {
            "hours": hours,
            "source": source,
            "readings": database.get_history(hours=hours, source=source),
        }

    except Exception as exc:

        raise HTTPException(
            status_code=502,
            detail=f"Unable to retrieve history: {exc}",
        )
