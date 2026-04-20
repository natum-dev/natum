import { describe, it, expect } from "vitest";
import { deriveInitials, pickColor } from "./utils";

describe("Avatar utils — deriveInitials", () => {
  it("returns empty string for undefined/empty", () => {
    expect(deriveInitials(undefined)).toBe("");
    expect(deriveInitials("")).toBe("");
    expect(deriveInitials("   ")).toBe("");
  });

  it("returns first char for single-word names", () => {
    expect(deriveInitials("Alice")).toBe("A");
    expect(deriveInitials("alice")).toBe("A");
  });

  it("returns first two chars for two-word names", () => {
    expect(deriveInitials("Jonathan Ramlie")).toBe("JR");
  });

  it("takes only first two words when there are more", () => {
    expect(deriveInitials("Mary Jane Watson")).toBe("MJ");
  });

  it("trims leading/trailing whitespace", () => {
    expect(deriveInitials("  Alice  ")).toBe("A");
  });

  it("preserves first grapheme verbatim for non-Latin scripts", () => {
    expect(deriveInitials("山田 太郎")).toBe("山太");
  });
});

describe("Avatar utils — pickColor", () => {
  it("returns neutral when name is missing", () => {
    expect(pickColor(undefined)).toBe("neutral");
    expect(pickColor("")).toBe("neutral");
  });

  it("returns a palette value from the 8-color set", () => {
    const palette = ["red", "orange", "yellow", "green", "teal", "blue", "purple", "pink"];
    expect(palette).toContain(pickColor("Alice"));
  });

  it("is deterministic — same name always returns the same color", () => {
    const a = pickColor("Alice Zhang");
    const b = pickColor("Alice Zhang");
    expect(a).toBe(b);
  });

  it("different names often return different colors (probabilistic smoke)", () => {
    const names = ["Alice", "Bob", "Charlie", "Dana", "Eve", "Fay", "Gil", "Hal"];
    const colors = new Set(names.map(pickColor));
    expect(colors.size).toBeGreaterThan(1);
  });
});

import { render, screen, fireEvent } from "@testing-library/react";
import { createRef } from "react";
import { Avatar } from "./Avatar";

describe("Avatar — image render", () => {
  it("renders <img> when src is present", () => {
    render(<Avatar src="/x.png" name="Alice" />);
    const img = screen.getByRole("img", { name: "Alice" });
    expect(img.tagName).toBe("IMG");
    expect(img).toHaveAttribute("src", "/x.png");
    expect(img).toHaveAttribute("loading", "lazy");
  });

  it("uses name as alt when alt not provided", () => {
    render(<Avatar src="/x.png" name="Alice Zhang" />);
    expect(screen.getByRole("img", { name: "Alice Zhang" })).toBeInTheDocument();
  });

  it("uses empty alt when no name and no alt", () => {
    const { container } = render(<Avatar src="/x.png" />);
    const img = container.querySelector("img");
    expect(img?.getAttribute("alt")).toBe("");
  });

  it("explicit alt overrides name", () => {
    render(<Avatar src="/x.png" name="Alice" alt="Alice's avatar" />);
    expect(
      screen.getByRole("img", { name: "Alice's avatar" })
    ).toBeInTheDocument();
  });

  it("forwards ref to the root span", () => {
    const ref = createRef<HTMLSpanElement>();
    render(<Avatar ref={ref} src="/x.png" />);
    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
  });

  it("merges className + spreads rest props on root", () => {
    render(<Avatar src="/x.png" className="mine" data-testid="av" />);
    const root = screen.getByTestId("av");
    expect(root).toHaveClass("mine");
    expect(root.tagName).toBe("SPAN");
  });
});
