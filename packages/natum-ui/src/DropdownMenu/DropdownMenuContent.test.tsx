import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DropdownMenu } from "./DropdownMenu";
import { DropdownMenuContent } from "./DropdownMenuContent";
import { DropdownMenuItem } from "./DropdownMenuItem";
import { DropdownMenuTrigger } from "./DropdownMenuTrigger";

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
});
afterEach(() => {
  vi.runAllTimers();
  vi.useRealTimers();
});

function Menu(props: { defaultOpen?: boolean }) {
  return (
    <DropdownMenu defaultOpen={props.defaultOpen}>
      <DropdownMenuTrigger>
        <button>open</button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>A</DropdownMenuItem>
        <DropdownMenuItem>B</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

describe("DropdownMenuContent scaffold", () => {
  it("renders nothing when closed", () => {
    render(<Menu />);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("renders role=menu when open, portaled to body", () => {
    render(<Menu defaultOpen />);
    const menu = screen.getByRole("menu");
    expect(menu).toBeInTheDocument();
    expect(document.body.contains(menu)).toBe(true);
  });

  it("wires aria-labelledby to trigger id", () => {
    render(<Menu defaultOpen />);
    const menu = screen.getByRole("menu");
    const trigger = screen.getByRole("button", { name: "open" });
    expect(menu).toHaveAttribute("aria-labelledby", trigger.id);
  });

  it("tabIndex=-1 on menu root", () => {
    render(<Menu defaultOpen />);
    expect(screen.getByRole("menu")).toHaveAttribute("tabindex", "-1");
  });

  it("data-state goes entering → entered on open", async () => {
    render(<Menu defaultOpen />);
    const menu = screen.getByRole("menu");
    expect(menu.getAttribute("data-state")).toBe("entering");
    await act(async () => {
      vi.advanceTimersByTime(160);
    });
    expect(menu.getAttribute("data-state")).toBe("entered");
  });

  it("focus lands on menu root when opened without focusTarget", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<Menu />);
    await user.click(screen.getByRole("button", { name: "open" }));
    await act(async () => {
      vi.advanceTimersByTime(160);
    });
    expect(document.activeElement).toBe(screen.getByRole("menu"));
  });
});

describe("DropdownMenuContent positioning", () => {
  // Stub rect measurements so useAnchorPosition + align math are deterministic.
  const originalGetBoundingClientRect =
    HTMLElement.prototype.getBoundingClientRect;

  beforeEach(() => {
    Object.defineProperty(HTMLElement.prototype, "getBoundingClientRect", {
      configurable: true,
      value: function () {
        const role = this.getAttribute("role");
        if (role === "menu") {
          return {
            top: 0,
            left: 0,
            right: 200,
            bottom: 100,
            width: 200,
            height: 100,
            x: 0,
            y: 0,
            toJSON() { return {}; },
          } as DOMRect;
        }
        // Trigger button
        return {
          top: 50,
          left: 500,
          right: 540,
          bottom: 90,
          width: 40,
          height: 40,
          x: 500,
          y: 50,
          toJSON() { return {}; },
        } as DOMRect;
      },
    });
  });

  afterEach(() => {
    Object.defineProperty(HTMLElement.prototype, "getBoundingClientRect", {
      configurable: true,
      value: originalGetBoundingClientRect,
    });
  });

  it("align='start' anchors menu left edge to trigger left edge", async () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>
          <button>open</button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem>A</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
    await act(async () => {
      vi.advanceTimersByTime(160);
    });
    const menu = screen.getByRole("menu");
    expect(menu.style.position).toBe("fixed");
    expect(parseFloat(menu.style.left)).toBe(500);
  });

  it("align='end' anchors menu right edge to trigger right edge", async () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>
          <button>open</button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>A</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
    await act(async () => {
      vi.advanceTimersByTime(160);
    });
    const menu = screen.getByRole("menu");
    // trigger.right (540) - content.width (200) = 340
    expect(parseFloat(menu.style.left)).toBe(340);
  });

  it("align='center' anchors menu center on trigger center", async () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>
          <button>open</button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center">
          <DropdownMenuItem>A</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
    await act(async () => {
      vi.advanceTimersByTime(160);
    });
    const menu = screen.getByRole("menu");
    // trigger.left (500) + (trigger.width 40 - content.width 200) / 2 = 500 + (-80) = 420
    expect(parseFloat(menu.style.left)).toBe(420);
  });

  it("sideOffset applies to top offset (default 4)", async () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>
          <button>open</button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>A</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
    await act(async () => {
      vi.advanceTimersByTime(160);
    });
    const menu = screen.getByRole("menu");
    // trigger.bottom (90) + 4 = 94
    expect(parseFloat(menu.style.top)).toBe(94);
  });
});
