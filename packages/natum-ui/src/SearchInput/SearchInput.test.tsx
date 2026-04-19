import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { useState } from "react";
import { SearchInput } from "./SearchInput";

describe("SearchInput — scaffold", () => {
  it("renders a search input with role=searchbox", () => {
    render(<SearchInput aria-label="Search files" />);
    // role="searchbox" is what <input type="search"> exposes.
    expect(screen.getByRole("searchbox", { name: "Search files" })).toBeInTheDocument();
  });

  it("renders the IconSearch decoration", () => {
    const { container } = render(<SearchInput aria-label="Search" />);
    // IconSearch renders an <svg>; leftSection wraps it.
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("seeds input from defaultValue", () => {
    render(<SearchInput defaultValue="hello" aria-label="Search" />);
    expect(screen.getByRole<HTMLInputElement>("searchbox").value).toBe("hello");
  });

  it("displays controlled value", () => {
    render(<SearchInput value="world" onChange={() => {}} aria-label="Search" />);
    expect(screen.getByRole<HTMLInputElement>("searchbox").value).toBe("world");
  });

  it("updates raw DOM value as the user types (uncontrolled)", async () => {
    const user = userEvent.setup();
    render(<SearchInput aria-label="Search" />);
    const input = screen.getByRole<HTMLInputElement>("searchbox");
    await user.type(input, "ab");
    expect(input.value).toBe("ab");
  });

  it("forwards ref to the underlying input", () => {
    const ref = { current: null as HTMLInputElement | null };
    render(<SearchInput ref={ref} aria-label="Search" />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });
});

describe("SearchInput — external value sync", () => {
  it("syncs internal DOM when controlled value changes externally", () => {
    const Harness = () => {
      const [v, setV] = useState("one");
      return (
        <>
          <button type="button" onClick={() => setV("two")}>bump</button>
          <SearchInput value={v} onChange={() => {}} aria-label="Search" />
        </>
      );
    };
    render(<Harness />);
    const input = screen.getByRole<HTMLInputElement>("searchbox");
    expect(input.value).toBe("one");
    fireEvent.click(screen.getByRole("button", { name: "bump" }));
    expect(input.value).toBe("two");
  });

  it("controlled: typing updates DOM responsively AND fires onChange", async () => {
    // SearchInput's `value` prop is a seed + external-sync channel, NOT a DOM
    // lock. Typing always updates the DOM immediately. Consumers who want to
    // reject typing use onChange to veto by not echoing back.
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const handleChange = vi.fn();
    render(
      <SearchInput value="seed" onChange={handleChange} aria-label="Search" />
    );
    const input = screen.getByRole<HTMLInputElement>("searchbox");
    await user.type(input, "x");
    expect(input.value).toBe("seedx");
    // Debounced — flush the pending timer before asserting the emit.
    vi.advanceTimersByTime(250);
    expect(handleChange).toHaveBeenCalledWith("seedx");
    vi.useRealTimers();
  });
});

describe("SearchInput — debounce", () => {
  it("emits onChange once after the debounce window", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const handleChange = vi.fn();
    render(<SearchInput onChange={handleChange} aria-label="Search" />);
    const input = screen.getByRole<HTMLInputElement>("searchbox");
    await user.type(input, "abc");
    // Not yet — still inside the 250ms window.
    expect(handleChange).not.toHaveBeenCalled();
    vi.advanceTimersByTime(250);
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith("abc");
    vi.useRealTimers();
  });

  it("later keystrokes reset the timer (no intermediate emits)", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const handleChange = vi.fn();
    render(<SearchInput onChange={handleChange} aria-label="Search" />);
    const input = screen.getByRole<HTMLInputElement>("searchbox");
    await user.type(input, "a");
    vi.advanceTimersByTime(200);
    await user.type(input, "b");
    vi.advanceTimersByTime(200);
    expect(handleChange).not.toHaveBeenCalled();
    vi.advanceTimersByTime(50);
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith("ab");
    vi.useRealTimers();
  });

  it("honors a custom debounceMs", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const handleChange = vi.fn();
    render(<SearchInput debounceMs={500} onChange={handleChange} aria-label="Search" />);
    await user.type(screen.getByRole<HTMLInputElement>("searchbox"), "x");
    vi.advanceTimersByTime(400);
    expect(handleChange).not.toHaveBeenCalled();
    vi.advanceTimersByTime(100);
    expect(handleChange).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it("debounceMs=0 still emits asynchronously", () => {
    // Pure fake timers (no shouldAdvanceTime) so the setTimeout(0) stays
    // queued until we explicitly advance. Use the native setter pattern
    // (like the unmount test) instead of userEvent to avoid needing
    // shouldAdvanceTime for user.type internals.
    vi.useFakeTimers();
    const handleChange = vi.fn();
    render(<SearchInput debounceMs={0} onChange={handleChange} aria-label="Search" />);
    const input = screen.getByRole<HTMLInputElement>("searchbox");
    const setter = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value"
    )?.set;
    setter?.call(input, "z");
    input.dispatchEvent(new Event("input", { bubbles: true }));
    expect(handleChange).not.toHaveBeenCalled();
    vi.advanceTimersByTime(0);
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith("z");
    vi.useRealTimers();
  });

  it("cancels pending timer on unmount", () => {
    vi.useFakeTimers();
    const handleChange = vi.fn();
    const { unmount } = render(
      <SearchInput defaultValue="" onChange={handleChange} aria-label="Search" />
    );
    const input = screen.getByRole<HTMLInputElement>("searchbox");
    const setter = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value"
    )?.set;
    setter?.call(input, "late");
    input.dispatchEvent(new Event("input", { bubbles: true }));
    unmount();
    vi.advanceTimersByTime(500);
    expect(handleChange).not.toHaveBeenCalled();
    vi.useRealTimers();
  });
});

