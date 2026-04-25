import { useCallback, useEffect, useRef, useState } from "react";

type Placement = "top" | "bottom" | "left" | "right";

type UseAnchorPositionBaseProps = {
  floatingRef: React.RefObject<HTMLElement | null>;
  placement?: Placement;
  offset?: number;
  isOpen: boolean;
};

type WithAnchorRef = UseAnchorPositionBaseProps & {
  anchorRef: React.RefObject<HTMLElement | null>;
  anchorRect?: never;
};

type WithAnchorRect = UseAnchorPositionBaseProps & {
  anchorRef?: never;
  anchorRect: DOMRect;
};

export type UseAnchorPositionProps = WithAnchorRef | WithAnchorRect;

export type UseAnchorPositionReturn = {
  styles: { position: "fixed"; top: number; left: number };
  actualPlacement: Placement;
};

function getAnchorRect(props: UseAnchorPositionProps): DOMRect | null {
  if (props.anchorRect) return props.anchorRect;
  if (props.anchorRef?.current) return props.anchorRef.current.getBoundingClientRect();
  return null;
}

function calculate(
  anchorRect: DOMRect,
  floatingRect: DOMRect,
  placement: Placement,
  offset: number
): { top: number; left: number; actualPlacement: Placement } {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const positions = {
    top: {
      top: anchorRect.top - floatingRect.height - offset,
      left: anchorRect.left + anchorRect.width / 2 - floatingRect.width / 2,
    },
    bottom: {
      top: anchorRect.bottom + offset,
      left: anchorRect.left + anchorRect.width / 2 - floatingRect.width / 2,
    },
    left: {
      top: anchorRect.top + anchorRect.height / 2 - floatingRect.height / 2,
      left: anchorRect.left - floatingRect.width - offset,
    },
    right: {
      top: anchorRect.top + anchorRect.height / 2 - floatingRect.height / 2,
      left: anchorRect.right + offset,
    },
  };

  const flipMap: Record<Placement, Placement> = {
    top: "bottom", bottom: "top", left: "right", right: "left",
  };

  const preferred = positions[placement];

  const placementFits =
    (placement === "top" && preferred.top >= 0) ||
    (placement === "bottom" && preferred.top + floatingRect.height <= vh) ||
    (placement === "left" && preferred.left >= 0) ||
    (placement === "right" && preferred.left + floatingRect.width <= vw);

  let top: number;
  let left: number;
  let actual: Placement;

  if (placementFits) {
    top = preferred.top;
    left = preferred.left;
    actual = placement;
  } else {
    const flipped = flipMap[placement];
    const flippedPos = positions[flipped];
    top = flippedPos.top;
    left = flippedPos.left;
    actual = flipped;
  }

  left = Math.max(0, Math.min(left, vw - floatingRect.width));
  top = Math.max(0, Math.min(top, vh - floatingRect.height));

  return { top, left, actualPlacement: actual };
}

export function useAnchorPosition(
  props: UseAnchorPositionProps
): UseAnchorPositionReturn {
  const { placement = "top", isOpen } = props;

  const propsRef = useRef(props);
  propsRef.current = props;

  const [position, setPosition] = useState<{
    top: number; left: number; actualPlacement: Placement;
  }>({ top: 0, left: 0, actualPlacement: placement });

  const update = useCallback(() => {
    const anchorRect = getAnchorRect(propsRef.current);
    const floatingEl = propsRef.current.floatingRef.current;
    if (!anchorRect || !floatingEl) return;

    const floatingRect = floatingEl.getBoundingClientRect();
    const { placement: p = "top", offset: o = 8 } = propsRef.current;
    const result = calculate(anchorRect, floatingRect, p, o);
    setPosition((prev) => {
      if (prev.top === result.top && prev.left === result.left && prev.actualPlacement === result.actualPlacement) {
        return prev;
      }
      return result;
    });
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    update();

    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [isOpen, update]);

  return {
    styles: { position: "fixed" as const, top: position.top, left: position.left },
    actualPlacement: position.actualPlacement,
  };
}
