import { createContext } from "react";

export type ComboboxContextValue = {
  comboboxId: string;
};

export const ComboboxContext = createContext<ComboboxContextValue | null>(null);
