import { useCallback, useRef } from "react";

export type UseTypeaheadProps<T> = {
  items: readonly T[];
  getKey: (item: T) => string;
  onMatch: (index: number) => void;
  enabled?: boolean;
  timeout?: number;
};

export type UseTypeaheadReturn = {
  onKeyDown: (e: React.KeyboardEvent) => void;
};

const SPECIAL_KEYS = new Set([
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "Enter",
  "Escape",
  " ",
  "Tab",
  "Home",
  "End",
  "PageUp",
  "PageDown",
  "Shift",
  "Control",
  "Alt",
  "Meta",
  "CapsLock",
  "Backspace",
  "Delete",
]);

export function useTypeahead<T>(
  props: UseTypeaheadProps<T>
): UseTypeaheadReturn {
  const { items, getKey, onMatch, enabled = true, timeout = 500 } = props;

  const bufferRef = useRef("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Latest refs so the callback identity is stable.
  const itemsRef = useRef(items);
  itemsRef.current = items;
  const getKeyRef = useRef(getKey);
  getKeyRef.current = getKey;
  const onMatchRef = useRef(onMatch);
  onMatchRef.current = onMatch;
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;
  const timeoutRef = useRef(timeout);
  timeoutRef.current = timeout;

  const onKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!enabledRef.current) return;
    if (e.ctrlKey || e.altKey || e.metaKey) return;
    if (SPECIAL_KEYS.has(e.key)) return;
    if (e.key.length !== 1) return; // only single printable characters

    bufferRef.current += e.key.toLowerCase();

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      bufferRef.current = "";
      timerRef.current = null;
    }, timeoutRef.current);

    const buffer = bufferRef.current;
    const itemsNow = itemsRef.current;
    const gk = getKeyRef.current;

    for (let i = 0; i < itemsNow.length; i++) {
      const key = gk(itemsNow[i]);
      if (!key) continue;
      if (key.startsWith(buffer)) {
        onMatchRef.current(i);
        return;
      }
    }
  }, []);

  return { onKeyDown };
}
