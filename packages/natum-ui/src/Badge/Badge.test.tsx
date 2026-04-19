import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Badge } from "./Badge";

describe("Badge", () => {
  // --- Rendering ---
  it("renders as a span by default", () => {
    render(<Badge data-testid="badge">Hello</Badge>);
    expect(screen.getByTestId("badge").tagName).toBe("SPAN");
  });

  it("renders children text", () => {
    render(<Badge>Shared</Badge>);
    expect(screen.getByText("Shared")).toBeInTheDocument();
  });

  it("applies default classes: badge, soft, neutral, md", () => {
    render(<Badge data-testid="badge">x</Badge>);
    expect(screen.getByTestId("badge")).toHaveClass("badge", "soft", "neutral", "md");
  });

  it("forwards className alongside component classes", () => {
    render(<Badge data-testid="badge" className="extra">x</Badge>);
    expect(screen.getByTestId("badge")).toHaveClass("badge", "extra");
  });

  // --- Variant ---
  it.each(["filled", "outlined", "soft"] as const)(
    "applies %s variant class",
    (variant) => {
      render(<Badge data-testid="badge" variant={variant}>x</Badge>);
      expect(screen.getByTestId("badge")).toHaveClass(variant);
    }
  );

  // --- Color ---
  it.each([
    "neutral",
    "primary",
    "secondary",
    "success",
    "warning",
    "error",
    "info",
  ] as const)("applies %s color class", (color) => {
    render(<Badge data-testid="badge" color={color}>x</Badge>);
    expect(screen.getByTestId("badge")).toHaveClass(color);
  });

  // --- Size ---
  it.each(["sm", "md"] as const)("applies %s size class", (size) => {
    render(<Badge data-testid="badge" size={size}>x</Badge>);
    expect(screen.getByTestId("badge")).toHaveClass(size);
  });

  // --- Dot mode ---
  it("applies dot class when dot={true}", () => {
    render(<Badge data-testid="badge" dot aria-label="Unread" />);
    expect(screen.getByTestId("badge")).toHaveClass("dot");
  });

  it("does not render children when dot={true}", () => {
    render(<Badge dot aria-label="Unread">HIDDEN</Badge>);
    expect(screen.queryByText("HIDDEN")).not.toBeInTheDocument();
  });

  it("passes aria-label through on dot mode", () => {
    render(<Badge data-testid="badge" dot aria-label="Unread" />);
    expect(screen.getByTestId("badge")).toHaveAttribute("aria-label", "Unread");
  });
});
