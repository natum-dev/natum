import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { StorageQuotaBar } from "./StorageQuotaBar";

// Binary gibibyte — formatFileSize uses 1024-based division (see src/utils/format-size.ts).
const GB = 1024 ** 3;

describe("StorageQuotaBar — default labels", () => {
  it("renders the primary label as 'used of total' via formatFileSize", () => {
    render(<StorageQuotaBar used={12.4 * GB} total={15 * GB} />);
    expect(screen.getByText("12.4 GB of 15.0 GB")).toBeInTheDocument();
  });

  it("renders the secondary label as rounded percent", () => {
    render(<StorageQuotaBar used={12.4 * GB} total={15 * GB} />);
    expect(screen.getByText("83%")).toBeInTheDocument();
  });

  it("composes ProgressBar inside with forwarded size=md by default", () => {
    render(<StorageQuotaBar used={6 * GB} total={15 * GB} />);
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("data-size", "md");
    expect(bar).toHaveAttribute("aria-valuenow", "40");
  });
});

describe("StorageQuotaBar — threshold state", () => {
  it("renders data-state='ok' below warnAt (default 0.9)", () => {
    const { container } = render(
      <StorageQuotaBar used={8 * GB} total={15 * GB} />,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveAttribute("data-state", "ok");
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "data-color",
      "primary",
    );
  });

  it("renders data-state='warn' at or above warnAt", () => {
    const { container } = render(
      <StorageQuotaBar used={13.5 * GB} total={15 * GB} />,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveAttribute("data-state", "warn");
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "data-color",
      "warning",
    );
  });

  it("renders data-state='error' at or above errorAt (default 1.0)", () => {
    const { container } = render(
      <StorageQuotaBar used={15 * GB} total={15 * GB} />,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveAttribute("data-state", "error");
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "data-color",
      "error",
    );
  });

  it("honors custom warnAt=0.75 and errorAt=0.95", () => {
    const { container, rerender } = render(
      <StorageQuotaBar
        used={12 * GB}
        total={15 * GB}
        warnAt={0.75}
        errorAt={0.95}
      />,
    );
    expect(container.firstElementChild).toHaveAttribute(
      "data-state",
      "warn",
    );

    rerender(
      <StorageQuotaBar
        used={14.5 * GB}
        total={15 * GB}
        warnAt={0.75}
        errorAt={0.95}
      />,
    );
    expect(container.firstElementChild).toHaveAttribute(
      "data-state",
      "error",
    );
  });
});

describe("StorageQuotaBar — over quota", () => {
  it("shows true percent label > 100 while clamping aria-valuenow to 100", () => {
    const { container } = render(
      <StorageQuotaBar used={16 * GB} total={15 * GB} />,
    );
    expect(screen.getByText("107%")).toBeInTheDocument();
    expect(container.firstElementChild).toHaveAttribute(
      "data-state",
      "error",
    );
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "100",
    );
  });

  it("renders primary label with true bytes even when over quota", () => {
    render(<StorageQuotaBar used={16 * GB} total={15 * GB} />);
    expect(screen.getByText("16.0 GB of 15.0 GB")).toBeInTheDocument();
  });
});

describe("StorageQuotaBar — invalid inputs", () => {
  it("warns and renders 0% when total is 0", () => {
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(<StorageQuotaBar used={5 * GB} total={0} />);
    expect(spy).toHaveBeenCalledWith(
      expect.stringContaining("total must be > 0"),
    );
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "0",
    );
    spy.mockRestore();
  });

  it("silently clamps negative used to 0 without warning", () => {
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(<StorageQuotaBar used={-1000} total={15 * GB} />);
    expect(spy).not.toHaveBeenCalled();
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "0",
    );
    spy.mockRestore();
  });

  it("warns and renders 0% when used is NaN", () => {
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(<StorageQuotaBar used={Number.NaN} total={15 * GB} />);
    expect(spy).toHaveBeenCalledWith(
      expect.stringContaining("used must be finite"),
    );
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "0",
    );
    spy.mockRestore();
  });
});

