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
