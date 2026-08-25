from datetime import date as date_type

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

from ml.airports import AIRPORTS
from ml.weather import fetch_forecast


router = APIRouter()


class WeatherResponse(BaseModel):
    airport: str
    date: date_type
    hour: int
    temperature: float
    precipitation: float
    snowfall: float
    wind_speed: float
    cloud_cover: float


@router.get("/weather", response_model=WeatherResponse)
async def weather(
    airport: str = Query(..., min_length=3, max_length=3, description="Origin airport IATA code"),
    date: date_type = Query(..., description="Local departure date (YYYY-MM-DD)"),
    hour: int = Query(..., ge=0, le=23, description="Local departure hour"),
):
    # Convenience endpoint: pre-fills the weather fields in the UI from the
    # Open-Meteo forecast so the user does not have to look them up manually.
    code = airport.upper()
    if code not in AIRPORTS:
        raise HTTPException(status_code=404, detail=f"Unknown airport code: {code}")
    try:
        data = fetch_forecast(code, date.isoformat(), hour)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Weather provider error: {str(e)}")
    if data is None:
        raise HTTPException(
            status_code=404,
            detail="No forecast available for that date (forecast horizon is ~16 days).",
        )
    return WeatherResponse(airport=code, date=date, hour=hour, **data)
