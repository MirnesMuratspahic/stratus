import { useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { getFieldStatus } from "@/lib/flight";
import { FIELD_STATUS_CFG } from "@/constants/flight";
import type { FieldStatus } from "@/models/flight";

interface WeatherFieldProps {
  label: string;
  name: string;
  value: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  min?: number;
  max?: number;
  step?: number;
  allowNegative?: boolean;
}

export function WeatherField({
  label,
  name,
  value,
  onChange,
  min,
  max,
  step = 0.1,
  allowNegative = false,
}: WeatherFieldProps) {
  // Tracks whether the input is currently focused so we can show the raw
  // draft string instead of the committed numeric value while typing.
  const [focused, setFocused] = useState(false);
  const [draft, setDraft] = useState("");

  // Resolve the operational status (normal / warning / critical) for this field.
  const status: FieldStatus | null = getFieldStatus(name, value);
  const statusCfg = status ? FIELD_STATUS_CFG[status] : null;

  // Builds a synthetic change event with the parsed numeric value and forwards
  // it to the parent handler. Skips the update when the string cannot be parsed.
  const fireChange = (raw: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = raw === "" || raw === "-" ? 0 : parseFloat(raw);
    if (!isNaN(parsed)) {
      const evt = {
        ...e,
        target: { ...e.target, name, value: String(parsed) },
      };
      onChange(evt as React.ChangeEvent<HTMLInputElement>);
    }
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-1 h-5">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider leading-none">
          {label}
        </label>
        {statusCfg ? (
          <span
            className={cn(
              "text-[10px] font-bold px-1.5 py-0.5 rounded border leading-none",
              statusCfg.className,
            )}
          >
            {statusCfg.label}
          </span>
        ) : (
          <span className="invisible text-[10px] px-1.5 py-0.5 border leading-none">
            _
          </span>
        )}
      </div>
      <Input
        type="text"
        inputMode={step && step < 1 ? "decimal" : "numeric"}
        name={name}
        value={focused ? draft : String(value)}
        onChange={(e) => {
          // Strip any non-numeric characters while typing (optionally keeping a
          // leading minus sign). The last replace prevents more than one decimal point.
          const pattern = allowNegative ? /[^0-9.-]/g : /[^0-9.]/g;
          const filtered = e.target.value
            .replace(pattern, "")
            .replace(/(?!^)-/g, "")
            .replace(/(\..*)\./g, "$1");
          setDraft(filtered);
          fireChange(filtered, e);
        }}
        onFocus={(e) => {
          // When focused, populate draft with the current committed value
          // and select all text for easy overwrite.
          setDraft(String(value));
          setFocused(true);
          requestAnimationFrame(() => e.target.select());
        }}
        onBlur={(e) => {
          // On blur, clamp the entered value to [min, max] bounds.
          // Falls back to min (or 0) when the draft is not a valid number.
          setFocused(false);
          let parsed = parseFloat(draft);
          if (isNaN(parsed)) parsed = min ?? 0;
          if (min !== undefined && parsed < min) parsed = min;
          if (max !== undefined && parsed > max) parsed = max;
          const evt = {
            ...e,
            target: { ...e.target, name, value: String(parsed) },
          };
          onChange(evt as React.ChangeEvent<HTMLInputElement>);
        }}
        min={min}
        max={max}
        required
        className={cn(
          status === "critical" && "border-red-400 focus:ring-red-400",
          status === "warning" && "border-amber-400 focus:ring-amber-400",
          status === "normal" && "border-green-400 focus:ring-green-400",
        )}
      />
      {(min !== undefined || max !== undefined) && (
        <p className="text-[10px] text-slate-400 leading-none">
          {min !== undefined && max !== undefined
            ? `${min} - ${max}`
            : min !== undefined
              ? `min ${min}`
              : `max ${max}`}
        </p>
      )}
    </div>
  );
}
