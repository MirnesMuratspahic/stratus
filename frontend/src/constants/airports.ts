import type { SelectOption } from "@/models/flight";

export interface Airport extends SelectOption {
  lat: number;
  lon: number;
}

/** The Norwegian airports known to the trained XGBoost model (Avinor dataset).
 *  `value` is the IATA code expected by the model; lat/lon are used to
 *  pre-fill the route distance (great-circle, in km). */
export const AIRPORTS: Airport[] = [
  { value: "OSL", label: "OSL - Oslo Gardermoen", lat: 60.1939, lon: 11.1004 },
  { value: "BOO", label: "BOO - Bodø", lat: 67.2692, lon: 14.3653 },
  { value: "TRD", label: "TRD - Trondheim, Værnes", lat: 63.4578, lon: 10.924 },
  { value: "VDS", label: "VDS - Vadsø", lat: 70.0653, lon: 29.8447 },
  { value: "SOG", label: "SOG - Sogndal, Haukåsen", lat: 61.1561, lon: 7.1378 },
  { value: "LKN", label: "LKN - Leknes", lat: 68.1525, lon: 13.6094 },
  { value: "MOL", label: "MOL - Molde, Årø", lat: 62.7447, lon: 7.2625 },
  { value: "HOV", label: "HOV - Ørsta-Volda, Hovden", lat: 62.18, lon: 6.0741 },
  { value: "MQN", label: "MQN - Mo i Rana, Røssvoll", lat: 66.3639, lon: 14.3014 },
  { value: "SVJ", label: "SVJ - Svolvær, Helle", lat: 68.2433, lon: 14.6692 },
  { value: "BGO", label: "BGO - Bergen, Flesland", lat: 60.2934, lon: 5.2181 },
  { value: "TOS", label: "TOS - Tromsø", lat: 69.6833, lon: 18.9189 },
  { value: "MJF", label: "MJF - Mosjøen, Kjærstad", lat: 65.784, lon: 13.2149 },
  { value: "FDE", label: "FDE - Førde, Bringeland", lat: 61.3911, lon: 5.7569 },
  { value: "SSJ", label: "SSJ - Sandnessjøen, Stokka", lat: 65.9568, lon: 12.4689 },
  { value: "SDN", label: "SDN - Sandane, Anda", lat: 61.83, lon: 6.1058 },
  { value: "OSY", label: "OSY - Namsos", lat: 64.4722, lon: 11.5786 },
  { value: "RVK", label: "RVK - Rørvik, Ryum", lat: 64.8383, lon: 11.1461 },
  { value: "KKN", label: "KKN - Kirkenes, Høybuktmoen", lat: 69.7258, lon: 29.8913 },
  { value: "HFT", label: "HFT - Hammerfest", lat: 70.6797, lon: 23.6686 },
  { value: "MEH", label: "MEH - Mehamn", lat: 71.0297, lon: 27.8267 },
  { value: "BJF", label: "BJF - Båtsfjord", lat: 70.6003, lon: 29.6926 },
  { value: "VAW", label: "VAW - Vardø, Svartnes", lat: 70.3554, lon: 31.0449 },
  { value: "HAA", label: "HAA - Hasvik", lat: 70.4867, lon: 22.1397 },
  { value: "SOJ", label: "SOJ - Sørkjosen", lat: 69.7868, lon: 20.9594 },
  { value: "BVG", label: "BVG - Berlevåg", lat: 70.8715, lon: 29.0341 },
  { value: "RRS", label: "RRS - Røros", lat: 62.5784, lon: 11.3423 },
  { value: "RET", label: "RET - Røst", lat: 67.5265, lon: 12.1016 },
  { value: "ALF", label: "ALF - Alta", lat: 69.9761, lon: 23.3717 },
  { value: "HVG", label: "HVG - Honningsvåg, Valan", lat: 71.0097, lon: 25.9836 },
  { value: "FRO", label: "FRO - Florø", lat: 61.5836, lon: 5.0247 },
  { value: "BNN", label: "BNN - Brønnøysund, Brønnøy", lat: 65.4611, lon: 12.2175 },
  { value: "SKN", label: "SKN - Stokmarknes, Skagen", lat: 68.5788, lon: 15.0334 },
  { value: "OLA", label: "OLA - Ørland", lat: 63.6989, lon: 9.604 },
  { value: "ANX", label: "ANX - Andøya, Andenes", lat: 69.2952, lon: 16.1394 },
  { value: "KSU", label: "KSU - Kristiansund, Kvernberget", lat: 63.1118, lon: 7.8245 },
].sort((a, b) => a.label.localeCompare(b.label));
