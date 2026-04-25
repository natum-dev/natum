import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useAnimationState } from "./use-animation-state";

describe("useAnimationState", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts as exited when isOpen is false", () => {
    const { result } = renderHook(() =>
      useAnimationState({ isOpen: false, enterDuration: 200, exitDuration: 150 })
    );
    expect(result.current.state).toBe("exited");
    expect(result.current.shouldRender).toBe(false);
  });

  it("transitions to entering then entered when isOpen becomes true", () => {
    const { result, rerender } = renderHook(
      ({ isOpen }) =>
        useAnimationState({ isOpen, enterDuration: 200, exitDuration: 150 }),
      { initialProps: { isOpen: false } }
    );

    rerender({ isOpen: true });
    expect(result.current.state).toBe("entering");
    expect(result.current.shouldRender).toBe(true);

    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current.state).toBe("entered");
    expect(result.current.shouldRender).toBe(true);
  });

  it("transitions to exiting then exited when isOpen becomes false", () => {
    const { result, rerender } = renderHook(
      ({ isOpen }) =>
        useAnimationState({ isOpen, enterDuration: 200, exitDuration: 150 }),
      { initialProps: { isOpen: true } }
    );

    // Let enter complete
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current.state).toBe("entered");

    rerender({ isOpen: false });
    expect(result.current.state).toBe("exiting");
    expect(result.current.shouldRender).toBe(true);

    act(() => {
      vi.advanceTimersByTime(150);
    });
    expect(result.current.state).toBe("exited");
    expect(result.current.shouldRender).toBe(false);
  });

  it("starts as entering when initially open", () => {
    const { result } = renderHook(() =>
      useAnimationState({ isOpen: true, enterDuration: 200, exitDuration: 150 })
    );
    expect(result.current.state).toBe("entering");
    expect(result.current.shouldRender).toBe(true);

    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current.state).toBe("entered");
  });

  it("cleans up timers on unmount", () => {
    const { unmount } = renderHook(
      ({ isOpen }) =>
        useAnimationState({ isOpen, enterDuration: 200, exitDuration: 150 }),
      { initialProps: { isOpen: true } }
    );

    // Unmount during entering
    unmount();

    // Advancing timers should not throw
    act(() => {
      vi.advanceTimersByTime(200);
    });
  });

  it("handles rapid open/close toggle", () => {
    const { result, rerender } = renderHook(
      ({ isOpen }) =>
        useAnimationState({ isOpen, enterDuration: 200, exitDuration: 150 }),
      { initialProps: { isOpen: false } }
    );

    // Open
    rerender({ isOpen: true });
    expect(result.current.state).toBe("entering");

    // Close before enter finishes
    rerender({ isOpen: false });
    expect(result.current.state).toBe("exiting");

    act(() => {
      vi.advanceTimersByTime(150);
    });
    expect(result.current.state).toBe("exited");
    expect(result.current.shouldRender).toBe(false);
  });
});
