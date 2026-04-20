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

describe("Avatar — fallback chain", () => {
  it("falls back to initials when image errors", () => {
    render(<Avatar src="/broken.png" name="Alice Zhang" />);
    const img = screen.getByRole("img", { name: "Alice Zhang" });
    fireEvent.error(img);
    expect(
      screen.getByRole("img", { name: "Alice Zhang" })
    ).toBeInTheDocument();
    expect(screen.getByText("AZ")).toBeInTheDocument();
  });

  it("renders initials when src is absent", () => {
    render(<Avatar name="Bob Kim" />);
    expect(screen.getByText("BK")).toBeInTheDocument();
  });

  it("explicit initials prop wins over name derivation", () => {
    render(<Avatar name="Alice Zhang" initials="DR" />);
    expect(screen.getByText("DR")).toBeInTheDocument();
  });

  it("truncates initials override to 2 chars + uppercases", () => {
    render(<Avatar initials="abcdef" />);
    expect(screen.getByText("AB")).toBeInTheDocument();
  });

  it("renders fallback ReactNode when no src and no initials", () => {
    render(<Avatar fallback={<span data-testid="team">Team</span>} />);
    expect(screen.getByTestId("team")).toBeInTheDocument();
  });

  it("renders IconUser when nothing else provided", () => {
    const { container } = render(<Avatar />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("data-fallback attribute reflects which fallback rendered", () => {
    const { rerender } = render(<Avatar src="/x.png" data-testid="av" />);
    expect(screen.getByTestId("av")).toHaveAttribute("data-fallback", "image");
    rerender(<Avatar name="Alice" data-testid="av" />);
    expect(screen.getByTestId("av")).toHaveAttribute("data-fallback", "initials");
    rerender(<Avatar fallback={<i />} data-testid="av" />);
    expect(screen.getByTestId("av")).toHaveAttribute("data-fallback", "custom");
    rerender(<Avatar data-testid="av" />);
    expect(screen.getByTestId("av")).toHaveAttribute("data-fallback", "icon");
  });

  it("isBroken resets when src changes", () => {
    const { rerender } = render(<Avatar src="/broken.png" name="Alice" />);
    const img1 = screen.getByRole("img", { name: "Alice" });
    fireEvent.error(img1);
    expect(screen.queryByRole("img")?.tagName).toBe("SPAN");
    rerender(<Avatar src="/new.png" name="Alice" />);
    const img = document.querySelector("img");
    expect(img).toBeInTheDocument();
  });
});

describe("Avatar — size / shape / color", () => {
  it("default size=md + shape=circle data-attrs", () => {
    render(<Avatar name="Alice" data-testid="av" />);
    const root = screen.getByTestId("av");
    expect(root).toHaveAttribute("data-size", "md");
    expect(root).toHaveAttribute("data-shape", "circle");
  });

  it("explicit size and shape", () => {
    render(<Avatar name="Alice" size="xl" shape="square" data-testid="av" />);
    const root = screen.getByTestId("av");
    expect(root).toHaveAttribute("data-size", "xl");
    expect(root).toHaveAttribute("data-shape", "square");
  });

  it("color='auto' with name → hashed palette color", () => {
    render(<Avatar name="Alice" data-testid="av" />);
    const palette = ["red", "orange", "yellow", "green", "teal", "blue", "purple", "pink"];
    expect(palette).toContain(
      screen.getByTestId("av").getAttribute("data-color")
    );
  });

  it("color='auto' without name → neutral", () => {
    render(<Avatar data-testid="av" />);
    expect(screen.getByTestId("av")).toHaveAttribute("data-color", "neutral");
  });

  it("explicit color prop wins", () => {
    render(<Avatar name="Alice" color="primary" data-testid="av" />);
    expect(screen.getByTestId("av")).toHaveAttribute("data-color", "primary");
  });

  it("hash is deterministic — same name renders same data-color across mounts", () => {
    const { unmount } = render(<Avatar name="Alice" data-testid="av" />);
    const first = screen.getByTestId("av").getAttribute("data-color");
    unmount();
    render(<Avatar name="Alice" data-testid="av2" />);
    const second = screen.getByTestId("av2").getAttribute("data-color");
    expect(first).toBe(second);
  });
});

describe("Avatar — accessibility", () => {
  it("image case: <img alt> is the accessible name; wrapper has no role", () => {
    render(<Avatar src="/x.png" name="Alice" data-testid="av" />);
    expect(screen.getByTestId("av")).not.toHaveAttribute("role");
    expect(screen.getByRole("img", { name: "Alice" }).tagName).toBe("IMG");
  });

  it("initials case: wrapper has role=img + aria-label from name", () => {
    render(<Avatar name="Bob Kim" data-testid="av" />);
    const root = screen.getByTestId("av");
    expect(root).toHaveAttribute("role", "img");
    expect(root).toHaveAccessibleName("Bob Kim");
  });

  it("icon case: wrapper has role=img + default aria-label", () => {
    render(<Avatar data-testid="av" />);
    const root = screen.getByTestId("av");
    expect(root).toHaveAttribute("role", "img");
    expect(root).toHaveAccessibleName("User avatar");
  });

  it("aria-label prop overrides default", () => {
    render(<Avatar name="Alice" aria-label="Profile photo" data-testid="av" />);
    expect(screen.getByTestId("av")).toHaveAccessibleName("Profile photo");
  });

  it("initials element is aria-hidden inside a role=img wrapper", () => {
    render(<Avatar name="Alice Zhang" />);
    const initialsEl = screen.getByText("AZ");
    expect(initialsEl).toHaveAttribute("aria-hidden", "true");
  });
});
