import { useLayoutEffect } from "react";

export type UseScrollLockOptions = {
  enabled?: boolean;
};

export function useScrollLock(options: UseScrollLockOptions): void {
  const { enabled = true } = options;

  useLayoutEffect(() => {
    if (!enabled) return;

    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;

    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, [enabled]);
}
