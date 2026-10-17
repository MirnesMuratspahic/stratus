import type { SelectOption } from "@/models/flight";

/** All airline codes known to the trained XGBoost model.
 *  `value` is the IATA airline code expected by the model.
 *  `label` is the human-readable display name. */
export const AIRLINES: SelectOption[] = [
  { value: "WF", label: "Widerøe (WF)" },
  { value: "DY", label: "Norwegian Air Shuttle (DY)" },
  { value: "SK", label: "SAS Scandinavian Airlines (SK)" },
  { value: "FL", label: "Air Leap (FL)" },
  { value: "DX", label: "DAT Danish Air Transport (DX)" },
].sort((a, b) => a.label.localeCompare(b.label));
