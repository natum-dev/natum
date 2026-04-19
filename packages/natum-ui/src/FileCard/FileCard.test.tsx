import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
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

describe("FileCard — action slot", () => {
  it("renders the action slot when provided", () => {
    render(
      <FileCard
        icon={IconFile}
        name="x.pdf"
        action={<button data-testid="act">⋮</button>}
      />
    );
    expect(screen.getByTestId("act")).toBeInTheDocument();
  });

  it("omits the action slot wrapper from the DOM when action is absent", () => {
    const { container } = render(<FileCard icon={IconFile} name="x.pdf" />);
    expect(container.querySelector('[class*="action_slot"]')).toBeNull();
  });

  it("clicking inside the action slot does not bubble to card onClick", async () => {
    const onClick = vi.fn();
    const onActionClick = vi.fn();
    render(
      <FileCard
        icon={IconFile}
        name="x.pdf"
        onClick={onClick}
        action={<button data-testid="act" onClick={onActionClick}>⋮</button>}
      />
    );
    await userEvent.click(screen.getByTestId("act"));
    expect(onActionClick).toHaveBeenCalledTimes(1);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("double-clicking inside the action slot does not bubble to card onDoubleClick", async () => {
    const onDoubleClick = vi.fn();
    render(
      <FileCard
        icon={IconFile}
        name="x.pdf"
        onClick={() => {}}
        onDoubleClick={onDoubleClick}
        action={<button data-testid="act">⋮</button>}
      />
    );
    await userEvent.dblClick(screen.getByTestId("act"));
    expect(onDoubleClick).not.toHaveBeenCalled();
  });
});

describe("FileCard — interaction", () => {
  it("does not set role/tabIndex when onClick is absent", () => {
    const { container } = render(<FileCard icon={IconFile} name="x.pdf" />);
    const root = container.firstElementChild as HTMLElement;
    expect(root).not.toHaveAttribute("role");
    expect(root).not.toHaveAttribute("tabIndex");
  });

  it("sets role='button' and tabIndex=0 when onClick is wired", () => {
    const { container } = render(
      <FileCard icon={IconFile} name="x.pdf" onClick={() => {}} />
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveAttribute("role", "button");
    expect(root).toHaveAttribute("tabIndex", "0");
  });

  it("fires onClick on click", async () => {
    const onClick = vi.fn();
    render(<FileCard icon={IconFile} name="x.pdf" onClick={onClick} />);
    await userEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("fires onDoubleClick on dblclick", async () => {
    const onDoubleClick = vi.fn();
    render(
      <FileCard
        icon={IconFile}
        name="x.pdf"
        onClick={() => {}}
        onDoubleClick={onDoubleClick}
      />
    );
    await userEvent.dblClick(screen.getByRole("button"));
    expect(onDoubleClick).toHaveBeenCalledTimes(1);
  });

  it("fires onClick on Enter when focused", async () => {
    const onClick = vi.fn();
    render(<FileCard icon={IconFile} name="x.pdf" onClick={onClick} />);
    const root = screen.getByRole("button");
    root.focus();
    await userEvent.keyboard("{Enter}");
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("fires onClick on Space when focused and preventDefaults the space", () => {
    const onClick = vi.fn();
    render(<FileCard icon={IconFile} name="x.pdf" onClick={onClick} />);
    const root = screen.getByRole("button");
    root.focus();
    // fireEvent.keyDown returns `false` if any listener called preventDefault.
    const wasNotPrevented = fireEvent.keyDown(root, { key: " " });
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(wasNotPrevented).toBe(false);
  });
});

describe("FileCard — selection", () => {
  it("does not render the checkbox when onSelectedChange is absent", () => {
    render(<FileCard icon={IconFile} name="x.pdf" selected />);
    expect(
      screen.queryByRole("checkbox", { name: /select/i })
    ).not.toBeInTheDocument();
  });

  it("renders a selection checkbox when onSelectedChange is wired", () => {
    render(
      <FileCard
        icon={IconFile}
        name="x.pdf"
        selected={false}
        onSelectedChange={() => {}}
      />
    );
    expect(
      screen.getByRole("checkbox", { name: "Select x.pdf" })
    ).toBeInTheDocument();
  });

  it("sets data-selected='true' when selected is true", () => {
    const { container } = render(
      <FileCard
        icon={IconFile}
        name="x.pdf"
        selected
        onSelectedChange={() => {}}
      />
    );
    expect(container.firstElementChild).toHaveAttribute(
      "data-selected",
      "true"
    );
  });

  it("sets aria-pressed when focusable AND selectable", () => {
    const { container } = render(
      <FileCard
        icon={IconFile}
        name="x.pdf"
        selected
        onSelectedChange={() => {}}
        onClick={() => {}}
      />
    );
    expect(container.firstElementChild).toHaveAttribute(
      "aria-pressed",
      "true"
    );
  });

  it("does not set aria-pressed when focusable but NOT selectable", () => {
    const { container } = render(
      <FileCard icon={IconFile} name="x.pdf" onClick={() => {}} />
    );
    expect(container.firstElementChild).not.toHaveAttribute("aria-pressed");
  });

  it("calling checkbox fires onSelectedChange with the opposite of current selected", async () => {
    const onSelectedChange = vi.fn();
    render(
      <FileCard
        icon={IconFile}
        name="x.pdf"
        selected={false}
        onSelectedChange={onSelectedChange}
      />
    );
    await userEvent.click(screen.getByRole("checkbox", { name: /select/i }));
    expect(onSelectedChange).toHaveBeenCalledWith(true);
  });

  it("clicking the checkbox does not fire card onClick", async () => {
    const onClick = vi.fn();
    const onSelectedChange = vi.fn();
    render(
      <FileCard
        icon={IconFile}
        name="x.pdf"
        selected={false}
        onSelectedChange={onSelectedChange}
        onClick={onClick}
      />
    );
    await userEvent.click(screen.getByRole("checkbox", { name: /select/i }));
    expect(onSelectedChange).toHaveBeenCalledTimes(1);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("library-managed data-selected wins over a consumer-supplied data-selected via rest", () => {
    const { container } = render(
      <FileCard
        icon={IconFile}
        name="x.pdf"
        selected
        onSelectedChange={() => {}}
        // @ts-expect-error consumers shouldn't typically do this, but the
        // library must protect its managed visual state anyway.
        data-selected="false"
      />
    );
    expect(container.firstElementChild).toHaveAttribute(
      "data-selected",
      "true"
    );
  });
});

describe("FileCard — aria-label", () => {
  it("falls back to name when no aria-label is supplied", () => {
    const { container } = render(
      <FileCard icon={IconFile} name="report.pdf" />
    );
    expect(container.firstElementChild).toHaveAttribute(
      "aria-label",
      "report.pdf"
    );
  });

  it("consumer-supplied aria-label wins over name fallback", () => {
    const { container } = render(
      <FileCard
        icon={IconFile}
        name="report.pdf"
        aria-label="Annual Report Q4 2026"
      />
    );
    expect(container.firstElementChild).toHaveAttribute(
      "aria-label",
      "Annual Report Q4 2026"
    );
  });
});

describe("FileCard — pass-through and RTL", () => {
  it("merges className onto the root", () => {
    const { container } = render(
      <FileCard icon={IconFile} name="x.pdf" className="my-card" />
    );
    expect(container.firstElementChild).toHaveClass("my-card");
  });

  it("spreads id and data-* attributes to the root", () => {
    const { container } = render(
      <FileCard
        icon={IconFile}
        name="x.pdf"
        id="file-1"
        data-test="yes"
      />
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveAttribute("id", "file-1");
    expect(root).toHaveAttribute("data-test", "yes");
  });

  it("does not render action/checkbox slots on the physical right/left in RTL (logical props)", () => {
    // Smoke test — we assert that the slots exist with their class names.
    // Physical-side rendering under RTL is a CSS concern; this proves the
    // elements are present and positioned via the logical class (jsdom
    // doesn't compute logical-property mirror; real-browser verification
    // is covered by Storybook).
    const { container } = render(
      <div dir="rtl">
        <FileCard
          icon={IconFile}
          name="x.pdf"
          onSelectedChange={() => {}}
          action={<button>⋮</button>}
        />
      </div>
    );
    expect(container.querySelector('[class*="checkbox_slot"]')).toBeTruthy();
    expect(container.querySelector('[class*="action_slot"]')).toBeTruthy();
  });
});
