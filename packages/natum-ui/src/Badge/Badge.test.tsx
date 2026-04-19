import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
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

  // --- leftSection ---
  it("renders leftSection wrapped in an aria-hidden span", () => {
    render(<Badge leftSection={<svg data-testid="icon" />}>Shared</Badge>);
    const icon = screen.getByTestId("icon");
    const wrapper = icon.parentElement;
    expect(wrapper?.tagName).toBe("SPAN");
    expect(wrapper).toHaveAttribute("aria-hidden", "true");
    expect(wrapper).toHaveClass("left_section");
  });

  it("does not render leftSection when dot={true}", () => {
    render(
      <Badge dot aria-label="Unread" leftSection={<svg data-testid="icon" />} />
    );
    expect(screen.queryByTestId("icon")).not.toBeInTheDocument();
  });

  it("renders leftSection when children is absent", () => {
    render(<Badge aria-label="Status" leftSection={<svg data-testid="icon" />} />);
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });

  // --- Polymorphism ---
  it("renders as <a> when as='a' and preserves href", () => {
    render(
      <Badge data-testid="badge" as="a" href="https://example.com">
        Link
      </Badge>
    );
    const el = screen.getByTestId("badge");
    expect(el.tagName).toBe("A");
    expect(el).toHaveAttribute("href", "https://example.com");
  });

  it("renders as <button> when as='button' and accepts type", () => {
    render(
      <Badge data-testid="badge" as="button" type="button">
        Click
      </Badge>
    );
    const el = screen.getByTestId("badge");
    expect(el.tagName).toBe("BUTTON");
    expect(el).toHaveAttribute("type", "button");
  });

  // --- Interactive class gating ---
  it("applies .interactive class when as='a'", () => {
    render(<Badge data-testid="badge" as="a" href="#">L</Badge>);
    expect(screen.getByTestId("badge")).toHaveClass("interactive");
  });

  it("applies .interactive class when as='button'", () => {
    render(<Badge data-testid="badge" as="button">B</Badge>);
    expect(screen.getByTestId("badge")).toHaveClass("interactive");
  });

  it("does not apply .interactive class when as='span' (default)", () => {
    render(<Badge data-testid="badge">S</Badge>);
    expect(screen.getByTestId("badge")).not.toHaveClass("interactive");
  });

  it("does not apply .interactive class when as='span' is explicit", () => {
    render(<Badge data-testid="badge" as="span">S</Badge>);
    expect(screen.getByTestId("badge")).not.toHaveClass("interactive");
  });

  // --- Disabled behavior ---
  it("sets native disabled on <button> when disabled={true}", () => {
    render(<Badge data-testid="badge" as="button" disabled>B</Badge>);
    expect(screen.getByTestId("badge")).toBeDisabled();
  });

  it("strips href on disabled <a>", () => {
    render(
      <Badge data-testid="badge" as="a" href="https://example.com" disabled>
        L
      </Badge>
    );
    expect(screen.getByTestId("badge")).not.toHaveAttribute("href");
  });

  it("handles disabled <a> rendered without href (no attribute injected)", () => {
    render(<Badge data-testid="badge" as="a" disabled>L</Badge>);
    expect(screen.getByTestId("badge")).not.toHaveAttribute("href");
  });

  it("sets aria-disabled=true on disabled interactive badge", () => {
    render(<Badge data-testid="badge" as="button" disabled>B</Badge>);
    expect(screen.getByTestId("badge")).toHaveAttribute("aria-disabled", "true");
  });

  it("does not set aria-disabled on non-interactive (span) badge", () => {
    render(<Badge data-testid="badge" disabled>S</Badge>);
    expect(screen.getByTestId("badge")).not.toHaveAttribute("aria-disabled");
  });

  it("does not invoke onClick when disabled", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(
      <Badge as="button" disabled onClick={onClick}>
        Click
      </Badge>
    );
    await user.click(screen.getByText("Click"));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("does not invoke onClick when disabled <a> is clicked", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(
      <Badge as="a" href="#" disabled onClick={onClick}>
        LinkText
      </Badge>
    );
    await user.click(screen.getByText("LinkText"));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("applies .disabled class when disabled AND interactive", () => {
    render(<Badge data-testid="badge" as="button" disabled>B</Badge>);
    expect(screen.getByTestId("badge")).toHaveClass("disabled");
  });

  it("does NOT apply .disabled class on non-interactive span (no-op)", () => {
    render(<Badge data-testid="badge" disabled>S</Badge>);
    expect(screen.getByTestId("badge")).not.toHaveClass("disabled");
  });
});
