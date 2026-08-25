"""Generates a synthetic flights dataset for local development when the real
BTS / Open-Meteo download is not available (offline demo, CI, quick smoke test).

The output has the same columns as the frame produced by train_real.load_and_prepare()
so the rest of the pipeline works unchanged. Run with: python -m ml.generate_data
"""

import numpy as np
import pandas as pd
from pathlib import Path

from ml.airports import AIRPORTS, AIRLINES
from ml.preprocessing import NUMERIC_FEATURES, CATEGORICAL_FEATURES, TARGET

DATA_DIR = Path(__file__).parent / "data"
OUTPUT_PATH = DATA_DIR / "flights_synthetic.csv"
N_SAMPLES = 60_000
RANDOM_STATE = 42

rng = np.random.default_rng(RANDOM_STATE)

# Approximate real-world class distribution: most flights arrive on time.
CLASS_WEIGHTS = [0.76, 0.13, 0.08, 0.03]

# Per-class distributions (mean, std, lo, hi) for numeric features. Delayed and
# cancelled flights skew towards later departures, worse weather, busy months.
FEATURES = {
    1: {
        "month":         (6.5, 3.4, 1, 12),
        "day_of_week":   (4.0, 2.0, 1, 7),
        "dep_hour":      (12, 4.5, 5, 22),
        "distance":      (800, 550, 100, 2700),
        "temperature":   (17, 10, -20, 42),
        "precipitation": (0.1, 0.4, 0, 8),
        "snowfall":      (0.0, 0.05, 0, 3),
        "wind_speed":    (14, 7, 0, 60),
        "cloud_cover":   (45, 35, 0, 100),
    },
    2: {
        "month":         (6.8, 3.3, 1, 12),
        "day_of_week":   (4.1, 2.0, 1, 7),
        "dep_hour":      (15, 4.0, 5, 23),
        "distance":      (850, 560, 100, 2700),
        "temperature":   (18, 10, -20, 42),
        "precipitation": (0.4, 1.0, 0, 15),
        "snowfall":      (0.05, 0.2, 0, 5),
        "wind_speed":    (19, 9, 0, 70),
        "cloud_cover":   (60, 33, 0, 100),
    },
    3: {
        "month":         (7.0, 3.0, 1, 12),
        "day_of_week":   (4.2, 2.0, 1, 7),
        "dep_hour":      (17, 3.5, 5, 23),
        "distance":      (900, 580, 100, 2700),
        "temperature":   (19, 11, -20, 42),
        "precipitation": (1.2, 2.2, 0, 25),
        "snowfall":      (0.15, 0.5, 0, 8),
        "wind_speed":    (25, 11, 0, 80),
        "cloud_cover":   (72, 28, 0, 100),
    },
    4: {
        "month":         (5.5, 4.0, 1, 12),
        "day_of_week":   (4.0, 2.0, 1, 7),
        "dep_hour":      (13, 5.0, 5, 23),
        "distance":      (700, 500, 100, 2700),
        "temperature":   (8, 13, -25, 40),
        "precipitation": (2.5, 3.5, 0, 40),
        "snowfall":      (0.8, 1.5, 0, 15),
        "wind_speed":    (34, 14, 0, 100),
        "cloud_cover":   (85, 20, 0, 100),
    },
}

INT_FEATURES = {"month", "day_of_week", "dep_hour", "distance"}


def sample_features(cls: int, n: int) -> dict:
    spec = FEATURES[cls]
    result = {}
    for col, (mean, std, lo, hi) in spec.items():
        vals = np.clip(rng.normal(mean, std, n), lo, hi)
        result[col] = np.round(vals).astype(int) if col in INT_FEATURES else np.round(vals, 1)
    return result


def generate():
    DATA_DIR.mkdir(parents=True, exist_ok=True)

    if OUTPUT_PATH.exists():
        print(f"Dataset already exists at {OUTPUT_PATH} - skipping generation.")
        return

    print(f"Generating {N_SAMPLES:,} synthetic flight records...")

    counts = (np.array(CLASS_WEIGHTS) * N_SAMPLES).astype(int)
    counts[-1] += N_SAMPLES - counts.sum()

    airports = list(AIRPORTS)
    airlines = list(AIRLINES)

    frames = []
    for cls in range(1, 5):
        n = counts[cls - 1]
        df = pd.DataFrame(sample_features(cls, n))
        df["airline"] = rng.choice(airlines, n)
        df["origin"] = rng.choice(airports, n)
        # Make sure destination differs from origin.
        dest = rng.choice(airports, n)
        same = dest == df["origin"].to_numpy()
        dest[same] = np.roll(dest[same], 1) if same.sum() > 1 else airports[0]
        df["dest"] = dest
        df[TARGET] = cls
        frames.append(df)

    df_all = pd.concat(frames, ignore_index=True)
    df_all = df_all.sample(frac=1, random_state=RANDOM_STATE).reset_index(drop=True)
    df_all = df_all[NUMERIC_FEATURES + CATEGORICAL_FEATURES + [TARGET]]

    df_all.to_csv(OUTPUT_PATH, index=False)
    print(f"Dataset saved: {OUTPUT_PATH}")
    print(f"Shape: {df_all.shape}")
    print("\nDelay class distribution:")
    print(df_all[TARGET].value_counts().sort_index())
    print(f"\nSample row:\n{df_all.iloc[0].to_dict()}")
    print("\nYou can now run: python -m ml.train_real --synthetic")


if __name__ == "__main__":
    generate()
