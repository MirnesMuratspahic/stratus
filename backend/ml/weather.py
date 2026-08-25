"""Weather access layer built on the free Open-Meteo API (no API key required).

Two entry points:
  * fetch_archive()  - historical hourly weather (ERA5 reanalysis) used to
                       enrich the BTS flight records before training.
  * fetch_forecast() - hourly forecast (up to 16 days ahead) used by the API
                       to pre-fill the weather fields for a planned flight.

Both return the same five variables so that training and inference features
are produced by exactly the same code path.
"""

import time
import requests
import pandas as pd

from ml.airports import AIRPORTS

ARCHIVE_URL = "https://archive-api.open-meteo.com/v1/archive"
FORECAST_URL = "https://api.open-meteo.com/v1/forecast"

# Open-Meteo variable name -> model feature name.
HOURLY_VARS = {
    "temperature_2m": "temperature",      # °C
    "precipitation": "precipitation",     # mm / h
    "snowfall": "snowfall",               # cm / h
    "wind_speed_10m": "wind_speed",       # km/h
    "cloud_cover": "cloud_cover",         # %
}

WEATHER_FEATURES = list(HOURLY_VARS.values())


def _request(url: str, params: dict, retries: int = 4) -> dict:
    # Open-Meteo occasionally rate-limits bursts of requests; back off and retry.
    for attempt in range(retries):
        try:
            resp = requests.get(url, params=params, timeout=60)
            if resp.status_code == 200:
                return resp.json()
            if resp.status_code == 429:
                time.sleep(5 * (attempt + 1))
                continue
            resp.raise_for_status()
        except requests.RequestException:
            if attempt == retries - 1:
                raise
            time.sleep(3 * (attempt + 1))
    raise RuntimeError(f"Open-Meteo request failed after {retries} attempts: {params}")


def _to_frame(payload: dict, airport: str) -> pd.DataFrame:
    hourly = payload["hourly"]
    df = pd.DataFrame({"time": pd.to_datetime(hourly["time"])})
    for src, dst in HOURLY_VARS.items():
        df[dst] = pd.to_numeric(pd.Series(hourly[src]), errors="coerce")
    df.insert(0, "airport", airport)
    return df


def fetch_archive(airport: str, start_date: str, end_date: str) -> pd.DataFrame:
    """Hourly historical weather for one airport, in the airport's local time."""
    meta = AIRPORTS[airport]
    payload = _request(ARCHIVE_URL, {
        "latitude": meta["lat"],
        "longitude": meta["lon"],
        "start_date": start_date,
        "end_date": end_date,
        "hourly": ",".join(HOURLY_VARS.keys()),
        "timezone": meta["tz"],
    })
    return _to_frame(payload, airport)


def fetch_forecast(airport: str, date: str, hour: int) -> dict | None:
    """Forecast weather for one airport at a given local date + hour.

    Returns a dict with WEATHER_FEATURES keys, or None if the date is outside
    the forecast horizon (Open-Meteo serves roughly -3 months .. +16 days).
    """
    meta = AIRPORTS[airport]
    payload = _request(FORECAST_URL, {
        "latitude": meta["lat"],
        "longitude": meta["lon"],
        "start_date": date,
        "end_date": date,
        "hourly": ",".join(HOURLY_VARS.keys()),
        "timezone": meta["tz"],
    })
    df = _to_frame(payload, airport)
    row = df[df["time"].dt.hour == int(hour)]
    if row.empty:
        return None
    rec = row.iloc[0]
    if rec[WEATHER_FEATURES].isna().any():
        return None
    return {k: round(float(rec[k]), 1) for k in WEATHER_FEATURES}
