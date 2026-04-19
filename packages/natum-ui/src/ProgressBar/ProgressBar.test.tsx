import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { createRef } from "react";
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

describe("ProgressBar — size + color", () => {
  it.each(["sm", "md", "lg"] as const)(
    "sets data-size=%s",
    (size) => {
      render(<ProgressBar value={0.5} size={size} aria-label="Loading" />);
      expect(screen.getByRole("progressbar")).toHaveAttribute(
        "data-size",
        size,
      );
    },
  );

  it("defaults data-size to 'md'", () => {
    render(<ProgressBar value={0.5} aria-label="Loading" />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("data-size", "md");
  });

  it.each(["primary", "success", "error", "warning", "info"] as const)(
    "sets data-color=%s",
    (color) => {
      render(
        <ProgressBar value={0.5} color={color} aria-label="Loading" />,
      );
      expect(screen.getByRole("progressbar")).toHaveAttribute(
        "data-color",
        color,
      );
    },
  );

  it("defaults data-color to 'primary'", () => {
    render(<ProgressBar value={0.5} aria-label="Loading" />);
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "data-color",
      "primary",
    );
  });

  it("merges className onto the root", () => {
    render(
      <ProgressBar
        value={0.5}
        className="custom-bar"
        aria-label="Loading"
      />,
    );
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveClass("custom-bar");
  });
});

describe("ProgressBar — a11y dev warning", () => {
  it("warns in dev when neither aria-label nor aria-labelledby is provided", () => {
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(<ProgressBar value={0.5} />);
    expect(spy).toHaveBeenCalledWith(
      expect.stringContaining("ProgressBar:"),
    );
    spy.mockRestore();
  });

  it("does not warn when aria-label is provided", () => {
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(<ProgressBar value={0.5} aria-label="Loading" />);
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it("does not warn when aria-labelledby is provided", () => {
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(<ProgressBar value={0.5} aria-labelledby="external-label" />);
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });
});

describe("ProgressBar — rest-spread + ref", () => {
  it("forwards ref to the root div", () => {
    const ref = createRef<HTMLDivElement>();
    render(<ProgressBar value={0.5} ref={ref} aria-label="Loading" />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toHaveAttribute("role", "progressbar");
  });

  it("managed role wins over a consumer-supplied role via rest spread", () => {
    render(
      <ProgressBar
        value={0.5}
        aria-label="Loading"
        // @ts-expect-error — deliberately bypass Omit to assert runtime
        role="button"
      />,
    );
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("passes through arbitrary data attributes", () => {
    render(
      <ProgressBar
        value={0.5}
        aria-label="Loading"
        data-testid="my-bar"
      />,
    );
    expect(screen.getByTestId("my-bar")).toHaveAttribute(
      "role",
      "progressbar",
    );
  });
});
