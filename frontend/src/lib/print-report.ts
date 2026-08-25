import type { DelayRequest, DelayResponse } from "@/models/delay";
import { AIRLINES } from "@/constants/airlines";
import { AIRPORTS } from "@/constants/airports";
import { DAY_NAMES, MONTH_NAMES } from "@/constants/flight";

const DELAY_COLORS: Record<number, string> = {
  1: "#22c55e",
  2: "#eab308",
  3: "#f97316",
  4: "#ef4444",
};

const DELAY_BGS: Record<number, string> = {
  1: "#f0fdf4",
  2: "#fefce8",
  3: "#fff7ed",
  4: "#fef2f2",
};

const DELAY_LABELS: Record<number, string> = {
  1: "Na vrijeme",
  2: "Manje kašnjenje",
  3: "Značajno kašnjenje",
  4: "Otkazan / preusmjeren",
};

export function buildPrintHtml(
  flightNumber: string,
  flightDate: string,
  form: DelayRequest,
  result: DelayResponse,
): string {
  const color = DELAY_COLORS[result.delay_class];
  const bg = DELAY_BGS[result.delay_class];
  const label = DELAY_LABELS[result.delay_class];

  const now = new Date().toLocaleString("bs-BA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const airline =
    AIRLINES.find((a) => a.value === form.airline)?.label ?? form.airline;
  const origin =
    AIRPORTS.find((a) => a.value === form.origin)?.label ?? form.origin;
  const dest = AIRPORTS.find((a) => a.value === form.dest)?.label ?? form.dest;
  const depHour = `${String(form.dep_hour).padStart(2, "0")}:00`;
  const title = flightNumber ? `Let ${flightNumber}` : `${form.origin} → ${form.dest}`;

  const row = (lbl: string, value: string) =>
    `<div class="vital"><div class="vital-label">${lbl}</div><div class="vital-value">${value}</div></div>`;

  return `<!DOCTYPE html><html><head><meta charset="utf-8"/>
<title>Izvještaj o procjeni kašnjenja - ${title}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #e2e8f0; font-family: Arial, sans-serif; min-height: 100vh; }
  .toolbar {
    position: sticky; top: 0; z-index: 100;
    background: #1e293b; color: #f8fafc;
    display: flex; align-items: center; justify-content: space-between;
    padding: 10px 24px; gap: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  }
  .toolbar-title { font-size: 14px; font-weight: 600; letter-spacing: 0.3px; }
  .toolbar-patient { font-size: 12px; color: #94a3b8; }
  .toolbar-actions { display: flex; gap: 10px; }
  .btn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 7px 16px; border-radius: 6px; font-size: 13px;
    font-weight: 600; cursor: pointer; border: none;
    transition: opacity 0.15s;
  }
  .btn:hover { opacity: 0.85; }
  .btn-print { background: #4f46e5; color: #fff; }
  .btn-close { background: #334155; color: #e2e8f0; }
  .paper-wrap { padding: 36px 24px 60px; }
  .paper {
    background: #fff; max-width: 760px; margin: 0 auto;
    padding: 48px 52px;
    box-shadow: 0 4px 24px rgba(0,0,0,0.18);
    border-radius: 4px;
  }
  h1 { text-align: center; font-size: 20px; letter-spacing: 1px; text-transform: uppercase; padding-bottom: 10px; border-bottom: 2px solid #1e293b; margin-bottom: 18px; color: #0f172a; }
  .meta { display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 12.5px; color: #475569; }
  .meta strong { color: #0f172a; }
  .section-title { font-size: 10.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 14px; margin-top: 22px; }
  .vitals { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
  .vitals.wide { grid-template-columns: repeat(3, 1fr); }
  .vital { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 12px; }
  .vital-label { font-size: 9.5px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
  .vital-value { font-size: 16px; font-weight: 700; margin-top: 3px; color: #0f172a; }
  .esi-box { border: 2px solid ${color}; background: ${bg}; border-radius: 10px; padding: 18px 22px; margin-top: 12px; }
  .esi-level { font-size: 26px; font-weight: 800; color: ${color}; }
  .esi-label { font-size: 15px; font-weight: 600; color: #1e293b; margin: 4px 0 8px; }
  .recommendation { font-size: 13px; color: #334155; line-height: 1.6; }
  .confidence { font-size: 11.5px; color: #64748b; margin-top: 8px; }
  .probs { display: flex; gap: 8px; margin-top: 10px; flex-wrap: wrap; }
  .prob-item { font-size: 11px; background: #f1f5f9; border-radius: 4px; padding: 3px 8px; color: #475569; }
  .signature { margin-top: 60px; display: flex; justify-content: space-between; }
  .sig-line { width: 220px; border-top: 1px solid #475569; padding-top: 6px; font-size: 11px; color: #64748b; text-align: center; }
  .footer { text-align: center; margin-top: 28px; font-size: 10px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 10px; }
  @media print {
    body { background: #fff; }
    .toolbar { display: none !important; }
    .paper-wrap { padding: 0; }
    .paper { box-shadow: none; border-radius: 0; padding: 0; max-width: 100%; }
  }
</style></head><body>
<div class="toolbar">
  <div>
    <div class="toolbar-title">Izvještaj o procjeni kašnjenja</div>
    <div class="toolbar-patient">${title} &nbsp;•&nbsp; ${now}</div>
  </div>
  <div class="toolbar-actions">
    <button class="btn btn-print" onclick="window.print()">🖸 &nbsp;Štampaj / Snimi kao PDF</button>
    <button class="btn btn-close" onclick="window.close()">✕ &nbsp;Zatvori</button>
  </div>
</div>
<div class="paper-wrap"><div class="paper">
<h1>Izvještaj o procjeni kašnjenja leta</h1>
<div class="meta">
  <div><strong>Let:</strong> ${flightNumber || "-"}</div>
  <div><strong>Datum izvještaja:</strong> ${now}</div>
  <div><strong>Sistem:</strong> Stratus v1.0</div>
</div>
<div class="section-title">Podaci o letu</div>
<div class="vitals wide">
  ${row("Aviokompanija", `<span style="font-size:12px">${airline}</span>`)}
  ${row("Polazni aerodrom", `<span style="font-size:12px">${origin}</span>`)}
  ${row("Dolazni aerodrom", `<span style="font-size:12px">${dest}</span>`)}
  ${row("Datum leta", `${flightDate}`)}
  ${row("Dan / mjesec", `<span style="font-size:12px">${DAY_NAMES[form.day_of_week]}, ${MONTH_NAMES[form.month]}</span>`)}
  ${row("Planirani polazak", `${depHour} (lokalno)`)}
</div>
<div class="section-title">Ruta i vremenski uslovi na polaznom aerodromu</div>
<div class="vitals">
  ${row("Udaljenost", `${form.distance} mi`)}
  ${row("Temperatura", `${form.temperature} °C`)}
  ${row("Padavine", `${form.precipitation} mm/h`)}
  ${row("Snijeg", `${form.snowfall} cm/h`)}
  ${row("Vjetar", `${form.wind_speed} km/h`)}
  ${row("Oblačnost", `${form.cloud_cover}%`)}
</div>
<div class="section-title">Rezultat procjene</div>
<div class="esi-box">
  <div class="esi-level">Klasa ${result.delay_class} - ${label}</div>
  <div class="esi-label">${result.label}</div>
  <div class="recommendation">${result.recommendation}</div>
  <div class="confidence">AI pouzdanost: ${result.confidence}%</div>
  <div class="probs">
    ${Object.entries(result.probabilities)
      .map(([l, p]) => `<div class="prob-item">${DELAY_LABELS[Number(l)]}: ${p}%</div>`)
      .join("")}
  </div>
</div>
<div class="signature">
  <div class="sig-line">Potpis dispečera / operativnog osoblja</div>
  <div class="sig-line">Datum i vrijeme potvrde</div>
</div>
<div class="footer">Stratus &nbsp;•&nbsp; Ovaj izvještaj ne zamjenjuje zvanične informacije aviokompanije</div>
</div></div>
</body></html>`;
}
