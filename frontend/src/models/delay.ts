export interface DelayRequest {
  airline: string;
  origin: string;
  dest: string;
  month: number;
  day_of_week: number;
  dep_hour: number;
  distance: number;
  temperature: number;
  precipitation: number;
  snowfall: number;
  wind_speed: number;
  cloud_cover: number;
}

export interface DelayResponse {
  delay_class: number;
  label: string;
  color: string;
  confidence: number;
  probabilities: Record<number, number>;
  recommendation: string;
}

export interface WeatherResponse {
  airport: string;
  date: string;
  hour: number;
  temperature: number;
  precipitation: number;
  snowfall: number;
  wind_speed: number;
  cloud_cover: number;
}
