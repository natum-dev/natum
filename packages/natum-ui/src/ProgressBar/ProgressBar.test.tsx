import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProgressBar } from "./ProgressBar";

describe("ProgressBar — determinate rendering", () => {
  it("renders with role='progressbar' and aria-valuemin/aria-valuemax", () => {
    render(<ProgressBar value={0.5} aria-label="Loading" />);
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuemin", "0");
    expect(bar).toHaveAttribute("aria-valuemax", "100");
  });

  it("sets aria-valuenow to the rounded percent", () => {
    render(<ProgressBar value={0.5} aria-label="Loading" />);
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "50"
    );
  });

  it("sets inline-size on the fill span matching the percent", () => {
    const { container } = render(
      <ProgressBar value={0.75} aria-label="Loading" />
    );
    const fill = container.querySelector("span") as HTMLElement;
    expect(fill.style.inlineSize).toBe("75%");
  });
});
