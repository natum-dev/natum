import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Sidebar } from "./Sidebar";
import { SidebarBody } from "./SidebarBody";
import { SidebarSection } from "./SidebarSection";

describe("SidebarSection", () => {
  it("renders label (aria-hidden) when expanded", () => {
    render(
      <Sidebar>
        <SidebarBody>
          <SidebarSection label="Main">
            <li>item</li>
          </SidebarSection>
        </SidebarBody>
      </Sidebar>
    );
    const label = screen.getByText("Main");
    expect(label).toBeInTheDocument();
    expect(label).toHaveAttribute("aria-hidden", "true");
  });

  it("omits label element when label prop missing", () => {
    render(
      <Sidebar>
        <SidebarBody>
          <SidebarSection data-testid="sec">
            <li>a</li>
          </SidebarSection>
        </SidebarBody>
      </Sidebar>
    );
    const section = screen.getByTestId("sec");
    expect(section.querySelector('[aria-hidden="true"]')).toBeNull();
  });

  it("wraps children in <ul role=list>", () => {
    render(
      <Sidebar>
        <SidebarBody>
          <SidebarSection label="Main">
            <li>a</li>
          </SidebarSection>
        </SidebarBody>
      </Sidebar>
    );
    const list = screen.getByRole("list");
    expect(list.tagName).toBe("UL");
  });

  it("passes className through", () => {
    render(
      <Sidebar>
        <SidebarBody>
          <SidebarSection label="Main" className="custom" data-testid="sec">
            <li>a</li>
          </SidebarSection>
        </SidebarBody>
      </Sidebar>
    );
    expect(screen.getByTestId("sec")).toHaveClass("custom");
  });

  it("throws when used outside Sidebar", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<SidebarSection label="x" />)).toThrow(
      "useSidebarCollapsed must be used within <Sidebar>."
    );
    spy.mockRestore();
  });
});
