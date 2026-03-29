import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useState } from "react";
import { useFocusTrap } from "./use-focus-trap";

// Test harness that renders a focus-trappable container
function TrapHarness({
  defaultActive = false,
  onEscape,
  children,
  hideButtons = false,
}: {
  defaultActive?: boolean;
  onEscape?: () => void;
  children?: React.ReactNode;
  hideButtons?: boolean;
}) {
  const [active, setActive] = useState(defaultActive);
  const { ref: trapRef } = useFocusTrap({
    isActive: active,
    onEscape,
  });

  return (
    <>
      <button onClick={() => setActive(true)} data-testid="activate">
        Activate
      </button>
      {active && (
        <div
          ref={trapRef}
          tabIndex={-1}
          data-testid="container"
          data-modal-portal=""
        >
          {!hideButtons && (
            <>
              <button data-testid="first">First</button>
              {children}
              <button data-testid="last">Last</button>
            </>
          )}
          {hideButtons && children}
        </div>
      )}
      {!active && <button onClick={() => setActive(false)} data-testid="deactivate-btn">Outside</button>}
    </>
  );
}

// Harness for testing deactivation (toggle on/off)
function ToggleHarness({ onEscape }: { onEscape?: () => void }) {
  const [active, setActive] = useState(false);
  const { ref: trapRef } = useFocusTrap({
    isActive: active,
    onEscape,
  });

  return (
    <>
      <button onClick={() => setActive(true)} data-testid="open">
        Open
      </button>
      <button onClick={() => setActive(false)} data-testid="close-external">
        Close
      </button>
      {active && (
        <div
          ref={trapRef}
          tabIndex={-1}
          data-testid="container"
          data-modal-portal=""
        >
          <button onClick={() => setActive(false)} data-testid="close">
            Close
          </button>
        </div>
      )}
    </>
  );
}

describe("useFocusTrap", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("focus moves to first focusable element on activate", async () => {
    render(<TrapHarness defaultActive />);
    await waitFor(() => {
      expect(screen.getByTestId("first")).toHaveFocus();
    });
  });

  it("focus moves to container when no focusable children", async () => {
    render(
      <TrapHarness defaultActive hideButtons>
        <span>No buttons here</span>
      </TrapHarness>
    );
    await waitFor(() => {
      expect(screen.getByTestId("container")).toHaveFocus();
    });
  });

  it("Tab wraps from last to first", async () => {
    const user = userEvent.setup();
    render(<TrapHarness defaultActive />);

    await waitFor(() => {
      expect(screen.getByTestId("first")).toHaveFocus();
    });

    // Tab to last
    await user.tab();
    expect(screen.getByTestId("last")).toHaveFocus();

    // Tab should wrap to first
    await user.tab();
    expect(screen.getByTestId("first")).toHaveFocus();
  });

  it("Shift+Tab wraps from first to last", async () => {
    const user = userEvent.setup();
    render(<TrapHarness defaultActive />);

    await waitFor(() => {
      expect(screen.getByTestId("first")).toHaveFocus();
    });

    // Shift+Tab should wrap to last
    await user.keyboard("{Shift>}{Tab}{/Shift}");
    expect(screen.getByTestId("last")).toHaveFocus();
  });

  it("ESC calls onEscape callback", async () => {
    const user = userEvent.setup();
    const onEscape = vi.fn();
    render(<TrapHarness defaultActive onEscape={onEscape} />);

    await waitFor(() => {
      expect(screen.getByTestId("first")).toHaveFocus();
    });

    await user.keyboard("{Escape}");
    expect(onEscape).toHaveBeenCalledOnce();
  });

  it("ESC does nothing when onEscape is not provided", async () => {
    const user = userEvent.setup();
    render(<TrapHarness defaultActive />);

    await waitFor(() => {
      expect(screen.getByTestId("first")).toHaveFocus();
    });

    // Should not throw
    await user.keyboard("{Escape}");
  });

  it("focus restores to previously focused element on deactivate", async () => {
    const user = userEvent.setup();
    render(<ToggleHarness />);

    // Focus the Open button and click it
    await user.click(screen.getByTestId("open"));

    // Wait for focus to move into trap
    await waitFor(() => {
      expect(screen.getByTestId("close")).toHaveFocus();
    });

    // Close the trap
    await user.click(screen.getByTestId("close"));

    // Focus should return to Open button
    await waitFor(() => {
      expect(screen.getByTestId("open")).toHaveFocus();
    });
  });

  it("inert applied to siblings on activate, removed on deactivate", async () => {
    const user = userEvent.setup();
    // Add a sibling element outside the portal
    const sibling = document.createElement("div");
    sibling.setAttribute("data-testid", "sibling");
    document.body.appendChild(sibling);

    render(<ToggleHarness />);

    // Activate
    await user.click(screen.getByTestId("open"));

    await waitFor(() => {
      expect(sibling.hasAttribute("inert")).toBe(true);
    });

    // Deactivate
    await user.click(screen.getByTestId("close"));

    await waitFor(() => {
      expect(sibling.hasAttribute("inert")).toBe(false);
    });

    sibling.remove();
  });
});
