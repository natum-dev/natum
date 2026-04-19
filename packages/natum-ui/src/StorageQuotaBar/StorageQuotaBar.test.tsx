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
