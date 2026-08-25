import type { SelectOption } from "@/models/flight";

/** All airline codes known to the trained XGBoost model.
 *  `value` is the BTS "Reporting_Airline" code expected by the model.
 *  `label` is the human-readable display name. */
export const AIRLINES: SelectOption[] = [
  { value: "AA", label: "American Airlines (AA)" },
  { value: "DL", label: "Delta Air Lines (DL)" },
  { value: "UA", label: "United Airlines (UA)" },
  { value: "WN", label: "Southwest Airlines (WN)" },
  { value: "B6", label: "JetBlue Airways (B6)" },
  { value: "AS", label: "Alaska Airlines (AS)" },
  { value: "NK", label: "Spirit Airlines (NK)" },
  { value: "F9", label: "Frontier Airlines (F9)" },
  { value: "G4", label: "Allegiant Air (G4)" },
  { value: "HA", label: "Hawaiian Airlines (HA)" },
  { value: "OO", label: "SkyWest Airlines (OO)" },
  { value: "YX", label: "Republic Airways (YX)" },
  { value: "MQ", label: "Envoy Air (MQ)" },
  { value: "OH", label: "PSA Airlines (OH)" },
  { value: "9E", label: "Endeavor Air (9E)" },
  { value: "YV", label: "Mesa Airlines (YV)" },
  { value: "QX", label: "Horizon Air (QX)" },
  { value: "PT", label: "Piedmont Airlines (PT)" },
  { value: "ZW", label: "Air Wisconsin (ZW)" },
  { value: "G7", label: "GoJet Airlines (G7)" },
  { value: "C5", label: "CommuteAir (C5)" },
].sort((a, b) => a.label.localeCompare(b.label));
