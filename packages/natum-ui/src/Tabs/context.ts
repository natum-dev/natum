import { createContext, useContext, type MutableRefObject } from "react";

export type TabsVariant = "underline" | "pill";
export type TabsSize = "sm" | "md";
export type TabsActivationMode = "automatic" | "manual";

export type TabsContextValue = {
  value: string | null;
  setValue: (next: string) => void;
  variant: TabsVariant;
  size: TabsSize;
  activationMode: TabsActivationMode;
  baseId: string;
  triggerRefs: MutableRefObject<Map<string, HTMLElement>>;
  registerTrigger: (value: string, el: HTMLElement | null) => void;
  mountedPanels: Set<string>;
  markPanelMounted: (value: string) => void;
  bumpMeasureTick: () => void;
  measureTick: number;
};

export const TabsContext = createContext<TabsContextValue | null>(null);

export const useTabsContext = (): TabsContextValue => {
  const ctx = useContext(TabsContext);
  if (ctx === null) {
    throw new Error(
      "TabsList/TabsTrigger/TabsPanel must be rendered inside <Tabs>."
    );
  }
  return ctx;
};
