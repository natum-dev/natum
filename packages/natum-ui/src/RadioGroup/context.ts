import { createContext } from "react";
import { type ChangeEvent } from "react";

export type RadioGroupSemanticColor =
  | "primary"
  | "secondary"
  | "error"
  | "success"
  | "warning"
  | "info"
  | "neutral";

export type RadioGroupSize = "sm" | "md" | "lg";

export type RadioGroupContextValue = {
  name: string;
  value?: string;
  onChange?: (
    value: string,
    event: ChangeEvent<HTMLInputElement>
  ) => void;
  size: RadioGroupSize;
  color: RadioGroupSemanticColor;
  disabled: boolean;
};

export const RadioGroupContext = createContext<RadioGroupContextValue | null>(
  null
);
