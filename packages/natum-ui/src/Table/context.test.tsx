import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useTableContext, useTableRowContext } from "./context";

describe("useTableContext", () => {
  it("throws when used outside <Table>", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => renderHook(() => useTableContext())).toThrow(
      /useTableContext must be used within <Table>/
    );
    spy.mockRestore();
  });
});

describe("useTableRowContext", () => {
  it("throws when used outside <TableRow>", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => renderHook(() => useTableRowContext())).toThrow(
      /useTableRowContext must be used within <TableRow>/
    );
    spy.mockRestore();
  });
});
