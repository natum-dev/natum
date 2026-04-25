import { useEffect, useRef } from "react";

export type UseEscapeKeyOptions = {
  onEscape: (event: KeyboardEvent) => void;
  enabled?: boolean;
};

export function useEscapeKey(options: UseEscapeKeyOptions): void {
  const { onEscape, enabled = true } = options;
  const onEscapeRef = useRef(onEscape);
  onEscapeRef.current = onEscape;

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onEscapeRef.current(e);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [enabled]);
}
