import { useCallback, useEffect, useRef } from "react";

export type UseClickOutsideOptions = {
  onClickOutside: () => void;
  enabled?: boolean;
};

export type UseClickOutsideReturn = {
  ref: React.RefCallback<Element>;
};

export function useClickOutside(
  options: UseClickOutsideOptions
): UseClickOutsideReturn {
  const { onClickOutside, enabled = true } = options;
  const elementRef = useRef<Element | null>(null);
  const onClickOutsideRef = useRef(onClickOutside);
  onClickOutsideRef.current = onClickOutside;

  useEffect(() => {
    if (!enabled) return;

    const handleMouseDown = (e: MouseEvent) => {
      if (
        elementRef.current &&
        !elementRef.current.contains(e.target as Node)
      ) {
        onClickOutsideRef.current();
      }
    };

    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [enabled]);

  const ref: React.RefCallback<Element> = useCallback((node: Element | null) => {
    elementRef.current = node;
  }, []);

  return { ref };
}
