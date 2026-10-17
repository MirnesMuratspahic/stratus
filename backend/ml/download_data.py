"""Downloads the real training data used by Stratus.

1. Flight records - Avinor historical flights. Avinor, the operator of the
   Norwegian state airports, released ~410k flights (January 2018 - July 2025)
   with scheduled and actual departure/arrival times and a cancellation flag for
   its "remote towers" ML competition. The file is mirrored in a public GitHub
   repository (no account needed). We keep only scheduled passenger flights
   between the AIRPORTS and operated by the AIRLINES listed in ml/airports.py
   and store the result in ml/data/flights.csv.

2. Weather records - Open-Meteo historical archive (ERA5). Hourly weather for
   each origin airport for the same period is stored in ml/data/weather.csv and
   merged onto the flights at training time.

Usage:
    python -m ml.download_data
"""

import time
from pathlib import Path

import pandas as pd
import requests

from ml.airports import AIRPORTS, AIRLINES
from ml.weather import fetch_archive

DATA_DIR = Path(__file__).parent / "data"
RAW_DIR = DATA_DIR / "raw"
WEATHER_RAW_DIR = RAW_DIR / "weather"
RAW_FLIGHTS_CSV = RAW_DIR / "avinor_historical_flights.csv"
FLIGHTS_CSV = DATA_DIR / "flights.csv"
WEATHER_CSV = DATA_DIR / "weather.csv"

# Pinned to a commit so the training data cannot change underneath the model.
AVINOR_URL = (
    "https://github.com/MiladTootoonchi/Avinor-Predictions/raw/"
    "a51f0974d82075ccab5690963db689326c4113e9/data/historical_flights.csv"
)

# Avinor service type "J" = scheduled passenger flight (IATA service type code).
SCHEDULED_PASSENGER = "J"

# A few flight numbers use the ICAO airline prefix instead of the IATA one.
ICAO_TO_IATA = {"LPA": "FL"}


def airline_code(flight_id: pd.Series) -> pd.Series:
    """Extracts the IATA airline code from an Avinor flight number (e.g. WF149 -> WF)."""
    icao = flight_id.str[:3].map(ICAO_TO_IATA)
    return icao.fillna(flight_id.str[:2])


def _download_raw() -> Path:
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    if RAW_FLIGHTS_CSV.exists():
        print(f"  {RAW_FLIGHTS_CSV.name} already downloaded - skipping.")
        return RAW_FLIGHTS_CSV
    print(f"  Downloading {AVINOR_URL} ...")
    with requests.get(AVINOR_URL, stream=True, timeout=300) as resp:
        resp.raise_for_status()
        with open(RAW_FLIGHTS_CSV, "wb") as fh:
            for chunk in resp.iter_content(chunk_size=1 << 20):
                fh.write(chunk)
    return RAW_FLIGHTS_CSV


def download_flights() -> None:
    if FLIGHTS_CSV.exists():
        print(f"Flights dataset already exists at {FLIGHTS_CSV} - skipping download.")
        return

    print("Downloading Avinor historical flight data ...")
    df = pd.read_csv(_download_raw())
    print(f"  Raw flights: {len(df):,}")
    df["airline"] = airline_code(df["flight_id"].astype(str))

    # Keep only the airport/airline universe known to the model. A few dozen
    # records have the same departure and arrival airport and are dropped.
    df = df[
        (df["service_type"] == SCHEDULED_PASSENGER)
        & df["dep_airport"].isin(AIRPORTS)
        & df["arr_airport"].isin(AIRPORTS)
        & (df["dep_airport"] != df["arr_airport"])
        & df["airline"].isin(AIRLINES)
    ]
    df.to_csv(FLIGHTS_CSV, index=False)
    print(f"\nFlights dataset saved: {FLIGHTS_CSV}  ({len(df):,} rows)")


def _weather_range() -> tuple[str, str]:
    # Scheduled times are UTC; pad by a day so every local departure hour is covered.
    std = pd.to_datetime(pd.read_csv(FLIGHTS_CSV, usecols=["std"])["std"])
    start = (std.min() - pd.Timedelta(days=1)).strftime("%Y-%m-%d")
    end = (std.max() + pd.Timedelta(days=1)).strftime("%Y-%m-%d")
    return start, end


def _fetch_with_rate_limit(code: str, start: str, end: str, attempts: int = 5) -> pd.DataFrame:
    # A multi-year request counts as ~100 calls against the Open-Meteo free
    # per-minute limit, so after a few airports we have to wait for it to reset.
    for attempt in range(attempts):
        try:
            return fetch_archive(code, start, end)
        except RuntimeError:
            if attempt == attempts - 1:
                raise
            print("    Open-Meteo rate limit reached - waiting 70 s ...")
            time.sleep(70)


def download_weather() -> None:
    if WEATHER_CSV.exists():
        print(f"Weather dataset already exists at {WEATHER_CSV} - skipping download.")
        return

    start, end = _weather_range()
    WEATHER_RAW_DIR.mkdir(parents=True, exist_ok=True)
    print(f"\nDownloading Open-Meteo hourly weather {start} .. {end} for {len(AIRPORTS)} airports ...")
    frames = []
    for i, code in enumerate(AIRPORTS, 1):
        # Each airport is cached separately, so an interrupted run (e.g. the
        # Open-Meteo hourly rate limit) resumes where it stopped.
        part_csv = WEATHER_RAW_DIR / f"{code}.csv"
        if part_csv.exists():
            print(f"  [{i:2d}/{len(AIRPORTS)}] {code} (cached)")
            frames.append(pd.read_csv(part_csv, parse_dates=["time"]))
            continue
        print(f"  [{i:2d}/{len(AIRPORTS)}] {code}")
        part = _fetch_with_rate_limit(code, start, end)
        part.to_csv(part_csv, index=False)
        frames.append(part)
        time.sleep(1)
    df = pd.concat(frames, ignore_index=True)
    df.to_csv(WEATHER_CSV, index=False)
    print(f"\nWeather dataset saved: {WEATHER_CSV}  ({len(df):,} rows)")


def download() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    download_flights()
    download_weather()
    print("\nYou can now run: python -m ml.train_real")


if __name__ == "__main__":
    download()
