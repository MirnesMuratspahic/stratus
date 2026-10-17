# Stratus - konačni skup podataka

Ovo je konačni izgled skupa podataka nad kojim je treniran model, nakon filtriranja, labeliranja i spajanja Avinor podataka o letovima sa Open-Meteo vremenskim podacima.

- `stratus_dataset_sample.csv` - uzorak od 1.000 letova sa istim udjelom klasa kao cijeli skup

Cijeli skup ima **401.373 leta** i nije u repozitoriju zbog veličine. Ne snima se kao poseban fajl, nego se pravi u memoriji pri svakom treniranju: `python -m ml.download_data` preuzima sirove podatke, a `python -m ml.train_real` od njih pravi ovaj skup i trenira model (u folderu `backend`).

## Izvor podataka

Podaci o letovima dolaze od **Avinora**, državnog operatera norveških aerodroma. Avinor ih je objavio za takmičenje u mašinskom učenju, a preuzimaju se bez registracije iz javnog GitHub repozitorija [MiladTootoonchi/Avinor-Predictions](https://github.com/MiladTootoonchi/Avinor-Predictions) (`data/historical_flights.csv`). Za svaki let sadrže planirano i stvarno vrijeme polaska i dolaska (u UTC) i oznaku da li je let otkazan.

- Period: januar 2018 - juli 2025
- Samo redovni putnički letovi (`service_type = J`)
- 36 norveških aerodroma sa najmanje 500 letova (OSL, BOO, TRD, BGO, TOS, VDS, SOG, LKN...)
- Aviokompanije: Widerøe (WF, ~94 % letova), Norwegian (DY), SAS (SK), Air Leap (FL), DAT (DX)
- Izbačeni su letovi bez stvarnog vremena dolaska (osim otkazanih) i letovi sa nemogućim vremenom dolaska (više od 2 sata ranije ili više od 24 sata kasnije od plana)

Avinor skup ne sadrži letove u cijeloj Norveškoj, nego one koji dotiču aerodrome iz Avinorovog projekta daljinski upravljanih tornjeva. Zato dominiraju kratke regionalne rute na sjeveru i zapadu Norveške.

## Kolone

Jedan red predstavlja jedan let.

| Kolona | Tip | Izvor | Opis |
| --- | --- | --- | --- |
| `airline` | kategorijski | Avinor | IATA kod aviokompanije, prva dva znaka broja leta (npr. WF, DY, SK) |
| `origin` | kategorijski | Avinor | IATA kod polaznog aerodroma |
| `dest` | kategorijski | Avinor | IATA kod dolaznog aerodroma |
| `month` | numerički | izveden | Mjesec leta (1-12) po lokalnom vremenu |
| `day_of_week` | numerički | izveden | Dan u sedmici (1 = ponedjeljak, 7 = nedjelja) po lokalnom vremenu |
| `dep_hour` | numerički | izveden | Sat planiranog polaska po lokalnom vremenu (0-23); Avinor daje UTC, pa je pretvoreno u vrijeme Europe/Oslo |
| `distance` | numerički | izveden | Udaljenost rute u kilometrima, izračunata iz koordinata aerodroma (Avinor je ne daje) |
| `temperature` | numerički | Open-Meteo | Temperatura na polaznom aerodromu u satu polaska (°C) |
| `precipitation` | numerički | Open-Meteo | Padavine (mm/h) |
| `snowfall` | numerički | Open-Meteo | Snijeg (cm/h) |
| `wind_speed` | numerički | Open-Meteo | Brzina vjetra (km/h) |
| `cloud_cover` | numerički | Open-Meteo | Oblačnost (%) |
| `delay_class` | ciljna varijabla | izvedena | Klasa kašnjenja (1-4), iz razlike stvarnog i planiranog vremena dolaska |

## Ciljna varijabla `delay_class`

| Klasa | Značenje | Broj letova | Udio |
| --- | --- | --- | --- |
| 1 | Na vrijeme (kašnjenje do 15 min) | 341.061 | 84,97 % |
| 2 | Manje kašnjenje (15-60 min) | 42.378 | 10,56 % |
| 3 | Značajno kašnjenje (preko 60 min) | 7.305 | 1,82 % |
| 4 | Otkazan | 10.629 | 2,65 % |

Avinor podaci nemaju oznaku za preusmjerene letove, pa klasa 4 obuhvata samo otkazane letove.

## Primjer

| airline | origin | dest | month | day_of_week | dep_hour | distance | temperature | precipitation | snowfall | wind_speed | cloud_cover | delay_class |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| WF | BOO | SVJ | 1 | 1 | 5 | 109 | -2.3 | 0.0 | 0.00 | 8.1 | 100 | 1 |
| WF | OSL | FDE | 1 | 1 | 14 | 319 | -4.6 | 0.1 | 0.07 | 7.1 | 100 | 2 |
| WF | HOV | SOG | 2 | 5 | 6 | 127 | 2.1 | 1.5 | 1.05 | 13.0 | 100 | 4 |

Posljednji primjer je let iz Ørsta-Volde po snijegu koji je otkazan.
