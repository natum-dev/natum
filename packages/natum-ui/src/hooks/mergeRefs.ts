type ReactRef<T> = React.Ref<T> | React.MutableRefObject<T | null> | null | undefined;

/**
 * Merges multiple refs into a single callback ref.
 * Not a hook — a plain utility function. Consumers memoize at the call site if needed.
 * Follows Mantine's mergeRefs pattern.
 */
export function mergeRefs<T>(...refs: ReactRef<T>[]): React.RefCallback<T> {
  return (node: T | null) => {
    for (const ref of refs) {
      if (typeof ref === "function") {
        ref(node);
      } else if (ref && typeof ref === "object") {
        (ref as React.MutableRefObject<T | null>).current = node;
      }
    }
  };
}
