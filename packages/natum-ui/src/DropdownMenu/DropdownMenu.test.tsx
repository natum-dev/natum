import { render, act } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useDropdownMenuContext } from "./context";

describe("DropdownMenu context", () => {
  it("useDropdownMenuContext throws when used outside <DropdownMenu>", () => {
    const Child = () => {
      useDropdownMenuContext();
      return null;
    };

    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Child />)).toThrow(
      "useDropdownMenuContext must be used within <DropdownMenu>."
    );
    spy.mockRestore();
  });
});

import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DropdownMenu } from "./DropdownMenu";

function Probe() {
  const ctx = useDropdownMenuContext();
  return (
    <>
      <span data-testid="open">{String(ctx.open)}</span>
      <button onClick={() => ctx.setOpen(!ctx.open)}>toggle</button>
      <span data-testid="modal">{String(ctx.modal)}</span>
      <span data-testid="trigger-id">{ctx.triggerId}</span>
      <span data-testid="content-id">{ctx.contentId}</span>
    </>
  );
}

describe("DropdownMenu root", () => {
  it("renders no wrapping DOM (Fragment-only)", () => {
    const { container } = render(
      <DropdownMenu>
        <span data-testid="c">child</span>
      </DropdownMenu>
    );
    expect(container.firstChild).toBe(screen.getByTestId("c"));
  });

  it("provides default open=false", () => {
    render(
      <DropdownMenu>
        <Probe />
      </DropdownMenu>
    );
    expect(screen.getByTestId("open").textContent).toBe("false");
  });

  it("uncontrolled: defaultOpen sets initial + setOpen toggles", async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu defaultOpen>
        <Probe />
      </DropdownMenu>
    );
    expect(screen.getByTestId("open").textContent).toBe("true");
    await user.click(screen.getByRole("button", { name: "toggle" }));
    expect(screen.getByTestId("open").textContent).toBe("false");
  });

  it("controlled: value wins, setOpen calls onOpenChange", async () => {
    const onOpenChange = vi.fn();
    const user = userEvent.setup();
    render(
      <DropdownMenu open={false} onOpenChange={onOpenChange}>
        <Probe />
      </DropdownMenu>
    );
    expect(screen.getByTestId("open").textContent).toBe("false");
    await user.click(screen.getByRole("button", { name: "toggle" }));
    expect(onOpenChange).toHaveBeenCalledWith(true);
    // Still false because parent never flipped the prop.
    expect(screen.getByTestId("open").textContent).toBe("false");
  });

  it("modal defaults to true; triggerId + contentId are stable strings", () => {
    render(
      <DropdownMenu>
        <Probe />
      </DropdownMenu>
    );
    expect(screen.getByTestId("modal").textContent).toBe("true");
    expect(screen.getByTestId("trigger-id").textContent).toMatch(/.+/);
    expect(screen.getByTestId("content-id").textContent).toMatch(/.+/);
    expect(screen.getByTestId("trigger-id").textContent).not.toBe(
      screen.getByTestId("content-id").textContent
    );
  });

  it("modal={false} propagates through context", () => {
    render(
      <DropdownMenu modal={false}>
        <Probe />
      </DropdownMenu>
    );
    expect(screen.getByTestId("modal").textContent).toBe("false");
  });
});

import { DropdownMenuContent } from "./DropdownMenuContent";
import { DropdownMenuTrigger } from "./DropdownMenuTrigger";
import { DropdownMenuItem } from "./DropdownMenuItem";
import { DropdownMenuSeparator } from "./DropdownMenuSeparator";
import { DropdownMenuLabel } from "./DropdownMenuLabel";

describe("DropdownMenuSeparator", () => {
  it("renders role=separator", () => {
    render(
      <DropdownMenu>
        <DropdownMenuSeparator />
      </DropdownMenu>
    );
    expect(screen.getByRole("separator")).toBeInTheDocument();
  });

  it("accepts className and passes through data-testid", () => {
    render(
      <DropdownMenu>
        <DropdownMenuSeparator className="x" data-testid="sep" />
      </DropdownMenu>
    );
    const sep = screen.getByTestId("sep");
    expect(sep).toHaveClass("x");
  });

  it("consumer-supplied role via rest does NOT override library role=separator", () => {
    render(
      <DropdownMenu>
        <DropdownMenuSeparator
          data-testid="sep"
          // @ts-expect-error testing rest-spread ordering
          role="presentation"
        />
      </DropdownMenu>
    );
    expect(screen.getByTestId("sep")).toHaveAttribute("role", "separator");
  });
});

describe("DropdownMenuLabel", () => {
  it("renders role=presentation with children", () => {
    render(
      <DropdownMenu>
        <DropdownMenuLabel>Danger zone</DropdownMenuLabel>
      </DropdownMenu>
    );
    const label = screen.getByText("Danger zone");
    expect(label).toHaveAttribute("role", "presentation");
  });

  it("accepts className", () => {
    render(
      <DropdownMenu>
        <DropdownMenuLabel className="x" data-testid="label">
          hi
        </DropdownMenuLabel>
      </DropdownMenu>
    );
    expect(screen.getByTestId("label")).toHaveClass("x");
  });
});

describe("DropdownMenu modal behavior", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });
  afterEach(() => {
    vi.runAllTimers();
    vi.useRealTimers();
    document.body.style.overflow = "";
    document.body.style.paddingRight = "";
  });

  it("modal=true locks body scroll when open", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>
          <button>open</button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>A</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
    expect(document.body.style.overflow).not.toBe("hidden");
    await user.click(screen.getByRole("button", { name: "open" }));
    await act(async () => { vi.advanceTimersByTime(160); });
    expect(document.body.style.overflow).toBe("hidden");
  });

  it("modal=false does NOT lock body scroll", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger>
          <button>open</button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>A</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
    await user.click(screen.getByRole("button", { name: "open" }));
    await act(async () => { vi.advanceTimersByTime(160); });
    expect(document.body.style.overflow).not.toBe("hidden");
  });

  it("modal=true renders a scrim element", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>
          <button>open</button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>A</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
    await user.click(screen.getByRole("button", { name: "open" }));
    await act(async () => { vi.advanceTimersByTime(160); });
    expect(document.querySelector("[data-dropdown-menu-scrim]")).toBeInTheDocument();
  });
});
