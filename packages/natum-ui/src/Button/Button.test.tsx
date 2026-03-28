import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { Button } from "./Button";

describe("Button", () => {
  it("renders children", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button", { name: "Click me" })).toBeInTheDocument();
  });

  it("applies default classes", () => {
    render(<Button>btn</Button>);
    const btn = screen.getByRole("button");
    expect(btn).toHaveClass("button", "filled");
  });

  it("applies variant class", () => {
    render(<Button variant="soft">btn</Button>);
    expect(screen.getByRole("button")).toHaveClass("soft");
  });

  it("applies text variant class", () => {
    render(<Button variant="text">btn</Button>);
    expect(screen.getByRole("button")).toHaveClass("text");
  });

  it("applies fullWidth class", () => {
    render(<Button fullWidth>btn</Button>);
    expect(screen.getByRole("button")).toHaveClass("full_width");
  });

  it("is disabled when disabled prop is set", () => {
    render(<Button disabled>btn</Button>);
    const btn = screen.getByRole("button");
    expect(btn).toBeDisabled();
    expect(btn).toHaveClass("disabled");
  });

  it("calls onClick when clicked", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>btn</Button>);
    await user.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("does not call onClick when disabled", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button disabled onClick={onClick}>btn</Button>);
    await user.click(screen.getByRole("button"));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("applies custom className", () => {
    render(<Button className="custom">btn</Button>);
    expect(screen.getByRole("button")).toHaveClass("custom");
  });

  it("forwards native button props", () => {
    render(<Button type="submit" aria-label="Submit form">btn</Button>);
    const btn = screen.getByRole("button");
    expect(btn).toHaveAttribute("type", "submit");
    expect(btn).toHaveAttribute("aria-label", "Submit form");
  });

  it("applies disabled styling to soft variant", () => {
    render(<Button variant="soft" disabled>btn</Button>);
    const btn = screen.getByRole("button");
    expect(btn).toHaveClass("disabled", "soft");
    expect(btn).toBeDisabled();
  });
});
