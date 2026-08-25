import { useEffect, useRef, useState } from "react";
import { ChevronDown, X } from "lucide-react";
import type { SelectOption } from "@/models/flight";

interface SearchSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

// Searchable combobox used for airline / origin / destination selection.
// Distinguishes the query string (shown while the dropdown is open) from the
// committed value passed up to the parent.
export function SearchSelect({
  options,
  value,
  onChange,
  placeholder = "Pretraži...",
}: SearchSelectProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedLabel = options.find((c) => c.value === value)?.label ?? "";

  const filtered = query.trim()
    ? options.filter(
        (c) =>
          c.label.toLowerCase().includes(query.toLowerCase()) ||
          c.value.toLowerCase().includes(query.toLowerCase()),
      )
    : options;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleSelect(option: SelectOption) {
    onChange(option.value);
    setQuery("");
    setOpen(false);
  }

  function handleClear(e: React.MouseEvent) {
    e.stopPropagation();
    onChange("");
    setQuery("");
    setOpen(false);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value);
    setOpen(true);
  }

  function handleInputFocus() {
    setOpen(true);
  }

  return (
    <div ref={containerRef} className="relative">
      <div
        className={`flex items-center gap-2 rounded-md border bg-white px-3 py-2 text-sm transition-colors
          ${open ? "border-indigo-500 ring-1 ring-indigo-500" : "border-slate-200 hover:border-slate-300"}`}
      >
        <input
          ref={inputRef}
          type="text"
          className="flex-1 outline-none placeholder:text-slate-400 bg-transparent min-w-0"
          placeholder={value ? selectedLabel : placeholder}
          value={open ? query : selectedLabel}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
        />
        {value ? (
          <button
            type="button"
            onClick={handleClear}
            className="text-slate-400 hover:text-slate-600 shrink-0"
            aria-label="Clear"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : (
          <ChevronDown
            className={`h-4 w-4 text-slate-400 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
          />
        )}
      </div>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-slate-200 bg-white shadow-lg">
          <ul className="max-h-60 overflow-y-auto py-1 text-sm">
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-slate-400 italic">
                Nema rezultata
              </li>
            ) : (
              filtered.map((c) => (
                <li
                  key={c.value}
                  onMouseDown={() => handleSelect(c)}
                  className={`cursor-pointer px-3 py-2 transition-colors
                    ${
                      c.value === value
                        ? "bg-indigo-50 text-indigo-700 font-medium"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                >
                  {c.label}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
