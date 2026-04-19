import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { act, fireEvent, render, renderHook } from "@testing-library/react";
import { useRef } from "react";
import { useFileDrop } from "./use-file-drop";

const makeFile = (name = "a.txt", content = "x") =>
  new File([content], name, { type: "text/plain" });

const makeDataTransfer = (files: File[]) => {
  const dt = {
    files,
    types: files.length > 0 ? ["Files"] : [],
  };
  return dt as unknown as DataTransfer;
};

describe("useFileDrop (ref target)", () => {
  function Harness({
    onFilesDropped,
    disabled,
  }: {
    onFilesDropped: (f: File[]) => void;
    disabled?: boolean;
  }) {
    const ref = useRef<HTMLDivElement>(null);
    const { isOver, bind } = useFileDrop({
      target: ref,
      onFilesDropped,
      filesOnly: true,
      disabled,
    });
    return (
      <div ref={ref} data-testid="zone" data-over={isOver} {...bind!}>
        <span data-testid="child">child</span>
      </div>
    );
  }

  it("sets isOver on dragenter with Files and clears on drop", () => {
    const onFilesDropped = vi.fn();
    const { getByTestId } = render(
      <Harness onFilesDropped={onFilesDropped} />
    );
    const zone = getByTestId("zone");
    const files = [makeFile("a.txt")];

    fireEvent.dragEnter(zone, { dataTransfer: makeDataTransfer(files) });
    expect(zone.getAttribute("data-over")).toBe("true");

    fireEvent.drop(zone, { dataTransfer: makeDataTransfer(files) });
    expect(zone.getAttribute("data-over")).toBe("false");
    expect(onFilesDropped).toHaveBeenCalledWith(files, expect.any(Object));
  });

  it("counter balances enter/leave on nested child (no flicker)", () => {
    const { getByTestId } = render(<Harness onFilesDropped={vi.fn()} />);
    const zone = getByTestId("zone");
    const child = getByTestId("child");
    const files = [makeFile()];

    fireEvent.dragEnter(zone, { dataTransfer: makeDataTransfer(files) });
    expect(zone.getAttribute("data-over")).toBe("true");

    fireEvent.dragEnter(child, { dataTransfer: makeDataTransfer(files) });
    fireEvent.dragLeave(zone, { dataTransfer: makeDataTransfer(files) });
    expect(zone.getAttribute("data-over")).toBe("true");

    fireEvent.dragLeave(child, { dataTransfer: makeDataTransfer(files) });
    expect(zone.getAttribute("data-over")).toBe("false");
  });

  it("ignores non-Files drag when filesOnly is true", () => {
    const { getByTestId } = render(<Harness onFilesDropped={vi.fn()} />);
    const zone = getByTestId("zone");

    fireEvent.dragEnter(zone, {
      dataTransfer: { files: [], types: ["text/plain"] } as unknown as DataTransfer,
    });
    expect(zone.getAttribute("data-over")).toBe("false");
  });

  it("disabled short-circuits; no isOver, no callback", () => {
    const onFilesDropped = vi.fn();
    const { getByTestId } = render(
      <Harness onFilesDropped={onFilesDropped} disabled />
    );
    const zone = getByTestId("zone");
    const files = [makeFile()];

    fireEvent.dragEnter(zone, { dataTransfer: makeDataTransfer(files) });
    fireEvent.drop(zone, { dataTransfer: makeDataTransfer(files) });
    expect(zone.getAttribute("data-over")).toBe("false");
    expect(onFilesDropped).not.toHaveBeenCalled();
  });

  it("calls preventDefault on dragover and drop", () => {
    const { getByTestId } = render(<Harness onFilesDropped={vi.fn()} />);
    const zone = getByTestId("zone");
    const files = [makeFile()];

    const overEvent = new Event("dragover", { bubbles: true, cancelable: true });
    Object.defineProperty(overEvent, "dataTransfer", {
      value: makeDataTransfer(files),
    });
    zone.dispatchEvent(overEvent);
    expect(overEvent.defaultPrevented).toBe(true);

    const dropEvent = new Event("drop", { bubbles: true, cancelable: true });
    Object.defineProperty(dropEvent, "dataTransfer", {
      value: makeDataTransfer(files),
    });
    zone.dispatchEvent(dropEvent);
    expect(dropEvent.defaultPrevented).toBe(true);
  });
});

describe("useFileDrop (document target)", () => {
  it("attaches document listeners and cleans up on unmount", () => {
    const add = vi.spyOn(document, "addEventListener");
    const remove = vi.spyOn(document, "removeEventListener");

    const { unmount } = renderHook(() =>
      useFileDrop({
        target: "document",
        onFilesDropped: vi.fn(),
        filesOnly: true,
      })
    );

    const added = add.mock.calls.map((c) => c[0]);
    expect(added).toEqual(
      expect.arrayContaining(["dragenter", "dragover", "dragleave", "drop"])
    );

    unmount();

    const removed = remove.mock.calls.map((c) => c[0]);
    expect(removed).toEqual(
      expect.arrayContaining(["dragenter", "dragover", "dragleave", "drop"])
    );
    add.mockRestore();
    remove.mockRestore();
  });

  it("fires onFilesDropped on document drop with Files", () => {
    const onFilesDropped = vi.fn();
    renderHook(() =>
      useFileDrop({
        target: "document",
        onFilesDropped,
        filesOnly: true,
      })
    );
    const files = [makeFile("z.txt")];

    const enter = new Event("dragenter", { bubbles: true, cancelable: true });
    Object.defineProperty(enter, "dataTransfer", {
      value: makeDataTransfer(files),
    });
    act(() => {
      document.dispatchEvent(enter);
    });

    const drop = new Event("drop", { bubbles: true, cancelable: true });
    Object.defineProperty(drop, "dataTransfer", {
      value: makeDataTransfer(files),
    });
    act(() => {
      document.dispatchEvent(drop);
    });

    expect(onFilesDropped).toHaveBeenCalledWith(files, expect.any(Object));
  });

  it("disabled does not attach document listeners", () => {
    const add = vi.spyOn(document, "addEventListener");
    renderHook(() =>
      useFileDrop({
        target: "document",
        onFilesDropped: vi.fn(),
        disabled: true,
      })
    );
    const events = add.mock.calls.map((c) => c[0]);
    expect(events).not.toContain("dragenter");
    add.mockRestore();
  });
});
