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
