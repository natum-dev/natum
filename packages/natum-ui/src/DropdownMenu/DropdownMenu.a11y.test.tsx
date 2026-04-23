import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DropdownMenu } from "./DropdownMenu";
import { DropdownMenuContent } from "./DropdownMenuContent";
import { DropdownMenuItem } from "./DropdownMenuItem";
import { DropdownMenuLabel } from "./DropdownMenuLabel";
import { DropdownMenuSeparator } from "./DropdownMenuSeparator";
import { DropdownMenuTrigger } from "./DropdownMenuTrigger";

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
});
afterEach(() => {
  vi.runAllTimers();
  vi.useRealTimers();
});

describe("DropdownMenu a11y", () => {
  it("renders role=menu with items, separator role=separator, label role=presentation", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>
          <button>open</button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>One</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Section</DropdownMenuLabel>
          <DropdownMenuItem>Two</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
    await user.click(screen.getByRole("button", { name: "open" }));
    await act(async () => { vi.advanceTimersByTime(160); });
    expect(screen.getByRole("menu")).toBeInTheDocument();
    expect(screen.getAllByRole("menuitem")).toHaveLength(2);
    expect(screen.getByRole("separator")).toBeInTheDocument();
    expect(screen.getByText("Section")).toHaveAttribute("role", "presentation");
  });

  it("menu aria-labelledby resolves to trigger id", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>
          <button>File actions</button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>X</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
    const trigger = screen.getByRole("button", { name: "File actions" });
    await user.click(trigger);
    await act(async () => { vi.advanceTimersByTime(160); });
    const menu = screen.getByRole("menu");
    expect(menu.getAttribute("aria-labelledby")).toBe(trigger.id);
  });

  it("RTL smoke: align='end' works under dir='rtl'", async () => {
    document.documentElement.dir = "rtl";
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>
          <button>open</button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>A</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
    await user.click(screen.getByRole("button", { name: "open" }));
    await act(async () => { vi.advanceTimersByTime(160); });
    expect(screen.getByRole("menu")).toBeInTheDocument();
    document.documentElement.dir = "";
  });

  it("library-managed role=menu wins over consumer role via rest", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>
          <button>open</button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          data-testid="menu"
          // @ts-expect-error rest-spread regression
          role="group"
        >
          <DropdownMenuItem>A</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
    await user.click(screen.getByRole("button", { name: "open" }));
    await act(async () => { vi.advanceTimersByTime(160); });
    expect(screen.getByTestId("menu")).toHaveAttribute("role", "menu");
  });

  it("DropdownMenuContent accepts data-testid via rest", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>
          <button>open</button>
        </DropdownMenuTrigger>
        <DropdownMenuContent data-testid="menu">
          <DropdownMenuItem>A</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
    await user.click(screen.getByRole("button", { name: "open" }));
    await act(async () => { vi.advanceTimersByTime(160); });
    expect(screen.getByTestId("menu")).toBeInTheDocument();
  });

  it("trigger aria-expanded flips to true on open and back on close", async () => {
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
    const trigger = screen.getByRole("button", { name: "open" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    await user.click(trigger);
    await act(async () => { vi.advanceTimersByTime(160); });
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    await user.keyboard("{Escape}");
    await act(async () => { vi.advanceTimersByTime(100); });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("aria-haspopup=menu always present", async () => {
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
    expect(screen.getByRole("button", { name: "open" })).toHaveAttribute(
      "aria-haspopup",
      "menu"
    );
  });

  it("aria-controls on trigger matches menu id", async () => {
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
    const trigger = screen.getByRole("button", { name: "open" });
    await user.click(trigger);
    await act(async () => { vi.advanceTimersByTime(160); });
    const menu = screen.getByRole("menu");
    expect(trigger.getAttribute("aria-controls")).toBe(menu.id);
  });
});
