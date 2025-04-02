import { useCallback, useRef, useState } from "react";

type CountdownBreakdown = {
  hours: number;
  minutes: number;
  seconds: number;
};

type CountdownState = "idle" | "running" | "finished";

const generateTimeBreakdown = (duration: number) => {
  const seconds = duration % 60;
  const minutes = Math.trunc(duration / 60) % 60;
  const hours = Math.trunc(duration / 3600);

  return { seconds, minutes, hours };
};

// Countdown hooks that will do countdown based on provided duration
const useCountdown = (initialDuration: number) => {
  const startTime = useRef<number>(0);
  const rafId = useRef<number | null>(null);
  const lastRender = useRef<number>(0);
  const [duration, setDuration] = useState(initialDuration);
  const [state, setState] = useState<CountdownState>("idle");
  const [breakdown, setBreakdown] = useState<CountdownBreakdown>(() =>
    generateTimeBreakdown(initialDuration)
  );

  const updateBreakdown = useCallback((targetDuration: number): boolean => {
    const currentBreakdown = generateTimeBreakdown(targetDuration);
    setBreakdown(currentBreakdown);
    return Object.values(currentBreakdown).every((value) => value === 0);
  }, []);

  const calculateRemainingDuration = useCallback(() => {
    const current = performance.now();

    // Elapsed time from start until now in seconds
    const elapsedTimeFromStart = Math.abs(
      Math.trunc((current - startTime.current) / 1000)
    );

    // Remaining countdown duration in seconds
    const remainingDuration = duration - elapsedTimeFromStart;

    // Callback calculateRemainingDuration is called within 1 seconds
    // Re-queueing calculation
    if (lastRender.current === elapsedTimeFromStart) {
      rafId.current = requestAnimationFrame(() => {
        calculateRemainingDuration();
      });
      return;
    }

    const isFinishsed = updateBreakdown(remainingDuration);
    if (isFinishsed) {
      setState("finished");
      return;
    }

    // Update last render to be the current time in seconds
    lastRender.current = elapsedTimeFromStart;
    rafId.current = requestAnimationFrame(() => {
      calculateRemainingDuration();
    });
  }, [duration, updateBreakdown]);

  const start = useCallback(() => {
    setState("running");
    if (rafId.current) cancelAnimationFrame(rafId.current);

    startTime.current = performance.now();
    calculateRemainingDuration();
  }, [calculateRemainingDuration]);

  const reset = useCallback(
    (duration = initialDuration) => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
      rafId.current = null;

      setDuration(duration);
      updateBreakdown(duration);
      setState("idle");
    },
    [initialDuration, updateBreakdown]
  );

  return {
    start,
    reset,
    breakdown,
    state,
  };
};

export default useCountdown;
