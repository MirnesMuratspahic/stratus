"""Reference data shared by the data pipeline, the model and the API.

AIRPORTS maps the IATA code of the Norwegian airports covered by the Avinor
historical flight dataset (every airport with at least 500 scheduled movements)
to the metadata needed to fetch weather for them and to compute route distances
(coordinates + IANA timezone, because Avinor times are in UTC and the model
works with the local departure hour).

AIRLINES maps the IATA airline code (the first two characters of the Avinor
flight number) to a human-readable name. Only scheduled passenger flights
operated by these carriers between these airports are used for training.
"""

import math

AIRPORTS: dict[str, dict] = {
    "OSL": {"name": "Oslo Gardermoen", "lat": 60.1939, "lon": 11.1004, "tz": "Europe/Oslo"},
    "BOO": {"name": "Bodø", "lat": 67.2692, "lon": 14.3653, "tz": "Europe/Oslo"},
    "TRD": {"name": "Trondheim, Værnes", "lat": 63.4578, "lon": 10.9240, "tz": "Europe/Oslo"},
    "VDS": {"name": "Vadsø", "lat": 70.0653, "lon": 29.8447, "tz": "Europe/Oslo"},
    "SOG": {"name": "Sogndal, Haukåsen", "lat": 61.1561, "lon": 7.1378, "tz": "Europe/Oslo"},
    "LKN": {"name": "Leknes", "lat": 68.1525, "lon": 13.6094, "tz": "Europe/Oslo"},
    "MOL": {"name": "Molde, Årø", "lat": 62.7447, "lon": 7.2625, "tz": "Europe/Oslo"},
    "HOV": {"name": "Ørsta-Volda, Hovden", "lat": 62.1800, "lon": 6.0741, "tz": "Europe/Oslo"},
    "MQN": {"name": "Mo i Rana, Røssvoll", "lat": 66.3639, "lon": 14.3014, "tz": "Europe/Oslo"},
    "SVJ": {"name": "Svolvær, Helle", "lat": 68.2433, "lon": 14.6692, "tz": "Europe/Oslo"},
    "BGO": {"name": "Bergen, Flesland", "lat": 60.2934, "lon": 5.2181, "tz": "Europe/Oslo"},
    "TOS": {"name": "Tromsø", "lat": 69.6833, "lon": 18.9189, "tz": "Europe/Oslo"},
    "MJF": {"name": "Mosjøen, Kjærstad", "lat": 65.7840, "lon": 13.2149, "tz": "Europe/Oslo"},
    "FDE": {"name": "Førde, Bringeland", "lat": 61.3911, "lon": 5.7569, "tz": "Europe/Oslo"},
    "SSJ": {"name": "Sandnessjøen, Stokka", "lat": 65.9568, "lon": 12.4689, "tz": "Europe/Oslo"},
    "SDN": {"name": "Sandane, Anda", "lat": 61.8300, "lon": 6.1058, "tz": "Europe/Oslo"},
    "OSY": {"name": "Namsos", "lat": 64.4722, "lon": 11.5786, "tz": "Europe/Oslo"},
    "RVK": {"name": "Rørvik, Ryum", "lat": 64.8383, "lon": 11.1461, "tz": "Europe/Oslo"},
    "KKN": {"name": "Kirkenes, Høybuktmoen", "lat": 69.7258, "lon": 29.8913, "tz": "Europe/Oslo"},
    "HFT": {"name": "Hammerfest", "lat": 70.6797, "lon": 23.6686, "tz": "Europe/Oslo"},
    "MEH": {"name": "Mehamn", "lat": 71.0297, "lon": 27.8267, "tz": "Europe/Oslo"},
    "BJF": {"name": "Båtsfjord", "lat": 70.6003, "lon": 29.6926, "tz": "Europe/Oslo"},
    "VAW": {"name": "Vardø, Svartnes", "lat": 70.3554, "lon": 31.0449, "tz": "Europe/Oslo"},
    "HAA": {"name": "Hasvik", "lat": 70.4867, "lon": 22.1397, "tz": "Europe/Oslo"},
    "SOJ": {"name": "Sørkjosen", "lat": 69.7868, "lon": 20.9594, "tz": "Europe/Oslo"},
    "BVG": {"name": "Berlevåg", "lat": 70.8715, "lon": 29.0341, "tz": "Europe/Oslo"},
    "RRS": {"name": "Røros", "lat": 62.5784, "lon": 11.3423, "tz": "Europe/Oslo"},
    "RET": {"name": "Røst", "lat": 67.5265, "lon": 12.1016, "tz": "Europe/Oslo"},
    "ALF": {"name": "Alta", "lat": 69.9761, "lon": 23.3717, "tz": "Europe/Oslo"},
    "HVG": {"name": "Honningsvåg, Valan", "lat": 71.0097, "lon": 25.9836, "tz": "Europe/Oslo"},
    "FRO": {"name": "Florø", "lat": 61.5836, "lon": 5.0247, "tz": "Europe/Oslo"},
    "BNN": {"name": "Brønnøysund, Brønnøy", "lat": 65.4611, "lon": 12.2175, "tz": "Europe/Oslo"},
    "SKN": {"name": "Stokmarknes, Skagen", "lat": 68.5788, "lon": 15.0334, "tz": "Europe/Oslo"},
    "OLA": {"name": "Ørland", "lat": 63.6989, "lon": 9.6040, "tz": "Europe/Oslo"},
    "ANX": {"name": "Andøya, Andenes", "lat": 69.2952, "lon": 16.1394, "tz": "Europe/Oslo"},
    "KSU": {"name": "Kristiansund, Kvernberget", "lat": 63.1118, "lon": 7.8245, "tz": "Europe/Oslo"},
}

AIRLINES: dict[str, str] = {
    "WF": "Widerøe",
    "DY": "Norwegian Air Shuttle",
    "SK": "SAS Scandinavian Airlines",
    "FL": "Air Leap",
    "DX": "DAT Danish Air Transport",
}


def route_distance_km(origin: str, dest: str) -> float:
    """Great-circle distance between two known airports in kilometres."""
    a, b = AIRPORTS[origin], AIRPORTS[dest]
    lat1, lon1, lat2, lon2 = map(math.radians, (a["lat"], a["lon"], b["lat"], b["lon"]))
    h = math.sin((lat2 - lat1) / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin((lon2 - lon1) / 2) ** 2
    return round(2 * 6371.0 * math.asin(math.sqrt(h)))
