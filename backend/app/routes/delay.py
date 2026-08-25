from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from ml.predict import predict_delay, FlightInput


router = APIRouter()


class DelayRequest(BaseModel):
    airline: str = Field(..., min_length=2, max_length=3, description="BTS airline code, e.g. DL")
    origin: str = Field(..., min_length=3, max_length=3, description="Origin airport IATA code, e.g. ATL")
    dest: str = Field(..., min_length=3, max_length=3, description="Destination airport IATA code, e.g. LAX")
    month: int = Field(..., ge=1, le=12, description="Month of departure 1-12")
    day_of_week: int = Field(..., ge=1, le=7, description="Day of week 1=Monday .. 7=Sunday")
    dep_hour: int = Field(..., ge=0, le=23, description="Scheduled local departure hour 0-23")
    distance: float = Field(..., ge=0, le=6000, description="Route distance in miles")
    temperature: float = Field(..., ge=-50, le=60, description="Temperature at origin in °C")
    precipitation: float = Field(..., ge=0, le=200, description="Precipitation at origin in mm/h")
    snowfall: float = Field(..., ge=0, le=100, description="Snowfall at origin in cm/h")
    wind_speed: float = Field(..., ge=0, le=250, description="Wind speed at origin in km/h")
    cloud_cover: float = Field(..., ge=0, le=100, description="Cloud cover at origin in %")


class DelayResponse(BaseModel):
    delay_class: int
    label: str
    color: str
    confidence: float
    probabilities: dict[int, float]
    recommendation: str


@router.post("/delay", response_model=DelayResponse)
async def delay(request: DelayRequest):
    try:
        result = predict_delay(FlightInput(
            airline=request.airline,
            origin=request.origin,
            dest=request.dest,
            month=request.month,
            day_of_week=request.day_of_week,
            dep_hour=request.dep_hour,
            distance=request.distance,
            temperature=request.temperature,
            precipitation=request.precipitation,
            snowfall=request.snowfall,
            wind_speed=request.wind_speed,
            cloud_cover=request.cloud_cover,
        ))
        return DelayResponse(
            delay_class=result.delay_class,
            label=result.label,
            color=result.color,
            confidence=result.confidence,
            probabilities=result.probabilities,
            recommendation=result.recommendation,
        )
    except FileNotFoundError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Delay prediction error: {str(e)}")
