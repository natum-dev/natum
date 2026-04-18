import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { createRef } from "react";
import { Spinner } from "./Spinner";

describe("Spinner", () => {
  // --- Renders ---
  it("renders a span with base + default size + default color classes", () => {
    render(<Spinner data-testid="sp" />);
    const el = screen.getByTestId("sp");
    expect(el.tagName).toBe("SPAN");
    expect(el).toHaveClass("spinner", "md", "currentColor");
  });

  it("renders an IconLoader svg child", () => {
    const { container } = render(<Spinner data-testid="sp" />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  // --- Size ---
  it.each(["sm", "md", "lg"] as const)("applies %s size class", (size) => {
    render(<Spinner data-testid="sp" size={size} />);
    expect(screen.getByTestId("sp")).toHaveClass(size);
  });

  // --- Color ---
  it.each([
    "primary",
    "secondary",
    "error",
    "success",
    "warning",
    "info",
    "currentColor",
  ] as const)("applies %s color class", (color) => {
    render(<Spinner data-testid="sp" color={color} />);
    expect(screen.getByTestId("sp")).toHaveClass(color);
  });

  // --- Label (a11y) ---
  it("renders an SR-only label span when label given", () => {
    render(<Spinner label="Loading data" />);
    expect(screen.getByText("Loading data")).toHaveClass("sr_only");
  });

  it("sets role=status and aria-live=polite when label given", () => {
    render(<Spinner data-testid="sp" label="Loading" />);
    const el = screen.getByTestId("sp");
    expect(el).toHaveAttribute("role", "status");
    expect(el).toHaveAttribute("aria-live", "polite");
  });

  it("does NOT set role/aria-live when no label given", () => {
    render(<Spinner data-testid="sp" />);
    const el = screen.getByTestId("sp");
    expect(el).not.toHaveAttribute("role");
    expect(el).not.toHaveAttribute("aria-live");
  });

  // --- className + ref + rest ---
  it("merges custom className", () => {
    render(<Spinner data-testid="sp" className="custom" />);
    expect(screen.getByTestId("sp")).toHaveClass("spinner", "custom");
  });

  it("forwards ref to the root span", () => {
    const ref = createRef<HTMLSpanElement>();
    render(<Spinner ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
  });

  it("spreads HTML attributes to the root span", () => {
    render(<Spinner data-testid="sp" id="my-spinner" title="loading" />);
    const el = screen.getByTestId("sp");
    expect(el).toHaveAttribute("id", "my-spinner");
    expect(el).toHaveAttribute("title", "loading");
  });
});
