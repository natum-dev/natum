import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { describe, it, expect, vi } from "vitest";
import { Tabs } from "./Tabs";

describe("Tabs root — scaffold", () => {
  it("renders a div with data-variant and data-size defaults", () => {
    const { container } = render(<Tabs defaultValue="a">child</Tabs>);
    const root = container.firstChild as HTMLElement;
    expect(root.tagName).toBe("DIV");
    expect(root).toHaveAttribute("data-variant", "underline");
    expect(root).toHaveAttribute("data-size", "md");
  });

  it("honors explicit variant + size props", () => {
    const { container } = render(
      <Tabs defaultValue="a" variant="pill" size="sm">
        x
      </Tabs>
    );
    const root = container.firstChild as HTMLElement;
    expect(root).toHaveAttribute("data-variant", "pill");
    expect(root).toHaveAttribute("data-size", "sm");
  });

  it("merges className onto root", () => {
    const { container } = render(
      <Tabs defaultValue="a" className="mine">
        x
      </Tabs>
    );
    expect(container.firstChild).toHaveClass("mine");
  });

  it("forwards ref to the root div", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Tabs ref={ref} defaultValue="a">
        x
      </Tabs>
    );
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("spreads rest props to root", () => {
    const { container } = render(
      <Tabs defaultValue="a" data-testid="root">
        x
      </Tabs>
    );
    expect(container.firstChild).toHaveAttribute("data-testid", "root");
  });

  it("library-managed data-variant wins over a consumer-supplied one via rest", () => {
    const consumerProps = { "data-variant": "pill" } as Record<string, string>;
    const { container } = render(
      <Tabs defaultValue="a" variant="underline" {...consumerProps}>
        x
      </Tabs>
    );
    expect(container.firstChild).toHaveAttribute("data-variant", "underline");
  });
});

import { TabsList } from "./TabsList";

describe("TabsList — scaffold", () => {
  it("throws orphan error outside <Tabs>", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<TabsList aria-label="x" />)).toThrow(
      /must be rendered inside <Tabs>/
    );
    spy.mockRestore();
  });

  it("renders div with role=tablist and aria-orientation=horizontal", () => {
    render(
      <Tabs defaultValue="a">
        <TabsList aria-label="Main">list</TabsList>
      </Tabs>
    );
    const list = screen.getByRole("tablist");
    expect(list).toHaveAttribute("aria-orientation", "horizontal");
    expect(list).toHaveAccessibleName("Main");
  });

  it("warns in dev when neither aria-label nor aria-labelledby is supplied", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(
      <Tabs defaultValue="a">
        <TabsList>list</TabsList>
      </Tabs>
    );
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining("TabsList")
    );
    warn.mockRestore();
  });

  it("forwards ref to the list div", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Tabs defaultValue="a">
        <TabsList ref={ref} aria-label="m">x</TabsList>
      </Tabs>
    );
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("merges className", () => {
    render(
      <Tabs defaultValue="a">
        <TabsList aria-label="m" className="mine">x</TabsList>
      </Tabs>
    );
    expect(screen.getByRole("tablist")).toHaveClass("mine");
  });
});

import { TabsTrigger } from "./TabsTrigger";

describe("TabsTrigger — scaffold", () => {
  it("throws orphan error outside <Tabs>", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<TabsTrigger value="a">x</TabsTrigger>)).toThrow(
      /must be rendered inside <Tabs>/
    );
    spy.mockRestore();
  });

  it("renders button with role=tab and aria attributes", () => {
    render(
      <Tabs defaultValue="files">
        <TabsList aria-label="m">
          <TabsTrigger value="files">Files</TabsTrigger>
          <TabsTrigger value="shared">Shared</TabsTrigger>
        </TabsList>
      </Tabs>
    );
    const files = screen.getByRole("tab", { name: "Files" });
    const shared = screen.getByRole("tab", { name: "Shared" });
    expect(files.tagName).toBe("BUTTON");
    expect(files).toHaveAttribute("type", "button");
    expect(files).toHaveAttribute("aria-selected", "true");
    expect(shared).toHaveAttribute("aria-selected", "false");
    expect(files).toHaveAttribute("tabIndex", "0");
    expect(shared).toHaveAttribute("tabIndex", "-1");
    expect(files.getAttribute("aria-controls")).toMatch(/panel-files$/);
  });

  it("click activates a tab (uncontrolled)", async () => {
    const user = userEvent.setup();
    render(
      <Tabs defaultValue="a">
        <TabsList aria-label="m">
          <TabsTrigger value="a">A</TabsTrigger>
          <TabsTrigger value="b">B</TabsTrigger>
        </TabsList>
      </Tabs>
    );
    await user.click(screen.getByRole("tab", { name: "B" }));
    expect(screen.getByRole("tab", { name: "B" })).toHaveAttribute(
      "aria-selected",
      "true"
    );
  });

  it("click calls onValueChange (controlled)", async () => {
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
    await user.click(screen.getByRole("tab", { name: "B" }));
    expect(onChange).toHaveBeenCalledWith("b");
  });
});

describe("TabsTrigger — disabled", () => {
  it("click on disabled trigger does not activate", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Tabs value="a" onValueChange={onChange}>
        <TabsList aria-label="m">
          <TabsTrigger value="a">A</TabsTrigger>
          <TabsTrigger value="b" disabled>B</TabsTrigger>
        </TabsList>
      </Tabs>
    );
    await user.click(screen.getByRole("tab", { name: "B" }));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("disabled trigger has aria-disabled='true' and NOT aria-disabled attr when enabled", () => {
    render(
      <Tabs defaultValue="a">
        <TabsList aria-label="m">
          <TabsTrigger value="a">A</TabsTrigger>
          <TabsTrigger value="b" disabled>B</TabsTrigger>
        </TabsList>
      </Tabs>
    );
    expect(screen.getByRole("tab", { name: "A" })).not.toHaveAttribute("aria-disabled");
    expect(screen.getByRole("tab", { name: "B" })).toHaveAttribute("aria-disabled", "true");
  });
});
