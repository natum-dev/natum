import { renderHook } from "@testing-library/react";
import { createRef } from "react";
import { describe, it, expect, vi } from "vitest";
import { mergeRefs, useMergedRefs } from "./mergeRefs";

describe("mergeRefs", () => {
  it("merges forwarded ref + internal ref", () => {
    const forwardedRef = createRef<HTMLDivElement>();
    const internalRef = createRef<HTMLDivElement>();

    const merged = mergeRefs(forwardedRef, internalRef);

    const node = document.createElement("div");
    merged(node);

    expect(forwardedRef.current).toBe(node);
    expect(internalRef.current).toBe(node);
  });

  it("handles callback refs", () => {
    const callbackRef = vi.fn();
    const objectRef = createRef<HTMLDivElement>();

    const merged = mergeRefs(callbackRef, objectRef);

    const node = document.createElement("div");
    merged(node);

    expect(callbackRef).toHaveBeenCalledWith(node);
    expect(objectRef.current).toBe(node);
  });

  it("handles null refs gracefully", () => {
    const validRef = createRef<HTMLDivElement>();

    const merged = mergeRefs(null, undefined, validRef);

    const node = document.createElement("div");
    expect(() => merged(node)).not.toThrow();
    expect(validRef.current).toBe(node);
  });

  it("updates all refs when node changes", () => {
    const ref1 = createRef<HTMLDivElement>();
    const ref2 = vi.fn();

    const merged = mergeRefs(ref1, ref2);

    const node1 = document.createElement("div");
    merged(node1);
    expect(ref1.current).toBe(node1);
    expect(ref2).toHaveBeenCalledWith(node1);

    const node2 = document.createElement("div");
    merged(node2);
    expect(ref1.current).toBe(node2);
    expect(ref2).toHaveBeenCalledWith(node2);

    // Unmount scenario
    merged(null);
    expect(ref1.current).toBeNull();
    expect(ref2).toHaveBeenCalledWith(null);
  });
});

describe("useMergedRefs", () => {
  it("merges refs via hook", () => {
    const ref1 = createRef<HTMLDivElement>();
    const ref2 = createRef<HTMLDivElement>();

    const { result } = renderHook(() => useMergedRefs(ref1, ref2));

    const node = document.createElement("div");
    result.current(node);

    expect(ref1.current).toBe(node);
    expect(ref2.current).toBe(node);
  });

  it("returns stable ref across re-renders when input refs don't change", () => {
    const ref1 = createRef<HTMLDivElement>();
    const ref2 = createRef<HTMLDivElement>();

    const { result, rerender } = renderHook(() => useMergedRefs(ref1, ref2));

    const firstResult = result.current;
    rerender();
    expect(result.current).toBe(firstResult);
  });

  it("returns new ref when input refs change", () => {
    const ref1 = createRef<HTMLDivElement>();
    const ref2 = createRef<HTMLDivElement>();
    const ref3 = createRef<HTMLDivElement>();

    const { result, rerender } = renderHook(
      ({ refs }) => useMergedRefs(...refs),
      { initialProps: { refs: [ref1, ref2] as React.RefObject<HTMLDivElement>[] } }
    );

    const firstResult = result.current;
    rerender({ refs: [ref1, ref3] });
    expect(result.current).not.toBe(firstResult);
  });
});
