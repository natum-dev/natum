import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useSidebarCollapsed } from "./context";

describe("useSidebarCollapsed", () => {
  it("throws when used outside <Sidebar>", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => renderHook(() => useSidebarCollapsed())).toThrow(
      "useSidebarCollapsed must be used within <Sidebar>."
    );
    spy.mockRestore();
  });
});
