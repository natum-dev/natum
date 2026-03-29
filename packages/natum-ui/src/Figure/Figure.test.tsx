import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { createRef } from "react";
import { Figure } from "./Figure";

describe("Figure", () => {
  it("renders without crashing", () => {
    const { container } = render(<Figure title="Hello" />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it("defaults to vertical layout", () => {
    const { container } = render(<Figure title="Test" />);
    expect(container.firstChild).toHaveClass("vertical");
  });

  it("applies horizontal layout class", () => {
    const { container } = render(<Figure layout="horizontal" title="Test" />);
    expect(container.firstChild).toHaveClass("horizontal");
  });

  it("renders illustration when provided", () => {
    render(
      <Figure illustration={<svg data-testid="illus" />} title="Test" />
    );
    expect(screen.getByTestId("illus")).toBeInTheDocument();
  });

  it("renders title as ReactNode", () => {
    render(<Figure title={<span data-testid="title">Hello</span>} />);
    expect(screen.getByTestId("title")).toBeInTheDocument();
  });

  it("renders title as string", () => {
    render(<Figure title="Hello world" />);
    expect(screen.getByText("Hello world")).toBeInTheDocument();
  });

  it("renders description when provided", () => {
    render(<Figure title="T" description="Some description" />);
    expect(screen.getByText("Some description")).toBeInTheDocument();
  });

  it("renders description as ReactNode", () => {
    render(
      <Figure title="T" description={<span data-testid="desc">Rich desc</span>} />
    );
    expect(screen.getByTestId("desc")).toBeInTheDocument();
  });

  it("renders action slot", () => {
    render(
      <Figure title="T" action={<button data-testid="cta">Click</button>} />
    );
    expect(screen.getByTestId("cta")).toBeInTheDocument();
  });

  it("adds data-figure-section to illustration wrapper", () => {
    const { container } = render(
      <Figure illustration={<svg />} title="T" />
    );
    expect(
      container.querySelector('[data-figure-section="illustration"]')
    ).toBeInTheDocument();
  });

  it("adds data-figure-section to body wrapper", () => {
    const { container } = render(<Figure title="T" />);
    expect(
      container.querySelector('[data-figure-section="body"]')
    ).toBeInTheDocument();
  });

  it("adds data-figure-section to action wrapper", () => {
    const { container } = render(
      <Figure title="T" action={<button>Go</button>} />
    );
    expect(
      container.querySelector('[data-figure-section="action"]')
    ).toBeInTheDocument();
  });

  it("does not render illustration wrapper when not provided", () => {
    const { container } = render(<Figure title="T" />);
    expect(
      container.querySelector('[data-figure-section="illustration"]')
    ).not.toBeInTheDocument();
  });

  it("does not render action wrapper when not provided", () => {
    const { container } = render(<Figure title="T" />);
    expect(
      container.querySelector('[data-figure-section="action"]')
    ).not.toBeInTheDocument();
  });

  it("forwards ref", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Figure ref={ref} title="T" />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("merges custom className", () => {
    const { container } = render(
      <Figure title="T" className="custom" />
    );
    expect(container.firstChild).toHaveClass("custom");
    expect(container.firstChild).toHaveClass("figure");
  });

  it("spreads additional HTML attributes", () => {
    const { container } = render(
      <Figure title="T" data-testid="my-figure" />
    );
    expect(
      container.querySelector("[data-testid='my-figure']")
    ).toBeInTheDocument();
  });
});
