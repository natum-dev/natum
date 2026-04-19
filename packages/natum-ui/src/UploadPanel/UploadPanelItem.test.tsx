import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UploadPanelItem } from "./UploadPanelItem";
import type { UploadItem } from "../hooks/use-upload-queue";

const baseItem = (overrides: Partial<UploadItem> = {}): UploadItem => ({
  id: "1",
  file: new File(["x"], "a.txt", { type: "text/plain" }),
  name: "a.txt",
  size: 1024,
  status: "pending",
  progress: 0,
  ...overrides,
});

describe("UploadPanelItem — status rendering", () => {
  it("pending shows 'Queued' label", () => {
    render(<UploadPanelItem item={baseItem({ status: "pending" })} />);
    expect(screen.getByText(/queued/i)).toBeInTheDocument();
  });

  it("uploading shows progressbar with aria-valuenow", () => {
    render(
      <UploadPanelItem
        item={baseItem({ status: "uploading", progress: 0.42 })}
      />
    );
    const bar = screen.getByRole("progressbar");
    expect(bar.getAttribute("aria-valuenow")).toBe("42");
    expect(bar.getAttribute("aria-valuemin")).toBe("0");
    expect(bar.getAttribute("aria-valuemax")).toBe("100");
  });

  it("indeterminate progress has data-indeterminate=true and no aria-valuenow", () => {
    render(
      <UploadPanelItem
        item={baseItem({ status: "uploading", progress: undefined })}
      />
    );
    const bar = screen.getByRole("progressbar");
    expect(bar.getAttribute("data-indeterminate")).toBe("true");
    expect(bar.getAttribute("aria-valuenow")).toBeNull();
  });

  it("success renders without progressbar", () => {
    const { container } = render(
      <UploadPanelItem item={baseItem({ status: "success", progress: 1 })} />
    );
    expect(screen.queryByRole("progressbar")).toBeNull();
    // At least one SVG rendered (for the success icon)
    expect(container.querySelectorAll("svg").length).toBeGreaterThan(0);
  });

  it("error shows error message", () => {
    render(
      <UploadPanelItem
        item={baseItem({ status: "error", error: "Network failure" })}
      />
    );
    expect(screen.getByText(/network failure/i)).toBeInTheDocument();
  });
});

describe("UploadPanelItem — actions", () => {
  it("cancel button renders for pending/uploading/error; absent for success", async () => {
    const onCancel = vi.fn();
    const { rerender } = render(
      <UploadPanelItem
        item={baseItem({ status: "uploading" })}
        onCancel={onCancel}
      />
    );
    const cancel = screen.getByRole("button", { name: /cancel a\.txt/i });
    await userEvent.click(cancel);
    expect(onCancel).toHaveBeenCalledWith("1");

    rerender(
      <UploadPanelItem
        item={baseItem({ status: "success" })}
        onCancel={onCancel}
      />
    );
    expect(screen.queryByRole("button", { name: /cancel/i })).toBeNull();
  });

  it("retry button renders only on error + when onRetry is passed", async () => {
    const onRetry = vi.fn();
    const { rerender } = render(
      <UploadPanelItem
        item={baseItem({ status: "error", error: "x" })}
        onRetry={onRetry}
      />
    );
    await userEvent.click(screen.getByRole("button", { name: /retry/i }));
    expect(onRetry).toHaveBeenCalledWith("1");

    rerender(
      <UploadPanelItem item={baseItem({ status: "error", error: "x" })} />
    );
    expect(screen.queryByRole("button", { name: /retry/i })).toBeNull();
  });

  it("progressbar aria-label includes file name", () => {
    render(
      <UploadPanelItem
        item={baseItem({ status: "uploading", progress: 0.1, name: "photo.png" })}
      />
    );
    const bar = screen.getByRole("progressbar");
    expect(bar.getAttribute("aria-label")).toMatch(/photo\.png/);
  });

  it("size is formatted via formatSize", () => {
    render(<UploadPanelItem item={baseItem({ size: 1024 * 1024 })} />);
    expect(screen.getByText(/^1\.0 MB$/)).toBeInTheDocument();
  });
});
