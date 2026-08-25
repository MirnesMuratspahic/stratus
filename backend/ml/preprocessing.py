import pandas as pd
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder

from ml.weather import WEATHER_FEATURES


# Flight schedule features + weather at the origin airport at departure time.
NUMERIC_FEATURES = [
    "month",
    "day_of_week",
    "dep_hour",
    "distance",
    *WEATHER_FEATURES,   # temperature, precipitation, snowfall, wind_speed, cloud_cover
]

CATEGORICAL_FEATURES = [
    "airline",
    "origin",
    "dest",
]

TARGET = "delay_class"

# Delay class thresholds (arrival delay in minutes). Class 1 follows the FAA /
# BTS definition of an on-time flight (arrives less than 15 minutes late).
ON_TIME_MAX = 15
MINOR_DELAY_MAX = 60

DELAY_LABELS = {
    1: "Na vrijeme - Dolazak sa najviše 15 minuta kašnjenja",
    2: "Manje kašnjenje - Dolazak 15 do 60 minuta nakon rasporeda",
    3: "Značajno kašnjenje - Dolazak više od 60 minuta nakon rasporeda",
    4: "Otkazan ili preusmjeren - Let vjerovatno neće biti realizovan po planu",
}

DELAY_COLORS = {
    1: "green",
    2: "yellow",
    3: "orange",
    4: "red",
}


def build_preprocessor() -> ColumnTransformer:
    numeric_pipeline = Pipeline([
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler()),
    ])

    categorical_pipeline = Pipeline([
        ("imputer", SimpleImputer(strategy="most_frequent")),
        ("encoder", OneHotEncoder(handle_unknown="ignore", sparse_output=False)),
    ])

    return ColumnTransformer([
        ("num", numeric_pipeline, NUMERIC_FEATURES),
        ("cat", categorical_pipeline, CATEGORICAL_FEATURES),
    ])


def delay_class(arr_delay_minutes: pd.Series, cancelled: pd.Series, diverted: pd.Series) -> pd.Series:
    # Cancelled / diverted flights have no arrival delay, so they are mapped
    # to their own class before the minute thresholds are applied.
    cls = pd.Series(1, index=arr_delay_minutes.index, dtype="int64")
    cls[arr_delay_minutes > ON_TIME_MAX] = 2
    cls[arr_delay_minutes > MINOR_DELAY_MAX] = 3
    cls[(cancelled == 1) | (diverted == 1)] = 4
    return cls


def clean_dataset(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()

    # Normalise column names to lowercase with no leading/trailing spaces.
    df.columns = df.columns.str.lower().str.strip()

    df = df[NUMERIC_FEATURES + CATEGORICAL_FEATURES + [TARGET]].copy()

    # Drop rows where the target is missing or not a valid class 1-4.
    df[TARGET] = pd.to_numeric(df[TARGET], errors="coerce")
    df = df.dropna(subset=[TARGET])
    df[TARGET] = df[TARGET].astype(int)
    df = df[df[TARGET].between(1, 4)]

    # Coerce numeric columns; non-parsable strings become NaN for the imputer.
    for col in NUMERIC_FEATURES:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce")

    # Standardise categorical codes to match inference-time normalisation.
    for col in CATEGORICAL_FEATURES:
        df[col] = df[col].fillna("unknown").astype(str).str.upper().str.strip()

    return df
