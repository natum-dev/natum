import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import { Tabs } from "./Tabs";
import { TabsList } from "./TabsList";
import { TabsTrigger } from "./TabsTrigger";
import { TabsPanel } from "./TabsPanel";

function Fixture(props: {
  initial?: string;
  activationMode?: "automatic" | "manual";
  disabled?: Set<string>;
}) {
  const { initial = "a", activationMode, disabled = new Set<string>() } = props;
  return (
    <Tabs defaultValue={initial} activationMode={activationMode}>
      <TabsList aria-label="m">
        {["a", "b", "c"].map((v) => (
          <TabsTrigger key={v} value={v} disabled={disabled.has(v)}>
            {v.toUpperCase()}
          </TabsTrigger>
        ))}
      </TabsList>
      <TabsPanel value="a">p a</TabsPanel>
      <TabsPanel value="b">p b</TabsPanel>
      <TabsPanel value="c">p c</TabsPanel>
    </Tabs>
  );
}

describe("Tabs keyboard — automatic mode", () => {
  it("ArrowRight focuses and activates next tab", async () => {
    const user = userEvent.setup();
    render(<Fixture />);
    screen.getByRole("tab", { name: "A" }).focus();
    await user.keyboard("{ArrowRight}");
    const b = screen.getByRole("tab", { name: "B" });
    expect(b).toHaveFocus();
    expect(b).toHaveAttribute("aria-selected", "true");
  });

  it("ArrowLeft focuses and activates previous tab", async () => {
    const user = userEvent.setup();
    render(<Fixture initial="c" />);
    screen.getByRole("tab", { name: "C" }).focus();
    await user.keyboard("{ArrowLeft}");
    expect(screen.getByRole("tab", { name: "B" })).toHaveFocus();
    expect(screen.getByRole("tab", { name: "B" })).toHaveAttribute(
      "aria-selected",
      "true"
    );
  });

  it("ArrowRight wraps from last to first", async () => {
    const user = userEvent.setup();
    render(<Fixture initial="c" />);
    screen.getByRole("tab", { name: "C" }).focus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "A" })).toHaveFocus();
  });

  it("ArrowLeft wraps from first to last", async () => {
    const user = userEvent.setup();
    render(<Fixture />);
    screen.getByRole("tab", { name: "A" }).focus();
    await user.keyboard("{ArrowLeft}");
    expect(screen.getByRole("tab", { name: "C" })).toHaveFocus();
  });

  it("Home focuses + activates first enabled tab", async () => {
    const user = userEvent.setup();
    render(<Fixture initial="c" />);
    screen.getByRole("tab", { name: "C" }).focus();
    await user.keyboard("{Home}");
    expect(screen.getByRole("tab", { name: "A" })).toHaveFocus();
    expect(screen.getByRole("tab", { name: "A" })).toHaveAttribute(
      "aria-selected",
      "true"
    );
  });

  it("End focuses + activates last enabled tab", async () => {
    const user = userEvent.setup();
    render(<Fixture />);
    screen.getByRole("tab", { name: "A" }).focus();
    await user.keyboard("{End}");
    expect(screen.getByRole("tab", { name: "C" })).toHaveFocus();
    expect(screen.getByRole("tab", { name: "C" })).toHaveAttribute(
      "aria-selected",
      "true"
    );
  });

  it("arrow keys skip disabled tabs", async () => {
    const user = userEvent.setup();
    render(<Fixture disabled={new Set(["b"])} />);
    screen.getByRole("tab", { name: "A" }).focus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "C" })).toHaveFocus();
  });

  it("Home/End skip disabled tabs", async () => {
    const user = userEvent.setup();
    render(<Fixture initial="b" disabled={new Set(["a"])} />);
    screen.getByRole("tab", { name: "B" }).focus();
    await user.keyboard("{Home}");
    expect(screen.getByRole("tab", { name: "B" })).toHaveFocus();
  });
});
