import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { createRef } from "react";
import { Container } from "./Container";

describe("Container", () => {
  // --- Renders ---
  it("renders children", () => {
    render(<Container>Content</Container>);
    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  it("renders as a div by default", () => {
    render(<Container data-testid="c">x</Container>);
    expect(screen.getByTestId("c").tagName).toBe("DIV");
  });

  it("applies base container class and default size lg", () => {
    render(<Container data-testid="c">x</Container>);
    expect(screen.getByTestId("c")).toHaveClass("container", "size_lg");
  });

  // --- Sizes ---
  it.each(["sm", "md", "lg", "xl", "fluid"] as const)(
    "applies size_%s class",
    (size) => {
      render(<Container data-testid="c" size={size}>x</Container>);
      expect(screen.getByTestId("c")).toHaveClass(`size_${size}`);
    }
  );

  // --- Polymorphic ---
  it.each(["section", "article", "main", "aside"] as const)(
    "renders as a %s element",
    (tag) => {
      render(<Container data-testid="c" as={tag}>x</Container>);
      expect(screen.getByTestId("c").tagName).toBe(tag.toUpperCase());
    }
  );

  // --- forwardRef ---
  it("forwards ref to the root element", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Container ref={ref}>x</Container>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("forwards ref when as='main'", () => {
    const ref = createRef<HTMLElement>();
    render(<Container ref={ref} as="main">x</Container>);
    expect(ref.current?.tagName).toBe("MAIN");
  });

  // --- className + rest ---
  it("merges custom className", () => {
    render(<Container data-testid="c" className="custom">x</Container>);
    expect(screen.getByTestId("c")).toHaveClass("container", "size_lg", "custom");
  });

  it("spreads HTML attributes", () => {
    render(<Container data-testid="c" id="page" aria-label="page">x</Container>);
    const el = screen.getByTestId("c");
    expect(el).toHaveAttribute("id", "page");
    expect(el).toHaveAttribute("aria-label", "page");
  });
});
