import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { createRef } from "react";
import { Card } from "./Card";

describe("Card", () => {
  // --- Renders without crashing ---
  it("renders without crashing with default props", () => {
    render(<Card>Content</Card>);
    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  it("renders children inside the card", () => {
    render(
      <Card>
        <span data-testid="child">Hello</span>
      </Card>
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  // --- Default element and classes ---
  it("renders as a div by default", () => {
    render(<Card data-testid="card">Content</Card>);
    expect(screen.getByTestId("card").tagName).toBe("DIV");
  });

  it("applies default variant (elevated) and size (md) classes", () => {
    render(<Card data-testid="card">Content</Card>);
    const card = screen.getByTestId("card");
    expect(card).toHaveClass("card", "elevated", "md");
  });

  // --- Variants ---
  it("applies elevated variant class", () => {
    render(<Card data-testid="card" variant="elevated">Content</Card>);
    expect(screen.getByTestId("card")).toHaveClass("elevated");
  });

  it("applies outlined variant class", () => {
    render(<Card data-testid="card" variant="outlined">Content</Card>);
    expect(screen.getByTestId("card")).toHaveClass("outlined");
  });

  it("applies filled variant class", () => {
    render(<Card data-testid="card" variant="filled">Content</Card>);
    expect(screen.getByTestId("card")).toHaveClass("filled");
  });

  // --- Sizes ---
  it("applies sm size class", () => {
    render(<Card data-testid="card" size="sm">Content</Card>);
    expect(screen.getByTestId("card")).toHaveClass("sm");
  });

  it("applies md size class", () => {
    render(<Card data-testid="card" size="md">Content</Card>);
    expect(screen.getByTestId("card")).toHaveClass("md");
  });

  it("applies lg size class", () => {
    render(<Card data-testid="card" size="lg">Content</Card>);
    expect(screen.getByTestId("card")).toHaveClass("lg");
  });

  // --- Polymorphic `as` prop ---
  it("renders as an article when as='article'", () => {
    render(<Card data-testid="card" as="article">Content</Card>);
    expect(screen.getByTestId("card").tagName).toBe("ARTICLE");
  });

  it("renders as a section when as='section'", () => {
    render(<Card data-testid="card" as="section">Content</Card>);
    expect(screen.getByTestId("card").tagName).toBe("SECTION");
  });

  it("renders as an anchor when as='a'", () => {
    render(<Card data-testid="card" as="a" href="https://example.com">Content</Card>);
    const card = screen.getByTestId("card");
    expect(card.tagName).toBe("A");
    expect(card).toHaveAttribute("href", "https://example.com");
  });

  it("renders as a button when as='button'", () => {
    render(<Card as="button">Content</Card>);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  // --- isInteractive ---
  it("adds interactive class when isInteractive is true", () => {
    render(<Card data-testid="card" isInteractive>Content</Card>);
    expect(screen.getByTestId("card")).toHaveClass("interactive");
  });

  it("adds role='button' and tabIndex=0 on div when isInteractive", () => {
    render(<Card data-testid="card" isInteractive>Content</Card>);
    const card = screen.getByTestId("card");
    expect(card).toHaveAttribute("role", "button");
    expect(card).toHaveAttribute("tabindex", "0");
  });

  it("adds role='button' and tabIndex=0 on article when isInteractive", () => {
    render(<Card data-testid="card" as="article" isInteractive>Content</Card>);
    const card = screen.getByTestId("card");
    expect(card).toHaveAttribute("role", "button");
    expect(card).toHaveAttribute("tabindex", "0");
  });

  it("adds role='button' and tabIndex=0 on section when isInteractive", () => {
    render(<Card data-testid="card" as="section" isInteractive>Content</Card>);
    const card = screen.getByTestId("card");
    expect(card).toHaveAttribute("role", "button");
    expect(card).toHaveAttribute("tabindex", "0");
  });

  it("does NOT add role or tabIndex on native button when isInteractive", () => {
    render(<Card as="button" isInteractive>Content</Card>);
    const card = screen.getByRole("button");
    expect(card).not.toHaveAttribute("role");
    expect(card).not.toHaveAttribute("tabindex");
  });

  it("does NOT add role or tabIndex on anchor when isInteractive", () => {
    render(<Card data-testid="card" as="a" href="#" isInteractive>Content</Card>);
    const card = screen.getByTestId("card");
    expect(card).not.toHaveAttribute("role");
    expect(card).not.toHaveAttribute("tabindex");
  });

  // --- Keyboard interaction ---
  it("triggers onClick on Enter key when isInteractive on div", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Card data-testid="card" isInteractive onClick={onClick}>Content</Card>);
    const card = screen.getByTestId("card");
    card.focus();
    await user.keyboard("{Enter}");
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("triggers onClick on Space key when isInteractive on div", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Card data-testid="card" isInteractive onClick={onClick}>Content</Card>);
    const card = screen.getByTestId("card");
    card.focus();
    await user.keyboard(" ");
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("does not trigger onClick on other keys when isInteractive", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Card data-testid="card" isInteractive onClick={onClick}>Content</Card>);
    const card = screen.getByTestId("card");
    card.focus();
    await user.keyboard("a");
    expect(onClick).not.toHaveBeenCalled();
  });

  // --- isSelected ---
  it("applies selected class when isSelected is true", () => {
    render(<Card data-testid="card" isSelected>Content</Card>);
    expect(screen.getByTestId("card")).toHaveClass("selected");
  });

  it("sets aria-selected='true' when isSelected", () => {
    render(<Card data-testid="card" isSelected>Content</Card>);
    expect(screen.getByTestId("card")).toHaveAttribute("aria-selected", "true");
  });

  it("does not have aria-selected when isSelected is false", () => {
    render(<Card data-testid="card">Content</Card>);
    expect(screen.getByTestId("card")).not.toHaveAttribute("aria-selected");
  });

  // --- Disabled state ---
  it("applies disabled class when disabled", () => {
    render(<Card data-testid="card" disabled>Content</Card>);
    expect(screen.getByTestId("card")).toHaveClass("disabled");
  });

  it("sets aria-disabled='true' when disabled", () => {
    render(<Card data-testid="card" disabled>Content</Card>);
    expect(screen.getByTestId("card")).toHaveAttribute("aria-disabled", "true");
  });

  it("does not fire onClick when disabled and isInteractive", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Card data-testid="card" disabled isInteractive onClick={onClick}>Content</Card>);
    await user.click(screen.getByTestId("card"));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("sets tabIndex=-1 when disabled and isInteractive on non-native element", () => {
    render(<Card data-testid="card" disabled isInteractive>Content</Card>);
    expect(screen.getByTestId("card")).toHaveAttribute("tabindex", "-1");
  });

  // --- Disabled + as="button" ---
  it("sets native disabled attribute when as='button' and disabled", () => {
    render(<Card as="button" disabled>Content</Card>);
    const card = screen.getByRole("button");
    expect(card).toBeDisabled();
  });

  // --- Disabled + as="a" ---
  it("removes href when as='a' and disabled", () => {
    render(<Card data-testid="card" as="a" href="https://example.com" disabled>Content</Card>);
    const card = screen.getByTestId("card");
    expect(card).not.toHaveAttribute("href");
  });

  // --- forwardRef ---
  it("forwards ref to the root element", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Card ref={ref}>Content</Card>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("forwards ref to button element when as='button'", () => {
    const ref = createRef<HTMLButtonElement>();
    render(<Card ref={ref} as="button">Content</Card>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  // --- className merging ---
  it("merges custom className with internal classes", () => {
    render(<Card data-testid="card" className="custom-class">Content</Card>);
    const card = screen.getByTestId("card");
    expect(card).toHaveClass("card", "elevated", "md", "custom-class");
  });

  // --- Spreads HTML attributes ---
  it("spreads HTML attributes to root element", () => {
    render(<Card data-testid="card" id="my-card" aria-label="Test card">Content</Card>);
    const card = screen.getByTestId("card");
    expect(card).toHaveAttribute("id", "my-card");
    expect(card).toHaveAttribute("aria-label", "Test card");
  });
});
