import { useCallback, useEffect, useRef, useState } from "react";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export type UseFocusTrapOptions = {
  isActive: boolean;
  onEscape?: (event: KeyboardEvent) => void;
};

export type UseFocusTrapReturn = {
  ref: React.RefCallback<HTMLElement>;
};

export function useFocusTrap(options: UseFocusTrapOptions): UseFocusTrapReturn {
  const { isActive, onEscape } = options;
  // useState (not useRef) so that effects re-run when the element attaches/detaches
  const [element, setElement] = useState<HTMLElement | null>(null);
  const previousActiveElement = useRef<Element | null>(null);
  const inertedElements = useRef<Element[]>([]);
  const onEscapeRef = useRef(onEscape);
  onEscapeRef.current = onEscape;

  // Focus first focusable element (or container) on activate
  useEffect(() => {
    if (!isActive || !element) return;

    previousActiveElement.current = document.activeElement;

    // Use microtask to ensure DOM is ready after portal render
    Promise.resolve().then(() => {
      if (!element) return;
      const firstFocusable =
        element.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
      if (firstFocusable) {
        firstFocusable.focus();
      } else {
        element.focus();
      }
    });
  }, [isActive, element]);

  // Inert management
  useEffect(() => {
    if (!isActive || !element) return;

    const portalEl = element.closest("[data-modal-portal]");
    const siblings = Array.from(document.body.children).filter(
      (el) => el !== portalEl && !el.hasAttribute("data-modal-portal")
    );
    siblings.forEach((el) => el.setAttribute("inert", ""));
    inertedElements.current = siblings;

    return () => {
      inertedElements.current.forEach((el) => el.removeAttribute("inert"));
      inertedElements.current = [];
    };
  }, [isActive, element]);

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
    if (!isActive || !element) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onEscapeRef.current?.(e);
        return;
      }

      if (e.key === "Tab") {
        const focusableEls =
          element.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
        if (focusableEls.length === 0) return;

        const first = focusableEls[0];
        const last = focusableEls[focusableEls.length - 1];

        if (e.shiftKey) {
          if (
            document.activeElement === first ||
            document.activeElement === element
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

    element.addEventListener("keydown", handleKeyDown);
    return () => element.removeEventListener("keydown", handleKeyDown);
  }, [isActive, element]);

  const ref: React.RefCallback<HTMLElement> = useCallback(
    (node: HTMLElement | null) => {
      setElement(node);
    },
    []
  );

  return { ref };
}
