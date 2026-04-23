import { createContext, useContext, type RefObject } from "react";

export type DropdownMenuSetOpenOptions = {
  returnFocus?: boolean;
  focusTarget?: "first" | "last";
};

export type DropdownMenuContextValue = {
  open: boolean;
  setOpen: (next: boolean, opts?: DropdownMenuSetOpenOptions) => void;
  triggerRef: RefObject<HTMLElement | null>;
  contentRef: RefObject<HTMLDivElement | null>;
  triggerId: string;
  contentId: string;
  modal: boolean;
  focusTargetOnOpen: "first" | "last" | null;
  clearFocusTarget: () => void;
  pendingReturnFocusRef: RefObject<boolean>;
};

export const DropdownMenuContext =
  createContext<DropdownMenuContextValue | null>(null);

export const useDropdownMenuContext = (): DropdownMenuContextValue => {
  const ctx = useContext(DropdownMenuContext);
  if (ctx === null) {
    throw new Error(
      "useDropdownMenuContext must be used within <DropdownMenu>."
    );
  }
  return ctx;
};
