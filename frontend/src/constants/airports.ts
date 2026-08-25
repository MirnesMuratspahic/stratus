import type { SelectOption } from "@/models/flight";

export interface Airport extends SelectOption {
  lat: number;
  lon: number;
}

/** The 50 busiest US airports known to the trained XGBoost model.
 *  `value` is the IATA code expected by the model; lat/lon are used to
 *  pre-fill the route distance (great-circle, in miles). */
export const AIRPORTS: Airport[] = [
  { value: "ATL", label: "ATL - Atlanta Hartsfield-Jackson", lat: 33.6407, lon: -84.4277 },
  { value: "DFW", label: "DFW - Dallas/Fort Worth", lat: 32.8998, lon: -97.0403 },
  { value: "DEN", label: "DEN - Denver", lat: 39.8561, lon: -104.6737 },
  { value: "ORD", label: "ORD - Chicago O'Hare", lat: 41.9742, lon: -87.9073 },
  { value: "LAX", label: "LAX - Los Angeles", lat: 33.9416, lon: -118.4085 },
  { value: "CLT", label: "CLT - Charlotte Douglas", lat: 35.214, lon: -80.9431 },
  { value: "LAS", label: "LAS - Las Vegas Harry Reid", lat: 36.084, lon: -115.1537 },
  { value: "PHX", label: "PHX - Phoenix Sky Harbor", lat: 33.4373, lon: -112.0078 },
  { value: "MCO", label: "MCO - Orlando", lat: 28.4312, lon: -81.3081 },
  { value: "SEA", label: "SEA - Seattle-Tacoma", lat: 47.4502, lon: -122.3088 },
  { value: "MIA", label: "MIA - Miami", lat: 25.7959, lon: -80.287 },
  { value: "IAH", label: "IAH - Houston George Bush", lat: 29.9902, lon: -95.3368 },
  { value: "JFK", label: "JFK - New York JFK", lat: 40.6413, lon: -73.7781 },
  { value: "EWR", label: "EWR - Newark Liberty", lat: 40.6895, lon: -74.1745 },
  { value: "SFO", label: "SFO - San Francisco", lat: 37.6213, lon: -122.379 },
  { value: "FLL", label: "FLL - Fort Lauderdale", lat: 26.0742, lon: -80.1506 },
  { value: "MSP", label: "MSP - Minneapolis-St. Paul", lat: 44.8848, lon: -93.2223 },
  { value: "BOS", label: "BOS - Boston Logan", lat: 42.3656, lon: -71.0096 },
  { value: "LGA", label: "LGA - New York LaGuardia", lat: 40.7769, lon: -73.874 },
  { value: "DTW", label: "DTW - Detroit Metropolitan", lat: 42.2162, lon: -83.3554 },
  { value: "PHL", label: "PHL - Philadelphia", lat: 39.8744, lon: -75.2424 },
  { value: "SLC", label: "SLC - Salt Lake City", lat: 40.7899, lon: -111.9791 },
  { value: "DCA", label: "DCA - Washington Reagan", lat: 38.8512, lon: -77.0402 },
  { value: "BWI", label: "BWI - Baltimore/Washington", lat: 39.1774, lon: -76.6684 },
  { value: "SAN", label: "SAN - San Diego", lat: 32.7338, lon: -117.1933 },
  { value: "TPA", label: "TPA - Tampa", lat: 27.9755, lon: -82.5332 },
  { value: "AUS", label: "AUS - Austin-Bergstrom", lat: 30.1975, lon: -97.6664 },
  { value: "IAD", label: "IAD - Washington Dulles", lat: 38.9531, lon: -77.4565 },
  { value: "BNA", label: "BNA - Nashville", lat: 36.1263, lon: -86.6774 },
  { value: "MDW", label: "MDW - Chicago Midway", lat: 41.7868, lon: -87.7522 },
  { value: "HNL", label: "HNL - Honolulu", lat: 21.3187, lon: -157.9225 },
  { value: "DAL", label: "DAL - Dallas Love Field", lat: 32.8481, lon: -96.8512 },
  { value: "PDX", label: "PDX - Portland", lat: 45.5898, lon: -122.5951 },
  { value: "STL", label: "STL - St. Louis Lambert", lat: 38.7499, lon: -90.3748 },
  { value: "RDU", label: "RDU - Raleigh-Durham", lat: 35.8801, lon: -78.788 },
  { value: "HOU", label: "HOU - Houston Hobby", lat: 29.6454, lon: -95.2789 },
  { value: "SMF", label: "SMF - Sacramento", lat: 38.6954, lon: -121.5908 },
  { value: "MSY", label: "MSY - New Orleans", lat: 29.9934, lon: -90.258 },
  { value: "SJC", label: "SJC - San Jose", lat: 37.3639, lon: -121.9289 },
  { value: "OAK", label: "OAK - Oakland", lat: 37.7126, lon: -122.2197 },
  { value: "MCI", label: "MCI - Kansas City", lat: 39.2976, lon: -94.7139 },
  { value: "RSW", label: "RSW - Fort Myers", lat: 26.5362, lon: -81.7552 },
  { value: "SNA", label: "SNA - Orange County John Wayne", lat: 33.6762, lon: -117.8675 },
  { value: "CLE", label: "CLE - Cleveland Hopkins", lat: 41.4117, lon: -81.8498 },
  { value: "IND", label: "IND - Indianapolis", lat: 39.7173, lon: -86.2944 },
  { value: "PIT", label: "PIT - Pittsburgh", lat: 40.4915, lon: -80.2329 },
  { value: "CMH", label: "CMH - Columbus John Glenn", lat: 39.998, lon: -82.8919 },
  { value: "SAT", label: "SAT - San Antonio", lat: 29.5337, lon: -98.4698 },
  { value: "CVG", label: "CVG - Cincinnati/Northern Kentucky", lat: 39.0488, lon: -84.6678 },
  { value: "MKE", label: "MKE - Milwaukee Mitchell", lat: 42.9472, lon: -87.8966 },
].sort((a, b) => a.label.localeCompare(b.label));
