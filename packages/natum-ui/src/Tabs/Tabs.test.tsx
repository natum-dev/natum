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
