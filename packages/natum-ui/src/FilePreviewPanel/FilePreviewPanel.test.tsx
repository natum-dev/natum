import { render, screen } from "@testing-library/react";
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
});
