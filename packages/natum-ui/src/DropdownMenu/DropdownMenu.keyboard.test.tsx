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

async function openMenu(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: "open" }));
  await act(async () => {
    vi.advanceTimersByTime(160);
  });
}

function ThreeItems({ loop = true }: { loop?: boolean } = {}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <button>open</button>
      </DropdownMenuTrigger>
      <DropdownMenuContent loop={loop}>
        <DropdownMenuItem>A</DropdownMenuItem>
        <DropdownMenuItem>B</DropdownMenuItem>
        <DropdownMenuItem>C</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

describe("DropdownMenu keyboard nav", () => {
  it("ArrowDown on menu focuses first item", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<ThreeItems />);
    await openMenu(user);
    await user.keyboard("{ArrowDown}");
    expect(document.activeElement?.textContent).toBe("A");
  });

  it("ArrowDown wraps past last when loop=true", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<ThreeItems />);
    await openMenu(user);
    await user.keyboard("{ArrowDown}");
    await user.keyboard("{ArrowDown}");
    await user.keyboard("{ArrowDown}");
    expect(document.activeElement?.textContent).toBe("C");
    await user.keyboard("{ArrowDown}");
    expect(document.activeElement?.textContent).toBe("A");
  });

  it("ArrowUp wraps past first", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<ThreeItems />);
    await openMenu(user);
    await user.keyboard("{ArrowDown}");
    expect(document.activeElement?.textContent).toBe("A");
    await user.keyboard("{ArrowUp}");
    expect(document.activeElement?.textContent).toBe("C");
  });

  it("Home focuses first, End focuses last", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<ThreeItems />);
    await openMenu(user);
    await user.keyboard("{End}");
    expect(document.activeElement?.textContent).toBe("C");
    await user.keyboard("{Home}");
    expect(document.activeElement?.textContent).toBe("A");
  });

  it("loop=false: ArrowUp on first stays on first", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<ThreeItems loop={false} />);
    await openMenu(user);
    await user.keyboard("{ArrowDown}");
    expect(document.activeElement?.textContent).toBe("A");
    await user.keyboard("{ArrowUp}");
    expect(document.activeElement?.textContent).toBe("A");
  });

  it("skips disabled items when navigating", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>
          <button>open</button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>A</DropdownMenuItem>
          <DropdownMenuItem disabled>B</DropdownMenuItem>
          <DropdownMenuItem>C</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
    await openMenu(user);
    await user.keyboard("{ArrowDown}");
    expect(document.activeElement?.textContent).toBe("A");
    await user.keyboard("{ArrowDown}");
    expect(document.activeElement?.textContent).toBe("C");
  });

  it("focusTarget='first' from Trigger lands on first item after open", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<ThreeItems />);
    screen.getByRole("button", { name: "open" }).focus();
    await user.keyboard("{ArrowDown}");
    await act(async () => {
      vi.advanceTimersByTime(160);
    });
    expect(document.activeElement?.textContent).toBe("A");
  });

  it("focusTarget='last' lands on last item", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<ThreeItems />);
    screen.getByRole("button", { name: "open" }).focus();
    await user.keyboard("{ArrowUp}");
    await act(async () => {
      vi.advanceTimersByTime(160);
    });
    expect(document.activeElement?.textContent).toBe("C");
  });
});

describe("DropdownMenu typeahead", () => {
  it("typing 'c' focuses first item starting with C", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>
          <button>open</button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Apple</DropdownMenuItem>
          <DropdownMenuItem>Banana</DropdownMenuItem>
          <DropdownMenuItem>Cherry</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
    await openMenu(user);
    await user.keyboard("c");
    expect(document.activeElement?.textContent).toBe("Cherry");
  });

  it("respects textValue override for ReactNode children", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>
          <button>open</button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem textValue="Zulu">
            <svg /> Z item
          </DropdownMenuItem>
          <DropdownMenuItem textValue="Alpha">
            <svg /> A item
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
    await openMenu(user);
    await user.keyboard("z");
    expect(document.activeElement).toHaveAttribute("data-text-value", "Zulu");
  });
});
