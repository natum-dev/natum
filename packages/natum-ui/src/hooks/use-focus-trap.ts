import { useCallback, useEffect, useRef } from "react";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export type UseFocusTrapOptions = {
  isActive: boolean;
  onEscape?: () => void;
  containerRef: React.RefObject<HTMLElement | null>;
};

export type UseFocusTrapReturn = {
  handleKeyDown: (e: React.KeyboardEvent) => void;
};

export function useFocusTrap(options: UseFocusTrapOptions): UseFocusTrapReturn {
  const { isActive, onEscape, containerRef } = options;
  const previousActiveElement = useRef<Element | null>(null);
  const inertedElements = useRef<Element[]>([]);

  // Focus first focusable element (or container) on activate
  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    previousActiveElement.current = document.activeElement;

    // Use microtask to ensure DOM is ready after portal render
    Promise.resolve().then(() => {
      if (!containerRef.current) return;
      const firstFocusable =
        containerRef.current.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
      if (firstFocusable) {
        firstFocusable.focus();
      } else {
        containerRef.current.focus();
      }
    });
  }, [isActive, containerRef]);

  // Inert management
  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const portalEl = containerRef.current.closest("[data-modal-portal]");
    const siblings = Array.from(document.body.children).filter(
      (el) => el !== portalEl && !el.hasAttribute("data-modal-portal")
    );
    siblings.forEach((el) => el.setAttribute("inert", ""));
    inertedElements.current = siblings;

    return () => {
      inertedElements.current.forEach((el) => el.removeAttribute("inert"));
      inertedElements.current = [];
    };
  }, [isActive, containerRef]);

  // Focus restore on deactivate
  useEffect(() => {
    if (isActive) return;
    if (!previousActiveElement.current) return;

    const el = previousActiveElement.current as HTMLElement;
    previousActiveElement.current = null;

    // Remove inert before restoring focus to ensure element is focusable
    inertedElements.current.forEach((sibling) =>
      sibling.removeAttribute("inert")
    );
    el?.focus?.();
  }, [isActive]);

  // Tab cycling + ESC
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onEscape?.();
        return;
      }

      if (e.key === "Tab" && containerRef.current) {
        const focusableEls =
          containerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
        if (focusableEls.length === 0) return;

        const first = focusableEls[0];
        const last = focusableEls[focusableEls.length - 1];

        if (e.shiftKey) {
          if (
            document.activeElement === first ||
            document.activeElement === containerRef.current
          ) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    },
    [onEscape, containerRef]
  );

  return { handleKeyDown };
}
