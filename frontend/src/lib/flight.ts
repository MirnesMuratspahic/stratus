import type { FieldStatus } from "@/models/flight";
import { AIRPORTS } from "@/constants/airports";

export type { FieldStatus };

// Returns the operational status of a single weather field based on typical
// aviation thresholds (ground operations, de-icing, crosswind limits).
// Returns null when the field name is not recognised.
export function getFieldStatus(
  name: string,
  value: number,
): FieldStatus | null {
  switch (name) {
    case "temperature":
      // Critical: extreme cold (de-icing, fuel) or extreme heat (take-off performance)
      if (value < -15 || value > 40) return "critical";
      if (value < -5 || value > 35) return "warning";
      return "normal";
    case "precipitation":
      // Critical: heavy rain > 5 mm/h; warning: moderate rain > 1 mm/h
      if (value > 5) return "critical";
      if (value > 1) return "warning";
      return "normal";
    case "snowfall":
      // Critical: > 1 cm/h (runway clearing, de-icing queues)
      if (value > 1) return "critical";
      if (value > 0.1) return "warning";
      return "normal";
    case "wind_speed":
      // Critical: > 50 km/h (approx. 27 kt) strong wind / gusts
      if (value > 50) return "critical";
      if (value > 30) return "warning";
      return "normal";
    case "cloud_cover":
      // Overcast skies increase the chance of low ceilings / IFR operations
      if (value > 85) return "warning";
      return "normal";
    default:
      return null;
  }
}

// Great-circle distance between two airports in statute miles (what BTS reports).
export function routeDistance(origin: string, dest: string): number {
  const a = AIRPORTS.find((x) => x.value === origin);
  const b = AIRPORTS.find((x) => x.value === dest);
  if (!a || !b || a === b) return 0;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 3958.8; // Earth radius in miles
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(h)));
}

// Converts an ISO date string (YYYY-MM-DD) to the BTS month / day_of_week
// encoding used by the model (1 = Monday .. 7 = Sunday).
export function dateParts(iso: string): { month: number; day_of_week: number } {
  const d = new Date(`${iso}T12:00:00`);
  const js = d.getDay(); // 0 = Sunday
  return { month: d.getMonth() + 1, day_of_week: js === 0 ? 7 : js };
}

export function todayIso(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export { FIELD_STATUS_CFG, DEFAULT_FORM } from "@/constants/flight";
