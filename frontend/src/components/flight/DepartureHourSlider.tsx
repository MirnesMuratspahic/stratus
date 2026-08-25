import { cn } from "@/lib/utils";

interface DepartureHourSliderProps {
  value: number;
  onChange: (value: number) => void;
}

// Verbal label for a part of the day, shown next to the selected hour.
function getPeriodLabel(h: number): string {
  if (h < 5) return "Noć";
  if (h < 9) return "Rano jutro";
  if (h < 12) return "Prijepodne";
  if (h < 17) return "Popodne";
  if (h < 21) return "Veče";
  return "Kasno veče";
}

// Returns a Tailwind text colour class based on typical delay build-up during
// the day (early departures rarely inherit delays, evening flights often do).
function getHourColor(h: number): string {
  if (h < 9) return "text-green-600";
  if (h < 14) return "text-amber-500";
  if (h < 19) return "text-orange-500";
  return "text-red-600";
}

// Returns background + border classes for the hour badge.
function getHourBg(h: number): string {
  if (h < 9) return "bg-green-50 border-green-200";
  if (h < 14) return "bg-amber-50 border-amber-200";
  if (h < 19) return "bg-orange-50 border-orange-200";
  return "bg-red-50 border-red-200";
}

// Builds an inline CSS gradient for the slider track that fills green→red
// proportionally to the current value (0-23).
function getTrackGradient(h: number): string {
  const pct = (h / 23) * 100;
  return `linear-gradient(to right, #22c55e 0%, #eab308 40%, #f97316 65%, #ef4444 100%) 0 0 / ${pct}% 100% no-repeat, #e2e8f0`;
}

const pad = (n: number) => String(n).padStart(2, "0");

export function DepartureHourSlider({
  value,
  onChange,
}: DepartureHourSliderProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between h-5">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider leading-none">
          Planirani sat polaska (lokalno vrijeme)
        </label>
        <div
          className={cn(
            "flex items-center gap-1.5 rounded border px-2 py-0.5 text-xs font-bold leading-none",
            getHourBg(value),
            getHourColor(value),
          )}
        >
          <span className="text-base font-black">{pad(value)}:00</span>
          <span className="text-[10px] font-semibold">
            {getPeriodLabel(value)}
          </span>
        </div>
      </div>

      <div className="relative">
        <input
          type="range"
          min={0}
          max={23}
          step={1}
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value, 10))}
          style={{ background: getTrackGradient(value) }}
          className="w-full h-2 rounded-full appearance-none cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:h-5
            [&::-webkit-slider-thumb]:w-5
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-white
            [&::-webkit-slider-thumb]:border-2
            [&::-webkit-slider-thumb]:border-slate-400
            [&::-webkit-slider-thumb]:shadow-md
            [&::-webkit-slider-thumb]:cursor-grab
            [&::-webkit-slider-thumb:active]:cursor-grabbing
            [&::-moz-range-thumb]:h-5
            [&::-moz-range-thumb]:w-5
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-white
            [&::-moz-range-thumb]:border-2
            [&::-moz-range-thumb]:border-slate-400
            [&::-moz-range-thumb]:cursor-grab"
        />
        <div className="flex justify-between mt-1 px-0.5">
          {Array.from({ length: 24 }, (_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onChange(i)}
              className={cn(
                "text-[10px] font-medium leading-none w-4 text-center transition-colors",
                i % 3 !== 0 && i !== value && "hidden sm:block",
                i === value
                  ? getHourColor(value) + " font-bold"
                  : "text-slate-300 hover:text-slate-500",
              )}
            >
              {i}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
