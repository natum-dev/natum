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
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <>
      <button onClick={() => setIsOpen(true)}>Open</button>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} {...props} />
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
  it("does not render when isOpen=false", () => {
    render(<Modal isOpen={false} onClose={() => {}}>Content</Modal>);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders when isOpen=true", () => {
    render(<Modal isOpen={true} onClose={() => {}}>Content</Modal>);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  // --- Title ---
  it("renders title in header with correct id", () => {
    render(<Modal isOpen onClose={() => {}} title="My Modal">Content</Modal>);
    const dialog = screen.getByRole("dialog");
    const titleId = dialog.getAttribute("aria-labelledby");
    expect(titleId).toBeTruthy();
    expect(document.getElementById(titleId!)).toHaveTextContent("My Modal");
  });

  // --- Children ---
  it("renders children in body", () => {
    render(
      <Modal isOpen onClose={() => {}}>
        <span data-testid="body-content">Hello</span>
      </Modal>
    );
    expect(screen.getByTestId("body-content")).toBeInTheDocument();
  });

  // --- Footer ---
  it("renders footer when provided", () => {
    render(
      <Modal isOpen onClose={() => {}} footer={<button>Confirm</button>}>
        Content
      </Modal>
    );
    expect(screen.getByRole("button", { name: "Confirm" })).toBeInTheDocument();
  });

  it("does not render footer when not provided", () => {
    const { container } = render(
      <Modal isOpen onClose={() => {}}>Content</Modal>
    );
    expect(container.ownerDocument.querySelector("[class*='footer']")).not.toBeInTheDocument();
  });

  // --- Close button ---
  it("shows close button by default", () => {
    render(<Modal isOpen onClose={() => {}}>Content</Modal>);
    expect(screen.getByLabelText("Close dialog")).toBeInTheDocument();
  });

  it("hides close button when hideCloseButton=true", () => {
    render(<Modal isOpen onClose={() => {}} hideCloseButton>Content</Modal>);
    expect(screen.queryByLabelText("Close dialog")).not.toBeInTheDocument();
  });

  it("close button calls onClose", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<Modal isOpen onClose={onClose}>Content</Modal>);
    await user.click(screen.getByLabelText("Close dialog"));
    expect(onClose).toHaveBeenCalledOnce();
  });

  // --- ESC key ---
  it("ESC calls onClose when closeOnEsc=true (default)", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<Modal isOpen onClose={onClose}>Content</Modal>);
    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("ESC does NOT call onClose when closeOnEsc=false", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<Modal isOpen onClose={onClose} closeOnEsc={false}>Content</Modal>);
    await user.keyboard("{Escape}");
    expect(onClose).not.toHaveBeenCalled();
  });

  // --- Overlay click ---
  it("overlay click calls onClose when closeOnOverlayClick=true (default)", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<Modal isOpen onClose={onClose}>Content</Modal>);
    const overlay = screen.getByRole("dialog").parentElement!;
    await user.click(overlay);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("overlay click does NOT close when closeOnOverlayClick=false", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<Modal isOpen onClose={onClose} closeOnOverlayClick={false}>Content</Modal>);
    const overlay = screen.getByRole("dialog").parentElement!;
    await user.click(overlay);
    expect(onClose).not.toHaveBeenCalled();
  });

  it("panel click does NOT trigger overlay close", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<Modal isOpen onClose={onClose}>Content</Modal>);
    await user.click(screen.getByRole("dialog"));
    expect(onClose).not.toHaveBeenCalled();
  });

  // --- Sizes ---
  it("applies md size class by default", () => {
    render(<Modal isOpen onClose={() => {}}>Content</Modal>);
    expect(screen.getByRole("dialog")).toHaveClass("md");
  });

  it("applies sm size class", () => {
    render(<Modal isOpen onClose={() => {}} size="sm">Content</Modal>);
    expect(screen.getByRole("dialog")).toHaveClass("sm");
  });

  it("applies lg size class", () => {
    render(<Modal isOpen onClose={() => {}} size="lg">Content</Modal>);
    expect(screen.getByRole("dialog")).toHaveClass("lg");
  });

  // --- Accessibility ---
  it("has role='dialog' and aria-modal='true' on panel", () => {
    render(<Modal isOpen onClose={() => {}}>Content</Modal>);
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
  });

  it("aria-labelledby points to title element", () => {
    render(<Modal isOpen onClose={() => {}} title="Test Title">Content</Modal>);
    const dialog = screen.getByRole("dialog");
    const labelledBy = dialog.getAttribute("aria-labelledby");
    expect(labelledBy).toBeTruthy();
    const titleEl = document.getElementById(labelledBy!);
    expect(titleEl).toHaveTextContent("Test Title");
  });

  it("has aria-label fallback when no title", () => {
    render(<Modal isOpen onClose={() => {}}>Content</Modal>);
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-label", "Dialog");
  });

  // --- Focus management ---
  it("focus moves to panel on open", async () => {
    render(<Modal isOpen onClose={() => {}}>Content</Modal>);
    await waitFor(() => {
      expect(screen.getByRole("dialog")).toHaveFocus();
    });
  });

  it("focus returns to trigger element on close", async () => {
    const user = userEvent.setup();
    render(<ModalWrapper title="Test">Content</ModalWrapper>);

    // Modal is open, close it
    await user.click(screen.getByLabelText("Close dialog"));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Open" })).toHaveFocus();
    });
  });

  it("Tab cycles within modal (focus trap)", async () => {
    const user = userEvent.setup();
    render(
      <Modal isOpen onClose={() => {}} title="Trap Test" footer={<button>Confirm</button>}>
        <button>Inner</button>
      </Modal>
    );

    const dialog = screen.getByRole("dialog");
    dialog.focus();

    // Tab through focusable elements, should cycle
    const closeBtn = screen.getByLabelText("Close dialog");
    const innerBtn = screen.getByRole("button", { name: "Inner" });
    const confirmBtn = screen.getByRole("button", { name: "Confirm" });

    await user.tab();
    expect(closeBtn).toHaveFocus();

    await user.tab();
    expect(innerBtn).toHaveFocus();

    await user.tab();
    expect(confirmBtn).toHaveFocus();

    // Should cycle back
    await user.tab();
    expect(closeBtn).toHaveFocus();
  });

  // --- forwardRef ---
  it("forwards ref to panel element", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Modal ref={ref} isOpen onClose={() => {}}>Content</Modal>);
    expect(ref.current).toBe(screen.getByRole("dialog"));
  });

  // --- className ---
  it("applies custom className on panel", () => {
    render(<Modal isOpen onClose={() => {}} className="custom-panel">Content</Modal>);
    expect(screen.getByRole("dialog")).toHaveClass("custom-panel");
  });

  // --- Portal ---
  it("renders via portal in document.body", () => {
    const { container } = render(<Modal isOpen onClose={() => {}}>Content</Modal>);
    // Dialog should NOT be inside the container (it's in a portal)
    expect(container.querySelector("[role='dialog']")).toBeNull();
    // But it should be in the document
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  // --- Scroll lock ---
  it("locks body scroll when open", () => {
    render(<Modal isOpen onClose={() => {}}>Content</Modal>);
    expect(document.body.style.overflow).toBe("hidden");
  });

  it("restores body scroll when closed", () => {
    const { rerender } = render(<Modal isOpen onClose={() => {}}>Content</Modal>);
    expect(document.body.style.overflow).toBe("hidden");
    rerender(<Modal isOpen={false} onClose={() => {}}>Content</Modal>);
    expect(document.body.style.overflow).not.toBe("hidden");
  });
});
