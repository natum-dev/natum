import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { IconButton } from "./IconButton";
import type { IconProps } from "@natum/icons";

const MockIcon = (props: IconProps) => <svg data-testid="mock-icon" {...props} />;

describe("IconButton", () => {
  it("renders a button with aria-label", () => {
    render(<IconButton icon={MockIcon} aria-label="Close" />);
    expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument();
  });

  it("renders the icon component", () => {
    render(<IconButton icon={MockIcon} aria-label="Close" />);
    expect(screen.getByTestId("mock-icon")).toBeInTheDocument();
  });

  it("applies default classes", () => {
    render(<IconButton icon={MockIcon} aria-label="Close" />);
    const btn = screen.getByRole("button");
    expect(btn).toHaveClass("icon_button", "filled", "medium", "primary");
  });

  it("applies variant class", () => {
    render(<IconButton icon={MockIcon} aria-label="Close" variant="soft" />);
    expect(screen.getByRole("button")).toHaveClass("soft");
  });

  it("applies color class", () => {
    render(<IconButton icon={MockIcon} aria-label="Close" color="error" />);
    expect(screen.getByRole("button")).toHaveClass("error");
  });

  it("applies size class", () => {
    render(<IconButton icon={MockIcon} aria-label="Close" size="small" />);
    expect(screen.getByRole("button")).toHaveClass("small");
  });

  it("is disabled when disabled prop is set", () => {
    render(<IconButton icon={MockIcon} aria-label="Close" disabled />);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("is disabled when loading", () => {
    render(<IconButton icon={MockIcon} aria-label="Close" loading />);
    const btn = screen.getByRole("button");
    expect(btn).toBeDisabled();
    expect(btn).toHaveClass("disabled");
  });

  it("calls onClick when clicked", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<IconButton icon={MockIcon} aria-label="Close" onClick={onClick} />);
    await user.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("applies custom className", () => {
    render(<IconButton icon={MockIcon} aria-label="Close" className="custom" />);
    expect(screen.getByRole("button")).toHaveClass("custom");
  });

  it("renders correctly with dir='rtl'", () => {
    const { container } = render(
      <div dir="rtl">
        <IconButton icon={MockIcon} aria-label="Close" />
      </div>
    );
    expect(container.firstChild).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument();
  });
});
