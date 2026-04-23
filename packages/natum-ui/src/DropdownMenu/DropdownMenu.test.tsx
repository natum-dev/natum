import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useDropdownMenuContext } from "./context";

describe("DropdownMenu context", () => {
  it("useDropdownMenuContext throws when used outside <DropdownMenu>", () => {
    const Child = () => {
      useDropdownMenuContext();
      return null;
    };

    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Child />)).toThrow(
      "useDropdownMenuContext must be used within <DropdownMenu>."
    );
    spy.mockRestore();
  });
});
