import { useLayoutEffect, useState } from "react";

export type AnimationState = "entering" | "entered" | "exiting" | "exited";

export type UseAnimationStateOptions = {
  isOpen: boolean;
  enterDuration: number;
  exitDuration: number;
};

export type UseAnimationStateReturn = {
  state: AnimationState;
  shouldRender: boolean;
};

export function useAnimationState(
  options: UseAnimationStateOptions
): UseAnimationStateReturn {
  const { isOpen, enterDuration, exitDuration } = options;
  const [state, setState] = useState<AnimationState>(
    isOpen ? "entering" : "exited"
  );

  useLayoutEffect(() => {
    if (isOpen) {
      setState("entering");
      const timer = setTimeout(() => setState("entered"), enterDuration);
      return () => clearTimeout(timer);
    } else if (state !== "exited") {
      setState("exiting");
      const timer = setTimeout(() => setState("exited"), exitDuration);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  return {
    state,
    shouldRender: state !== "exited",
  };
}
