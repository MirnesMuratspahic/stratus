import { useState } from "react";
import { submitDelay, fetchWeather } from "../api/delay";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertTriangle,
  CloudDownload,
  HelpCircle,
  Plane,
  Ticket,
  X,
} from "lucide-react";
import { DEFAULT_FORM } from "@/constants/flight";
import { AIRLINES } from "@/constants/airlines";
import { AIRPORTS } from "@/constants/airports";
import { buildPrintHtml } from "@/lib/print-report";
import { dateParts, routeDistance, todayIso } from "@/lib/flight";
import type { DelayRequest, DelayResponse } from "@/models/delay";
import { SearchSelect } from "./flight/SearchSelect";
import { WeatherField } from "./flight/WeatherField";
import { HelpPanel } from "./flight/HelpPanel";
import { DelayResult } from "./flight/DelayResult";
import { DelayResultSkeleton } from "./flight/DelayResultSkeleton";
import { DepartureHourSlider } from "./flight/DepartureHourSlider";

export function FlightForm() {
  const [flightNumber, setFlightNumber] = useState("");
  const [flightDate, setFlightDate] = useState(todayIso());
  const [showHelp, setShowHelp] = useState(false);
  const [form, setForm] = useState<DelayRequest>(DEFAULT_FORM);
  const [result, setResult] = useState<DelayResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingWeather, setIsFetchingWeather] = useState(false);
  const [weatherNote, setWeatherNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Generic handler for all numeric input fields.
  // parseFloat falls back to 0 for empty/invalid strings.
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: parseFloat(value) || 0,
    }));
  };

  // Updates origin/destination and re-computes the great-circle distance so
  // the user does not have to look it up (still editable afterwards).
  const handleAirportChange = (field: "origin" | "dest", code: string) => {
    setForm((prev) => {
      const next = { ...prev, [field]: code };
      return { ...next, distance: routeDistance(next.origin, next.dest) };
    });
  };

  // Pre-fills the five weather fields from the Open-Meteo forecast for the
  // origin airport at the selected date/hour.
  const handleFetchWeather = async () => {
    if (!form.origin) {
      setError("Odaberite polazni aerodrom prije preuzimanja prognoze.");
      return;
    }
    setIsFetchingWeather(true);
    setError(null);
    setWeatherNote(null);
    try {
      const w = await fetchWeather(form.origin, flightDate, form.dep_hour);
      setForm((prev) => ({
        ...prev,
        temperature: w.temperature,
        precipitation: w.precipitation,
        snowfall: w.snowfall,
        wind_speed: w.wind_speed,
        cloud_cover: w.cloud_cover,
      }));
      setWeatherNote(
        `Prognoza za ${w.airport}, ${flightDate} u ${String(w.hour).padStart(2, "0")}:00 je učitana.`,
      );
    } catch {
      setError(
        "Prognoza nije dostupna za odabrani datum (dostupna je do 16 dana unaprijed). Unesite vremenske uslove ručno.",
      );
    } finally {
      setIsFetchingWeather(false);
    }
  };

  // Validates the required selections before sending the request, then calls
  // the delay API and stores the result or error.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.airline || !form.origin || !form.dest) {
      setError(
        "Molimo odaberite aviokompaniju, polazni i dolazni aerodrom prije procjene.",
      );
      return;
    }
    if (form.origin === form.dest) {
      setError("Polazni i dolazni aerodrom ne mogu biti isti.");
      return;
    }
    setIsLoading(true);
    setError(null);
    // Clear previous result so the skeleton is shown during the new request.
    setResult(null);
    try {
      const parts = dateParts(flightDate);
      const payload = { ...form, ...parts };
      setForm(payload);
      const res = await submitDelay(payload);
      setResult(res);
    } catch {
      setError(
        "Greška pri procjeni kašnjenja. Provjerite da li je backend pokrenut i model obučen.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Resets all form fields, result and error back to their initial state.
  const handleReset = () => {
    setForm(DEFAULT_FORM);
    setResult(null);
    setError(null);
    setWeatherNote(null);
    setFlightNumber("");
    setFlightDate(todayIso());
  };

  // Builds the print HTML from the current form/result and opens it in a new
  // tab so the user can print or save as PDF without leaving the app.
  const handlePrint = () => {
    if (!result) return;
    const html = buildPrintHtml(flightNumber, flightDate, form, result);
    const w = window.open("", "_blank", "width=800,height=900");
    if (!w) return;
    w.document.write(html);
    w.document.close();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100">
          <Plane className="h-5 w-5 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Procjena kašnjenja leta
          </h1>
          <p className="text-slate-500 text-sm">
            Unesite podatke o letu i vremenskim uslovima za procjenu rizika od
            kašnjenja
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Podaci o letu</CardTitle>
            <button
              type="button"
              onClick={() => setShowHelp((v) => !v)}
              className="text-slate-400 hover:text-indigo-600 transition-colors"
              aria-label="Opisi polja"
            >
              {showHelp ? (
                <X className="h-5 w-5" />
              ) : (
                <HelpCircle className="h-5 w-5" />
              )}
            </button>
          </div>
          {showHelp && <HelpPanel />}
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Ticket className="h-3.5 w-3.5" /> Broj leta
                </label>
                <Input
                  type="text"
                  placeholder="npr. DL 1234 (opcionalno)"
                  value={flightNumber}
                  onChange={(e) => setFlightNumber(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Datum leta
                  <span className="text-red-500 ml-0.5">*</span>
                </label>
                <Input
                  type="date"
                  value={flightDate}
                  onChange={(e) => setFlightDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Aviokompanija
                  <span className="text-red-500 ml-0.5">*</span>
                </label>
                <SearchSelect
                  options={AIRLINES}
                  value={form.airline}
                  onChange={(v) => setForm((prev) => ({ ...prev, airline: v }))}
                  placeholder="Pretraži aviokompaniju..."
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Polazni aerodrom
                  <span className="text-red-500 ml-0.5">*</span>
                </label>
                <SearchSelect
                  options={AIRPORTS}
                  value={form.origin}
                  onChange={(v) => handleAirportChange("origin", v)}
                  placeholder="Pretraži aerodrom..."
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Dolazni aerodrom
                  <span className="text-red-500 ml-0.5">*</span>
                </label>
                <SearchSelect
                  options={AIRPORTS}
                  value={form.dest}
                  onChange={(v) => handleAirportChange("dest", v)}
                  placeholder="Pretraži aerodrom..."
                />
              </div>
            </div>

            <DepartureHourSlider
              value={form.dep_hour}
              onChange={(v) => setForm((prev) => ({ ...prev, dep_hour: v }))}
            />

            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2 h-5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider leading-none">
                  Vremenski uslovi na polaznom aerodromu
                </label>
                <button
                  type="button"
                  onClick={handleFetchWeather}
                  disabled={isFetchingWeather}
                  className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 disabled:opacity-50 transition-colors"
                >
                  <CloudDownload className="h-3.5 w-3.5" />
                  {isFetchingWeather ? "Preuzimanje..." : "Preuzmi prognozu"}
                </button>
              </div>
              {weatherNote && (
                <p className="text-[11px] text-green-700">{weatherNote}</p>
              )}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <WeatherField
                  label="Udaljenost (mi)"
                  name="distance"
                  value={form.distance}
                  onChange={handleChange}
                  min={0}
                  max={6000}
                  step={1}
                />
                <WeatherField
                  label="Temperatura (°C)"
                  name="temperature"
                  value={form.temperature}
                  onChange={handleChange}
                  min={-50}
                  max={60}
                  step={0.1}
                  allowNegative
                />
                <WeatherField
                  label="Padavine (mm/h)"
                  name="precipitation"
                  value={form.precipitation}
                  onChange={handleChange}
                  min={0}
                  max={200}
                  step={0.1}
                />
                <WeatherField
                  label="Snijeg (cm/h)"
                  name="snowfall"
                  value={form.snowfall}
                  onChange={handleChange}
                  min={0}
                  max={100}
                  step={0.1}
                />
                <WeatherField
                  label="Vjetar (km/h)"
                  name="wind_speed"
                  value={form.wind_speed}
                  onChange={handleChange}
                  min={0}
                  max={250}
                  step={0.1}
                />
                <WeatherField
                  label="Oblačnost (%)"
                  name="cloud_cover"
                  value={form.cloud_cover}
                  onChange={handleChange}
                  min={0}
                  max={100}
                  step={1}
                />
              </div>
            </div>

            <div className="flex gap-2.5 pt-1">
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 sm:flex-none sm:px-8"
              >
                {isLoading ? "Procjenjivanje..." : "Procijeni kašnjenje"}
              </Button>
              <Button type="button" variant="outline" onClick={handleReset}>
                Poništi
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {error && (
        <div className="flex items-start gap-2.5 text-red-700 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      {isLoading && <DelayResultSkeleton />}

      {result && !isLoading && (
        <DelayResult result={result} onPrint={handlePrint} />
      )}
    </div>
  );
}
