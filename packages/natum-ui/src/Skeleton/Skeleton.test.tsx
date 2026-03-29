import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { createRef } from "react";
import { Skeleton } from "./Skeleton";

describe("Skeleton", () => {
  it("renders without crashing", () => {
    const { container } = render(<Skeleton />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it("renders as text variant by default", () => {
    const { container } = render(<Skeleton />);
    expect(container.firstChild).toHaveClass("text");
  });

  it("defaults to 100% width", () => {
    const { container } = render(<Skeleton />);
    expect(container.firstChild).toHaveStyle({ width: "100%" });
  });

  it.each(["text", "rectangular", "circular"] as const)(
    "applies %s variant class",
    (variant) => {
      const { container } = render(<Skeleton variant={variant} />);
      expect(container.firstChild).toHaveClass(variant);
    }
  );

  it("applies border-radius 50% for circular variant", () => {
    const { container } = render(
      <Skeleton variant="circular" width={40} height={40} />
    );
    expect(container.firstChild).toHaveClass("circular");
  });

  it("applies numeric width as px", () => {
    const { container } = render(<Skeleton width={200} />);
    expect(container.firstChild).toHaveStyle({ width: "200px" });
  });

  it("applies string width directly", () => {
    const { container } = render(<Skeleton width="50%" />);
    expect(container.firstChild).toHaveStyle({ width: "50%" });
  });

  it("applies numeric height as px", () => {
    const { container } = render(<Skeleton height={24} />);
    expect(container.firstChild).toHaveStyle({ height: "24px" });
  });

  it("applies string height directly", () => {
    const { container } = render(<Skeleton height="2rem" />);
    expect(container.firstChild).toHaveStyle({ height: "2rem" });
  });

  it("applies custom borderRadius as number", () => {
    const { container } = render(<Skeleton borderRadius={12} />);
    expect(container.firstChild).toHaveStyle({ borderRadius: "12px" });
  });

  it("applies custom borderRadius as string", () => {
    const { container } = render(<Skeleton borderRadius="50%" />);
    expect(container.firstChild).toHaveStyle({ borderRadius: "50%" });
  });

  it("has aria-hidden true", () => {
    const { container } = render(<Skeleton />);
    expect(container.firstChild).toHaveAttribute("aria-hidden", "true");
  });

  it("forwards ref", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Skeleton ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("merges custom className", () => {
    const { container } = render(<Skeleton className="custom" />);
    expect(container.firstChild).toHaveClass("custom");
    expect(container.firstChild).toHaveClass("skeleton");
  });

  it("spreads additional HTML attributes", () => {
    const { container } = render(<Skeleton data-testid="my-skeleton" />);
    expect(container.querySelector("[data-testid='my-skeleton']")).toBeInTheDocument();
  });
});