describe("SearchInput — Enter + submit", () => {
  it("Enter flushes pending onChange and fires onSubmit", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const handleChange = vi.fn();
    const handleSubmit = vi.fn();
    render(
      <SearchInput
        onChange={handleChange}
        onSubmit={handleSubmit}
        aria-label="Search"
      />
    );
    const input = screen.getByRole<HTMLInputElement>("searchbox");
    await user.type(input, "hello");
    await user.keyboard("{Enter}");
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith("hello");
    expect(handleSubmit).toHaveBeenCalledTimes(1);
    expect(handleSubmit).toHaveBeenCalledWith("hello");
    // No late emit from the cancelled timer.
    vi.advanceTimersByTime(500);
    expect(handleChange).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it("Enter with no pending change still fires onSubmit", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    const handleSubmit = vi.fn();
    render(
      <SearchInput
        defaultValue="preset"
        onChange={handleChange}
        onSubmit={handleSubmit}
        aria-label="Search"
      />
    );
    screen.getByRole<HTMLInputElement>("searchbox").focus();
    await user.keyboard("{Enter}");
    expect(handleChange).not.toHaveBeenCalled();
    expect(handleSubmit).toHaveBeenCalledTimes(1);
    expect(handleSubmit).toHaveBeenCalledWith("preset");
  });

  it("consumer onKeyDown runs before internal Enter handling; preventDefault suppresses", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const handleChange = vi.fn();
    const handleSubmit = vi.fn();
    const order: string[] = [];
    render(
      <SearchInput
        onChange={handleChange}
        onSubmit={handleSubmit}
        onKeyDown={(e) => {
          if (e.key !== "Enter") return;
          order.push("consumer");
          e.preventDefault();
        }}
        aria-label="Search"
      />
    );
    const input = screen.getByRole<HTMLInputElement>("searchbox");
    await user.type(input, "x");
    await user.keyboard("{Enter}");
    expect(order).toEqual(["consumer"]);
    expect(handleSubmit).not.toHaveBeenCalled();
    // Pending debounce timer NOT cancelled (no flush happened either).
    vi.advanceTimersByTime(300);
    expect(handleChange).toHaveBeenCalledWith("x");
    vi.useRealTimers();
  });
});
