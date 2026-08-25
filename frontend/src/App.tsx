import { FlightForm } from "./components/FlightForm";
import { Plane } from "lucide-react";

function App() {
  return (
    <div className="flex flex-col h-screen bg-slate-50">
      <header className="shrink-0 border-b border-slate-200 bg-white shadow-sm">
        <div className="flex items-center px-6 py-3 gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
            <Plane className="h-4 w-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-base font-bold text-slate-900 tracking-tight">
            Stratus
          </span>
          <span className="hidden sm:inline text-xs text-slate-400 font-medium border border-slate-200 rounded-full px-2 py-0.5">
            Flight Delay Predictor
          </span>
        </div>
      </header>
      <div className="flex-1 overflow-auto">
        <FlightForm />
      </div>
    </div>
  );
}

export default App;
