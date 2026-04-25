import { createContext, useContext } from "react";

export type SidebarContextValue = {
  collapsed: boolean;
  setCollapsed: (next: boolean) => void;
};

export const SidebarContext = createContext<SidebarContextValue | null>(null);

export const useSidebarCollapsed = (): SidebarContextValue => {
  const ctx = useContext(SidebarContext);
  if (ctx === null) {
    throw new Error("useSidebarCollapsed must be used within <Sidebar>.");
  }
  return ctx;
};
