import { renderHook } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { useEscapeKey } from "./use-escape-key";

describe("useEscapeKey", () => {
  it("calls onEscape when Escape is pressed", async () => {
    const user = userEvent.setup();
    const onEscape = vi.fn();
    renderHook(() => useEscapeKey({ onEscape }));

    await user.keyboard("{Escape}");
    expect(onEscape).toHaveBeenCalledOnce();
  });

  it("does not call onEscape when enabled is false", async () => {
    const user = userEvent.setup();
    const onEscape = vi.fn();
    renderHook(() => useEscapeKey({ onEscape, enabled: false }));

    await user.keyboard("{Escape}");
    expect(onEscape).not.toHaveBeenCalled();
  });

  it("does not call onEscape for other keys", async () => {
    const user = userEvent.setup();
    const onEscape = vi.fn();
    renderHook(() => useEscapeKey({ onEscape }));

    await user.keyboard("{Enter}");
    expect(onEscape).not.toHaveBeenCalled();
  });

  it("removes listener on unmount", async () => {
    const user = userEvent.setup();
    const onEscape = vi.fn();
    const { unmount } = renderHook(() => useEscapeKey({ onEscape }));

    unmount();
    await user.keyboard("{Escape}");
    expect(onEscape).not.toHaveBeenCalled();
  });

  it("removes listener when enabled changes to false", async () => {
    const user = userEvent.setup();
    const onEscape = vi.fn();
    const { rerender } = renderHook(
      ({ enabled }) => useEscapeKey({ onEscape, enabled }),
      { initialProps: { enabled: true } }
    );

    rerender({ enabled: false });
    await user.keyboard("{Escape}");
    expect(onEscape).not.toHaveBeenCalled();
  });

  it("defaults enabled to true", async () => {
    const user = userEvent.setup();
    const onEscape = vi.fn();
    renderHook(() => useEscapeKey({ onEscape }));

    await user.keyboard("{Escape}");
    expect(onEscape).toHaveBeenCalledOnce();
  });
});
