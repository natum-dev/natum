import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { act, fireEvent, render } from "@testing-library/react";
import { DropZoneOverlay } from "./DropZoneOverlay";

const makeFile = (name = "a.txt", type = "text/plain") =>
  new File(["x"], name, { type });

const fireDocDrag = (
  type: "dragenter" | "dragover" | "dragleave" | "drop",
  files: File[]
) => {
  const event = new Event(type, { bubbles: true, cancelable: true });
  Object.defineProperty(event, "dataTransfer", {
    value: {
      files,
      types: files.length > 0 ? ["Files"] : [],
    },
  });
  document.dispatchEvent(event);
  return event;
};

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  vi.runAllTimers();
  vi.useRealTimers();
});

describe("DropZoneOverlay — activation", () => {
  it("shows on document dragenter with Files", () => {
    render(<DropZoneOverlay onFilesDropped={vi.fn()} />);
    expect(document.querySelector("[role='dialog']")).toBeNull();

    act(() => {
      fireDocDrag("dragenter", [makeFile()]);
    });
    const dialog = document.querySelector("[role='dialog']");
    expect(dialog).not.toBeNull();
    expect(dialog?.getAttribute("aria-label")).toBe("Drop files to upload");
  });

  it("ignores non-file drag", () => {
    render(<DropZoneOverlay onFilesDropped={vi.fn()} />);
    const event = new Event("dragenter", { bubbles: true, cancelable: true });
    Object.defineProperty(event, "dataTransfer", {
      value: { files: [], types: ["text/plain"] },
    });
    act(() => {
      document.dispatchEvent(event);
    });
    expect(document.querySelector("[role='dialog']")).toBeNull();
  });

  it("dismisses on drop + calls onFilesDropped", () => {
    const onFilesDropped = vi.fn();
    render(<DropZoneOverlay onFilesDropped={onFilesDropped} />);
    const files = [makeFile("x.txt")];

    act(() => {
      fireDocDrag("dragenter", files);
    });
    expect(document.querySelector("[role='dialog']")).not.toBeNull();

    act(() => {
      fireDocDrag("drop", files);
    });
    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(onFilesDropped).toHaveBeenCalledWith(files);
    expect(document.querySelector("[role='dialog']")).toBeNull();
  });

  it("dismisses on Escape key", () => {
    render(<DropZoneOverlay onFilesDropped={vi.fn()} />);
    const files = [makeFile()];
    act(() => {
      fireDocDrag("dragenter", files);
    });
    expect(document.querySelector("[role='dialog']")).not.toBeNull();

    act(() => {
      fireEvent.keyDown(document, { key: "Escape" });
    });
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(document.querySelector("[role='dialog']")).toBeNull();
  });

  it("renders null when disabled", () => {
    render(<DropZoneOverlay onFilesDropped={vi.fn()} disabled />);
    const files = [makeFile()];
    act(() => {
      fireDocDrag("dragenter", files);
    });
    expect(document.querySelector("[role='dialog']")).toBeNull();
  });

  it("accepts custom label", () => {
    render(
      <DropZoneOverlay
        onFilesDropped={vi.fn()}
        label="Drop CSVs to import"
      />
    );
    act(() => {
      fireDocDrag("dragenter", [makeFile()]);
    });
    const dialog = document.querySelector("[role='dialog']");
    expect(dialog?.textContent).toMatch(/drop csvs to import/i);
  });
});

describe("DropZoneOverlay — accept filter", () => {
  it("rejects drop when file type doesn't match accept prefix", () => {
    const onFilesDropped = vi.fn();
    render(
      <DropZoneOverlay onFilesDropped={onFilesDropped} accept="image/*" />
    );
    const files = [makeFile("a.txt", "text/plain")];
    act(() => {
      fireDocDrag("dragenter", files);
      fireDocDrag("drop", files);
    });
    expect(onFilesDropped).not.toHaveBeenCalled();
  });

  it("accepts matching image/* type", () => {
    const onFilesDropped = vi.fn();
    render(
      <DropZoneOverlay onFilesDropped={onFilesDropped} accept="image/*" />
    );
    const files = [makeFile("a.png", "image/png")];
    act(() => {
      fireDocDrag("dragenter", files);
      fireDocDrag("drop", files);
    });
    expect(onFilesDropped).toHaveBeenCalledWith(files);
  });

  it("accepts .ext extension match", () => {
    const onFilesDropped = vi.fn();
    render(
      <DropZoneOverlay onFilesDropped={onFilesDropped} accept=".csv,.tsv" />
    );
    const files = [makeFile("data.csv", "")];
    act(() => {
      fireDocDrag("dragenter", files);
      fireDocDrag("drop", files);
    });
    expect(onFilesDropped).toHaveBeenCalledWith(files);
  });
});
