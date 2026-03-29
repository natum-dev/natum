import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useAnchorPosition } from "./use-anchor-position";

const mockRect = (rect: Partial<DOMRect>): DOMRect => ({
  top: 0, left: 0, bottom: 0, right: 0, width: 0, height: 0, x: 0, y: 0, toJSON: () => {}, ...rect,
});

describe("useAnchorPosition", () => {
  const originalInnerWidth = window.innerWidth;
  const originalInnerHeight = window.innerHeight;

  beforeEach(() => {
    Object.defineProperty(window, "innerWidth", { value: 1024, writable: true });
    Object.defineProperty(window, "innerHeight", { value: 768, writable: true });
  });

  afterEach(() => {
    Object.defineProperty(window, "innerWidth", { value: originalInnerWidth, writable: true });
    Object.defineProperty(window, "innerHeight", { value: originalInnerHeight, writable: true });
  });

  it("returns initial position when anchor is not available", () => {
    const { result } = renderHook(() =>
      useAnchorPosition({
        anchorRef: { current: null },
        floatingRef: { current: null },
        placement: "top",
        isOpen: false,
      })
    );
    expect(result.current.styles).toEqual({ position: "fixed", top: 0, left: 0 });
    expect(result.current.actualPlacement).toBe("top");
  });

  it("calculates top placement position", () => {
    const anchor = document.createElement("div");
    const floating = document.createElement("div");
    vi.spyOn(anchor, "getBoundingClientRect").mockReturnValue(
      mockRect({ top: 200, left: 100, bottom: 240, right: 200, width: 100, height: 40 })
    );
    vi.spyOn(floating, "getBoundingClientRect").mockReturnValue(
      mockRect({ width: 80, height: 30 })
    );

    const { result } = renderHook(() =>
      useAnchorPosition({
        anchorRef: { current: anchor },
        floatingRef: { current: floating },
        placement: "top",
        isOpen: true,
        offset: 8,
      })
    );

    expect(result.current.styles.top).toBe(162);
    expect(result.current.styles.left).toBe(110);
    expect(result.current.actualPlacement).toBe("top");
  });

  it("calculates bottom placement position", () => {
    const anchor = document.createElement("div");
    const floating = document.createElement("div");
    vi.spyOn(anchor, "getBoundingClientRect").mockReturnValue(
      mockRect({ top: 200, left: 100, bottom: 240, right: 200, width: 100, height: 40 })
    );
    vi.spyOn(floating, "getBoundingClientRect").mockReturnValue(
      mockRect({ width: 80, height: 30 })
    );

    const { result } = renderHook(() =>
      useAnchorPosition({
        anchorRef: { current: anchor },
        floatingRef: { current: floating },
        placement: "bottom",
        isOpen: true,
        offset: 8,
      })
    );

    expect(result.current.styles.top).toBe(248);
    expect(result.current.styles.left).toBe(110);
    expect(result.current.actualPlacement).toBe("bottom");
  });

  it("calculates left placement position", () => {
    const anchor = document.createElement("div");
    const floating = document.createElement("div");
    vi.spyOn(anchor, "getBoundingClientRect").mockReturnValue(
      mockRect({ top: 200, left: 300, bottom: 240, right: 400, width: 100, height: 40 })
    );
    vi.spyOn(floating, "getBoundingClientRect").mockReturnValue(
      mockRect({ width: 80, height: 30 })
    );

    const { result } = renderHook(() =>
      useAnchorPosition({
        anchorRef: { current: anchor },
        floatingRef: { current: floating },
        placement: "left",
        isOpen: true,
        offset: 8,
      })
    );

    expect(result.current.styles.left).toBe(212);
    expect(result.current.styles.top).toBe(205);
    expect(result.current.actualPlacement).toBe("left");
  });

  it("calculates right placement position", () => {
    const anchor = document.createElement("div");
    const floating = document.createElement("div");
    vi.spyOn(anchor, "getBoundingClientRect").mockReturnValue(
      mockRect({ top: 200, left: 100, bottom: 240, right: 200, width: 100, height: 40 })
    );
    vi.spyOn(floating, "getBoundingClientRect").mockReturnValue(
      mockRect({ width: 80, height: 30 })
    );

    const { result } = renderHook(() =>
      useAnchorPosition({
        anchorRef: { current: anchor },
        floatingRef: { current: floating },
        placement: "right",
        isOpen: true,
        offset: 8,
      })
    );

    expect(result.current.styles.left).toBe(208);
    expect(result.current.styles.top).toBe(205);
    expect(result.current.actualPlacement).toBe("right");
  });

  it("flips from top to bottom when near top edge", () => {
    const anchor = document.createElement("div");
    const floating = document.createElement("div");
    vi.spyOn(anchor, "getBoundingClientRect").mockReturnValue(
      mockRect({ top: 20, left: 100, bottom: 60, right: 200, width: 100, height: 40 })
    );
    vi.spyOn(floating, "getBoundingClientRect").mockReturnValue(
      mockRect({ width: 80, height: 50 })
    );

    const { result } = renderHook(() =>
      useAnchorPosition({
        anchorRef: { current: anchor },
        floatingRef: { current: floating },
        placement: "top",
        isOpen: true,
        offset: 8,
      })
    );

    expect(result.current.actualPlacement).toBe("bottom");
    expect(result.current.styles.top).toBe(68);
  });

  it("flips from bottom to top when near bottom edge", () => {
    const anchor = document.createElement("div");
    const floating = document.createElement("div");
    vi.spyOn(anchor, "getBoundingClientRect").mockReturnValue(
      mockRect({ top: 700, left: 100, bottom: 740, right: 200, width: 100, height: 40 })
    );
    vi.spyOn(floating, "getBoundingClientRect").mockReturnValue(
      mockRect({ width: 80, height: 50 })
    );

    const { result } = renderHook(() =>
      useAnchorPosition({
        anchorRef: { current: anchor },
        floatingRef: { current: floating },
        placement: "bottom",
        isOpen: true,
        offset: 8,
      })
    );

    expect(result.current.actualPlacement).toBe("top");
    expect(result.current.styles.top).toBe(642);
  });

  it("accepts DOMRect as anchor (for selection ranges)", () => {
    const floating = document.createElement("div");
    vi.spyOn(floating, "getBoundingClientRect").mockReturnValue(
      mockRect({ width: 80, height: 30 })
    );

    const anchorRect = mockRect({
      top: 200, left: 100, bottom: 220, right: 300, width: 200, height: 20,
    });

    const { result } = renderHook(() =>
      useAnchorPosition({
        anchorRect,
        floatingRef: { current: floating },
        placement: "top",
        isOpen: true,
        offset: 8,
      })
    );

    expect(result.current.styles.top).toBe(162);
    expect(result.current.styles.left).toBe(160);
  });
});
