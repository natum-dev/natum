import { useEffect, useLayoutEffect } from "react";

// On the server `useLayoutEffect` emits a warning and does nothing useful;
// `useEffect` is a no-op there. Swap at import time so callers get
// `useLayoutEffect` in the browser and a quiet no-op during SSR.
export const useIsomorphicLayoutEffect =
  typeof document !== "undefined" ? useLayoutEffect : useEffect;
