import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DropZone } from "./DropZone";

describe("DropZone — base rendering", () => {
  it("renders default label + hidden file input", () => {
    render(<DropZone onFilesSelected={vi.fn()} />);
    expect(
      screen.getByText(/drag files here or click to browse/i)
    ).toBeInTheDocument();
    const region = screen.getByRole("button", { name: /upload files/i });
    expect(region.getAttribute("tabindex")).toBe("0");
    const input = region.querySelector("input[type='file']");
    expect(input).not.toBeNull();
  });

  it("custom children replace default content", () => {
    render(
      <DropZone onFilesSelected={vi.fn()}>
        <span data-testid="custom">My Label</span>
      </DropZone>
    );
    expect(screen.getByTestId("custom")).toBeInTheDocument();
    expect(
      screen.queryByText(/drag files here or click to browse/i)
    ).not.toBeInTheDocument();
  });

  it("forwards accept + multiple to input", () => {
    render(
      <DropZone
        onFilesSelected={vi.fn()}
        accept="image/*"
        multiple={false}
      />
    );
    const input = screen.getByRole("button", { name: /upload files/i })
      .querySelector("input") as HTMLInputElement;
    expect(input.accept).toBe("image/*");
    expect(input.multiple).toBe(false);
  });

  it("multiple defaults to true", () => {
    render(<DropZone onFilesSelected={vi.fn()} />);
    const input = screen.getByRole("button", { name: /upload files/i })
      .querySelector("input") as HTMLInputElement;
    expect(input.multiple).toBe(true);
  });
});

describe("DropZone — click + keyboard", () => {
  it("clicking the region triggers the file picker (via input.click)", async () => {
    render(<DropZone onFilesSelected={vi.fn()} />);
    const region = screen.getByRole("button", { name: /upload files/i });
    const input = region.querySelector("input") as HTMLInputElement;
    const spy = vi.spyOn(input, "click");

    await userEvent.click(region);
    expect(spy).toHaveBeenCalled();
  });

  it("Enter + Space trigger the file picker; Space prevents scroll", async () => {
    render(<DropZone onFilesSelected={vi.fn()} />);
    const region = screen.getByRole("button", { name: /upload files/i });
    const input = region.querySelector("input") as HTMLInputElement;
    const spy = vi.spyOn(input, "click");

    region.focus();
    await userEvent.keyboard("{Enter}");
    expect(spy).toHaveBeenCalledTimes(1);

    await userEvent.keyboard(" ");
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it("input change calls onFilesSelected with a File[] and resets value", () => {
    const onFilesSelected = vi.fn();
    render(<DropZone onFilesSelected={onFilesSelected} />);
    const input = screen
      .getByRole("button", { name: /upload files/i })
      .querySelector("input") as HTMLInputElement;
    const file = new File(["x"], "a.txt", { type: "text/plain" });

    Object.defineProperty(input, "files", {
      configurable: true,
      value: [file],
    });
    fireEvent.change(input);

    expect(onFilesSelected).toHaveBeenCalledWith([file]);
    expect(input.value).toBe("");
  });
});

describe("DropZone — disabled", () => {
  it("sets aria-disabled + tabIndex -1 + does not trigger picker", async () => {
    const onFilesSelected = vi.fn();
    render(<DropZone onFilesSelected={onFilesSelected} disabled />);
    const region = screen.getByRole("button", { name: /upload files/i });
    expect(region.getAttribute("aria-disabled")).toBe("true");
    expect(region.getAttribute("tabindex")).toBe("-1");

    const input = region.querySelector("input") as HTMLInputElement;
    expect(input.disabled).toBe(true);

    const spy = vi.spyOn(input, "click");
    await userEvent.click(region);
    expect(spy).not.toHaveBeenCalled();
  });

  it("data-state is 'disabled' when disabled is true", () => {
    render(<DropZone onFilesSelected={vi.fn()} disabled />);
    const region = screen.getByRole("button", { name: /upload files/i });
    expect(region.getAttribute("data-state")).toBe("disabled");
  });
});

describe("DropZone — aria-label override", () => {
  it("consumer-supplied aria-label wins", () => {
    render(
      <DropZone onFilesSelected={vi.fn()} aria-label="Drop your resume" />
    );
    expect(
      screen.getByRole("button", { name: /drop your resume/i })
    ).toBeInTheDocument();
  });
});

describe("DropZone — drag", () => {
  const makeFile = (name = "a.txt") =>
    new File(["x"], name, { type: "text/plain" });
  const makeDT = (files: File[]) =>
    ({ files, types: files.length > 0 ? ["Files"] : [] } as unknown as DataTransfer);

  it("applies data-state=\"dragover\" on dragenter with Files", () => {
    render(<DropZone onFilesSelected={vi.fn()} />);
    const region = screen.getByRole("button", { name: /upload files/i });
    const files = [makeFile()];

    fireEvent.dragEnter(region, { dataTransfer: makeDT(files) });
    expect(region.getAttribute("data-state")).toBe("dragover");
  });

  it("onDrop calls onFilesSelected + clears dragover", () => {
    const onFilesSelected = vi.fn();
    render(<DropZone onFilesSelected={onFilesSelected} />);
    const region = screen.getByRole("button", { name: /upload files/i });
    const files = [makeFile("b.txt")];

    fireEvent.dragEnter(region, { dataTransfer: makeDT(files) });
    fireEvent.drop(region, { dataTransfer: makeDT(files) });

    expect(onFilesSelected).toHaveBeenCalledWith(files);
    expect(region.getAttribute("data-state")).toBe("idle");
  });

  it("non-file drag does not toggle dragover", () => {
    render(<DropZone onFilesSelected={vi.fn()} />);
    const region = screen.getByRole("button", { name: /upload files/i });
    fireEvent.dragEnter(region, {
      dataTransfer: {
        files: [],
        types: ["text/plain"],
      } as unknown as DataTransfer,
    });
    expect(region.getAttribute("data-state")).toBe("idle");
  });

  it("disabled short-circuits drag", () => {
    const onFilesSelected = vi.fn();
    render(<DropZone onFilesSelected={onFilesSelected} disabled />);
    const region = screen.getByRole("button", { name: /upload files/i });
    const files = [makeFile()];
    fireEvent.dragEnter(region, { dataTransfer: makeDT(files) });
    expect(region.getAttribute("data-state")).toBe("disabled");
    fireEvent.drop(region, { dataTransfer: makeDT(files) });
    expect(onFilesSelected).not.toHaveBeenCalled();
  });
});
