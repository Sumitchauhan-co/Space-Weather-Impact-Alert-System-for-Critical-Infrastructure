import asyncio

from fastapi import APIRouter, HTTPException

import database
from sector.sector_mapper import build_sector_cards
from services.alert_service import check_and_trigger
from services.geomagnetic_service import get_geomagnetic_data
from services.risk_service import calculate_risk
from services.solar_activity_service import get_solar_activity
from services.solar_wind_service import get_solar_wind

router = APIRouter(
    prefix="/api/sectors",
    tags=["Sectors"],
)


@router.get("/current")
async def current_sectors():
    """
    The dashboard's main endpoint: current risk translated into
    plain-language impact + recommended action per sector
    (Power / Telecom / Aviation / Railways).
    """

    try:
        geomagnetic, solar_wind, solar_activity = await asyncio.gather(
            get_geomagnetic_data(),
            get_solar_wind(),
            get_solar_activity(),
        )

        risk = calculate_risk(geomagnetic, solar_wind, solar_activity)

        database.insert_reading(
            {
                "time_tag": geomagnetic.get("time_tag"),
                "kp": geomagnetic.get("kp"),
                "dst": geomagnetic.get("dst"),
                "solar_wind_speed": solar_wind.get("speed"),
                "bz": solar_wind.get("bz"),
                "xray_flux": solar_activity.get("xray_flux"),
                "proton_flux": solar_activity.get("proton_flux"),
                "overall_score": risk.overall_score,
                "overall_level": risk.overall_level.value,
            },
            source="live",
        )

        alert = check_and_trigger(risk, source="live")

        return {
            "overall_score": risk.overall_score,
            "overall_level": risk.overall_level.value,
            "confidence": risk.confidence,
            "sectors": build_sector_cards(risk),
            "alert_triggered": alert,
        }

    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Unable to build sector view: {exc}",
        )
