import axios from "axios";
import type {
  DelayRequest,
  DelayResponse,
  WeatherResponse,
} from "@/models/delay";

export type { DelayRequest, DelayResponse, WeatherResponse };

// Base URL is read from the environment variable set in .env so the API
// endpoint can be changed per environment without touching source code.
const API_BASE = import.meta.env.VITE_API_BASE_URL;

// Sends flight details to the backend delay endpoint and returns the delay
// class, label, confidence score and per-class probability distribution.
export async function submitDelay(data: DelayRequest): Promise<DelayResponse> {
  const { data: result } = await axios.post<DelayResponse>(
    `${API_BASE}/delay`,
    data,
  );
  return result;
}

// Fetches the Open-Meteo forecast (via the backend) for the origin airport at
// the scheduled local departure date/hour to pre-fill the weather fields.
export async function fetchWeather(
  airport: string,
  date: string,
  hour: number,
): Promise<WeatherResponse> {
  const { data } = await axios.get<WeatherResponse>(`${API_BASE}/weather`, {
    params: { airport, date, hour },
  });
  return data;
}
