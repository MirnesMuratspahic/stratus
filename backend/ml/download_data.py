"""Downloads the real training data used by Stratus.

1. Flight records - Bureau of Transportation Statistics (BTS), "Airline On-Time
   Performance" reporting database. One zip per month is published at a stable
   public URL (no account needed). Each month holds ~600k flights; we keep only
   flights between the AIRPORTS and operated by the AIRLINES listed in
   ml/airports.py and store the result in ml/data/flights.csv.

2. Weather records - Open-Meteo historical archive (ERA5). Hourly weather for
   each origin airport for the same period is stored in ml/data/weather.csv and
   merged onto the flights at training time.

Usage:
    python -m ml.download_data            # full year (STRATUS_YEAR, default 2024)
    STRATUS_MONTHS=1-3 python -m ml.download_data
"""

import os
import io
import zipfile
from pathlib import Path

import pandas as pd
import requests
from dotenv import load_dotenv

from ml.airports import AIRPORTS, AIRLINES
from ml.weather import fetch_archive

load_dotenv()

DATA_DIR = Path(__file__).parent / "data"
RAW_DIR = DATA_DIR / "raw"
FLIGHTS_CSV = DATA_DIR / "flights.csv"
WEATHER_CSV = DATA_DIR / "weather.csv"

YEAR = int(os.getenv("STRATUS_YEAR", "2024"))

BTS_URL = (
    "https://transtats.bts.gov/PREZIP/"
    "On_Time_Reporting_Carrier_On_Time_Performance_1987_present_{year}_{month}.zip"
)

# Columns read from the raw BTS csv (it has 110 columns; we need a handful).
BTS_COLUMNS = [
    "FlightDate", "Month", "DayOfWeek", "Reporting_Airline",
    "Origin", "Dest", "CRSDepTime", "Distance",
    "ArrDelayMinutes", "Cancelled", "Diverted",
]


def _months() -> list[int]:
    spec = os.getenv("STRATUS_MONTHS", "1-12")
    if "-" in spec:
        lo, hi = spec.split("-")
        return list(range(int(lo), int(hi) + 1))
    return [int(m) for m in spec.split(",")]


def _download_month(year: int, month: int) -> Path:
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    target = RAW_DIR / f"bts_{year}_{month:02d}.zip"
    if target.exists():
        print(f"  {target.name} already downloaded - skipping.")
        return target
    url = BTS_URL.format(year=year, month=month)
    print(f"  Downloading {url} ...")
    with requests.get(url, stream=True, timeout=300) as resp:
        resp.raise_for_status()
        with open(target, "wb") as fh:
            for chunk in resp.iter_content(chunk_size=1 << 20):
                fh.write(chunk)
    return target


def _read_month(zip_path: Path) -> pd.DataFrame:
    with zipfile.ZipFile(zip_path) as zf:
        csv_name = next(n for n in zf.namelist() if n.lower().endswith(".csv"))
        with zf.open(csv_name) as fh:
            df = pd.read_csv(io.TextIOWrapper(fh, encoding="latin-1"), usecols=BTS_COLUMNS, low_memory=False)
    # Keep only the airport/airline universe known to the model.
    df = df[
        df["Origin"].isin(AIRPORTS)
        & df["Dest"].isin(AIRPORTS)
        & df["Reporting_Airline"].isin(AIRLINES)
    ]
    return df


def download_flights() -> None:
    if FLIGHTS_CSV.exists():
        print(f"Flights dataset already exists at {FLIGHTS_CSV} - skipping download.")
        return

    frames = []
    print(f"Downloading BTS on-time performance data for {YEAR} ...")
    for month in _months():
        zip_path = _download_month(YEAR, month)
        part = _read_month(zip_path)
        print(f"  {YEAR}-{month:02d}: {len(part):,} flights kept")
        frames.append(part)

    df = pd.concat(frames, ignore_index=True)
    df.to_csv(FLIGHTS_CSV, index=False)
    print(f"\nFlights dataset saved: {FLIGHTS_CSV}  ({len(df):,} rows)")


def download_weather() -> None:
    if WEATHER_CSV.exists():
        print(f"Weather dataset already exists at {WEATHER_CSV} - skipping download.")
        return

    months = _months()
    start = f"{YEAR}-{months[0]:02d}-01"
    end = (pd.Timestamp(YEAR, months[-1], 1) + pd.offsets.MonthEnd(0)).strftime("%Y-%m-%d")

    print(f"\nDownloading Open-Meteo hourly weather {start} .. {end} for {len(AIRPORTS)} airports ...")
    frames = []
    for i, code in enumerate(AIRPORTS, 1):
        print(f"  [{i:2d}/{len(AIRPORTS)}] {code}")
        frames.append(fetch_archive(code, start, end))
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
