import os
import joblib
import pandas as pd
import numpy as np
from dataclasses import dataclass

from ml.preprocessing import (
    NUMERIC_FEATURES,
    CATEGORICAL_FEATURES,
    DELAY_LABELS,
    DELAY_COLORS,
)

MODEL_PATH = os.path.join(os.path.dirname(__file__), "delay_model.joblib")

# Module-level cache so the model is loaded from disk only once per process.
_model = None


def _load_model():
    # Raises FileNotFoundError if model not trained yet - run ml.train_real first.
    global _model
    if _model is None:
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(
                f"Trained model not found at {MODEL_PATH}. "
                "Run 'python -m ml.train_real' first."
            )
        _model = joblib.load(MODEL_PATH)
    return _model


@dataclass
class FlightInput:
    airline: str
    origin: str
    dest: str
    month: int
    day_of_week: int
    dep_hour: int
    distance: float
    temperature: float
    precipitation: float
    snowfall: float
    wind_speed: float
    cloud_cover: float


@dataclass
class DelayResult:
    delay_class: int
    label: str
    color: str
    confidence: float
    probabilities: dict[int, float]
    recommendation: str


RECOMMENDATIONS = {
    1: "NA VRIJEME: Let bi trebao stići prema rasporedu. Standardni dolazak na aerodrom (2 sata prije polaska) je dovoljan.",
    2: "MANJE KAŠNJENJE: Moguće kašnjenje od 15 do 60 minuta. Provjerite status leta prije polaska na aerodrom i izbjegavajte kratka presjedanja (< 60 min).",
    3: "ZNAČAJNO KAŠNJENJE: Visok rizik kašnjenja preko sat vremena. Planirajte presjedanje od najmanje 2 sata i pratite obavještenja aviokompanije.",
    4: "RIZIK OTKAZIVANJA: Uslovi ukazuju na moguće otkazivanje ili preusmjeravanje. Razmotrite alternativni let i provjerite pravila aviokompanije o preknjižavanju.",
}


def predict_delay(input_data: FlightInput) -> DelayResult:
    model = _load_model()

    # Categorical codes must be uppercase/stripped to match training encoding.
    row = {
        "airline": input_data.airline.upper().strip(),
        "origin": input_data.origin.upper().strip(),
        "dest": input_data.dest.upper().strip(),
        "month": input_data.month,
        "day_of_week": input_data.day_of_week,
        "dep_hour": input_data.dep_hour,
        "distance": input_data.distance,
        "temperature": input_data.temperature,
        "precipitation": input_data.precipitation,
        "snowfall": input_data.snowfall,
        "wind_speed": input_data.wind_speed,
        "cloud_cover": input_data.cloud_cover,
    }

    df = pd.DataFrame([row])[NUMERIC_FEATURES + CATEGORICAL_FEATURES]

    # Model outputs class indices 0-3; add 1 to get the delay class 1-4.
    cls_pred = int(model.predict(df)[0]) + 1
    proba = model.predict_proba(df)[0]

    # Convert raw probabilities (0-1) to percentage rounded to 1 decimal.
    probabilities = {i + 1: round(float(p) * 100, 1) for i, p in enumerate(proba)}
    # Confidence = probability of the predicted class.
    confidence = round(float(np.max(proba)) * 100, 1)

    return DelayResult(
        delay_class=cls_pred,
        label=DELAY_LABELS[cls_pred],
        color=DELAY_COLORS[cls_pred],
        confidence=confidence,
        probabilities=probabilities,
        recommendation=RECOMMENDATIONS[cls_pred],
    )
