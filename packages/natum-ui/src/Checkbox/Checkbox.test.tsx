import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { createRef } from "react";
import { Checkbox } from "./Checkbox";

describe("Checkbox", () => {
  it("renders without crashing", () => {
    render(<Checkbox aria-label="Test" />);
    expect(screen.getByRole("checkbox")).toBeInTheDocument();
  });

  it("renders unchecked by default", () => {
    render(<Checkbox aria-label="Test" />);
    expect(screen.getByRole("checkbox")).not.toBeChecked();
  });

  it("reflects controlled checked state", () => {
    const { rerender } = render(
      <Checkbox checked={false} onChange={() => {}} aria-label="Test" />
    );
    expect(screen.getByRole("checkbox")).not.toBeChecked();
    rerender(
      <Checkbox checked={true} onChange={() => {}} aria-label="Test" />
    );
    expect(screen.getByRole("checkbox")).toBeChecked();
  });

  it("calls onChange when clicked in controlled mode", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <Checkbox checked={false} onChange={handleChange} aria-label="Test" />
    );
    await user.click(screen.getByRole("checkbox"));
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it("toggles in uncontrolled mode", async () => {
    const user = userEvent.setup();
    render(<Checkbox defaultChecked={false} aria-label="Test" />);
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).not.toBeChecked();
    await user.click(checkbox);
    expect(checkbox).toBeChecked();
    await user.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });

  it("starts checked with defaultChecked", () => {
    render(<Checkbox defaultChecked={true} aria-label="Test" />);
    expect(screen.getByRole("checkbox")).toBeChecked();
  });

  it("sets indeterminate visual state on the input", () => {
    render(<Checkbox indeterminate aria-label="Test" />);
    const input = screen.getByRole("checkbox") as HTMLInputElement;
    expect(input.indeterminate).toBe(true);
  });

  it("shows indeterminate icon instead of checkmark when indeterminate", () => {
    const { container } = render(<Checkbox indeterminate aria-label="Test" />);
    expect(container.querySelector("[data-icon='indeterminate']")).toBeInTheDocument();
    expect(container.querySelector("[data-icon='check']")).not.toBeInTheDocument();
  });

  it("renders label text when label prop is provided", () => {
    render(<Checkbox label="Remember me" />);
    expect(screen.getByText("Remember me")).toBeInTheDocument();
  });

  it("associates label with checkbox input", () => {
    render(<Checkbox label="Remember me" />);
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toHaveAccessibleName("Remember me");
  });

  it("toggles when label is clicked", async () => {
    const user = userEvent.setup();
    render(<Checkbox label="Remember me" />);
    await user.click(screen.getByText("Remember me"));
    expect(screen.getByRole("checkbox")).toBeChecked();
  });

  it("renders ReactNode label", () => {
    render(<Checkbox label={<span data-testid="rich-label">Rich</span>} />);
    expect(screen.getByTestId("rich-label")).toBeInTheDocument();
  });

  it.each(["sm", "md", "lg"] as const)(
    "applies %s size class",
    (size) => {
      const { container } = render(
        <Checkbox size={size} aria-label="Test" />
      );
      expect(container.firstChild).toHaveClass(size);
    }
  );

  it("defaults to md size", () => {
    const { container } = render(<Checkbox aria-label="Test" />);
    expect(container.firstChild).toHaveClass("md");
  });

  it("applies primary color class by default", () => {
    const { container } = render(<Checkbox aria-label="Test" />);
    expect(container.firstChild).toHaveClass("primary");
  });

  it("applies custom color class", () => {
    const { container } = render(
      <Checkbox color="error" aria-label="Test" />
    );
    expect(container.firstChild).toHaveClass("error");
  });

  it("disables the checkbox input when disabled", () => {
    render(<Checkbox disabled aria-label="Test" />);
    expect(screen.getByRole("checkbox")).toBeDisabled();
  });

  it("applies disabled class to container", () => {
    const { container } = render(
      <Checkbox disabled aria-label="Test" />
    );
    expect(container.firstChild).toHaveClass("disabled");
  });

  it("does not call onChange when disabled", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <Checkbox disabled onChange={handleChange} aria-label="Test" />
    );
    await user.click(screen.getByRole("checkbox"));
    expect(handleChange).not.toHaveBeenCalled();
  });

  it("toggles via Space key", async () => {
    const user = userEvent.setup();
    render(<Checkbox aria-label="Test" />);
    const checkbox = screen.getByRole("checkbox");
    checkbox.focus();
    await user.keyboard(" ");
    expect(checkbox).toBeChecked();
  });

  it("forwards ref to the input element", () => {
    const ref = createRef<HTMLInputElement>();
    render(<Checkbox ref={ref} aria-label="Test" />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
    expect(ref.current?.type).toBe("checkbox");
  });

  it("merges custom className", () => {
    const { container } = render(
      <Checkbox className="custom" aria-label="Test" />
    );
    expect(container.firstChild).toHaveClass("custom");
  });

  it("spreads additional HTML attributes", () => {
    render(<Checkbox aria-label="Test" data-testid="my-checkbox" />);
    expect(screen.getByTestId("my-checkbox")).toBeInTheDocument();
  });
});
