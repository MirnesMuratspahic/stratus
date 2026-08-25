"""Reference data shared by the data pipeline, the model and the API.

AIRPORTS maps the IATA code of the 50 busiest US airports to the metadata needed
to fetch weather for them (coordinates + IANA timezone, because BTS scheduled
departure times are expressed in the local time of the origin airport).

AIRLINES maps the BTS "Reporting_Airline" code to a human-readable name.
Only flights operated by these carriers between these airports are used for
training, which keeps the one-hot encoded feature space compact while still
covering the vast majority of US domestic traffic.
"""

AIRPORTS: dict[str, dict] = {
    "ATL": {"name": "Atlanta Hartsfield-Jackson", "lat": 33.6407, "lon": -84.4277, "tz": "America/New_York"},
    "DFW": {"name": "Dallas/Fort Worth", "lat": 32.8998, "lon": -97.0403, "tz": "America/Chicago"},
    "DEN": {"name": "Denver", "lat": 39.8561, "lon": -104.6737, "tz": "America/Denver"},
    "ORD": {"name": "Chicago O'Hare", "lat": 41.9742, "lon": -87.9073, "tz": "America/Chicago"},
    "LAX": {"name": "Los Angeles", "lat": 33.9416, "lon": -118.4085, "tz": "America/Los_Angeles"},
    "CLT": {"name": "Charlotte Douglas", "lat": 35.2140, "lon": -80.9431, "tz": "America/New_York"},
    "LAS": {"name": "Las Vegas Harry Reid", "lat": 36.0840, "lon": -115.1537, "tz": "America/Los_Angeles"},
    "PHX": {"name": "Phoenix Sky Harbor", "lat": 33.4373, "lon": -112.0078, "tz": "America/Phoenix"},
    "MCO": {"name": "Orlando", "lat": 28.4312, "lon": -81.3081, "tz": "America/New_York"},
    "SEA": {"name": "Seattle-Tacoma", "lat": 47.4502, "lon": -122.3088, "tz": "America/Los_Angeles"},
    "MIA": {"name": "Miami", "lat": 25.7959, "lon": -80.2870, "tz": "America/New_York"},
    "IAH": {"name": "Houston George Bush", "lat": 29.9902, "lon": -95.3368, "tz": "America/Chicago"},
    "JFK": {"name": "New York JFK", "lat": 40.6413, "lon": -73.7781, "tz": "America/New_York"},
    "EWR": {"name": "Newark Liberty", "lat": 40.6895, "lon": -74.1745, "tz": "America/New_York"},
    "SFO": {"name": "San Francisco", "lat": 37.6213, "lon": -122.3790, "tz": "America/Los_Angeles"},
    "FLL": {"name": "Fort Lauderdale", "lat": 26.0742, "lon": -80.1506, "tz": "America/New_York"},
    "MSP": {"name": "Minneapolis-St. Paul", "lat": 44.8848, "lon": -93.2223, "tz": "America/Chicago"},
    "BOS": {"name": "Boston Logan", "lat": 42.3656, "lon": -71.0096, "tz": "America/New_York"},
    "LGA": {"name": "New York LaGuardia", "lat": 40.7769, "lon": -73.8740, "tz": "America/New_York"},
    "DTW": {"name": "Detroit Metropolitan", "lat": 42.2162, "lon": -83.3554, "tz": "America/Detroit"},
    "PHL": {"name": "Philadelphia", "lat": 39.8744, "lon": -75.2424, "tz": "America/New_York"},
    "SLC": {"name": "Salt Lake City", "lat": 40.7899, "lon": -111.9791, "tz": "America/Denver"},
    "DCA": {"name": "Washington Reagan", "lat": 38.8512, "lon": -77.0402, "tz": "America/New_York"},
    "BWI": {"name": "Baltimore/Washington", "lat": 39.1774, "lon": -76.6684, "tz": "America/New_York"},
    "SAN": {"name": "San Diego", "lat": 32.7338, "lon": -117.1933, "tz": "America/Los_Angeles"},
    "TPA": {"name": "Tampa", "lat": 27.9755, "lon": -82.5332, "tz": "America/New_York"},
    "AUS": {"name": "Austin-Bergstrom", "lat": 30.1975, "lon": -97.6664, "tz": "America/Chicago"},
    "IAD": {"name": "Washington Dulles", "lat": 38.9531, "lon": -77.4565, "tz": "America/New_York"},
    "BNA": {"name": "Nashville", "lat": 36.1263, "lon": -86.6774, "tz": "America/Chicago"},
    "MDW": {"name": "Chicago Midway", "lat": 41.7868, "lon": -87.7522, "tz": "America/Chicago"},
    "HNL": {"name": "Honolulu", "lat": 21.3187, "lon": -157.9225, "tz": "Pacific/Honolulu"},
    "DAL": {"name": "Dallas Love Field", "lat": 32.8481, "lon": -96.8512, "tz": "America/Chicago"},
    "PDX": {"name": "Portland", "lat": 45.5898, "lon": -122.5951, "tz": "America/Los_Angeles"},
    "STL": {"name": "St. Louis Lambert", "lat": 38.7499, "lon": -90.3748, "tz": "America/Chicago"},
    "RDU": {"name": "Raleigh-Durham", "lat": 35.8801, "lon": -78.7880, "tz": "America/New_York"},
    "HOU": {"name": "Houston Hobby", "lat": 29.6454, "lon": -95.2789, "tz": "America/Chicago"},
    "SMF": {"name": "Sacramento", "lat": 38.6954, "lon": -121.5908, "tz": "America/Los_Angeles"},
    "MSY": {"name": "New Orleans", "lat": 29.9934, "lon": -90.2580, "tz": "America/Chicago"},
    "SJC": {"name": "San Jose", "lat": 37.3639, "lon": -121.9289, "tz": "America/Los_Angeles"},
    "OAK": {"name": "Oakland", "lat": 37.7126, "lon": -122.2197, "tz": "America/Los_Angeles"},
    "MCI": {"name": "Kansas City", "lat": 39.2976, "lon": -94.7139, "tz": "America/Chicago"},
    "RSW": {"name": "Fort Myers", "lat": 26.5362, "lon": -81.7552, "tz": "America/New_York"},
    "SNA": {"name": "Orange County John Wayne", "lat": 33.6762, "lon": -117.8675, "tz": "America/Los_Angeles"},
    "CLE": {"name": "Cleveland Hopkins", "lat": 41.4117, "lon": -81.8498, "tz": "America/New_York"},
    "IND": {"name": "Indianapolis", "lat": 39.7173, "lon": -86.2944, "tz": "America/Indiana/Indianapolis"},
    "PIT": {"name": "Pittsburgh", "lat": 40.4915, "lon": -80.2329, "tz": "America/New_York"},
    "CMH": {"name": "Columbus John Glenn", "lat": 39.9980, "lon": -82.8919, "tz": "America/New_York"},
    "SAT": {"name": "San Antonio", "lat": 29.5337, "lon": -98.4698, "tz": "America/Chicago"},
    "CVG": {"name": "Cincinnati/Northern Kentucky", "lat": 39.0488, "lon": -84.6678, "tz": "America/New_York"},
    "MKE": {"name": "Milwaukee Mitchell", "lat": 42.9472, "lon": -87.8966, "tz": "America/Chicago"},
}

AIRLINES: dict[str, str] = {
    "AA": "American Airlines",
    "DL": "Delta Air Lines",
    "UA": "United Airlines",
    "WN": "Southwest Airlines",
    "B6": "JetBlue Airways",
    "AS": "Alaska Airlines",
    "NK": "Spirit Airlines",
    "F9": "Frontier Airlines",
    "G4": "Allegiant Air",
    "HA": "Hawaiian Airlines",
    "OO": "SkyWest Airlines",
    "YX": "Republic Airways",
    "MQ": "Envoy Air",
    "OH": "PSA Airlines",
    "9E": "Endeavor Air",
    "YV": "Mesa Airlines",
    "QX": "Horizon Air",
    "PT": "Piedmont Airlines",
    "ZW": "Air Wisconsin",
    "G7": "GoJet Airlines",
    "C5": "CommuteAir",
}
