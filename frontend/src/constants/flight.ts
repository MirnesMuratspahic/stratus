import type { FieldStatus } from "@/models/flight";
import type { DelayRequest } from "@/models/delay";

export const FIELD_STATUS_CFG: Record<
  FieldStatus,
  { label: string; className: string }
> = {
  normal: {
    label: "Povoljno",
    className: "text-green-600 bg-green-50 border-green-200",
  },
  warning: {
    label: "Otežano",
    className: "text-amber-600 bg-amber-50 border-amber-200",
  },
  critical: {
    label: "Kritično",
    className: "text-red-600 bg-red-50 border-red-200",
  },
};

// month / day_of_week are derived from the selected flight date on submit.
export const DEFAULT_FORM: DelayRequest = {
  airline: "",
  origin: "",
  dest: "",
  month: 1,
  day_of_week: 1,
  dep_hour: 12,
  distance: 0,
  temperature: 15,
  precipitation: 0,
  snowfall: 0,
  wind_speed: 10,
  cloud_cover: 30,
};

export const DAY_NAMES: Record<number, string> = {
  1: "Ponedjeljak",
  2: "Utorak",
  3: "Srijeda",
  4: "Četvrtak",
  5: "Petak",
  6: "Subota",
  7: "Nedjelja",
};

export const MONTH_NAMES: Record<number, string> = {
  1: "Januar",
  2: "Februar",
  3: "Mart",
  4: "April",
  5: "Maj",
  6: "Juni",
  7: "Juli",
  8: "August",
  9: "Septembar",
  10: "Oktobar",
  11: "Novembar",
  12: "Decembar",
};
