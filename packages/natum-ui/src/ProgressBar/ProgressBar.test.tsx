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

describe("ProgressBar — value clamping", () => {
  it("clamps value < 0 to 0", () => {
    const { container } = render(
      <ProgressBar value={-0.5} aria-label="Loading" />
    );
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuenow", "0");
    const fill = container.querySelector("span") as HTMLElement;
    expect(fill.style.inlineSize).toBe("0%");
  });

  it("clamps value > 1 to 100", () => {
    const { container } = render(
      <ProgressBar value={1.5} aria-label="Loading" />
    );
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuenow", "100");
    const fill = container.querySelector("span") as HTMLElement;
    expect(fill.style.inlineSize).toBe("100%");
  });

  it("rounds aria-valuenow from fractional percents", () => {
    render(<ProgressBar value={0.333} aria-label="Loading" />);
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "33",
    );
  });
});

describe("ProgressBar — non-finite falls back to indeterminate", () => {
  it("treats value=NaN as indeterminate", () => {
    render(<ProgressBar value={Number.NaN} aria-label="Loading" />);
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("data-indeterminate", "true");
    expect(bar).not.toHaveAttribute("aria-valuenow");
  });

  it("treats value=Infinity as indeterminate", () => {
    render(
      <ProgressBar value={Number.POSITIVE_INFINITY} aria-label="Loading" />,
    );
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("data-indeterminate", "true");
    expect(bar).not.toHaveAttribute("aria-valuenow");
  });
});

describe("ProgressBar — indeterminate", () => {
  it("sets data-indeterminate='true' when value is undefined", () => {
    render(<ProgressBar aria-label="Loading" />);
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "data-indeterminate",
      "true",
    );
  });

  it("omits aria-valuenow when indeterminate", () => {
    render(<ProgressBar aria-label="Loading" />);
    expect(screen.getByRole("progressbar")).not.toHaveAttribute(
      "aria-valuenow",
    );
  });

  it("does not apply an inline style on the fill when indeterminate", () => {
    const { container } = render(<ProgressBar aria-label="Loading" />);
    const fill = container.querySelector("span") as HTMLElement;
    expect(fill.getAttribute("style")).toBeNull();
  });
});
