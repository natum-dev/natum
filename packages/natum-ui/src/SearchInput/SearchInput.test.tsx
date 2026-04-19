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
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <SearchInput value="seed" onChange={handleChange} aria-label="Search" />
    );
    const input = screen.getByRole<HTMLInputElement>("searchbox");
    await user.type(input, "x");
    expect(input.value).toBe("seedx");
    expect(handleChange).toHaveBeenCalledWith("seedx");
  });
});
