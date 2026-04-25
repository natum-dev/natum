import { useCallback, useEffect, useRef, useState } from "react";

export type UseActiveDescendantProps = {
  count: number;
  isOpen: boolean;
  onSelect: (index: number, event?: React.SyntheticEvent) => void;
  isDisabled?: (index: number) => boolean;
};

export type UseActiveDescendantReturn = {
  activeIndex: number;
  setActiveIndex: (i: number) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
};

function firstNonDisabled(
  count: number,
  isDisabled?: (i: number) => boolean
): number {
  for (let i = 0; i < count; i++) {
    if (!isDisabled?.(i)) return i;
  }
  return -1;
}

function lastNonDisabled(
  count: number,
  isDisabled?: (i: number) => boolean
): number {
  for (let i = count - 1; i >= 0; i--) {
    if (!isDisabled?.(i)) return i;
  }
  return -1;
}

function nextNonDisabled(
  from: number,
  direction: 1 | -1,
  count: number,
  isDisabled?: (i: number) => boolean
): number {
  if (count === 0) return -1;
  let cursor = from;
  for (let attempts = 0; attempts < count; attempts++) {
    cursor = (cursor + direction + count) % count;
    if (!isDisabled?.(cursor)) return cursor;
  }
  return -1; // all disabled
}

export function useActiveDescendant(
  props: UseActiveDescendantProps
): UseActiveDescendantReturn {
  const { count, isOpen, onSelect, isDisabled } = props;
  const [activeIndex, setActiveIndexRaw] = useState<number>(-1);

  // Keep latest refs so the keydown handler identity is stable-ish and
  // picks up the latest values without re-creating on every render.
  const countRef = useRef(count);
  countRef.current = count;
  const isDisabledRef = useRef(isDisabled);
  isDisabledRef.current = isDisabled;
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;
  const activeRef = useRef(activeIndex);
  activeRef.current = activeIndex;

  // Reset on open/close or count change.
  useEffect(() => {
    if (!isOpen || count === 0) {
      setActiveIndexRaw(-1);
      return;
    }
    setActiveIndexRaw(firstNonDisabled(count, isDisabled));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, count]);

  const setActiveIndex = useCallback((i: number) => {
    if (i < 0) {
      setActiveIndexRaw(-1);
      return;
    }
    const c = countRef.current;
    const d = isDisabledRef.current;
    if (i >= c) return;
    if (!d?.(i)) {
      setActiveIndexRaw(i);
      return;
    }
    // Clamp forward to next non-disabled
    const next = nextNonDisabled(i - 1, 1, c, d);
    setActiveIndexRaw(next);
  }, []);

  const onKeyDown = useCallback((e: React.KeyboardEvent) => {
    const c = countRef.current;
    const d = isDisabledRef.current;
    const current = activeRef.current;

    switch (e.key) {
      case "ArrowDown": {
        e.preventDefault();
        const next = nextNonDisabled(current, 1, c, d);
        setActiveIndexRaw(next);
        return;
      }
      case "ArrowUp": {
        e.preventDefault();
        const next = nextNonDisabled(current < 0 ? c : current, -1, c, d);
        setActiveIndexRaw(next);
        return;
      }
      case "Home": {
        e.preventDefault();
        setActiveIndexRaw(firstNonDisabled(c, d));
        return;
      }
      case "End": {
        e.preventDefault();
        setActiveIndexRaw(lastNonDisabled(c, d));
        return;
      }
      case "Enter":
      case " ": {
        e.preventDefault();
        if (current >= 0 && !d?.(current)) {
          onSelectRef.current(current, e);
        }
        return;
      }
      default:
        return;
    }
  }, []);

  return { activeIndex, setActiveIndex, onKeyDown };
}
