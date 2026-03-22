import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { createRef } from "react";
import { TextField } from "./TextField";

describe("TextField", () => {
  // --- Renders without crashing ---
  it("renders without crashing with default props", () => {
    render(<TextField aria-label="Test" />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  // --- Label ---
  it("renders label with htmlFor association", () => {
    render(<TextField label="Email" />);
    const input = screen.getByLabelText("Email");
    expect(input).toBeInTheDocument();
    expect(input.tagName).toBe("INPUT");
  });

  it("renders without label and no crash", () => {
    render(<TextField aria-label="No label" />);
    expect(screen.queryByText(/./)).toBeFalsy();
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  // --- Variants ---
  it("applies outlined variant class by default", () => {
    render(<TextField label="Test" />);
    const container = screen.getByLabelText("Test").closest("[class*='input_container']")!;
    expect(container).toHaveClass("outlined");
  });

  it("applies filled variant class", () => {
    render(<TextField label="Test" variant="filled" />);
    const container = screen.getByLabelText("Test").closest("[class*='input_container']")!;
    expect(container).toHaveClass("filled");
  });

  // --- Sizes ---
  it("applies md size class by default", () => {
    render(<TextField label="Test" />);
    const container = screen.getByLabelText("Test").closest("[class*='input_container']")!;
    expect(container).toHaveClass("md");
  });

  it("applies sm size class", () => {
    render(<TextField label="Test" size="sm" />);
    const container = screen.getByLabelText("Test").closest("[class*='input_container']")!;
    expect(container).toHaveClass("sm");
  });

  it("applies lg size class", () => {
    render(<TextField label="Test" size="lg" />);
    const container = screen.getByLabelText("Test").closest("[class*='input_container']")!;
    expect(container).toHaveClass("lg");
  });

  // --- Click-to-focus ---
  it("focuses input when container is clicked", async () => {
    const user = userEvent.setup();
    render(<TextField label="Test" />);
    const input = screen.getByLabelText("Test");
    const container = input.closest("[class*='input_container']")!;
    await user.click(container);
    expect(input).toHaveFocus();
  });

  // --- Sections ---
  it("renders leftSection inside container", () => {
    render(<TextField label="Test" leftSection={<span data-testid="left">L</span>} />);
    expect(screen.getByTestId("left")).toBeInTheDocument();
    const input = screen.getByLabelText("Test");
    expect(input.closest("[class*='input_container']")!.contains(screen.getByTestId("left"))).toBe(true);
  });

  it("renders rightSection inside container", () => {
    render(<TextField label="Test" rightSection={<span data-testid="right">R</span>} />);
    expect(screen.getByTestId("right")).toBeInTheDocument();
    const input = screen.getByLabelText("Test");
    expect(input.closest("[class*='input_container']")!.contains(screen.getByTestId("right"))).toBe(true);
  });

  // --- Clearable ---
  it("shows clear button when clearable and has value (controlled)", () => {
    render(<TextField label="Test" clearable value="hello" onChange={() => {}} />);
    expect(screen.getByLabelText("Clear input")).toBeInTheDocument();
  });

  it("hides clear button when clearable and empty (controlled)", () => {
    render(<TextField label="Test" clearable value="" onChange={() => {}} />);
    expect(screen.queryByLabelText("Clear input")).not.toBeInTheDocument();
  });

  it("clicking clear empties value (controlled)", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onClear = vi.fn();
    render(<TextField label="Test" clearable value="hello" onChange={onChange} onClear={onClear} />);
    await user.click(screen.getByLabelText("Clear input"));
    expect(onClear).toHaveBeenCalledOnce();
  });

  it("clicking clear empties value (uncontrolled)", async () => {
    const user = userEvent.setup();
    render(<TextField label="Test" clearable defaultValue="hello" />);
    expect(screen.getByLabelText("Clear input")).toBeInTheDocument();
    await user.click(screen.getByLabelText("Clear input"));
    expect(screen.getByLabelText("Test")).toHaveValue("");
  });

  it("focus returns to input after clear", async () => {
    const user = userEvent.setup();
    render(<TextField label="Test" clearable defaultValue="hello" />);
    await user.click(screen.getByLabelText("Clear input"));
    expect(screen.getByLabelText("Test")).toHaveFocus();
  });

  it("does not show clear button when disabled", () => {
    render(<TextField label="Test" clearable value="hello" onChange={() => {}} disabled />);
    expect(screen.queryByLabelText("Clear input")).not.toBeInTheDocument();
  });

  it("does not show clear button when readOnly", () => {
    render(<TextField label="Test" clearable value="hello" onChange={() => {}} readOnly />);
    expect(screen.queryByLabelText("Clear input")).not.toBeInTheDocument();
  });

  // --- Error state ---
  it("renders errorMessage with role='alert'", () => {
    render(<TextField label="Test" errorMessage="Required field" />);
    expect(screen.getByRole("alert")).toHaveTextContent("Required field");
  });

  it("sets aria-invalid on input when errorMessage present", () => {
    render(<TextField label="Test" errorMessage="Bad value" />);
    expect(screen.getByLabelText("Test")).toHaveAttribute("aria-invalid", "true");
  });

  it("errorMessage replaces helperText", () => {
    render(<TextField label="Test" helperText="Enter email" errorMessage="Invalid" />);
    expect(screen.getByRole("alert")).toHaveTextContent("Invalid");
    expect(screen.queryByText("Enter email")).not.toBeInTheDocument();
  });

  // --- Helper text ---
  it("renders helper text", () => {
    render(<TextField label="Test" helperText="Enter your name" />);
    expect(screen.getByText("Enter your name")).toBeInTheDocument();
  });

  it("aria-describedby points to helper text", () => {
    render(<TextField label="Test" helperText="Help" />);
    const input = screen.getByLabelText("Test");
    const describedby = input.getAttribute("aria-describedby");
    expect(describedby).toBeTruthy();
    expect(document.getElementById(describedby!)).toHaveTextContent("Help");
  });

  it("aria-describedby points to error message when present", () => {
    render(<TextField label="Test" errorMessage="Error" />);
    const input = screen.getByLabelText("Test");
    const describedby = input.getAttribute("aria-describedby");
    expect(describedby).toBeTruthy();
    expect(document.getElementById(describedby!)!.textContent).toContain("Error");
  });

  // --- Required ---
  it("shows asterisk when required", () => {
    render(<TextField label="Email" required />);
    const label = screen.getByText("Email").closest("label")!;
    expect(label.querySelector("[aria-hidden='true']")).toHaveTextContent("*");
  });

  it("sets aria-required on input when required", () => {
    render(<TextField label="Email" required />);
    expect(screen.getByLabelText(/Email/)).toHaveAttribute("aria-required", "true");
  });

  // --- ReadOnly ---
  it("sets readOnly attribute on input", () => {
    render(<TextField label="Test" readOnly />);
    expect(screen.getByLabelText("Test")).toHaveAttribute("readonly");
  });

  // --- Disabled ---
  it("sets disabled attribute on input", () => {
    render(<TextField label="Test" disabled />);
    expect(screen.getByLabelText("Test")).toBeDisabled();
  });

  // --- forwardRef ---
  it("forwards ref to input element", () => {
    const ref = createRef<HTMLInputElement>();
    render(<TextField ref={ref} label="Test" />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
    expect(ref.current).toBe(screen.getByLabelText("Test"));
  });

  // --- className ---
  it("applies custom className on wrapper", () => {
    const { container } = render(<TextField label="Test" className="custom-wrapper" />);
    expect(container.firstChild).toHaveClass("custom-wrapper");
  });

  it("applies inputClassName on input element", () => {
    render(<TextField label="Test" inputClassName="custom-input" />);
    expect(screen.getByLabelText("Test")).toHaveClass("custom-input");
  });

  // --- Spreads HTML attributes ---
  it("spreads HTML attributes to input", () => {
    render(<TextField label="Test" placeholder="Enter text" type="email" data-testid="my-input" />);
    const input = screen.getByLabelText("Test");
    expect(input).toHaveAttribute("placeholder", "Enter text");
    expect(input).toHaveAttribute("type", "email");
    expect(input).toHaveAttribute("data-testid", "my-input");
  });

  // --- Focus/blur toggle ---
  it("toggles focused class on container on focus/blur", async () => {
    const user = userEvent.setup();
    render(<TextField label="Test" />);
    const input = screen.getByLabelText("Test");
    const container = input.closest("[class*='input_container']")!;

    await user.click(input);
    expect(container).toHaveClass("focused");

    await user.tab();
    expect(container).not.toHaveClass("focused");
  });
});
