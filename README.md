# Stratus - Flight Delay Prediction System

> An intelligent decision-support tool for travellers, airline dispatchers and airport operations staff, powered by a machine learning model trained on real US flight records and historical weather data.

---

## About the Project

**Stratus** is a web application that uses machine learning to estimate the risk of a flight arriving late before it departs. It predicts one of four **delay classes** - on time, minor delay, significant delay, or cancelled/diverted - based on the flight schedule and the weather at the origin airport at the scheduled departure hour.

The model was trained on **4.2 million real domestic flights** between the 50 busiest US airports in 2024 (source: US Department of Transportation, Bureau of Transportation Statistics *Airline On-Time Performance* database), enriched with **hourly historical weather** from the Open-Meteo ERA5 archive. It reaches an accuracy of **~75.7%** on held-out data, with the strongest signal for the on-time class; minority classes (delays and cancellations) are harder to separate from pre-departure data alone, which is why the app always shows the full probability distribution rather than a single verdict.

The project was developed as an academic project following the architecture of the **Priora** medical triage assistant.

---

## Purpose and Use

Roughly one in five US domestic flights arrives more than 15 minutes late, and weather is the single largest cause of delay minutes. Travellers, dispatchers and ground operations staff have to decide early whether a connection is safe, whether extra crew or gates are needed, or whether a passenger should be rebooked - decisions that are easier with an objective risk estimate.

**Stratus** assists by:

- Accepting the **flight details** (airline, origin and destination airport, date, scheduled departure hour, route distance)
- Accepting the **weather conditions** at the origin airport (temperature, precipitation, snowfall, wind speed, cloud cover) - or fetching them automatically from the Open-Meteo forecast
- Returning a **suggested delay class** with a confidence percentage within seconds
- Displaying the **probability distribution** across all 4 delay classes
- Generating a **printable delay assessment report** with a signature line

Stratus is **not** a replacement for official airline information - it is a tool that supports and accelerates planning, especially on days with adverse weather or heavy traffic.

---

## Who Uses Stratus

| User                                   | How They Use It                                                                    |
| -------------------------------------- | ---------------------------------------------------------------------------------- |
| **Travellers**                         | Check the delay risk before booking a tight connection or leaving for the airport |
| **Airline dispatchers / ops staff**    | Plan crew, gates and rebooking capacity on days with elevated delay risk           |
| **Airport operations**                 | Anticipate congestion and resource needs for the day                               |
| **Researchers and students**           | Analyse the factors influencing delays through an interactive interface            |

---

## Delay Classes

| Class | Label                    | Definition (arrival delay)              |
| ----- | ------------------------ | --------------------------------------- |
| 1     | On time                  | ≤ 15 minutes (FAA/BTS on-time standard) |
| 2     | Minor delay              | 15 - 60 minutes                         |
| 3     | Significant delay        | > 60 minutes                            |
| 4     | Cancelled / diverted     | Flight cancelled or diverted            |

---

## Running the Project

**Backend** (Python 3.12+)

```bash
cd backend
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python -m ml.download_data      # downloads BTS flights + Open-Meteo weather (~330 MB, 2024)
python -m ml.train_real         # trains XGBoost and saves ml/delay_model.joblib
python run.py                   # API on http://localhost:8000 (docs at /docs)
```

For an offline smoke test without downloading: `python -m ml.generate_data && python -m ml.train_real --synthetic`.

**Frontend** (Node 20+)

```bash
cd frontend
npm install
npm run dev                     # http://localhost:5173
```

---

_Stratus was developed as a prototype and academic project. Predictions are statistical estimates and must not be used as the sole basis for operational decisions._
