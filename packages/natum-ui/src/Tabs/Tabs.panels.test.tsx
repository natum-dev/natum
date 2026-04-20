import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { describe, it, expect, vi } from "vitest";
import { Tabs } from "./Tabs";
import { TabsList } from "./TabsList";
import { TabsTrigger } from "./TabsTrigger";
import { TabsPanel } from "./TabsPanel";

function Fixture({ initial = "a" }: { initial?: string }) {
  return (
    <Tabs defaultValue={initial}>
      <TabsList aria-label="m">
        <TabsTrigger value="a">A</TabsTrigger>
        <TabsTrigger value="b">B</TabsTrigger>
        <TabsTrigger value="c">C</TabsTrigger>
      </TabsList>
      <TabsPanel value="a">panel a</TabsPanel>
      <TabsPanel value="b">panel b</TabsPanel>
      <TabsPanel value="c">panel c</TabsPanel>
    </Tabs>
  );
}

describe("TabsPanel — lazy mount + aria wiring", () => {
  it("renders only the initially active panel", () => {
    render(<Fixture />);
    expect(screen.getByText("panel a")).toBeInTheDocument();
    expect(screen.queryByText("panel b")).not.toBeInTheDocument();
    expect(screen.queryByText("panel c")).not.toBeInTheDocument();
  });

  it("mounts a panel on first activation and keeps it in the DOM", async () => {
    const user = userEvent.setup();
    render(<Fixture />);
    await user.click(screen.getByRole("tab", { name: "B" }));
    expect(screen.getByText("panel b")).toBeInTheDocument();
    await user.click(screen.getByRole("tab", { name: "A" }));
    const b = screen.getByText("panel b");
    expect(b).toBeInTheDocument();
    expect(b.closest("[role='tabpanel']")).toHaveAttribute("hidden");
  });

  it("inactive mounted panel has hidden attribute; active one does not", async () => {
    const user = userEvent.setup();
    render(<Fixture />);
    const panelA = screen.getByText("panel a").closest("[role='tabpanel']")!;
    expect(panelA).not.toHaveAttribute("hidden");
    await user.click(screen.getByRole("tab", { name: "B" }));
    expect(panelA).toHaveAttribute("hidden");
  });

  it("panels have role=tabpanel + aria-labelledby + tabIndex 0", () => {
    render(<Fixture />);
    const panel = screen.getByRole("tabpanel", { hidden: false });
    expect(panel).toHaveAttribute("tabIndex", "0");
    const labelledBy = panel.getAttribute("aria-labelledby");
    expect(labelledBy).toBeTruthy();
    const trigger = document.getElementById(labelledBy!);
    expect(trigger).toHaveAttribute("role", "tab");
  });

  it("panel id and trigger aria-controls match", () => {
    render(<Fixture />);
    const trigger = screen.getByRole("tab", { name: "A" });
    const panel = screen.getByText("panel a").closest("[role='tabpanel']")!;
    expect(trigger.getAttribute("aria-controls")).toBe(panel.id);
  });

  it("panels have unique ids across multiple Tabs instances", () => {
    render(
      <>
        <Fixture initial="a" />
        <Fixture initial="a" />
      </>
    );
    const panels = screen.getAllByRole("tabpanel");
    const ids = panels.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("orphan TabsPanel outside Tabs throws", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<TabsPanel value="x">x</TabsPanel>)).toThrow(
      /must be rendered inside <Tabs>/
    );
    spy.mockRestore();
  });

  it("forwards ref + merges className", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Tabs defaultValue="a">
        <TabsList aria-label="m">
          <TabsTrigger value="a">A</TabsTrigger>
        </TabsList>
        <TabsPanel ref={ref} value="a" className="mine">
          p
        </TabsPanel>
      </Tabs>
    );
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toHaveClass("mine");
  });

  it("panel does not render its children until activated (lazy)", () => {
    const marker = vi.fn(() => "lazy content" as string);
    const Lazy = () => <>{marker()}</>;
    render(
      <Tabs defaultValue="a">
        <TabsList aria-label="m">
          <TabsTrigger value="a">A</TabsTrigger>
          <TabsTrigger value="b">B</TabsTrigger>
        </TabsList>
        <TabsPanel value="a">panel a</TabsPanel>
        <TabsPanel value="b">
          <Lazy />
        </TabsPanel>
      </Tabs>
    );
    expect(marker).not.toHaveBeenCalled();
  });
});
