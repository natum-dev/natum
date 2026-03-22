import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { createRef } from "react";
import { Divider } from "./Divider";

describe("Divider", () => {
  // --- Renders without crashing ---
  it("renders without crashing with default props", () => {
    render(<Divider data-testid="divider" />);
    expect(screen.getByTestId("divider")).toBeInTheDocument();
  });

  // --- Orientation / element type ---
  it("renders as <hr> for horizontal orientation (default)", () => {
    render(<Divider data-testid="divider" />);
    expect(screen.getByTestId("divider").tagName).toBe("HR");
  });

  it("renders as <div> for vertical orientation", () => {
    render(<Divider data-testid="divider" orientation="vertical" />);
    expect(screen.getByTestId("divider").tagName).toBe("DIV");
  });

  it("vertical has role='separator' and aria-orientation='vertical'", () => {
    render(<Divider data-testid="divider" orientation="vertical" />);
    const el = screen.getByTestId("divider");
    expect(el).toHaveAttribute("role", "separator");
    expect(el).toHaveAttribute("aria-orientation", "vertical");
  });

  it("horizontal <hr> does not have explicit role or aria-orientation", () => {
    render(<Divider data-testid="divider" />);
    const el = screen.getByTestId("divider");
    expect(el).not.toHaveAttribute("role");
    expect(el).not.toHaveAttribute("aria-orientation");
  });

  // --- Default classes ---
  it("applies default classes: divider, solid, sm, horizontal", () => {
    render(<Divider data-testid="divider" />);
    const el = screen.getByTestId("divider");
    expect(el).toHaveClass("divider", "solid", "sm", "horizontal");
  });

  // --- Variants ---
  it("applies solid variant class", () => {
    render(<Divider data-testid="divider" variant="solid" />);
    expect(screen.getByTestId("divider")).toHaveClass("solid");
  });

  it("applies dashed variant class", () => {
    render(<Divider data-testid="divider" variant="dashed" />);
    expect(screen.getByTestId("divider")).toHaveClass("dashed");
  });

  it("applies dotted variant class", () => {
    render(<Divider data-testid="divider" variant="dotted" />);
    expect(screen.getByTestId("divider")).toHaveClass("dotted");
  });

  // --- Spacing ---
  it("applies none spacing class", () => {
    render(<Divider data-testid="divider" spacing="none" />);
    expect(screen.getByTestId("divider")).toHaveClass("none");
  });

  it("applies sm spacing class (default)", () => {
    render(<Divider data-testid="divider" spacing="sm" />);
    expect(screen.getByTestId("divider")).toHaveClass("sm");
  });

  it("applies md spacing class", () => {
    render(<Divider data-testid="divider" spacing="md" />);
    expect(screen.getByTestId("divider")).toHaveClass("md");
  });

  it("applies lg spacing class", () => {
    render(<Divider data-testid="divider" spacing="lg" />);
    expect(screen.getByTestId("divider")).toHaveClass("lg");
  });

  // --- Orientation classes ---
  it("applies horizontal class for horizontal orientation", () => {
    render(<Divider data-testid="divider" orientation="horizontal" />);
    expect(screen.getByTestId("divider")).toHaveClass("horizontal");
  });

  it("applies vertical class for vertical orientation", () => {
    render(<Divider data-testid="divider" orientation="vertical" />);
    expect(screen.getByTestId("divider")).toHaveClass("vertical");
  });

  // --- className merging ---
  it("merges custom className with internal classes", () => {
    render(<Divider data-testid="divider" className="custom-class" />);
    const el = screen.getByTestId("divider");
    expect(el).toHaveClass("divider", "solid", "sm", "horizontal", "custom-class");
  });

  // --- forwardRef ---
  it("forwards ref for horizontal divider", () => {
    const ref = createRef<HTMLElement>();
    render(<Divider ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLHRElement);
  });

  it("forwards ref for vertical divider", () => {
    const ref = createRef<HTMLElement>();
    render(<Divider ref={ref} orientation="vertical" />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  // --- Spreads HTML attributes ---
  it("spreads HTML attributes to root element", () => {
    render(<Divider data-testid="divider" id="my-divider" aria-label="Section divider" />);
    const el = screen.getByTestId("divider");
    expect(el).toHaveAttribute("id", "my-divider");
    expect(el).toHaveAttribute("aria-label", "Section divider");
  });

  // --- No children ---
  it("renders no child nodes", () => {
    render(<Divider data-testid="divider" />);
    expect(screen.getByTestId("divider").childNodes).toHaveLength(0);
  });
});
