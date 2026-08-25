export type FieldStatus = "normal" | "warning" | "critical";

export interface DelayCfg {
  bg: string;
  border: string;
  badge: string;
  text: string;
  bar: string;
  icon: React.ReactNode;
  label: string;
}

export interface SelectOption {
  value: string;
  label: string;
}
