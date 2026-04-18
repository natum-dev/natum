import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { createRef } from "react";
import { AspectRatio } from "./AspectRatio";

describe("AspectRatio", () => {
  // --- Renders ---
  it("renders children", () => {
    render(
      <AspectRatio ratio={16 / 9}>
        <span>Content</span>
      </AspectRatio>
    );
    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  it("renders as a div by default", () => {
    render(
      <AspectRatio data-testid="ar" ratio={1}>
        x
      </AspectRatio>
    );
    expect(screen.getByTestId("ar").tagName).toBe("DIV");
  });

  it("applies base aspect_ratio class", () => {
    render(
      <AspectRatio data-testid="ar" ratio={1}>
        x
      </AspectRatio>
    );
    expect(screen.getByTestId("ar")).toHaveClass("aspect_ratio");
  });

  // --- Ratio exposed as CSS custom property ---
  it("exposes ratio via --ar-ratio custom property (16/9)", () => {
    render(
      <AspectRatio data-testid="ar" ratio={16 / 9}>
        x
      </AspectRatio>
    );
    const style = screen.getByTestId("ar").getAttribute("style") ?? "";
    expect(style).toMatch(/--ar-ratio:\s*1\.777/);
  });

  it("exposes ratio via --ar-ratio custom property (1:1)", () => {
    render(
      <AspectRatio data-testid="ar" ratio={1}>
        x
      </AspectRatio>
    );
    const style = screen.getByTestId("ar").getAttribute("style") ?? "";
    expect(style).toMatch(/--ar-ratio:\s*1/);
  });

  // --- Polymorphic ---
  it.each(["figure", "section"] as const)(
    "renders as a %s element",
    (tag) => {
      render(
        <AspectRatio data-testid="ar" as={tag} ratio={1}>
          x
        </AspectRatio>
      );
      expect(screen.getByTestId("ar").tagName).toBe(tag.toUpperCase());
    }
  );

  // --- forwardRef ---
  it("forwards ref to the root element", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <AspectRatio ref={ref} ratio={1}>
        x
      </AspectRatio>
    );
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  // --- className + rest ---
  it("merges custom className", () => {
    render(
      <AspectRatio data-testid="ar" ratio={1} className="custom">
        x
      </AspectRatio>
    );
    expect(screen.getByTestId("ar")).toHaveClass("aspect_ratio", "custom");
  });

  it("preserves consumer style alongside --ar-ratio", () => {
    render(
      <AspectRatio data-testid="ar" ratio={1} style={{ border: "1px solid red" }}>
        x
      </AspectRatio>
    );
    const style = screen.getByTestId("ar").getAttribute("style") ?? "";
    expect(style).toMatch(/border:\s*1px solid red/);
    expect(style).toMatch(/--ar-ratio:\s*1/);
  });

  it("spreads HTML attributes", () => {
    render(
      <AspectRatio data-testid="ar" ratio={1} id="ar" aria-label="media">
        x
      </AspectRatio>
    );
    const el = screen.getByTestId("ar");
    expect(el).toHaveAttribute("id", "ar");
    expect(el).toHaveAttribute("aria-label", "media");
  });
});
