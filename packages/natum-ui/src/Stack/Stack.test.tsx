import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { createRef } from "react";
import { Stack } from "./Stack";

describe("Stack", () => {
  // --- Renders ---
  it("renders children", () => {
    render(<Stack>Content</Stack>);
    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  it("renders as a div by default", () => {
    render(<Stack data-testid="stack">x</Stack>);
    expect(screen.getByTestId("stack").tagName).toBe("DIV");
  });

  it("applies default classes (stack + column direction + gap_0)", () => {
    render(<Stack data-testid="stack">x</Stack>);
    const el = screen.getByTestId("stack");
    expect(el).toHaveClass("stack", "column", "gap_0");
  });

  // --- Direction ---
  it("applies row direction class", () => {
    render(<Stack data-testid="stack" direction="row">x</Stack>);
    expect(screen.getByTestId("stack")).toHaveClass("row");
  });

  it("applies column direction class", () => {
    render(<Stack data-testid="stack" direction="column">x</Stack>);
    expect(screen.getByTestId("stack")).toHaveClass("column");
  });

  // --- Gap ---
  it.each([0, 1, 2, 3, 4, 6, 8, 12, 16] as const)(
    "applies gap_%i class when gap=%i",
    (gap) => {
      render(<Stack data-testid="stack" gap={gap}>x</Stack>);
      expect(screen.getByTestId("stack")).toHaveClass(`gap_${gap}`);
    }
  );

  // --- Align ---
  it.each(["start", "center", "end", "stretch", "baseline"] as const)(
    "applies align_%s class",
    (align) => {
      render(<Stack data-testid="stack" align={align}>x</Stack>);
      expect(screen.getByTestId("stack")).toHaveClass(`align_${align}`);
    }
  );

  // --- Justify ---
  it.each(["start", "center", "end", "between", "around", "evenly"] as const)(
    "applies justify_%s class",
    (justify) => {
      render(<Stack data-testid="stack" justify={justify}>x</Stack>);
      expect(screen.getByTestId("stack")).toHaveClass(`justify_${justify}`);
    }
  );

  // --- Wrap ---
  it("applies wrap class when wrap=true", () => {
    render(<Stack data-testid="stack" wrap>x</Stack>);
    expect(screen.getByTestId("stack")).toHaveClass("wrap");
  });

  it("does not apply wrap class by default", () => {
    render(<Stack data-testid="stack">x</Stack>);
    expect(screen.getByTestId("stack")).not.toHaveClass("wrap");
  });

  // --- Polymorphic as ---
  it.each(["section", "article", "nav", "ul", "ol", "main", "aside"] as const)(
    "renders as a %s element",
    (tag) => {
      render(<Stack data-testid="stack" as={tag}>x</Stack>);
      expect(screen.getByTestId("stack").tagName).toBe(tag.toUpperCase());
    }
  );

  // --- forwardRef ---
  it("forwards ref to the root element", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Stack ref={ref}>x</Stack>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("forwards ref when using as='ul'", () => {
    const ref = createRef<HTMLUListElement>();
    render(<Stack ref={ref} as="ul">x</Stack>);
    expect(ref.current).toBeInstanceOf(HTMLUListElement);
  });

  // --- className + rest ---
  it("merges custom className with internal classes", () => {
    render(<Stack data-testid="stack" className="custom">x</Stack>);
    expect(screen.getByTestId("stack")).toHaveClass("stack", "column", "custom");
  });

  it("spreads HTML attributes", () => {
    render(<Stack data-testid="stack" id="my-stack" aria-label="group">x</Stack>);
    const el = screen.getByTestId("stack");
    expect(el).toHaveAttribute("id", "my-stack");
    expect(el).toHaveAttribute("aria-label", "group");
  });

  // --- RTL ---
  it("does not leak physical directional inline styles", () => {
    render(<Stack data-testid="stack" direction="row" gap={4}>x</Stack>);
    const style = screen.getByTestId("stack").getAttribute("style") ?? "";
    expect(style).not.toMatch(/(left|right):/);
  });
});
