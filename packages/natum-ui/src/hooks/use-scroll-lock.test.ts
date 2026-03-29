import { renderHook } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import { useScrollLock } from "./use-scroll-lock";

describe("useScrollLock", () => {
  beforeEach(() => {
    document.body.style.overflow = "";
    document.body.style.paddingRight = "";
  });

  it("sets overflow hidden when enabled", () => {
    renderHook(() => useScrollLock({ enabled: true }));
    expect(document.body.style.overflow).toBe("hidden");
  });

  it("does not set overflow hidden when enabled is false", () => {
    renderHook(() => useScrollLock({ enabled: false }));
    expect(document.body.style.overflow).toBe("");
  });

  it("restores original overflow on unmount", () => {
    document.body.style.overflow = "auto";
    const { unmount } = renderHook(() => useScrollLock({ enabled: true }));

    expect(document.body.style.overflow).toBe("hidden");
    unmount();
    expect(document.body.style.overflow).toBe("auto");
  });

  it("restores original overflow when enabled changes to false", () => {
    document.body.style.overflow = "scroll";
    const { rerender } = renderHook(
      ({ enabled }) => useScrollLock({ enabled }),
      { initialProps: { enabled: true } }
    );

    expect(document.body.style.overflow).toBe("hidden");
    rerender({ enabled: false });
    expect(document.body.style.overflow).toBe("scroll");
  });

  it("defaults enabled to true", () => {
    renderHook(() => useScrollLock({}));
    expect(document.body.style.overflow).toBe("hidden");
  });
});
