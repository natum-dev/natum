import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { IconFile } from "@natum/icons";
import { FileCard } from "./FileCard";

describe("FileCard — minimal render", () => {
  it("renders the name as text", () => {
    render(<FileCard icon={IconFile} name="report.pdf" />);
    expect(screen.getByText("report.pdf")).toBeInTheDocument();
  });

  it("applies a title attribute equal to the name for truncated-name hover", () => {
    render(<FileCard icon={IconFile} name="really-long-filename.pdf" />);
    const name = screen.getByText("really-long-filename.pdf");
    expect(name).toHaveAttribute("title", "really-long-filename.pdf");
  });

  it("renders the icon when no thumbnail is provided (data-has-thumbnail is 'false')", () => {
    const { container } = render(
      <FileCard icon={IconFile} name="x.pdf" />
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveAttribute("data-has-thumbnail", "false");
    expect(root.querySelector("svg")).toBeTruthy();
  });
});

describe("FileCard — thumbnail vs icon mutual exclusion", () => {
  it("renders thumbnail when provided and omits the icon from the DOM", () => {
    const { container } = render(
      <FileCard
        icon={IconFile}
        thumbnail={<img src="/test.png" alt="test" data-testid="thumb" />}
        name="image.png"
      />
    );
    expect(screen.getByTestId("thumb")).toBeInTheDocument();
    // icon is not rendered at all — no svg anywhere inside the preview
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveAttribute("data-has-thumbnail", "true");
    expect(root.querySelector("svg")).toBeNull();
  });

  it("renders the icon when thumbnail is absent", () => {
    const { container } = render(
      <FileCard icon={IconFile} name="x.pdf" />
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveAttribute("data-has-thumbnail", "false");
    expect(root.querySelector("svg")).toBeTruthy();
  });
});

describe("FileCard — sizes", () => {
  it.each(["sm", "md", "lg"] as const)(
    "applies data-size='%s'",
    (size) => {
      const { container } = render(
        <FileCard icon={IconFile} name="x.pdf" size={size} />
      );
      const root = container.firstElementChild as HTMLElement;
      expect(root).toHaveAttribute("data-size", size);
    }
  );

  it("defaults data-size to 'md'", () => {
    const { container } = render(<FileCard icon={IconFile} name="x.pdf" />);
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveAttribute("data-size", "md");
  });

  it("renders icon at 32px when size='sm'", () => {
    const { container } = render(
      <FileCard icon={IconFile} name="x.pdf" size="sm" />
    );
    const svg = container.querySelector("svg")!;
    expect(svg.getAttribute("width")).toBe("32");
  });

  it("renders icon at 56px when size='lg'", () => {
    const { container } = render(
      <FileCard icon={IconFile} name="x.pdf" size="lg" />
    );
    const svg = container.querySelector("svg")!;
    expect(svg.getAttribute("width")).toBe("56");
  });
});

describe("FileCard — meta slot", () => {
  it("renders the meta ReactNode when provided", () => {
    render(
      <FileCard
        icon={IconFile}
        name="x.pdf"
        meta={<span data-testid="meta">2.4 MB · 2d ago</span>}
      />
    );
    expect(screen.getByTestId("meta")).toHaveTextContent("2.4 MB · 2d ago");
  });

  it("omits the meta row from the DOM when meta is absent", () => {
    const { container } = render(<FileCard icon={IconFile} name="x.pdf" />);
    expect(container.querySelector('[class*="meta_line"]')).toBeNull();
  });
});
