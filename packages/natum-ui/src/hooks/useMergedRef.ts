import { useCallback } from "react";

type ReactRef<T> = React.Ref<T> | React.MutableRefObject<T | null> | null | undefined;

/**
 * Merges multiple refs into a single callback ref.
 * Supports forwarded refs, callback refs, and MutableRefObjects.
 */
export function useMergedRef<T>(...refs: ReactRef<T>[]): React.RefCallback<T> {
  return useCallback((node: T | null) => {
    for (const ref of refs) {
      if (typeof ref === "function") {
        ref(node);
      } else if (ref && typeof ref === "object") {
        (ref as React.MutableRefObject<T | null>).current = node;
      }
    }
  }, refs); // eslint-disable-line react-hooks/exhaustive-deps
}
