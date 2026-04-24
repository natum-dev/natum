import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { FilePreviewPanel } from "./FilePreviewPanel";

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
});
