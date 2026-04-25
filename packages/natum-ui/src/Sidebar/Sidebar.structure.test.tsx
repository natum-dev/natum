import { describe, it, expect, vi } from "vitest";
import { renderHook, render, screen } from "@testing-library/react";
import { useSidebarCollapsed } from "./context";
import { Sidebar } from "./Sidebar";
import { SidebarHeader } from "./SidebarHeader";
import { SidebarBody } from "./SidebarBody";
import { SidebarFooter } from "./SidebarFooter";

describe("useSidebarCollapsed", () => {
  it("throws when used outside <Sidebar>", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => renderHook(() => useSidebarCollapsed())).toThrow(
      "useSidebarCollapsed must be used within <Sidebar>."
    );
    spy.mockRestore();
  });
});

describe("Sidebar slot wrappers", () => {
  it("renders Header, Body, Footer in DOM order given", () => {
    render(
      <Sidebar>
        <SidebarHeader data-testid="h">Brand</SidebarHeader>
        <SidebarBody data-testid="b">Nav</SidebarBody>
        <SidebarFooter data-testid="f">User</SidebarFooter>
      </Sidebar>
    );
    const nav = screen.getByRole("navigation");
    const kids = Array.from(nav.children);
    expect(kids[0]).toHaveAttribute("data-testid", "h");
    expect(kids[1]).toHaveAttribute("data-testid", "b");
    expect(kids[2]).toHaveAttribute("data-testid", "f");
  });

  it("renders without Header or Footer", () => {
    render(
      <Sidebar>
        <SidebarBody data-testid="b">Nav</SidebarBody>
      </Sidebar>
    );
    expect(screen.getByTestId("b")).toHaveTextContent("Nav");
  });

  it("passes className through on each slot", () => {
    render(
      <Sidebar>
        <SidebarHeader className="h-c" data-testid="h">H</SidebarHeader>
        <SidebarBody className="b-c" data-testid="b">B</SidebarBody>
        <SidebarFooter className="f-c" data-testid="f">F</SidebarFooter>
      </Sidebar>
    );
    expect(screen.getByTestId("h")).toHaveClass("h-c");
    expect(screen.getByTestId("b")).toHaveClass("b-c");
    expect(screen.getByTestId("f")).toHaveClass("f-c");
  });

  it("SidebarHeader throws when rendered outside Sidebar", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<SidebarHeader>h</SidebarHeader>)).toThrow(
      "useSidebarCollapsed must be used within <Sidebar>."
    );
    spy.mockRestore();
  });
});
