import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTypeahead } from "./use-typeahead";

function keyEvent(
  key: string,
  opts: { ctrl?: boolean; alt?: boolean; meta?: boolean } = {}
) {
  return {
    key,
    ctrlKey: opts.ctrl ?? false,
    altKey: opts.alt ?? false,
    metaKey: opts.meta ?? false,
    preventDefault: vi.fn(),
  } as unknown as React.KeyboardEvent;
}

describe("useTypeahead", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("single char matches the first item with that prefix", () => {
    const onMatch = vi.fn();
    const items = [{ key: "apple" }, { key: "banana" }, { key: "apricot" }];
    const { result } = renderHook(() =>
      useTypeahead({ items, getKey: (i) => i.key, onMatch })
    );

    act(() => result.current.onKeyDown(keyEvent("a")));
    expect(onMatch).toHaveBeenCalledWith(0);
  });

  it("multi-char buffer matches longer prefix", () => {
    const onMatch = vi.fn();
    const items = [{ key: "apple" }, { key: "apricot" }, { key: "banana" }];
    const { result } = renderHook(() =>
      useTypeahead({ items, getKey: (i) => i.key, onMatch })
    );

    act(() => result.current.onKeyDown(keyEvent("a")));
    act(() => result.current.onKeyDown(keyEvent("p")));
    act(() => result.current.onKeyDown(keyEvent("r")));
    // buffer is now "apr" → matches "apricot"
    expect(onMatch).toHaveBeenLastCalledWith(1);
  });

  it("500ms idle clears the buffer", () => {
    const onMatch = vi.fn();
    const items = [{ key: "apple" }, { key: "apricot" }];
    const { result } = renderHook(() =>
      useTypeahead({ items, getKey: (i) => i.key, onMatch })
    );

    act(() => result.current.onKeyDown(keyEvent("a")));
    expect(onMatch).toHaveBeenLastCalledWith(0);

    act(() => {
      vi.advanceTimersByTime(500);
    });

    act(() => result.current.onKeyDown(keyEvent("a")));
    // buffer reset — "a" matches "apple" (first a) again
    expect(onMatch).toHaveBeenLastCalledWith(0);
  });

  it("modifier keys (Ctrl/Alt/Meta) are ignored", () => {
    const onMatch = vi.fn();
    const items = [{ key: "apple" }];
    const { result } = renderHook(() =>
      useTypeahead({ items, getKey: (i) => i.key, onMatch })
    );

    act(() => result.current.onKeyDown(keyEvent("a", { ctrl: true })));
    act(() => result.current.onKeyDown(keyEvent("a", { alt: true })));
    act(() => result.current.onKeyDown(keyEvent("a", { meta: true })));

    expect(onMatch).not.toHaveBeenCalled();
  });

  it("arrow keys, Enter, Escape, Space, Tab are ignored", () => {
    const onMatch = vi.fn();
    const items = [{ key: "apple" }];
    const { result } = renderHook(() =>
      useTypeahead({ items, getKey: (i) => i.key, onMatch })
    );

    for (const key of ["ArrowUp", "ArrowDown", "Enter", "Escape", " ", "Tab"]) {
      act(() => result.current.onKeyDown(keyEvent(key)));
    }
    expect(onMatch).not.toHaveBeenCalled();
  });

  it("empty items is a no-op", () => {
    const onMatch = vi.fn();
    const { result } = renderHook(() =>
      useTypeahead({ items: [], getKey: () => "", onMatch })
    );
    act(() => result.current.onKeyDown(keyEvent("a")));
    expect(onMatch).not.toHaveBeenCalled();
  });

  it("matching is case-insensitive", () => {
    const onMatch = vi.fn();
    const items = [{ key: "banana" }, { key: "Apple" }];
    const { result } = renderHook(() =>
      useTypeahead({
        items,
        getKey: (i) => i.key.toLowerCase(),
        onMatch,
      })
    );
    act(() => result.current.onKeyDown(keyEvent("A")));
    expect(onMatch).toHaveBeenLastCalledWith(1);
  });

  it("getKey returning empty string skips that item", () => {
    const onMatch = vi.fn();
    const items = [{ key: "" }, { key: "banana" }];
    const { result } = renderHook(() =>
      useTypeahead({ items, getKey: (i) => i.key, onMatch })
    );
    act(() => result.current.onKeyDown(keyEvent("b")));
    expect(onMatch).toHaveBeenLastCalledWith(1);
  });

  it("enabled=false returns a no-op handler", () => {
    const onMatch = vi.fn();
    const items = [{ key: "apple" }];
    const { result } = renderHook(() =>
      useTypeahead({ items, getKey: (i) => i.key, onMatch, enabled: false })
    );
    act(() => result.current.onKeyDown(keyEvent("a")));
    expect(onMatch).not.toHaveBeenCalled();
  });

  it("custom timeout works", () => {
    const onMatch = vi.fn();
    const items = [{ key: "apple" }, { key: "apricot" }];
    const { result } = renderHook(() =>
      useTypeahead({ items, getKey: (i) => i.key, onMatch, timeout: 100 })
    );

    act(() => result.current.onKeyDown(keyEvent("a")));
    act(() => result.current.onKeyDown(keyEvent("p")));
    // buffer is "ap" → still apple
    act(() => vi.advanceTimersByTime(100));

    act(() => result.current.onKeyDown(keyEvent("b")));
    // buffer reset to "b" — no match → onMatch not re-invoked
    const afterB = onMatch.mock.calls.length;
    expect(afterB).toBe(2); // called for "a" then "ap" only
  });

  it("no-match does not invoke onMatch for that keystroke", () => {
    const onMatch = vi.fn();
    const items = [{ key: "apple" }];
    const { result } = renderHook(() =>
      useTypeahead({ items, getKey: (i) => i.key, onMatch })
    );
    act(() => result.current.onKeyDown(keyEvent("z")));
    expect(onMatch).not.toHaveBeenCalled();
  });

  it("onMatch is called with the correct index", () => {
    const onMatch = vi.fn();
    const items = [
      { key: "alpha" },
      { key: "beta" },
      { key: "gamma" },
    ];
    const { result } = renderHook(() =>
      useTypeahead({ items, getKey: (i) => i.key, onMatch })
    );
    act(() => result.current.onKeyDown(keyEvent("g")));
    expect(onMatch).toHaveBeenCalledWith(2);
  });
});
