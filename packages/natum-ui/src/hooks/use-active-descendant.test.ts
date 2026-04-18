import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useActiveDescendant } from "./use-active-descendant";

// Helper: simulate a keyboard event shaped enough for the hook's handler.
function keyEvent(key: string) {
  const prevent = vi.fn();
  return {
    event: {
      key,
      preventDefault: prevent,
    } as unknown as React.KeyboardEvent,
    prevent,
  };
}

describe("useActiveDescendant", () => {
  it("activeIndex is -1 when count=0", () => {
    const { result } = renderHook(() =>
      useActiveDescendant({ count: 0, isOpen: true, onSelect: () => {} })
    );
    expect(result.current.activeIndex).toBe(-1);
  });

  it("activeIndex is -1 when isOpen=false", () => {
    const { result } = renderHook(() =>
      useActiveDescendant({ count: 5, isOpen: false, onSelect: () => {} })
    );
    expect(result.current.activeIndex).toBe(-1);
  });

  it("on open transition, resets to first non-disabled index", () => {
    const { result, rerender } = renderHook(
      ({ isOpen }) =>
        useActiveDescendant({
          count: 3,
          isOpen,
          onSelect: () => {},
          isDisabled: (i) => i === 0, // first is disabled
        }),
      { initialProps: { isOpen: false } }
    );
    expect(result.current.activeIndex).toBe(-1);
    rerender({ isOpen: true });
    expect(result.current.activeIndex).toBe(1);
  });

  it("on open with all items disabled, activeIndex stays at -1", () => {
    const { result, rerender } = renderHook(
      ({ isOpen }) =>
        useActiveDescendant({
          count: 3,
          isOpen,
          onSelect: () => {},
          isDisabled: () => true,
        }),
      { initialProps: { isOpen: false } }
    );
    rerender({ isOpen: true });
    expect(result.current.activeIndex).toBe(-1);
  });

  it("ArrowDown advances", () => {
    const { result } = renderHook(() =>
      useActiveDescendant({ count: 3, isOpen: true, onSelect: () => {} })
    );
    act(() => result.current.onKeyDown(keyEvent("ArrowDown").event));
    expect(result.current.activeIndex).toBe(1);
  });

  it("ArrowDown wraps at end", () => {
    const { result } = renderHook(() =>
      useActiveDescendant({ count: 2, isOpen: true, onSelect: () => {} })
    );
    // starts at 0 after open reset
    act(() => result.current.onKeyDown(keyEvent("ArrowDown").event));
    expect(result.current.activeIndex).toBe(1);
    act(() => result.current.onKeyDown(keyEvent("ArrowDown").event));
    expect(result.current.activeIndex).toBe(0);
  });

  it("ArrowUp decrements", () => {
    const { result } = renderHook(() =>
      useActiveDescendant({ count: 3, isOpen: true, onSelect: () => {} })
    );
    act(() => result.current.setActiveIndex(2));
    act(() => result.current.onKeyDown(keyEvent("ArrowUp").event));
    expect(result.current.activeIndex).toBe(1);
  });

  it("ArrowUp wraps at start", () => {
    const { result } = renderHook(() =>
      useActiveDescendant({ count: 2, isOpen: true, onSelect: () => {} })
    );
    expect(result.current.activeIndex).toBe(0);
    act(() => result.current.onKeyDown(keyEvent("ArrowUp").event));
    expect(result.current.activeIndex).toBe(1);
  });

  it("Home jumps to first non-disabled", () => {
    const { result } = renderHook(() =>
      useActiveDescendant({
        count: 3,
        isOpen: true,
        onSelect: () => {},
        isDisabled: (i) => i === 0,
      })
    );
    act(() => result.current.setActiveIndex(2));
    act(() => result.current.onKeyDown(keyEvent("Home").event));
    expect(result.current.activeIndex).toBe(1);
  });

  it("End jumps to last non-disabled", () => {
    const { result } = renderHook(() =>
      useActiveDescendant({
        count: 3,
        isOpen: true,
        onSelect: () => {},
        isDisabled: (i) => i === 2,
      })
    );
    act(() => result.current.onKeyDown(keyEvent("End").event));
    expect(result.current.activeIndex).toBe(1);
  });

  it("arrow nav skips disabled indices", () => {
    const { result } = renderHook(() =>
      useActiveDescendant({
        count: 4,
        isOpen: true,
        onSelect: () => {},
        isDisabled: (i) => i === 1, // 0, [1 disabled], 2, 3
      })
    );
    expect(result.current.activeIndex).toBe(0);
    act(() => result.current.onKeyDown(keyEvent("ArrowDown").event));
    expect(result.current.activeIndex).toBe(2); // skipped 1
  });

  it("Enter calls onSelect(activeIndex) when valid", () => {
    const onSelect = vi.fn();
    const { result } = renderHook(() =>
      useActiveDescendant({ count: 3, isOpen: true, onSelect })
    );
    act(() => result.current.setActiveIndex(1));
    act(() => result.current.onKeyDown(keyEvent("Enter").event));
    expect(onSelect).toHaveBeenCalledWith(1);
  });

  it("Space calls onSelect(activeIndex) when valid", () => {
    const onSelect = vi.fn();
    const { result } = renderHook(() =>
      useActiveDescendant({ count: 3, isOpen: true, onSelect })
    );
    act(() => result.current.setActiveIndex(2));
    act(() => result.current.onKeyDown(keyEvent(" ").event));
    expect(onSelect).toHaveBeenCalledWith(2);
  });

  it("Enter with activeIndex=-1 is a no-op", () => {
    const onSelect = vi.fn();
    const { result } = renderHook(() =>
      useActiveDescendant({ count: 0, isOpen: true, onSelect })
    );
    act(() => result.current.onKeyDown(keyEvent("Enter").event));
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("setActiveIndex clamps to non-disabled (moves forward if the target is disabled)", () => {
    const { result } = renderHook(() =>
      useActiveDescendant({
        count: 4,
        isOpen: true,
        onSelect: () => {},
        isDisabled: (i) => i === 1,
      })
    );
    act(() => result.current.setActiveIndex(1)); // 1 is disabled
    expect(result.current.activeIndex).toBe(2); // clamps forward
  });

  it("setActiveIndex(-1) clears", () => {
    const { result } = renderHook(() =>
      useActiveDescendant({ count: 3, isOpen: true, onSelect: () => {} })
    );
    act(() => result.current.setActiveIndex(-1));
    expect(result.current.activeIndex).toBe(-1);
  });

  it("wrap-around with mixed disabled indices", () => {
    const { result } = renderHook(() =>
      useActiveDescendant({
        count: 4,
        isOpen: true,
        onSelect: () => {},
        isDisabled: (i) => i === 0 || i === 3,
      })
    );
    // open reset → index 1 (first non-disabled)
    expect(result.current.activeIndex).toBe(1);
    act(() => result.current.onKeyDown(keyEvent("ArrowDown").event));
    expect(result.current.activeIndex).toBe(2);
    act(() => result.current.onKeyDown(keyEvent("ArrowDown").event));
    expect(result.current.activeIndex).toBe(1); // wrapped, skipped 3 and 0
  });

  it("all-disabled + ArrowDown stays at -1", () => {
    const { result } = renderHook(() =>
      useActiveDescendant({
        count: 3,
        isOpen: true,
        onSelect: () => {},
        isDisabled: () => true,
      })
    );
    act(() => result.current.onKeyDown(keyEvent("ArrowDown").event));
    expect(result.current.activeIndex).toBe(-1);
  });

  it("preventDefault is called for handled keys", () => {
    const { result } = renderHook(() =>
      useActiveDescendant({ count: 3, isOpen: true, onSelect: () => {} })
    );
    for (const key of ["ArrowDown", "ArrowUp", "Home", "End", "Enter", " "]) {
      const ke = keyEvent(key);
      act(() => result.current.onKeyDown(ke.event));
      expect(ke.prevent).toHaveBeenCalled();
    }
  });

  it("preventDefault is NOT called for unhandled keys (Escape, Tab, a)", () => {
    const { result } = renderHook(() =>
      useActiveDescendant({ count: 3, isOpen: true, onSelect: () => {} })
    );
    for (const key of ["Escape", "Tab", "a"]) {
      const ke = keyEvent(key);
      act(() => result.current.onKeyDown(ke.event));
      expect(ke.prevent).not.toHaveBeenCalled();
    }
  });
});
