import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createRef, useState } from "react";
import { Modal } from "./Modal";

// Helper to render a modal that can be opened/closed
function ModalWrapper({
  defaultOpen = true,
  ...props
}: Partial<React.ComponentProps<typeof Modal>> & { defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <>
      <button onClick={() => setOpen(true)}>Open</button>
      <Modal open={open} onClose={() => setOpen(false)} {...props} />
    </>
  );
}

describe("Modal", () => {
  beforeEach(() => {
    document.body.style.overflow = "";
    document.body.style.paddingRight = "";
  });

  afterEach(() => {
    document.body.style.overflow = "";
    document.body.style.paddingRight = "";
  });

  // --- Visibility ---
  it("does not render when open=false", () => {
    render(<Modal open={false} onClose={() => {}}>Content</Modal>);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders when open=true", () => {
    render(<Modal open={true} onClose={() => {}}>Content</Modal>);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  // --- Title ---
  it("renders title in header with correct id", () => {
    render(<Modal open onClose={() => {}} title="My Modal">Content</Modal>);
    const dialog = screen.getByRole("dialog");
    const titleId = dialog.getAttribute("aria-labelledby");
    expect(titleId).toBeTruthy();
    expect(document.getElementById(titleId!)).toHaveTextContent("My Modal");
  });

  it("accepts ReactNode as title", () => {
    render(
      <Modal
        open
        onClose={() => {}}
        title={
          <span>
            <svg data-testid="title-icon" />
            <span>Modal with icon</span>
          </span>
        }
        aria-label="Modal with icon"
      >
        Content
      </Modal>
    );
    expect(screen.getByTestId("title-icon")).toBeInTheDocument();
    expect(screen.getByText("Modal with icon")).toBeInTheDocument();
  });

  // --- Children ---
  it("renders children in body", () => {
    render(
      <Modal open onClose={() => {}}>
        <span data-testid="body-content">Hello</span>
      </Modal>
    );
    expect(screen.getByTestId("body-content")).toBeInTheDocument();
  });

  // --- Footer ---
  it("renders footer when provided", () => {
    render(
      <Modal open onClose={() => {}} footer={<button>Confirm</button>}>
        Content
      </Modal>
    );
    expect(screen.getByRole("button", { name: "Confirm" })).toBeInTheDocument();
  });

  it("does not render footer when not provided", () => {
    const { container } = render(
      <Modal open onClose={() => {}}>Content</Modal>
    );
    expect(container.ownerDocument.querySelector("[class*='footer']")).not.toBeInTheDocument();
  });

  // --- Close button ---
  it("shows close button by default", () => {
    render(<Modal open onClose={() => {}}>Content</Modal>);
    expect(screen.getByLabelText("Close dialog")).toBeInTheDocument();
  });

  it("hides close button when hideCloseButton=true", () => {
    render(<Modal open onClose={() => {}} hideCloseButton>Content</Modal>);
    expect(screen.queryByLabelText("Close dialog")).not.toBeInTheDocument();
  });

  it("close button calls onClose", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<Modal open onClose={onClose}>Content</Modal>);
    await user.click(screen.getByLabelText("Close dialog"));
    expect(onClose).toHaveBeenCalledOnce();
  });

  // --- ESC key (cancellable callback) ---
  it("ESC calls onClose by default", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<Modal open onClose={onClose}>Content</Modal>);
    // Wait for focus to land inside modal
    await waitFor(() => {
      expect(screen.getByLabelText("Close dialog")).toHaveFocus();
    });
    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("ESC fires onEscapeKeyDown; close still happens by default", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const onEscapeKeyDown = vi.fn();
    render(
      <Modal open onClose={onClose} onEscapeKeyDown={onEscapeKeyDown}>
        Content
      </Modal>
    );
    await waitFor(() => {
      expect(screen.getByLabelText("Close dialog")).toHaveFocus();
    });
    await user.keyboard("{Escape}");
    expect(onEscapeKeyDown).toHaveBeenCalledOnce();
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("ESC consumer can suppress close via event.preventDefault()", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Modal
        open
        onClose={onClose}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        Content
      </Modal>
    );
    await waitFor(() => {
      expect(screen.getByLabelText("Close dialog")).toHaveFocus();
    });
    await user.keyboard("{Escape}");
    expect(onClose).not.toHaveBeenCalled();
  });

  // --- Overlay click (cancellable callback) ---
  it("overlay click calls onClose by default", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<Modal open onClose={onClose}>Content</Modal>);
    const overlay = screen.getByRole("dialog").parentElement!;
    await user.click(overlay);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("overlay click fires onInteractOutside; close still happens by default", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const onInteractOutside = vi.fn();
    render(
      <Modal open onClose={onClose} onInteractOutside={onInteractOutside}>
        Content
      </Modal>
    );
    const overlay = screen.getByRole("dialog").parentElement!;
    await user.click(overlay);
    expect(onInteractOutside).toHaveBeenCalledOnce();
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("overlay click consumer can suppress close via event.preventDefault()", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Modal
        open
        onClose={onClose}
        onInteractOutside={(e) => e.preventDefault()}
      >
        Content
      </Modal>
    );
    const overlay = screen.getByRole("dialog").parentElement!;
    await user.click(overlay);
    expect(onClose).not.toHaveBeenCalled();
  });

  it("panel click does NOT trigger overlay close", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<Modal open onClose={onClose}>Content</Modal>);
    await user.click(screen.getByRole("dialog"));
    expect(onClose).not.toHaveBeenCalled();
  });

  // --- Sizes ---
  it("applies md size class by default", () => {
    render(<Modal open onClose={() => {}}>Content</Modal>);
    expect(screen.getByRole("dialog")).toHaveClass("md");
  });

  it("applies sm size class", () => {
    render(<Modal open onClose={() => {}} size="sm">Content</Modal>);
    expect(screen.getByRole("dialog")).toHaveClass("sm");
  });

  it("applies lg size class", () => {
    render(<Modal open onClose={() => {}} size="lg">Content</Modal>);
    expect(screen.getByRole("dialog")).toHaveClass("lg");
  });

  // --- Accessibility ---
  it("has role='dialog' and aria-modal='true' on panel", () => {
    render(<Modal open onClose={() => {}}>Content</Modal>);
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
  });

  it("aria-labelledby points to title element", () => {
    render(<Modal open onClose={() => {}} title="Test Title">Content</Modal>);
    const dialog = screen.getByRole("dialog");
    const labelledBy = dialog.getAttribute("aria-labelledby");
    expect(labelledBy).toBeTruthy();
    const titleEl = document.getElementById(labelledBy!);
    expect(titleEl).toHaveTextContent("Test Title");
  });

  it("has aria-label fallback when no title", () => {
    render(<Modal open onClose={() => {}}>Content</Modal>);
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-label", "Dialog");
  });

  // --- Focus management ---
  it("focus moves to first focusable element on open", async () => {
    render(<Modal open onClose={() => {}}>Content</Modal>);
    await waitFor(() => {
      expect(screen.getByLabelText("Close dialog")).toHaveFocus();
    });
  });

  it("focus moves to panel when no focusable elements", async () => {
    render(<Modal open onClose={() => {}} hideCloseButton>Content</Modal>);
    await waitFor(() => {
      expect(screen.getByRole("dialog")).toHaveFocus();
    });
  });

  it("focus returns to trigger element on close", async () => {
    const user = userEvent.setup();
    render(<ModalWrapper defaultOpen={false} title="Test">Content</ModalWrapper>);

    // Click Open button to open modal (sets previousActiveElement to Open button)
    await user.click(screen.getByRole("button", { name: "Open" }));

    // Wait for modal to appear and focus to settle
    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    // Close the modal
    await user.click(screen.getByLabelText("Close dialog"));

    // Focus should return to Open button
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Open" })).toHaveFocus();
    });
  });

  it("Tab cycles within modal (focus trap)", async () => {
    const user = userEvent.setup();
    render(
      <Modal open onClose={() => {}} title="Trap Test" footer={<button>Confirm</button>}>
        <button>Inner</button>
      </Modal>
    );

    const closeBtn = screen.getByLabelText("Close dialog");
    const innerBtn = screen.getByRole("button", { name: "Inner" });
    const confirmBtn = screen.getByRole("button", { name: "Confirm" });

    // Focus starts on close button (first focusable)
    await waitFor(() => {
      expect(closeBtn).toHaveFocus();
    });

    // Tab through: close → inner → confirm → close (cycle)
    await user.tab();
    expect(innerBtn).toHaveFocus();

    await user.tab();
    expect(confirmBtn).toHaveFocus();

    // Should cycle back to first
    await user.tab();
    expect(closeBtn).toHaveFocus();
  });

  // --- forwardRef ---
  it("forwards ref to panel element", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Modal ref={ref} open onClose={() => {}}>Content</Modal>);
    expect(ref.current).toBe(screen.getByRole("dialog"));
  });

  // --- className ---
  it("applies custom className on panel", () => {
    render(<Modal open onClose={() => {}} className="custom-panel">Content</Modal>);
    expect(screen.getByRole("dialog")).toHaveClass("custom-panel");
  });

  // --- Portal ---
  it("renders via portal in document.body", () => {
    const { container } = render(<Modal open onClose={() => {}}>Content</Modal>);
    // Dialog should NOT be inside the container (it's in a portal)
    expect(container.querySelector("[role='dialog']")).toBeNull();
    // But it should be in the document
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  // --- Scroll lock ---
  it("locks body scroll when open", () => {
    render(<Modal open onClose={() => {}}>Content</Modal>);
    expect(document.body.style.overflow).toBe("hidden");
  });

  it("restores body scroll when closed", () => {
    const { rerender } = render(<Modal open onClose={() => {}}>Content</Modal>);
    expect(document.body.style.overflow).toBe("hidden");
    rerender(<Modal open={false} onClose={() => {}}>Content</Modal>);
    expect(document.body.style.overflow).not.toBe("hidden");
  });
});
