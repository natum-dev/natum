import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Sidebar } from "./Sidebar";
import { useSidebarCollapsed } from "./context";

const CollapseProbe = () => {
  const { collapsed, setCollapsed } = useSidebarCollapsed();
  return (
    <button type="button" data-testid="probe" onClick={() => setCollapsed(!collapsed)}>
      {collapsed ? "collapsed" : "expanded"}
    </button>
  );
};

describe("Sidebar root", () => {
  it("renders as <aside> with role=navigation and default aria-label", () => {
    render(<Sidebar>content</Sidebar>);
    const nav = screen.getByRole("navigation");
    expect(nav.tagName).toBe("ASIDE");
    expect(nav).toHaveAttribute("aria-label", "Sidebar navigation");
  });

  it("accepts a custom aria-label", () => {
    render(<Sidebar aria-label="Main menu">x</Sidebar>);
    expect(screen.getByRole("navigation")).toHaveAttribute("aria-label", "Main menu");
  });

  it("is uncontrolled: defaultCollapsed sets initial state", () => {
    render(
      <Sidebar defaultCollapsed>
        <CollapseProbe />
      </Sidebar>
    );
    expect(screen.getByTestId("probe")).toHaveTextContent("collapsed");
    expect(screen.getByRole("navigation")).toHaveAttribute("data-collapsed", "true");
  });

  it("uncontrolled: toggle via context flips data-collapsed", async () => {
    const user = userEvent.setup();
    render(
      <Sidebar>
        <CollapseProbe />
      </Sidebar>
    );
    const nav = screen.getByRole("navigation");
    expect(nav).toHaveAttribute("data-collapsed", "false");
    await user.click(screen.getByTestId("probe"));
    expect(nav).toHaveAttribute("data-collapsed", "true");
  });

  it("controlled: external collapsed prop drives UI; setCollapsed fires onCollapseChange only", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { rerender } = render(
      <Sidebar collapsed={false} onCollapseChange={onChange}>
        <CollapseProbe />
      </Sidebar>
    );
    const nav = screen.getByRole("navigation");
    expect(nav).toHaveAttribute("data-collapsed", "false");

    await user.click(screen.getByTestId("probe"));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(true);
    // Parent hasn't re-rendered with new collapsed yet; UI stays
    expect(nav).toHaveAttribute("data-collapsed", "false");

    rerender(
      <Sidebar collapsed={true} onCollapseChange={onChange}>
        <CollapseProbe />
      </Sidebar>
    );
    expect(nav).toHaveAttribute("data-collapsed", "true");
  });

  it("passes through className", () => {
    render(<Sidebar className="app-sidebar">x</Sidebar>);
    expect(screen.getByRole("navigation")).toHaveClass("app-sidebar");
  });
});
