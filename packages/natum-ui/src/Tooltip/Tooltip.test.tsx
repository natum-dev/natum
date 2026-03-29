import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Tooltip } from "./Tooltip";

describe("Tooltip", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders the trigger element", () => {
    render(
      <Tooltip content="Tooltip text">
        <button>Hover me</button>
      </Tooltip>
    );
    expect(screen.getByText("Hover me")).toBeInTheDocument();
  });

  it("does not show tooltip by default", () => {
    render(
      <Tooltip content="Tooltip text">
        <button>Hover me</button>
      </Tooltip>
    );
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("shows tooltip on mouse enter after delay", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(
      <Tooltip content="Tooltip text" delay={200}>
        <button>Hover me</button>
      </Tooltip>
    );
    await user.hover(screen.getByText("Hover me"));
    act(() => { vi.advanceTimersByTime(200); });
    expect(screen.getByRole("tooltip")).toBeInTheDocument();
    expect(screen.getByRole("tooltip")).toHaveTextContent("Tooltip text");
  });

  it("does not show tooltip before delay completes", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(
      <Tooltip content="Tooltip text" delay={200}>
        <button>Hover me</button>
      </Tooltip>
    );
    await user.hover(screen.getByText("Hover me"));
    act(() => { vi.advanceTimersByTime(100); });
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("hides tooltip on mouse leave", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(
      <Tooltip content="Tooltip text" delay={0}>
        <button>Hover me</button>
      </Tooltip>
    );
    await user.hover(screen.getByText("Hover me"));
    act(() => { vi.advanceTimersByTime(0); });
    expect(screen.getByRole("tooltip")).toBeInTheDocument();
    await user.unhover(screen.getByText("Hover me"));
    act(() => { vi.advanceTimersByTime(150); });
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("shows tooltip on focus", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(
      <Tooltip content="Tooltip text" delay={0}>
        <button>Focus me</button>
      </Tooltip>
    );
    await user.tab();
    act(() => { vi.advanceTimersByTime(0); });
    expect(screen.getByRole("tooltip")).toBeInTheDocument();
  });

  it("hides tooltip on blur", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(
      <>
        <Tooltip content="Tooltip text" delay={0}>
          <button>Focus me</button>
        </Tooltip>
        <button>Other</button>
      </>
    );
    await user.tab();
    act(() => { vi.advanceTimersByTime(0); });
    expect(screen.getByRole("tooltip")).toBeInTheDocument();
    await user.tab();
    act(() => { vi.advanceTimersByTime(150); });
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("hides tooltip on Escape", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(
      <Tooltip content="Tooltip text" delay={0}>
        <button>Hover me</button>
      </Tooltip>
    );
    await user.hover(screen.getByText("Hover me"));
    act(() => { vi.advanceTimersByTime(0); });
    expect(screen.getByRole("tooltip")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    act(() => { vi.advanceTimersByTime(150); });
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("has role tooltip on the tooltip element", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(
      <Tooltip content="Tooltip text" delay={0}>
        <button>Hover me</button>
      </Tooltip>
    );
    await user.hover(screen.getByText("Hover me"));
    act(() => { vi.advanceTimersByTime(0); });
    expect(screen.getByRole("tooltip")).toBeInTheDocument();
  });

  it("sets aria-describedby on trigger pointing to tooltip id", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(
      <Tooltip content="Tooltip text" delay={0}>
        <button>Hover me</button>
      </Tooltip>
    );
    await user.hover(screen.getByText("Hover me"));
    act(() => { vi.advanceTimersByTime(0); });
    const trigger = screen.getByText("Hover me");
    const tooltip = screen.getByRole("tooltip");
    expect(trigger).toHaveAttribute("aria-describedby", tooltip.id);
  });

  it.each(["top", "bottom", "left", "right"] as const)(
    "applies %s placement data attribute",
    async (placement) => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(
        <Tooltip content="Tip" placement={placement} delay={0}>
          <button>Hover</button>
        </Tooltip>
      );
      await user.hover(screen.getByText("Hover"));
      act(() => { vi.advanceTimersByTime(0); });
      expect(screen.getByRole("tooltip")).toHaveAttribute("data-placement");
    }
  );

  it("renders ReactNode content", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(
      <Tooltip content={<strong data-testid="bold">Bold tip</strong>} delay={0}>
        <button>Hover me</button>
      </Tooltip>
    );
    await user.hover(screen.getByText("Hover me"));
    act(() => { vi.advanceTimersByTime(0); });
    expect(screen.getByTestId("bold")).toBeInTheDocument();
  });

  it("applies custom className to tooltip container", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(
      <Tooltip content="Tip" className="custom-tooltip" delay={0}>
        <button>Hover me</button>
      </Tooltip>
    );
    await user.hover(screen.getByText("Hover me"));
    act(() => { vi.advanceTimersByTime(0); });
    expect(screen.getByRole("tooltip")).toHaveClass("custom-tooltip");
  });
});
