import { useCallback, useEffect, useRef } from "react";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export type UseFocusTrapOptions = {
  isActive: boolean;
  onEscape?: () => void;
};

export type UseFocusTrapReturn = {
  ref: React.RefCallback<HTMLElement>;
};

export function useFocusTrap(options: UseFocusTrapOptions): UseFocusTrapReturn {
  const { isActive, onEscape } = options;
  const elementRef = useRef<HTMLElement | null>(null);
  const previousActiveElement = useRef<Element | null>(null);
  const inertedElements = useRef<Element[]>([]);
  const onEscapeRef = useRef(onEscape);
  onEscapeRef.current = onEscape;

  // Focus first focusable element (or container) on activate
  useEffect(() => {
    if (!isActive || !elementRef.current) return;

    previousActiveElement.current = document.activeElement;

    const container = elementRef.current;
    // Use microtask to ensure DOM is ready after portal render
    Promise.resolve().then(() => {
      if (!container) return;
      const firstFocusable =
        container.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
      if (firstFocusable) {
        firstFocusable.focus();
      } else {
        container.focus();
      }
    });
  }, [isActive]);

  // Inert management
  useEffect(() => {
    if (!isActive || !elementRef.current) return;

    const portalEl = elementRef.current.closest("[data-modal-portal]");
    const siblings = Array.from(document.body.children).filter(
      (el) => el !== portalEl && !el.hasAttribute("data-modal-portal")
    );
    siblings.forEach((el) => el.setAttribute("inert", ""));
    inertedElements.current = siblings;

    return () => {
      inertedElements.current.forEach((el) => el.removeAttribute("inert"));
      inertedElements.current = [];
    };
  }, [isActive]);

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

  // Internal keydown handler for Tab cycling + ESC
  useEffect(() => {
    if (!isActive || !elementRef.current) return;

    const container = elementRef.current;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onEscapeRef.current?.();
        return;
      }

      if (e.key === "Tab") {
        const focusableEls =
          container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
        if (focusableEls.length === 0) return;

        const first = focusableEls[0];
        const last = focusableEls[focusableEls.length - 1];

        if (e.shiftKey) {
          if (
            document.activeElement === first ||
            document.activeElement === container
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
    };

    container.addEventListener("keydown", handleKeyDown);
    return () => container.removeEventListener("keydown", handleKeyDown);
  }, [isActive]);

  const ref: React.RefCallback<HTMLElement> = useCallback(
    (node: HTMLElement | null) => {
      elementRef.current = node;
    },
    []
  );

  return { ref };
}
