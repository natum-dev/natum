import { createContext } from "react";
import type { SelectContextValue } from "./types";

export const SelectContext = createContext<SelectContextValue | null>(null);
