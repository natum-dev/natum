import { createRef } from "react";
import { describe, it, expect, vi } from "vitest";
import { mergeRefs } from "./mergeRefs";

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
