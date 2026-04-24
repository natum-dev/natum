import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { useState } from "react";
import { FilePreviewPanel } from "./FilePreviewPanel";

function PanelWrapper({
  defaultOpen = true,
  ...props
}: Partial<React.ComponentProps<typeof FilePreviewPanel>> & {
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <>
      <button data-testid="trigger" onClick={() => setOpen(true)}>
        Open
      </button>
      <FilePreviewPanel
        open={open}
        onClose={() => setOpen(false)}
        fileName="test.jpg"
        {...props}
      />
    </>
  );
}

describe("FilePreviewPanel", () => {
  describe("rendering", () => {
    it("does not render when open={false}", () => {
      render(
        <FilePreviewPanel open={false} onClose={() => {}} fileName="test.jpg" />
      );
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("renders portal to document.body when open={true}", () => {
      render(
        <FilePreviewPanel open={true} onClose={() => {}} fileName="test.jpg" />
      );
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("shows fileName with title attribute for tooltip", () => {
      render(
        <FilePreviewPanel open={true} onClose={() => {}} fileName="report.pdf" />
      );
      const fileName = screen.getByText("report.pdf");
      expect(fileName).toHaveAttribute("title", "report.pdf");
    });
  });

  describe("slots", () => {
    it("renders meta in .meta element", () => {
      render(
        <FilePreviewPanel open onClose={() => {}} fileName="test.jpg" meta="2.4 MB" />
      );
      expect(screen.getByText("2.4 MB")).toBeInTheDocument();
    });

    it("does not render .meta element when meta is not provided", () => {
      const { container } = render(
        <FilePreviewPanel open onClose={() => {}} fileName="test.jpg" />
      );
      expect(
        container.ownerDocument.querySelector("[class*='meta']")
      ).not.toBeInTheDocument();
    });

    it("renders headerActions before close button", () => {
      render(
        <FilePreviewPanel
          open
          onClose={() => {}}
          fileName="test.jpg"
          headerActions={<button>Download</button>}
        />
      );
      const download = screen.getByRole("button", { name: "Download" });
      const close = screen.getByRole("button", { name: "Close preview" });
      expect(download.compareDocumentPosition(close) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    });

    it("renders children inside body", () => {
      render(
        <FilePreviewPanel open onClose={() => {}} fileName="test.jpg">
          <span data-testid="preview-content">Preview here</span>
        </FilePreviewPanel>
      );
      expect(screen.getByTestId("preview-content")).toBeInTheDocument();
    });
  });

  describe("navigation", () => {
    it("hides previous button when onPrevious not provided", () => {
      render(
        <FilePreviewPanel open onClose={() => {}} fileName="test.jpg" />
      );
      expect(
        screen.queryByRole("button", { name: "Previous file" })
      ).not.toBeInTheDocument();
    });

    it("hides next button when onNext not provided", () => {
      render(
        <FilePreviewPanel open onClose={() => {}} fileName="test.jpg" />
      );
      expect(
        screen.queryByRole("button", { name: "Next file" })
      ).not.toBeInTheDocument();
    });

    it("shows and fires onPrevious when provided", async () => {
      const onPrevious = vi.fn();
      render(
        <FilePreviewPanel
          open
          onClose={() => {}}
          fileName="test.jpg"
          onPrevious={onPrevious}
        />
      );
      const btn = screen.getByRole("button", { name: "Previous file" });
      await userEvent.click(btn);
      expect(onPrevious).toHaveBeenCalledOnce();
    });

    it("shows and fires onNext when provided", async () => {
      const onNext = vi.fn();
      render(
        <FilePreviewPanel
          open
          onClose={() => {}}
          fileName="test.jpg"
          onNext={onNext}
        />
      );
      const btn = screen.getByRole("button", { name: "Next file" });
      await userEvent.click(btn);
      expect(onNext).toHaveBeenCalledOnce();
    });

    it("ArrowLeft fires onPrevious", () => {
      const onPrevious = vi.fn();
      render(
        <FilePreviewPanel
          open
          onClose={() => {}}
          fileName="test.jpg"
          onPrevious={onPrevious}
        />
      );
      const panel = screen.getByRole("dialog");
      fireEvent.keyDown(panel, { key: "ArrowLeft" });
      expect(onPrevious).toHaveBeenCalledOnce();
    });

    it("ArrowRight fires onNext", () => {
      const onNext = vi.fn();
      render(
        <FilePreviewPanel
          open
          onClose={() => {}}
          fileName="test.jpg"
          onNext={onNext}
        />
      );
      const panel = screen.getByRole("dialog");
      fireEvent.keyDown(panel, { key: "ArrowRight" });
      expect(onNext).toHaveBeenCalledOnce();
    });
  });

  describe("close behavior", () => {
    it("close button fires onClose", async () => {
      const onClose = vi.fn();
      render(
        <FilePreviewPanel open onClose={onClose} fileName="test.jpg" />
      );
      await userEvent.click(
        screen.getByRole("button", { name: "Close preview" })
      );
      expect(onClose).toHaveBeenCalledOnce();
    });

    it("Escape fires onClose", async () => {
      const onClose = vi.fn();
      render(
        <FilePreviewPanel open onClose={onClose} fileName="test.jpg" />
      );
      await userEvent.keyboard("{Escape}");
      expect(onClose).toHaveBeenCalledOnce();
    });

    it("scrim click fires onClose", () => {
      const onClose = vi.fn();
      render(
        <FilePreviewPanel open onClose={onClose} fileName="test.jpg" />
      );
      const scrim = document.querySelector("[aria-hidden='true']") as HTMLElement;
      fireEvent.click(scrim);
      expect(onClose).toHaveBeenCalledOnce();
    });

    it("closeOnEsc={false} disables Escape close", async () => {
      const onClose = vi.fn();
      render(
        <FilePreviewPanel
          open
          onClose={onClose}
          fileName="test.jpg"
          closeOnEsc={false}
        />
      );
      await userEvent.keyboard("{Escape}");
      expect(onClose).not.toHaveBeenCalled();
    });

    it("closeOnOverlayClick={false} disables scrim click close", () => {
      const onClose = vi.fn();
      render(
        <FilePreviewPanel
          open
          onClose={onClose}
          fileName="test.jpg"
          closeOnOverlayClick={false}
        />
      );
      const scrim = document.querySelector("[aria-hidden='true']") as HTMLElement;
      fireEvent.click(scrim);
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe("focus", () => {
    it("panel receives focus on open", async () => {
      render(<PanelWrapper />);
      const panel = screen.getByRole("dialog");
      await vi.waitFor(() => {
        expect(document.activeElement).toBe(panel);
      });
    });

    it("focus returns to previously focused element on close", async () => {
      render(<PanelWrapper defaultOpen={false} />);
      const trigger = screen.getByTestId("trigger");
      trigger.focus();
      expect(document.activeElement).toBe(trigger);
      await userEvent.click(trigger);
      expect(screen.getByRole("dialog")).toBeInTheDocument();

      // Wait for focus to land on the panel (rAF-deferred)
      await vi.waitFor(() => {
        expect(document.activeElement).toBe(screen.getByRole("dialog"));
      });

      await userEvent.click(
        screen.getByRole("button", { name: "Close preview" })
      );
      await vi.waitFor(() => {
        expect(document.activeElement).toBe(trigger);
      });
    });

    it("arrow keys do not fire when panel lacks focus", () => {
      const onPrevious = vi.fn();
      const onNext = vi.fn();
      render(
        <FilePreviewPanel
          open
          onClose={() => {}}
          fileName="test.jpg"
          onPrevious={onPrevious}
          onNext={onNext}
        />
      );
      fireEvent.keyDown(document.body, { key: "ArrowLeft" });
      fireEvent.keyDown(document.body, { key: "ArrowRight" });
      expect(onPrevious).not.toHaveBeenCalled();
      expect(onNext).not.toHaveBeenCalled();
    });
  });

  describe("accessibility", () => {
    it("has role=dialog on panel root", () => {
      render(
        <FilePreviewPanel open onClose={() => {}} fileName="test.jpg" />
      );
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("aria-labelledby points to file name element", () => {
      render(
        <FilePreviewPanel open onClose={() => {}} fileName="test.jpg" />
      );
      const panel = screen.getByRole("dialog");
      const labelledBy = panel.getAttribute("aria-labelledby");
      expect(labelledBy).toBeTruthy();
      const target = document.getElementById(labelledBy!);
      expect(target).toHaveTextContent("test.jpg");
    });

    it("aria-label prop replaces aria-labelledby", () => {
      render(
        <FilePreviewPanel
          open
          onClose={() => {}}
          fileName="test.jpg"
          aria-label="Custom label"
        />
      );
      const panel = screen.getByRole("dialog");
      expect(panel).toHaveAttribute("aria-label", "Custom label");
      expect(panel).not.toHaveAttribute("aria-labelledby");
    });

    it("scrim has aria-hidden=true", () => {
      render(
        <FilePreviewPanel open onClose={() => {}} fileName="test.jpg" />
      );
      const scrim = document.querySelector("[aria-hidden='true']");
      expect(scrim).toBeInTheDocument();
    });
  });

  describe("rest-spread + RTL", () => {
    it("rest-spread passes through; managed data-attrs win", () => {
      render(
        <FilePreviewPanel
          open
          onClose={() => {}}
          fileName="test.jpg"
          data-testid="custom-panel"
          data-state="should-lose"
        />
      );
      const panel = screen.getByRole("dialog");
      expect(panel).toHaveAttribute("data-testid", "custom-panel");
      expect(panel.getAttribute("data-state")).not.toBe("should-lose");
    });

    it("RTL smoke: panel renders at inset-inline-end", () => {
      const { container } = render(
        <div dir="rtl">
          <FilePreviewPanel open onClose={() => {}} fileName="test.jpg" />
        </div>
      );
      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(container.querySelector("[dir='rtl']")).toBeInTheDocument();
    });
  });

  describe("animation", () => {
    it("data-state transitions entering → entered on open", async () => {
      render(
        <FilePreviewPanel open onClose={() => {}} fileName="test.jpg" />
      );
      const panel = screen.getByRole("dialog");
      expect(panel).toHaveAttribute("data-state", "entering");

      await vi.waitFor(() => {
        expect(panel).toHaveAttribute("data-state", "entered");
      });
    });

    it("data-state transitions to exiting on close", async () => {
      const { rerender } = render(
        <FilePreviewPanel open onClose={() => {}} fileName="test.jpg" />
      );
      await vi.waitFor(() => {
        expect(screen.getByRole("dialog")).toHaveAttribute(
          "data-state",
          "entered"
        );
      });

      rerender(
        <FilePreviewPanel open={false} onClose={() => {}} fileName="test.jpg" />
      );
      const panel = screen.getByRole("dialog");
      expect(panel).toHaveAttribute("data-state", "exiting");
    });
  });
});