describe("StorageQuotaBar — slot overrides", () => {
  it("renders a custom primary label when `label` is provided", () => {
    render(
      <StorageQuotaBar
        used={5 * GB}
        total={15 * GB}
        label="Media usage"
      />,
    );
    expect(screen.getByText("Media usage")).toBeInTheDocument();
    // Default primary would be "5.00 GB of 15.0 GB" — assert it is NOT rendered.
    expect(screen.queryByText("5.00 GB of 15.0 GB")).toBeNull();
  });

  it("renders a custom secondary label when `valueLabel` is provided", () => {
    render(
      <StorageQuotaBar
        used={12.4 * GB}
        total={15 * GB}
        valueLabel="2.6 GB left"
      />,
    );
    expect(screen.getByText("2.6 GB left")).toBeInTheDocument();
    expect(screen.queryByText("83%")).toBeNull();
  });
});

describe("StorageQuotaBar — accessibility", () => {
  it("applies default aria-label='Storage quota' on the root group", () => {
    render(<StorageQuotaBar used={5 * GB} total={15 * GB} />);
    expect(screen.getByRole("group")).toHaveAttribute(
      "aria-label",
      "Storage quota",
    );
  });

  it("omits the default aria-label when aria-labelledby is supplied", () => {
    render(
      <>
        <span id="external-q">Quota</span>
        <StorageQuotaBar
          used={5 * GB}
          total={15 * GB}
          aria-labelledby="external-q"
        />
      </>,
    );
    const group = screen.getByRole("group");
    expect(group).toHaveAttribute("aria-labelledby", "external-q");
    expect(group).not.toHaveAttribute("aria-label");
  });

  it("points the inner progressbar aria-labelledby at the primary label id", () => {
    render(<StorageQuotaBar used={5 * GB} total={15 * GB} />);
    const bar = screen.getByRole("progressbar");
    const labelledByRaw = bar.getAttribute("aria-labelledby");
    expect(labelledByRaw).toBeTruthy();
    const labelledBy = labelledByRaw as string;
    const labelEl = document.getElementById(labelledBy);
    expect(labelEl).toBeTruthy();
    // formatFileSize(5*GB) → "5.00 GB" (2 decimals below 10 GB); formatFileSize(15*GB) → "15.0 GB".
    expect(labelEl?.textContent).toBe("5.00 GB of 15.0 GB");
  });

  it("generates a unique id per instance via useId", () => {
    render(
      <>
        <StorageQuotaBar used={1 * GB} total={15 * GB} />
        <StorageQuotaBar used={2 * GB} total={15 * GB} />
      </>,
    );
    const [a, b] = screen.getAllByRole("progressbar");
    expect(a.getAttribute("aria-labelledby")).not.toBe(
      b.getAttribute("aria-labelledby"),
    );
  });
});

describe("StorageQuotaBar — size passthrough", () => {
  it.each(["sm", "md", "lg"] as const)(
    "forwards size=%s to the inner ProgressBar",
    (size) => {
      render(
        <StorageQuotaBar used={5 * GB} total={15 * GB} size={size} />,
      );
      expect(screen.getByRole("progressbar")).toHaveAttribute(
        "data-size",
        size,
      );
    },
  );
});

describe("StorageQuotaBar — rest-spread + ref", () => {
  it("forwards ref to the root div", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <StorageQuotaBar ref={ref} used={5 * GB} total={15 * GB} />,
    );
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toHaveAttribute("role", "group");
  });

  it("passes through arbitrary data attributes", () => {
    render(
      <StorageQuotaBar
        used={5 * GB}
        total={15 * GB}
        data-testid="quota"
      />,
    );
    expect(screen.getByTestId("quota")).toHaveAttribute("role", "group");
  });
});
