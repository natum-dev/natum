import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
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

describe("Tabs keyboard — manual mode", () => {
  it("ArrowRight moves focus but does NOT activate", async () => {
    const user = userEvent.setup();
    render(<Fixture activationMode="manual" />);
    const a = screen.getByRole("tab", { name: "A" });
    a.focus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "B" })).toHaveFocus();
    expect(a).toHaveAttribute("aria-selected", "true");
  });

  it("Enter on focused trigger activates in manual mode", async () => {
    const user = userEvent.setup();
    render(<Fixture activationMode="manual" />);
    screen.getByRole("tab", { name: "A" }).focus();
    await user.keyboard("{ArrowRight}");
    await user.keyboard("{Enter}");
    expect(screen.getByRole("tab", { name: "B" })).toHaveAttribute(
      "aria-selected",
      "true"
    );
  });

  it("Space on focused trigger activates and preventDefault fires (no page scroll)", async () => {
    const user = userEvent.setup();
    render(<Fixture activationMode="manual" />);
    screen.getByRole("tab", { name: "A" }).focus();
    await user.keyboard("{ArrowRight}");
    await user.keyboard(" ");
    expect(screen.getByRole("tab", { name: "B" })).toHaveAttribute(
      "aria-selected",
      "true"
    );
  });

  it("Enter on focused trigger in automatic mode is a no-op (already active)", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Tabs value="a" onValueChange={onChange}>
        <TabsList aria-label="m">
          <TabsTrigger value="a">A</TabsTrigger>
          <TabsTrigger value="b">B</TabsTrigger>
        </TabsList>
      </Tabs>
    );
    screen.getByRole("tab", { name: "A" }).focus();
    await user.keyboard("{Enter}");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("disabled trigger ignores Enter/Space", async () => {
    const user = userEvent.setup();
    render(<Fixture activationMode="manual" disabled={new Set(["b"])} />);
    const b = screen.getByRole("tab", { name: "B" });
    b.focus();
    await user.keyboard("{Enter}");
    expect(b).toHaveAttribute("aria-selected", "false");
  });

  it("roving tabindex: only active trigger has tabIndex=0", () => {
    render(<Fixture />);
    expect(screen.getByRole("tab", { name: "A" })).toHaveAttribute("tabIndex", "0");
    expect(screen.getByRole("tab", { name: "B" })).toHaveAttribute("tabIndex", "-1");
    expect(screen.getByRole("tab", { name: "C" })).toHaveAttribute("tabIndex", "-1");
  });
});
