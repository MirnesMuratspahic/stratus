import { AlertTriangle, CheckCircle, Clock, XCircle } from "lucide-react";
import type { DelayCfg } from "@/models/flight";

export const DELAY_CONFIG: Record<number, DelayCfg> = {
  1: {
    bg: "bg-green-50",
    border: "border-green-300",
    badge: "bg-green-600 text-white",
    text: "text-green-700",
    bar: "bg-green-500",
    icon: <CheckCircle className="h-5 w-5 text-green-600" />,
    label: "Na vrijeme",
  },
  2: {
    bg: "bg-yellow-50",
    border: "border-yellow-300",
    badge: "bg-yellow-500 text-white",
    text: "text-yellow-700",
    bar: "bg-yellow-400",
    icon: <Clock className="h-5 w-5 text-yellow-600" />,
    label: "Manje kašnjenje",
  },
  3: {
    bg: "bg-orange-50",
    border: "border-orange-300",
    badge: "bg-orange-500 text-white",
    text: "text-orange-700",
    bar: "bg-orange-500",
    icon: <AlertTriangle className="h-5 w-5 text-orange-500" />,
    label: "Značajno kašnjenje",
  },
  4: {
    bg: "bg-red-50",
    border: "border-red-300",
    badge: "bg-red-600 text-white",
    text: "text-red-700",
    bar: "bg-red-500",
    icon: <XCircle className="h-5 w-5 text-red-600" />,
    label: "Otkazan / preusmjeren",
  },
};
