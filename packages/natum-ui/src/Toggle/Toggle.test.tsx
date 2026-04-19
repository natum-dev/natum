import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { useState } from "react";
import { Toggle } from "./Toggle";

describe("Toggle — scaffold", () => {
  it("renders with role=switch", () => {
    render(<Toggle aria-label="Notifications" />);
    expect(screen.getByRole("switch", { name: "Notifications" })).toBeInTheDocument();
  });

  it("defaults to unchecked", () => {
    render(<Toggle aria-label="N" />);
    expect(screen.getByRole("switch")).not.toBeChecked();
  });

  it("reflects defaultChecked", () => {
    render(<Toggle defaultChecked aria-label="N" />);
    expect(screen.getByRole("switch")).toBeChecked();
  });

  it("toggles uncontrolled on click", async () => {
    const user = userEvent.setup();
    render(<Toggle aria-label="N" />);
    const sw = screen.getByRole("switch");
    await user.click(sw);
    expect(sw).toBeChecked();
    await user.click(sw);
    expect(sw).not.toBeChecked();
  });

  it("controlled: external checked drives state", () => {
    const { rerender } = render(
      <Toggle checked={false} onChange={() => {}} aria-label="N" />
    );
    expect(screen.getByRole("switch")).not.toBeChecked();
    rerender(<Toggle checked={true} onChange={() => {}} aria-label="N" />);
    expect(screen.getByRole("switch")).toBeChecked();
  });

  it("controlled: click without parent update keeps state locked", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    const Harness = () => {
      const [v] = useState(false);
      return <Toggle checked={v} onChange={handleChange} aria-label="N" />;
    };
    render(<Harness />);
    const sw = screen.getByRole("switch");
    await user.click(sw);
    expect(handleChange).toHaveBeenCalledTimes(1);
    // Parent didn't update state; input stays unchecked.
    expect(sw).not.toBeChecked();
  });

  it("Space toggles uncontrolled state", async () => {
    const user = userEvent.setup();
    render(<Toggle aria-label="N" />);
    const sw = screen.getByRole("switch");
    sw.focus();
    await user.keyboard(" ");
    expect(sw).toBeChecked();
  });

  it("forwards ref to the underlying input", () => {
    const ref = { current: null as HTMLInputElement | null };
    render(<Toggle ref={ref} aria-label="N" />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });
});
