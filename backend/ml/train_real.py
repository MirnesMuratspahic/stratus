"""Trains the Stratus delay model on real Avinor flight records enriched with
Open-Meteo weather and saves the fitted sklearn Pipeline to delay_model.joblib.

    python -m ml.train_real              # real data (run ml.download_data first)
    python -m ml.train_real --synthetic  # synthetic data from ml.generate_data
"""

import os
import sys
import joblib
import numpy as np
import pandas as pd
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score, balanced_accuracy_score
from xgboost import XGBClassifier

from ml.preprocessing import (
    NUMERIC_FEATURES,
    CATEGORICAL_FEATURES,
    TARGET,
    build_preprocessor,
    clean_dataset,
    delay_class,
)
from ml.airports import route_distance_km
from ml.weather import WEATHER_FEATURES

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
FLIGHTS_CSV = os.path.join(DATA_DIR, "flights.csv")
WEATHER_CSV = os.path.join(DATA_DIR, "weather.csv")
SYNTHETIC_CSV = os.path.join(DATA_DIR, "flights_synthetic.csv")
MODEL_PATH = os.path.join(os.path.dirname(__file__), "delay_model.joblib")

# Cap on training rows to keep training time reasonable on a laptop. The Avinor
# dataset holds ~400k eligible flights, so by default all of them are used.
MAX_ROWS = int(os.getenv("STRATUS_MAX_ROWS", "1000000"))

# 90:10 split: compared with 50:50 .. 90:10 over 5 random splits each, more
# training data gave a slightly higher ROC AUC and balanced accuracy, and 10 %
# of the dataset (~40k flights) is still a large enough test set.
TEST_SIZE = 0.1

# All airports in the dataset are in Norway.
LOCAL_TZ = "Europe/Oslo"

# Arrival times further than this from the schedule are treated as data errors.
MAX_EARLY_MINUTES = 120
MAX_DELAY_MINUTES = 24 * 60


def load_and_prepare() -> pd.DataFrame:
    print("Loading real Avinor flight dataset...")
    df = pd.read_csv(FLIGHTS_CSV, parse_dates=["std", "sta", "ata"])
    print(f"  Raw rows: {len(df):,}")

    # Avinor times are UTC; the model works with the local departure time.
    local_std = df["std"].dt.tz_localize("UTC").dt.tz_convert(LOCAL_TZ).dt.tz_localize(None)

    result = pd.DataFrame(index=df.index)
    # Map raw Avinor column names to the feature names used by the model.
    result["airline"] = df["airline"].astype(str)
    result["origin"] = df["dep_airport"].astype(str)
    result["dest"] = df["arr_airport"].astype(str)
    result["month"] = local_std.dt.month
    result["day_of_week"] = local_std.dt.dayofweek + 1
    result["dep_hour"] = local_std.dt.hour
    # Avinor has no distance column, so it is the great-circle route distance.
    result["distance"] = [route_distance_km(o, d) for o, d in zip(result["origin"], result["dest"])]

    cancelled = pd.to_numeric(df["cancelled"], errors="coerce").fillna(0)
    arr_delay = (df["ata"] - df["sta"]).dt.total_seconds() / 60
    result[TARGET] = delay_class(arr_delay.fillna(0), cancelled)

    # Flown flights without an actual arrival time have an unknown outcome, and
    # a handful of records have impossible arrival times (days off schedule).
    flown = cancelled == 0
    valid = ~flown | (arr_delay.notna() & arr_delay.between(-MAX_EARLY_MINUTES, MAX_DELAY_MINUTES))
    print(f"  Dropped flights without a valid arrival time: {(~valid).sum():,}")
    result = result[valid]
    local_std = local_std[valid]

    # Join hourly weather at the origin airport for the scheduled departure hour.
    print("  Merging Open-Meteo weather at origin airport / departure hour...")
    result["time"] = local_std.dt.floor("h")
    weather = pd.read_csv(WEATHER_CSV, parse_dates=["time"])
    weather = weather.rename(columns={"airport": "origin"})
    # Autumn DST change repeats one local hour; keep a single weather row for it.
    weather = weather.drop_duplicates(subset=["origin", "time"])
    result = result.merge(weather, on=["origin", "time"], how="left")
    missing = result[WEATHER_FEATURES[0]].isna().mean() * 100
    print(f"  Rows without weather match: {missing:.2f}% (imputed with median)")
    result = result.drop(columns=["time"])

    result = clean_dataset(result)
    print(f"  Clean rows: {len(result):,}")
    print(f"  Delay class distribution:\n{result[TARGET].value_counts().sort_index()}")
    return result


def load_synthetic() -> pd.DataFrame:
    print("Loading synthetic dataset...")
    df = pd.read_csv(SYNTHETIC_CSV)
    df = clean_dataset(df)
    print(f"  Rows: {len(df):,}")
    return df


def train(synthetic: bool = False):
    df = load_synthetic() if synthetic else load_and_prepare()

    if len(df) > MAX_ROWS:
        print(f"Sampling {MAX_ROWS:,} of {len(df):,} rows (stratified)...")
        df, _ = train_test_split(df, train_size=MAX_ROWS, random_state=42, stratify=df[TARGET])

    X = df[NUMERIC_FEATURES + CATEGORICAL_FEATURES]
    y = df[TARGET] - 1

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=TEST_SIZE, random_state=42, stratify=y
    )

    # Flights are heavily imbalanced (~3/4 on time). Mild re-weighting of the
    # minority classes keeps the probabilities informative for delayed flights
    # without collapsing overall accuracy.
    class_freq = y_train.value_counts(normalize=True)
    weights = y_train.map(lambda c: (1.0 / class_freq[c]) ** 0.5).to_numpy()
    weights = weights / weights.mean()

    model = Pipeline([
        ("preprocessor", build_preprocessor()),
        ("classifier", XGBClassifier(
            n_estimators=300,
            max_depth=6,
            learning_rate=0.1,
            subsample=0.8,
            colsample_bytree=0.8,
            eval_metric="mlogloss",
            random_state=42,
            n_jobs=-1,
        )),
    ])

    print("Training XGBoost model on real data..." if not synthetic else "Training XGBoost model on synthetic data...")
    model.fit(X_train, y_train, classifier__sample_weight=weights)

    y_pred = model.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    bal = balanced_accuracy_score(y_test, y_pred)
    print(f"\nTest accuracy: {acc:.4f}")
    print(f"Balanced accuracy: {bal:.4f}")
    print("\nClassification report:")
    print(classification_report(
        y_test, y_pred,
        target_names=["Na vrijeme", "Manje kašnjenje", "Značajno kašnjenje", "Otkazan"],
    ))

    joblib.dump(model, MODEL_PATH)
    print(f"\nModel saved to: {MODEL_PATH}")


if __name__ == "__main__":
    train(synthetic="--synthetic" in sys.argv)
